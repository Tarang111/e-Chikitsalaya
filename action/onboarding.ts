"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export  async function setuserrole(formdata:any) {
    const {userId}=await auth()
    
    
    if(!userId)
    {
        throw new Error("Unauthorized")
    }
    
    
    
    try {
            const user=await prisma.user.findUnique({
      where:{
          clerkUserId:userId

      }
  })
  if(!user)
  {
      throw new Error("No user found")
  }
 const role=formdata.get("role");
 if(!role||!["PATIENT","DOCTOR"].includes(role))
 {
  throw new Error("WRONG ROLE SELECTION")
 }
     if(role==="PATIENT")
   {
    const user=await prisma.user.update({
        where:{
            clerkUserId:userId
        },
        data:{
            role:"PATIENT"
        }

    })
    revalidatePath("/")
    return {success:true,redirect:"/",message:"role created"}
   }
   if(role==="DOCTOR")
   {
    const speciality=formdata.get("speciality")
    const experience=Number(formdata.get("experience"))
    const credentiallink=formdata.get("credentiallink")
    const description=formdata.get("description")
   if (speciality === "" ||credentiallink === "" ||description === "" ||experience==null) {
    throw new Error("FILL ALL CREDENTALS")
}

   
    await prisma.user.update({
        where:{clerkUserId:userId},
        data:{
            role:"DOCTOR",
            specialty:speciality,
            experience:experience,
            credentialUrl:credentiallink,
            description:description,
            credits:0
        }
    })

revalidatePath("/")
    return {success:true,redirect:"/doctor/verification"}

   }
  }
  
  catch (error) {
    console.error("failed to set role",error)
    throw new Error(`FAILED TO UPDATE USER PROFILE`)
  }


   
}
export async function getCurrentUser() {
     const {userId}=await auth()
    if(!userId)
    {
        throw new Error("Unauthorized")
    }
    const user=await prisma.user.findUnique({
        where:{
            clerkUserId:userId

        }
    })
    if(!user)
    {
        throw new Error("No user found")
    }
    return user
}
export async function resetUser() {
    const {userId}=await auth()
    if(!userId)
    {
        throw new Error("Unauthorized User");
        
    }
    try {
         const doctor=await prisma.user.findUnique({
            where:{clerkUserId:userId,role:"DOCTOR"},
            
         })
         if(!doctor)
         {
            throw new Error("Unauthorized User");
         }
           const doctor1=await prisma.user.update({
            where:{clerkUserId:userId,role:"DOCTOR"},
            data:{
                verificationStatus:"PENDING",
                 role:"UNASSIGNED",
                specialty:"",
                experience:0,
                description:"",
                credentialUrl:"",
                
            }
         })
        
       revalidatePath("/doctor/verification")

    } catch (error) {
        console.log(error);
        
    }
}