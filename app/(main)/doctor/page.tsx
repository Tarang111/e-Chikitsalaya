"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCheck, Clock, CrossIcon, DollarSign, X } from 'lucide-react'

import Availabilitysetting from './_components/availabilitysetting'
import Getappointments from './_components/getappointments'
import { getAppointments } from '@/action/doctor'
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Calendar1, Clock1 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea'
import { redirect, useRouter } from "next/navigation";

import { deleteAppointment, generateVideoToken, markDoneAppointment } from '@/action/appointment'
import EarningTab from './_components/earning'
import { getCurrentUser } from '@/action/onboarding'
export const dynamic = "force-dynamic";

 function dashboarddoctor() {
async function check() {
    const user=await getCurrentUser()
   if (user.verificationStatus !== "VERIFIED") {
     redirect("/doctor/verification")
}
}       
 const [details,setdetails]=useState<any[]>([])
 const router =useRouter()
const [selected, setselected] = useState<any>(null);
const [open ,setopen]=useState(false)
const [notes,setnotes]=useState("")
const [canjoinn ,setcanjoin]=useState(false)
const [deleteconfirm,setdeleteconfirm]=useState(false)
   async function getappointementsofdoctor() {
      try {
           const res=await getAppointments();
           console.log(res);
           setdetails(res.appointments)
           
      } catch (error) {
        toast("TRY AGAIN LATER")
      }
   }
   async function deleteAppointments(apointmentid:string) {
      try {
         const formdata=new FormData()
        formdata.append("appointmentid",apointmentid)
        formdata.append("notes",notes)
         const deletee=await deleteAppointment(formdata)
         if(deletee.success)
         {
           return toast("CANCELLED SUCCESFULLY")
         }
         toast("TRY AGAIN LATER")
         
      } catch (error) {
         console.log(error);
         
      }
      finally{
         setopen(false)
         setdeleteconfirm(false)
         getappointementsofdoctor()
      }
   }
   async function markdone(apointmentid:string) {
        const formdata=new FormData()
        formdata.append("appointmentid",apointmentid)
        formdata.append("notes",notes)
      try {
         const res=await markDoneAppointment(formdata)
         if(res.success)
            {
                    toast("Marked as done")
                   
            }
            else
            {
               toast("Try again later")
            }
      } catch (error) {
         console.log(error);
toast("Try again later")
         
      }
      finally{
         setopen(false)
         getappointementsofdoctor()
      }
   }
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
      check()
    getappointementsofdoctor()
   },[])
    function canmarkdone(){
          const now = new Date();
    const appointmentTime = new Date(selected?.endTime);
    const timeDifference = (now.getTime()-appointmentTime.getTime() ) / (1000 * 60);
    if(timeDifference>1)
    {
      return true
    }
    return false
   }
  
  return (
        <Dialog  open={open} onOpenChange={setopen} >
    <div className="w-full mt-5 ">
                <Tabs defaultValue='Earning' className=''>
             <div className=" gap-1 w-full  flex md:flex-row flex-col ">
                    <TabsList className='flex md:w-[320px] w-full h-fit flex-col  gap-2 border'>
                        <TabsTrigger value='Earning' className='w-full justify-start'><DollarSign/>Earning</TabsTrigger>
                        <TabsTrigger value='Appointements' className='w-full justify-start'><Calendar/> Appointments</TabsTrigger>
                        <TabsTrigger value='Availability' className='w-full justify-start'><Clock/> Availability</TabsTrigger>
                    </TabsList>

                  <div className="w-full justify-start">
                    <TabsContent value='Earning'>
                       <Card className=' flex justify-start border'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Earning Information</CardTitle>
                            <CardDescription>Check your earning and request for payout.</CardDescription>
                          <CardContent className='flex w-fit justify-start '>
                             <EarningTab />

                          </CardContent>
                        </CardHeader>
                       </Card>
                  </TabsContent>


                   <TabsContent value="Appointements">
                       <Card className='w-full'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Upcoming Appointments</CardTitle>
                            <CardDescription>Check appointments mark them done ,leave note or cancel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                         
       <div className="w-full border rounded-lg flex flex-col gap-2 p-2">
          {details.length>0?details.map((item,i)=>(
             <div className="md:w-[97%] w-full flex justify-between md:flex-row flex-col gap-2 md:gap-0 border p-1 rounded-lg" key={i}>
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
                

               <div className="flex justify-center items-center">
                  <div className="flex gap-1 items-center">
                          <p className='border p-0.5 w-fit border-amber-500 rounded-sm bg-amber-800 text-white'>Scheduled</p>
                
                <DialogTrigger asChild><Button onClick={()=>{setselected(item),setopen(true)}}>View details</Button></DialogTrigger>
                  </div>
              
</div>
             </div>
             
          )):(<h1>No appointment found</h1>)}
           
       
       </div>
       
                        </CardContent>
                       </Card>
                  </TabsContent>
                   <TabsContent value='Availability'>
                       
                         <Availabilitysetting />
                        
                  </TabsContent>
                  </div>




    </div>
                </Tabs>
                
               <DialogContent className='md:h-[90vh] h-screen max-h-fit md:w-[60vw] md:min-w-[30vw] min-w-screen w-screen flex flex-col  overflow-y-scroll '>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Make changes in the appointment here</DialogDescription>
          </DialogHeader>
               <div className="w-full flex flex-col gap-4">
                   <div className="">
                    <p className='font-bold'>Patient</p>
                    <div className="flex items-center gap-1">
                      {/* image */}
                       <div className=" flex gap-1 items-center  ">
                       <div className="w-8 h-8 rounded-full object-cover">
                        <img src={selected?.patient?.imageUrl} className='w-full rounded-full' alt="" />
                       </div>
                       </div>
                       {/* name */}
                        <div className=" flex flex-col">
                        <p className='font-light'>{selected?.patient?.name}</p>
                        <p className='font-light'>{selected?.patient?.email}</p>
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
                   <p className='border p-0.5 w-fit border-amber-500 rounded-sm bg-amber-800 text-white'>Scheduled</p>
                   </div>

                    <div className="flex flex-col">
                    <p className='font-bold'>Patient Description</p>
                   <p className='font-light'>{(!selected?.patientDescription)?"No description found...":selected?.patientDescription}</p>
                   </div>

                     <div className="flex flex-col">
                    <p className='font-bold'>Video Consultation</p>
                   <p className='border p-0.5 w-fit border-emerald-400 rounded-sm bg-emerald-800 text-white' onClick={()=>{handlevideocall(selected?.id)}}>{canjoin()?(canjoinn)?"Processing Video call":"Video call link here":"Video call will be available 30 minutes before appointment "}</p>
                   </div>

                     <div className="flex flex-col gap-1">
                    <p className='font-bold'>Doctor Notes</p>
                       <Textarea className='h-[5vw]' placeholder='Add notes  or prescription here...' onChange={(e)=>{setnotes(e.target.value)}}></Textarea>
                   </div>

                   <div className="flex md:flex-row flex-col justify-between w-full md:gap-0 gap-1">
                   <div className="flex gap-1 ">
                   { canmarkdone()&&<Button onClick={()=>{markdone(selected?.id)}}><CheckCheck/> Mark as Done</Button>}
                    <Button className='bg-red-500 text-white' onClick={()=>{setdeleteconfirm(prev=>!prev)}}><X/>Cancel</Button>
                   </div>
                    <DialogClose asChild><Button className='bg-[#0A4D68] text-white w-fit'>Close</Button></DialogClose>
                   </div>

                
                </div>
                 
             { deleteconfirm && <div className="">
                  <p className='font-bold text-xl'>Confirm cancellation of this appointment</p>
                  <div className="flex gap-1">
                     <Button onClick={()=>{deleteAppointments(selected?.id)}}>Yes</Button>
                     <Button onClick={()=>{setdeleteconfirm(prev=>!prev)}}>No</Button>
                  </div>
                </div>}
              
               
             </DialogContent>
             </div>
        </Dialog>
  )
}

export default dashboarddoctor