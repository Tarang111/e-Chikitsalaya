"use server"

import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "./onboarding"
import prisma from "@/lib/prisma"

import { VerificationStatus } from "@/app/generated/prisma/enums"
import { revalidatePath } from "next/cache"

export async function verifyAdmin()
{
try {
    const {userId}=await auth()
    if(!userId) throw new Error("LOGIN FIRST")
    const user=await prisma.user.findUnique({
        where:{clerkUserId:userId}
    })
    if(!user)
    {
        throw new Error("LOGIN FIRST")
    }
    if(user.role==="ADMIN")
    {
        return true;
    }
    return false
} catch (error) {
   
    return false
}
}
export async function pendingList() {
    try {
         const doctors=await prisma.user.findMany({
            where:{
                role:"DOCTOR",
                verificationStatus:"PENDING"
            },
            select:{
                name:true,
                id:true,
                experience:true,
                description:true,
                specialty:true,
                credentialUrl:true,
                imageUrl:true,
                createdAt:true,
                email:true

            }
         })
         return {pending:doctors}
    } catch (error) {
        console.log(error);
        
         return {pending:[]}

    }
}
export async function updateDoctor(formdata:FormData)
{
    try {
        const status=formdata.get("status") as string
        const userId=formdata.get("id") as string
        if(!userId) throw new Error("Missing userid")
        // const user=await verifyAdmin()
        // if(!user)
        // {
        //     throw new Error("Not authorized")
        // }
        const update=await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                verificationStatus:status as VerificationStatus
            }
        })
        revalidatePath("/admin")
        return {success:true}
    } catch (error) {
         console.log(error);
          return {sucsess:false}
    }
}
export async function verifieddoctorlist() {
    try {
          const doctor=await prisma.user.findMany({
            where:{role:"DOCTOR",verificationStatus:"VERIFIED"},
            select:{
                name:true,
                id:true,
                experience:true,
                description:true,
                specialty:true,
                credentialUrl:true,
                imageUrl:true,
                createdAt:true,
                email:true

            }
          })
          return {listdoctor:doctor}
    } catch (error) {
         return {listdoctor:[]}
    }
}

export async function approvePayout(formData:FormData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const payoutId = formData.get("payoutId") as string;

  if (!payoutId) {
    throw new Error("Payout ID is required");
  }

  try {
    // Get admin user info
    const { userId } = await auth();
    if(!userId) throw new Error("Unauthorized");
    const admin = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Find the payout request
    const payout = await prisma.payout.findUnique({
      where: {
        id: payoutId,
        status: "PROCESSING",
      },
      include: {
        doctor: true,
      },
    });

    if (!payout) {
      throw new Error("Payout request not found or already processed");
    }

    // Check if doctor has enough credits
    if (payout.doctor.credits < payout.credits) {
      throw new Error("Doctor doesn't have enough credits for this payout");
    }

    // Process the payout in a transaction
    await prisma.$transaction(async (tx) => {
      // Update payout status to PROCESSED
      await tx.payout.update({
        where: {
          id: payoutId,
        },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
          processedBy: admin?.id || "unknown",
        },
      });

      // Deduct credits from doctor's account
      await tx.user.update({
        where: {
          id: payout.doctorId,
        },
        data: {
          credits: {
            decrement: payout.credits,
          },
        },
      });

      // Create a transaction record for the deduction
      await tx.creditTransaction.create({
        data: {
          userId: payout.doctorId,
          amount: -payout.credits,
          type: "ADMIN_ADJUSTMENT",
        },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve payout:", error);
    throw new Error(`Failed to approve payout:` )
  }
}