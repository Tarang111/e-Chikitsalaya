"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { addDays, addMinutes, endOfDay, isBefore, format } from "date-fns";
import { revalidatePath } from "next/cache";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";
import { deductCreditsForAppointment, refundCreditsForAppointment } from "./credit";

// Helper to handle newlines in private keys stored in .env variables
const privateKey = process.env.VONAGE_PRIVATE_KEY
  ? process.env.VONAGE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : "";

const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID!,
  privateKey: privateKey,
});

const vonage = new Vonage(credentials);

// --- HELPER: Get current time in India ---
const getIndiaNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

// --- 1. Get Available Time Slots ---
export async function getAvailableTimeSlots(doctorId: string) {
  try {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId, role: "DOCTOR", verificationStatus: "VERIFIED" },
    });

    if (!doctor) return { error: "Doctor not found", days: [] };

    const availability = await prisma.availability.findFirst({
      where: { doctorId: doctor.id, status: "AVAILABLE" },
    });

    if (!availability) return { error: "No availability set", days: [] };

    // Use the India timezone helper
    const now = getIndiaNow();
    const days = [now, addDays(now, 1), addDays(now, 2), addDays(now, 3)];
    const lastDay = endOfDay(days[3]);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        startTime: { lte: lastDay },
      },
    });

    const availableSlotsByDay: Record<string, any[]> = {};
    const formatIST = (date: Date) => 
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);

    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");
      availableSlotsByDay[dayString] = [];

      const availabilityStart = new Date(availability.startTime);
      const availabilityEnd = new Date(availability.endTime);

      // Align availability to the current processing day
      availabilityStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      availabilityEnd.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      let current = new Date(availabilityStart);
      const end = new Date(availabilityEnd);

      while (isBefore(addMinutes(current, 30), end) || +addMinutes(current, 30) === +end) {
        const next = addMinutes(current, 30);

        if (isBefore(current, now)) {
          current = next;
          continue;
        }

        const overlaps = existingAppointments.some((appointment) => {
          const aStart = new Date(appointment.startTime);
          const aEnd = new Date(appointment.endTime);
          return (current < aEnd && next > aStart); // Simple overlap check
        });

        if (!overlaps) {
          availableSlotsByDay[dayString].push({
            startTime: current.toISOString(),
            endTime: next.toISOString(),
            formatted: `${formatIST(current)} - ${formatIST(next)}`,
            day: format(current, "EEEE, MMMM d"),
          });
        }
        current = next;
      }
    }

    const result = Object.entries(availableSlotsByDay).map(([date, slots]) => ({
      date,
      displayDate: slots.length > 0 ? slots[0].day : format(new Date(date), "EEEE, MMMM d"),
      slots,
    }));

    return { days: result };
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    return { error: "Failed to load slots", days: [] };
  }
}

// --- 2. Book Appointment ---
export async function bookAppointment(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const patient = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: "PATIENT" },
    });

    if (!patient) return { success: false, error: "Patient not found" };

    const doctorId = formData.get("doctorId") as string;
    
    // Ensure we parse the string correctly
    const startStr = formData.get("startTime") as string;
    const endStr = formData.get("endTime") as string;
    
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);
    const patientDescription = formData.get("description") as string;

    if (!doctorId || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { success: false, error: "Missing or invalid date fields" };
    }

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId, role: "DOCTOR", verificationStatus: "VERIFIED" },
    });

    if (!doctor) return { success: false, error: "Doctor not found" };

    if (patient.credits < 2) {
      return { success: false, error: "Insufficient credits (2 required)" };
    }

    // Check for overlaps
    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: "SCHEDULED",
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    if (overlappingAppointment) {
      return { success: false, error: "This time slot has already been booked" };
    }

    const sessionId = await createVideoSession();
    
    if (!sessionId) return { success: false, error: "Failed to create video session" };

    const { success, error: creditError } = await deductCreditsForAppointment(
      patient.id,
      doctor.id
    );

    if (!success) {
      // Return the specific credit error instead of generic "failed"
      return { success: false, error: creditError || "Credit deduction failed" };
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        patientDescription,
        status: "SCHEDULED",
        videoSessionId: sessionId,
      },
    });

    revalidatePath(`/doctors/${doctor.specialty}/${doctor.id}`);
    return { success: true, appointment };

  } catch (error: any) {
    // Log the actual error to your Vercel/Terminal console
    console.error("DETAILED BOOKING ERROR:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

// --- 3. Create Video Session (Vonage) ---
async function createVideoSession() {
  try {
    const session = await vonage.video.createSession({ 
      mediaMode: "routed" as any 
    });

    if (!session || !session.sessionId) {
      throw new Error("Vonage returned an empty session.");
    }

    return session.sessionId;
  } catch (error) {
    console.error("VONAGE ERROR:", error);
    throw error; 
  }
}

export async function deleteAppointment(formdata: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized user");

  try {
    const appointmentid = formdata.get("appointmentid") as string;
    const notes = formdata.get("notes") as string;
    const doctor = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: "DOCTOR", verificationStatus: "VERIFIED" }
    });
    if (!doctor) throw new Error("Doctor Not found");

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentid, doctorId: doctor.id, status: "SCHEDULED" }
    });
    if (!appointment) throw new Error("Appointment Not found");

    const { success, error } = await refundCreditsForAppointment(appointment.patientId, appointment.doctorId);
    if (!success) throw new Error(error || "Failed to refund credits");

    await prisma.appointment.update({
      where: { id: appointmentid },
      data: { status: "CANCELLED", notes: notes }
    });
    revalidatePath("/doctor");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Try agin later" };
  }
}

export async function markDoneAppointment(formdata: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized user");

  try {
    const appointmentid = formdata.get("appointmentid") as string;
    const notes = formdata.get("notes") as string;
    const doctor = await prisma.user.findUnique({
      where: { clerkUserId: userId, role: "DOCTOR", verificationStatus: "VERIFIED" }
    });
    if (!doctor) throw new Error("Doctor Not found");

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentid, doctorId: doctor.id, status: "SCHEDULED" }
    });
    if (!appointment) throw new Error("Appointment Not found");

    await prisma.appointment.update({
      where: { id: appointmentid },
      data: { status: "COMPLETED", notes: notes }
    });
    revalidatePath("/doctor");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Try again later" };
  }
}

// --- 4. Generate Video Token ---
export async function generateVideoToken(appointmentId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) return { success: false, error: "Appointment not found" };

    if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
      return { success: false, error: "Not authorized for this call" };
    }

    // CHANGE: Compare with India time
    const now = getIndiaNow();
    const appointmentTime = new Date(appointment.startTime);
    const timeDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);

    if (timeDifference > 30) {
      return { success: false, error: "Call available 30 mins before scheduled time" };
    }

    const connectionData = JSON.stringify({
      name: user.name,
      role: user.role,
      userId: user.id,
    });

    const appointmentEndTime = new Date(appointment.endTime);
    const expirationTime = Math.floor(appointmentEndTime.getTime() / 1000) + 3600;
    
    const nowUnix = Math.floor(Date.now() / 1000);
    if (expirationTime < nowUnix) {
      return { success: false, error: "Appointment has already ended" };
    }

    const token = vonage.video.generateClientToken(appointment?.videoSessionId || "", {
      role: "publisher",
      expireTime: expirationTime,
      data: connectionData,
    });

    return {
      success: true,
      videoSessionId: appointment.videoSessionId,
      token: token,
      apiKey: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID
    };

  } catch (error) {
    console.error("Failed to generate video token:", error);
    return { success: false, error: "Token generation failed" };
  }
}
