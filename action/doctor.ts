"use server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function specialtydoctors(specialty:string) {
    try {
        const doctors=await prisma.user.findMany({
            where:{role:"DOCTOR",specialty:specialty}
            ,
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
        return {doctorlist:doctors}
    } catch (error) {
        return {doctorlist:[]}
         console.log(error);
         
    }
}

export async function setAvailability(formdata:FormData)
{
    const {userId} =await auth()
    if(!userId)
    {
        throw new Error("Login first")
    }

    try {
         const starttime=formdata.get("starttime") as string 
         const endtime=formdata.get("endtime") as string
        
         if(!starttime||!endtime)
         {
             return{success:"false", message :"Kindly enter both start and end time",newslott:[]}
         }
         if(starttime>=endtime)
         {
            throw new Error("START TIME CANNOT EXCEED END TIME ")
         }
         const doctor=await prisma.user.findUnique({
            where:{clerkUserId:userId,role:"DOCTOR"}
         })
         if(!doctor)
         {
            throw new Error("Unauthorized")
         }
         const existingappointment=await prisma.availability.findMany({
            where:{doctorId:doctor.id}
         })
         if(existingappointment.length>0)
         {
           const slotwithnoappointments = existingappointment.filter((slot) => {
                 return slot.status === "AVAILABLE";
           });

           
            if(slotwithnoappointments.length>0)
            {
                await prisma.availability.deleteMany({
                    where:{
                        id:{
                            in:slotwithnoappointments.map((slot)=>slot.id)
                        }
                    }
                })
            }
         }
         
         const newslot=await prisma.availability.create({
             data:{
                startTime:new Date( starttime),
                endTime:new Date(endtime),
                doctorId:doctor.id,
                status:"AVAILABLE"
             }
         })


    revalidatePath("/doctor");
    return{success:true,newslott:newslot}
    } catch (error) {
        console.log(error);
        
        return{success:false,message :"",newslott:[]}
    
    }
}


export async function getdoctoravailability() {
  const {userId} =await auth()
    if(!userId)
    {
        throw new Error("Login first")
    }
    try {
         const doctor=await prisma.user.findUnique({
            where:{clerkUserId:userId,role:"DOCTOR"}
         })
         if(!doctor)
         {
            throw new Error("Unauthorized")
         }
         const existingappointment=await prisma.availability.findMany({
            where:{doctorId:doctor.id}
         })
         return {availabilty:[...existingappointment]}
    } catch (error) {
        console.log(error);
        
        return {availabilty:[]}
    }  
}

export async function getDoctorProfile(id:string) {
      
      if(!id)
      {
        throw new Error("Unauthenticated User")
      }
    try {
          const doctor=await prisma.user.findUnique({
                    where:{
                        id:id,
                        role:"DOCTOR",
                        verificationStatus:"VERIFIED"

                    },
                   select:{
                name:true,
                id:true,
                credits:true,
                experience:true,
                description:true,
                specialty:true,
                credentialUrl:true,
                imageUrl:true,
                createdAt:true,
                email:true,
                  availabilities:{
                    select:{
                        startTime:true,
                        endTime:true,
                        status:true,
                    }
                  }

            }
          })
          if(!doctor)
          {
            throw new Error("NO DOCTOR FOUND")
          }
        return {doctors:[{...doctor}]}
    } catch (error) {
    console.log(error);
    return {doctors:[]}
    }
}
export async function getAppointments() {
    const {userId}=await auth()
    if (!userId)
    {
        throw new Error("Unauthorized access")
    }
    try {
        const doctor=await prisma.user.findUnique({
            where:{clerkUserId:userId,role:"DOCTOR",verificationStatus:"VERIFIED"}
        })
        if(!doctor)
        {
            throw new Error("Unauthorized access");
        }
        const appointments=await prisma.appointment.findMany({

            where:{doctorId:doctor.id,status:"SCHEDULED"},
            select:{
                patientDescription:true,
                patient:{
                    select:{
                        name:true,
                        imageUrl:true,
                        email:true,
                    }
                },
                status:true,
                startTime:true,
                endTime:true,
                id:true

            }
        })
        return {success:true,appointments:appointments}
    } catch (error) {
         console.log(error);
           return {success:false,appointments:[]}
         
    }
}