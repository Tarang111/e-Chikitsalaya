"use server"
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { verifyAdmin } from "./admin";


export async function getcredits()
{ 
 const {userId}=await auth()
 if(!userId)
 {
    throw new Error("Unauthorized user");
 }
try {
      const doctor=await prisma.user.findUnique({
        where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"},
        select:{
            credits:true,
            _count:{
                select:{
                    doctorAppointments:true,
                    patientAppointments:true
                }
            }
        }
      })
      if(!doctor)    throw new Error("Unauthorized user");
      return {success:true,credits:doctor}
} catch (error) {
    return {sucess:false,error:"try again later"}
}
}
export async function canpayout()
{ 
    const {userId}=await auth()
    if(!userId)
 {
    throw new Error("Unauthorized user");
 }
try {
      const doctor=await prisma.user.findUnique({
        where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"},
        select:{
            id:true
        }
      })
       if(!doctor)    throw new Error("Unauthorized user");
       const canpay=await prisma.payout.findFirst({
     where:{
        doctorId:doctor.id,
        status:"PROCESSING"
     }
       })

       if(canpay)
        return false;

       return true
    } catch (error) {
        console.log(error);
        
        return false
    }
}
export async function payoutdetails(formdata:FormData) {
  const {userId}=await auth()
    if(!userId)
 {
    throw new Error("Unauthorized user");
 }
try {
      const doctor=await prisma.user.findUnique({
        where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"},
        select:{
            id:true
        }
      })
       if(!doctor)    throw new Error("Unauthorized user");
        const netamount=Number( formdata.get("netamount" ))
         const amount=Number( formdata.get("amount"))
          const platformfee=Number(formdata.get("platformfee"))
         const credits=Number( formdata.get("credits"))
         const paypalemail= formdata.get("paypalemail") as string
         if(!paypalemail)
         {
            throw new Error("Paypal email required");
            
         }
        //  if(credits<1)
        //  {
        //     throw new Error("1 credits required");
        //  }
         const payoutdetail=await prisma.payout.create({
            data:{
                amount:amount,
                doctorId:doctor.id,
                netAmount:netamount,
                paypalEmail:paypalemail,
                credits:credits,
                platformFee:platformfee

            }
         })
         return{success:true,payoutdetail}
    } catch (error) {
         return{success:false,error:"Try again later"}
    }
}
export async function getpendingpayout() {
   const verify=await verifyAdmin()
   if(!verify)
   {
    throw new Error("unauthorized");
    
    
  }
    try {
           const payoutrequest=await prisma.payout.findMany({
              where:{
                status:"PROCESSING"
              },
              select:{
                id:true,
                netAmount:true,
                amount:true,
                platformFee:true,
                paypalEmail:true,
                credits:true,
                doctor:{
                    select:{
                        imageUrl:true,
                        name:true,
                        email:true,
                        specialty:true

                    }
                },
                createdAt:true
              }
           })

            return{success:true,payoutrequest:[...payoutrequest]}

    } catch (error) {
        return{success:false,error:"Try again later"}
    }
}
export async function getapprovedpayout() {
  const {userId}=await auth()
    if(!userId)
 {
    throw new Error("Unauthorized user");
 }
try {
      const doctor=await prisma.user.findUnique({
        where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"},
        select:{
            id:true
        }
      })
       if(!doctor)    throw new Error("Unauthorized user");
           const payoutrequest=await prisma.payout.findMany({
              where:{
                status:"PROCESSED",
                doctorId:doctor.id
              },
              select:{
                id:true,
                netAmount:true,
               
               
                credits:true,
               
                processedAt:true,
                createdAt:true
              },
              orderBy:{
                processedAt:'desc'
              }
           })

            return{success:true,payoutrequest:payoutrequest}

    } 
    catch (error) {
        return{success:false,error:"Try again later"}
    }
}