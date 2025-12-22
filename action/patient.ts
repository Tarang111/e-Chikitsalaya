"use server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAppointentofpatient() {
    const {userId}=await auth()
    if(!userId) throw new Error("Unauthorized User");
    try {
        const patient=await prisma.user.findUnique({
            where:{clerkUserId:userId,role:"PATIENT"}
        }) 
        if(!patient)  throw new Error("Unauthorized User");
        const appointments=await prisma.appointment.findMany({
            where:{patientId:patient.id},
            select:{
                doctor:{
                    select:{
                        name:true,
                        imageUrl:true,
                        specialty:true,
                        email:true

                    }
                },
                startTime:true,
                endTime:true,
                status:true,
                id:true,
                notes:true
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        return {success:true,appointments}
    } catch (error) {
         return {success:false,appointments:[]}
    }
    
}