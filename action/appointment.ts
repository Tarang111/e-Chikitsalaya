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

// --- 1. Get Available Time Slots ---
export async function getAvailableTimeSlots(doctorId: string) {
  try {
    const doctor = await prisma.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) return { error: "Doctor not found or not verified",days:[] };

    const availability = await prisma.availability.findFirst({
      where: { doctorId: doctor.id, status: "AVAILABLE" },
    });

    if (!availability) return { error: "No availability set by doctor",days:[] };

    const now = new Date();
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

    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");
      availableSlotsByDay[dayString] = [];

      // Construct start/end times for the specific day based on availability
      const availabilityStart = new Date(availability.startTime);
      const availabilityEnd = new Date(availability.endTime);

      availabilityStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      availabilityEnd.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      let current = new Date(availabilityStart);
      const end = new Date(availabilityEnd);

      while (isBefore(addMinutes(current, 30), end) || +addMinutes(current, 30) === +end) {
        const next = addMinutes(current, 30);

        // Skip past slots
        if (isBefore(current, now)) {
          current = next;
          continue;
        }

        // Check overlaps
        const overlaps = existingAppointments.some((appointment) => {
          const aStart = new Date(appointment.startTime);
          const aEnd = new Date(appointment.endTime);
          return (
            (current >= aStart && current < aEnd) ||
            (next > aStart && next <= aEnd) ||
            (current <= aStart && next >= aEnd)
          );
        });

        if (!overlaps) {
          availableSlotsByDay[dayString].push({
            startTime: current.toISOString(),
            endTime: next.toISOString(),
            formatted: `${format(current, "h:mm a")} - ${format(next, "h:mm a")}`,
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
    return { error: "Failed to load slots" ,days:[]};
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
    const startTime = new Date(formData.get("startTime") as string);
    const endTime = new Date(formData.get("endTime") as string);
    const patientDescription = formData.get("description") as string;

    if (!doctorId || !startTime || !endTime) {
      return { success: false, error: "Missing required fields" };
    }

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId, role: "DOCTOR", verificationStatus: "VERIFIED" },
    });

    if (!doctor) return { success: false, error: "Doctor not found" };

    if (patient.credits < 2) {
      return { success: false, error: "Insufficient credits (2 required)" };
    }

    // Check for overlaps (DB Check)
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
      return { success: false, error: "Time slot already booked" };
    }

    // Create Vonage Session
    const sessionId = await createVideoSession();
    
    if (!sessionId) return { success: false, error: "Failed to create video session" };

    const { success, error } = await deductCreditsForAppointment(
      patient.id,
      doctor.id
    );

    if (!success) {
      throw new Error(error || "Failed to deduct credits");
    }

    // Create the appointment with the video session ID
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        patientDescription,
        status: "SCHEDULED",
        videoSessionId: sessionId, // Store the Vonage session ID
      },
    });

    revalidatePath(`/doctors/${doctor.specialty}/${doctor.id}`);
    return { success: true, appointment };

  } catch (error) {
    console.error("Failed to book appointment:", error);
    return { success: false,error:"failed" };
  }
}

// --- 3. Create Video Session (Vonage) ---
async function createVideoSession() {
  try {
    const session = await vonage.video.createSession({ 
      // FIX: Cast string to 'any' to bypass strict Enum check
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

export async function deleteAppointment(formdata:FormData) {
      const {userId}=await auth()
      if(!userId)
      {
        throw new Error("Unauthorized user")
      }
  try {
    const appointmentid=formdata.get("appointmentid") as string
      const notes=formdata.get("notes") as string
       const doctor=await prisma.user.findUnique({
        where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"}
       })
       if(!doctor)
       {
        throw new Error("Doctor Not found")
       }
       const appointment=await prisma.appointment.findUnique({
        where:{id:appointmentid,doctorId:doctor.id,status:"SCHEDULED"}
       })
       if(!appointment)
       {
        throw new Error("Appointment Not found")
       }
       const {success,error}=await refundCreditsForAppointment(appointment.patientId,appointment.doctorId)
       if (!success) {
      throw new Error(error || "Failed to refund credits");
    }
        const appointment1=await prisma.appointment.update({
        where:{id:appointmentid},
        data:{status:"CANCELLED",notes:notes}
       })
        revalidatePath("/doctor")
       return {success:true}
  } catch (error) {
    return {success:false,error:"Try agin later"}
  }
}
export async function markDoneAppointment(formdata:FormData) {
      const {userId}=await auth()
      if(!userId)
      {
        throw new Error("Unauthorized user")
      }
  try {
      const appointmentid=formdata.get("appointmentid") as string
      const notes=formdata.get("notes") as string
       const doctor=await prisma.user.findUnique({
        where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"}
       })
       if(!doctor)
       {
        throw new Error("Doctor Not found")
       }
       const appointment=await prisma.appointment.findUnique({
        where:{id:appointmentid,doctorId:doctor.id,status:"SCHEDULED"}
       })
       if(!appointment)
       {
        throw new Error("Appointment Not found")
       }
  
        const appointment1=await prisma.appointment.update({
        where:{id:appointmentid},
        data:{status:"COMPLETED",notes:notes}
       })
        revalidatePath("/doctor")
       return {success:true}
  } catch (error) {
    return {success:false,error:"Try again later"}
  }
}


// --- 4. Generate Video Token (Required for Frontend) ---
// This function allows the user to JOIN the call
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

    // Security: Only allow the specific Doctor or Patient to generate a token
    if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
      return { success: false, error: "Not authorized for this call" };
    }

    // Time Check: Only allow joining 30 mins before start time
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const timeDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);

    // Note: Adjust this logic if you want to allow them to join ANY time after creation
    if (timeDifference > 30) {
       return { success: false, error: "Call available 30 mins before scheduled time" };
    }

    // Connection Data (stored in the token, visible to other participants)
    const connectionData = JSON.stringify({
      name: user.name,
      role: user.role,
      userId: user.id,
    });

    // Token Expiration (1 hour after appointment ends)
    const appointmentEndTime = new Date(appointment.endTime);
    const expirationTime = Math.floor(appointmentEndTime.getTime() / 1000) + 3600;
    
    // Ensure expiration is within Vonage limits (max 30 days from now)
    const nowUnix = Math.floor(Date.now() / 1000);
    if(expirationTime < nowUnix) {
        return { success: false, error: "Appointment has already ended" };
    }

    // Generate Token
    const token = vonage.video.generateClientToken(appointment?.videoSessionId||"", {
      role: "publisher", // Both can publish video/audio
      expireTime: expirationTime,
      data: connectionData,
    });

    // Optional: Save token to DB if you want to reuse it, 
    // though generating a fresh one on join request is usually safer/stateless.
    
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