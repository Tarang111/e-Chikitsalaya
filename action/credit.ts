"use server";


import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const PLAN_CREDITS = {
  free_user: 0,
  standard: 10,
  premium: 24,
};
const APPOINTMENT_CREDIT_COST = 2;

export async function checkAndAllocateCredits(user: any) {
  try {
    if (!user) return null;

    if (user.role !== "PATIENT") return user;

    const { has } = await auth();

    const hasBasic = has({ plan: "free_user" });
    const hasStandard = has({ plan: "standard" });
    const hasPremium = has({ plan: "premium" });

    let currentPlan: string | null = null;
    let creditsToAllocate = 0;

    if (hasPremium) {
      currentPlan = "premium";
      creditsToAllocate = PLAN_CREDITS.premium;
    } else if (hasStandard) {
      currentPlan = "standard";
      creditsToAllocate = PLAN_CREDITS.standard;
    } else if (hasBasic) {
      currentPlan = "free_user";
      creditsToAllocate = PLAN_CREDITS.free_user;
    }

    if (!currentPlan) return user;

    const currentMonth = format(new Date(), "yyyy-MM");

    // ✔ FILTER only credit transactions
    const creditTransactions = user.transactions?.filter(
      (t: any) => t.type === "CREDIT_PURCHASE"
    );

    const latestTransaction = creditTransactions?.[0];

    // ✔ No previous credit? Allocate
    if (!latestTransaction) {
      return await allocateCredits(user, currentPlan, creditsToAllocate);
    }

    const transactionMonth = format(
      new Date(latestTransaction.createdAt),
      "yyyy-MM"
    );

    const transactionPlan = latestTransaction.packageId;

    // ✔ Already credited this month for this exact plan → stop
    if (transactionMonth === currentMonth && transactionPlan === currentPlan) {
      return user;
    }

    // ❗ CHANGED ROLE OR CHANGED PLAN in same month → allocate fresh
    return await allocateCredits(user, currentPlan, creditsToAllocate);
  } catch (error) {
    console.error("failed", error);
    return null;
  }
}

async function allocateCredits(user: any, plan: string, amount: number) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const updatedUser = await prisma.$transaction(async (tx) => {

    // ✅ ONLY NECESSARY CHANGE (MONTH-BASED DUPLICATE CHECK)
    const alreadyExists = await tx.creditTransaction.findFirst({
      where: {
        userId: user.id,
        packageId: plan,
        type: "CREDIT_PURCHASE",
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    if (alreadyExists) {
      return user; // ⛔ stops double subscription credit
    }
    // ✅ END CHANGE

    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        amount,
        type: "CREDIT_PURCHASE",
        packageId: plan,
      },
    });

    return await tx.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: amount },
      },
    });
  });

  return updatedUser;
}



export async function deductCreditsForAppointment(userId:string, doctorId:string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  if(!user) return {success:false}
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    // Ensure user has sufficient credits
    if (user.credits < APPOINTMENT_CREDIT_COST) {
      throw new Error("Insufficient credits to book an appointment");
    }

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Deduct credits from patient and add to doctor
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record for patient (deduction)
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
        },
      });

      // Create transaction record for doctor (addition)
      await tx.creditTransaction.create({
        data: {
          userId: doctor.id,
          amount: APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION", // Using same type for consistency
        },
      });

      // Update patient's credit balance (decrement)
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            decrement: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      // Update doctor's credit balance (increment)
      await tx.user.update({
        where: {
          id: doctor.id,
        },
        data: {
          credits: {
            increment: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      return updatedUser;
    });

    return { success: true, user: result };
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return { success: false, error: "FAILED ATTEMPT" };
  }
}

export async function refundCreditsForAppointment(userId:string, doctorId:string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  if(!user) return {success:false}
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    // Ensure user has sufficient credits
  

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Deduct credits from patient and add to doctor
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record for patient (deduction)
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount:+APPOINTMENT_CREDIT_COST,
          type: "ADMIN_ADJUSTMENT",
        },
      });

      // Create transaction record for doctor (addition)
      await tx.creditTransaction.create({
        data: {
          userId: doctor.id,
          amount: -APPOINTMENT_CREDIT_COST,
          type: "ADMIN_ADJUSTMENT", // Using same type for consistency
        },
      });

      // Update patient's credit balance (decrement)
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            increment: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      // Update doctor's credit balance (increment)
      await tx.user.update({
        where: {
          id: doctor.id,
        },
        data: {
          credits: {
            decrement: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      return updatedUser;
    });

    return { success: true, user: result };
  } catch (error) {
    console.error("Failed to refund credits:", error);
    return { success: false, error: "FAILED ATTEMPT" };
  }
}