"use client";
import { getAppointments } from '@/action/doctor'
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogContent } from '@radix-ui/react-dialog';
import { Calendar1, Clock1 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

function Getappointments() {
    const [details,setdetails]=useState<any[]>([])
   async function getappointementsofdoctor() {
      try {
           const res=await getAppointments();
           console.log(res);
           setdetails(res.appointments)
           
      } catch (error) {
        toast("TRY AGAIN LATER")
      }
   }
   useEffect(()=>{
    getappointementsofdoctor()
   },[])
   return (
      <Dialog>
       <div className="w-full border rounded-lg flex flex-col gap-2 p-2">
          {details.map((item,i)=>(
             <div className="w-[97%] flex justify-between border p-1 rounded-lg" key={i}>
                    <div className=" flex gap-1 items-center  ">
                       <div className="w-8 h-8 rounded-full object-cover">
                        <img src={item.patient.imageUrl} className='w-full rounded-full' alt="" />
                       </div>
                       <div className=" flex flex-col">
                        <p className='font-light'>{item.patient.name}</p>
                        <p className='font-light'>{item.patient.email}</p>
                        <p className='font-light flex gap-1 items-center'><Calendar1 className='w-4 h-4'/>{item.startTime.toDateString() +"  at "+item.startTime.toLocaleTimeString('en-US') }</p>
                        <p className='font-light flex gap-1 items-center'><Clock1 className='w-4 h-4'/>{item.startTime.toLocaleTimeString("en-US")+" to "+item.endTime.toLocaleTimeString("en-US")}</p>
                       </div>
                    </div>
                

                <div className=" flex flex-col gap-1 justify-center">
                          <p className='border p-0.5 w-fit border-amber-500 rounded-sm bg-amber-800 text-white'>Scheduled</p>
                  <div className="flex gap-1">
                     <Button className='bg-emerald-900 text-emerald-400'>Complete</Button>
                <DialogTrigger asChild><Button>View details</Button></DialogTrigger>
                  </div>
                </div>

             </div>
             
          ))}
             <DialogContent className='absolute  min-w-[50vw] w-[50vw] bg-gray-500 min-h-[50vh] h-[50vh]  '>
          <DialogHeader>
            <DialogTitle>Upcoming Appointment Details</DialogTitle>
            <DialogDescription>Make changes in the appointment here</DialogDescription>
          </DialogHeader>
            hello
               
             </DialogContent>
       
       </div>
       </Dialog>
  )
}

export default Getappointments