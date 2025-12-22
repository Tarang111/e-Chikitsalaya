"use client";
import { generateVideoToken } from '@/action/appointment';
import { getAppointentofpatient } from '@/action/patient'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/PageHeader'

import { Calendar1, Calendar1Icon, Clock1, File } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
export const dynamic = "force-dynamic";

function Appointment() {
    const [appointments,setappointments]=useState<any[]>([])
    const [selected, setselected] = useState<any>(null);
    const [open ,setopen]=useState(false)
    const [canjoinn ,setcanjoin]=useState(false)
    async function getappointments() {
         try {
             const appointments=await getAppointentofpatient()
              setappointments(appointments.appointments)
         } catch (error) {
            toast("Try again later")
         }
    }
     const router =useRouter()
     async function handlevideocall(apointmentid:string) {
            try {
             const res=await generateVideoToken(apointmentid)
             if(res.success)
             {
                setcanjoin(true)
                router.push(`video-call/?sessionId=${res.videoSessionId}&token=${res.token}&appointmentId=${apointmentid}`)
             }
             else{
                     toast("Video link is not ready")
             }
            } catch (error) {
             toast("Video link is not ready")
            }
            finally
            {
               setcanjoin(false)
            }
       }
       function canjoin(){
              const now = new Date();
        const appointmentTime = new Date(selected?.startTime);
        const timeDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);
        if(timeDifference<=30)
        {
          return true
        }
        return false
       }
    useEffect(()=>{
        getappointments()
    },[])
  return (
    <Dialog>
  <div className="">
    <PageHeader title={"My Appointments"} icon={<Calendar1Icon/>}/>
    <Card className='w-full'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Appointments</CardTitle>
                            <CardDescription>Check appointments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                         
       <div className="w-full border rounded-lg flex flex-col gap-2 p-2">
          {appointments.length>0?appointments.map((item,i)=>(
             <div className="md:w-[97%] w-full flex justify-between md:flex-row flex-col gap-2 md:gap-0 border p-1 rounded-lg" key={i}>
                    <div className=" flex gap-1 items-center  ">
                       <div className="w-8 h-8 rounded-full object-cover">
                        <img src={item.doctor.imageUrl} className='w-full rounded-full' alt="" />
                       </div>
                       <div className=" flex flex-col">
                        <p className='font-light'>Dr.{item.doctor.name}</p>
                        <p className='font-light'>{item.doctor.email}</p>
                        <p className='font-light flex gap-1 items-center'><Calendar1 className='w-4 h-4'/>{item.startTime.toDateString() +"  at "+item.startTime.toLocaleTimeString('en-US') }</p>
                        <p className='font-light flex gap-1 items-center'><Clock1 className='w-4 h-4'/>{item.startTime.toLocaleTimeString("en-US")+" to "+item.endTime.toLocaleTimeString("en-US")}</p>
                       </div>
                    </div>
                

               <div className="flex justify-center items-center">
                  <div className="flex gap-1 items-center">
                          {item.status=="SCHEDULED"&&<p className='border p-0.5 w-fit border-amber-500 rounded-sm bg-amber-800 text-white'>{item.status}</p>}
                           {item.status=="CANCELLED"&&<p className='border p-0.5 w-fit border-red-400 rounded-sm bg-red-800 text-white'>{item.status}</p>}
                            {item.status=="COMPLETED"&&<p className='border p-0.5 w-fit border-emerald-400 rounded-sm bg-emerald-900/40 text-white'>{item.status}</p>}
                
                <DialogTrigger asChild><Button onClick={()=>{setselected(item),setopen(true)}} >View details</Button></DialogTrigger>
                  </div>
              
</div>
             </div>
             
          )):(<h1>No appointment found</h1>)}
           
       
       </div>
       
                        </CardContent>
                       </Card>
  </div>
    <DialogContent className='md:h-[90vh] h-screen max-h-fit md:w-[60vw] md:min-w-[30vw] min-w-screen w-screen flex flex-col  overflow-y-scroll '>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>Make changes in the appointment here</DialogDescription>
            </DialogHeader>
                 <div className="w-full flex flex-col gap-4">
                     <div className="">
                      <p className='font-bold'>Doctor</p>
                      <div className="flex items-center gap-1">
                        {/* image */}
                         <div className=" flex gap-1 items-center  ">
                         <div className="w-8 h-8 rounded-full object-cover">
                          <img src={selected?.doctor?.imageUrl} className='w-full rounded-full' alt="" />
                         </div>
                         </div>
                         {/* name */}
                          <div className=" flex flex-col">
                          <p className='font-light'>{selected?.doctor?.name}</p>
                          <p className='font-light'>{selected?.doctor?.email}</p>
                            </div>
                      </div>
                     </div>
  
                     <div className="flex flex-col">
                      <p className='font-bold'>Scheduled Time</p>
                 
                     
                       
                          <div className=" flex flex-col">
                                            <p className='font-light flex gap-1 items-center'><Calendar1 className='w-4 h-4'/>{selected?.startTime.toDateString() +"  at "+selected?.startTime.toLocaleTimeString('en-US') }</p>
                          <p className='font-light flex gap-1 items-center'><Clock1 className='w-4 h-4'/>{selected?.startTime.toLocaleTimeString("en-US")+" to "+selected?.endTime.toLocaleTimeString("en-US")}</p>
                          
                      </div>
                     </div>
               
  
                     <div className="flex flex-col">
                      <p className='font-bold'>Status</p>
                    {selected?.status=="SCHEDULED"&&<p className='border p-0.5 w-fit border-amber-500 rounded-sm bg-amber-800 text-white'>{selected?.status}</p>}
                           {selected?.status=="CANCELLED"&&<p className='border p-0.5 w-fit border-red-400 rounded-sm bg-red-800 text-white'>{selected?.status}</p>}
                            {selected?.status=="COMPLETED"&&<p className='border p-0.5 w-fit border-emerald-400 rounded-sm bg-emerald-900/40 text-white'>{selected?.status}</p>}
                
                     </div>
  
                      <div className="flex flex-col">
                      <p className='font-bold'>Doctor notes</p>
                     <p className='font-light'>{(!selected?.notes)?"No notes found...":selected?.notes}</p>
                     </div>
  
                       <div className="flex flex-col">
                      <p className='font-bold'>Video Consultation</p>
                   {selected?.status=="SCHEDULED"&&  <p className='border p-0.5 w-fit border-emerald-400 rounded-sm bg-emerald-800 text-white' onClick={()=>{handlevideocall(selected?.id)}}>{canjoin()?(canjoinn)?"Processing Video call":"Video call link here":"Video call will be available 30 minutes before appointment "}</p>}
                   {selected?.status=="CANCELLED"&&<p className='border p-0.5 w-fit border-red-400 rounded-sm bg-red-800 text-white'>{selected?.status}</p>}
                            {selected?.status=="COMPLETED"&&<p className='border p-0.5 w-fit border-emerald-400 rounded-sm bg-emerald-900/40 text-white'>{selected?.status}</p>}
                
                     </div>
  
                       <div className="flex flex-col gap-1">
                    
  
                    
                      <DialogClose asChild><Button className='bg-[#0A4D68] text-white w-fit'>Close</Button></DialogClose>
                     </div>
  
                  
                  </div>
                   
              
                
                 
               </DialogContent>
  </Dialog>
  )
}

export default Appointment