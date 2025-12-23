"use client";
import { bookAppointment, getAvailableTimeSlots } from '@/action/appointment';
import { getDoctorProfile } from '@/action/doctor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { BadgeCheck, Calendar1, Clock, Clock1, File, StethoscopeIcon, Wallet2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
export const dynamic = "force-dynamic";

function Profileview() {
  const { id, specialty } = useParams()
   const [description,setdescription]=useState("")
  const [data, setdata] = useState<any[]>([])
  const [slots, setslots] = useState<any[]>([])
 const router=useRouter()
  // 🔴 FIX: store selected day + slot
  const [active, setactive] = useState<{day:number,index:number,  item: any } | null>(null)

  const [togglebook, settogglebook] = useState(false)
 
  if (!id) {
    return <h1>Not available</h1>
  }

  const backlabell = specialty?.toString().split("%20").join(" ")
const [open, setOpen] = useState(false)
const [confirming,setconfirming]=useState(false)
  async function getdata(id: any) {
    try {
      const res = await getDoctorProfile(id)
      const slotres = await getAvailableTimeSlots(id)

      setdata(res.doctors)
      setslots(slotres.days)
      console.log(slotres);
      
    } catch (error) {}
  }
async function bookslot(active:any) {
  try {
    const formdata = new FormData()
    formdata.append("doctorId", id as string)
    formdata.append("startTime", active.item.startTime)
    formdata.append("endTime", active.item.endTime)
    formdata.append("description", description)

    const appointment = await bookAppointment(formdata)

    if (!appointment.success) {
      toast(appointment.error)
      return
    }

    toast("Appointment booked successfully")

    // ✅ CLOSE DIALOG
    setOpen(false)

    // ✅ RESET STATE
    setactive(null)
    settogglebook(false)
    setdescription("")
   setconfirming(false)
    // ✅ REFRESH DATA
    await getdata(id)

  } catch (error) {
    console.log(error)
  }
}


  useEffect(() => {
    getdata(id)
  }, [id])

  return (
   <Dialog open={open} onOpenChange={setOpen}>
      <div className="w-full">
        <PageHeader
          backLabel={`Back to ${backlabell}`}
          title={`Dr.${data[0]?.name ?? "..."}`}
          icon={<StethoscopeIcon />}
          backLink={`/doctors/${specialty}`}
        />

        <div className="flex w-full md:flex-row flex-col gap-2">
          {/* photocard */}
          <Card className='md:w-[25%] w-full h-fit'>
            <CardContent>
              <div className="w-full justify-center items-center flex gap-5 flex-col">
                <div className="w-26 h-26 rounded-full object-cover">
                  <img src={data[0]?.imageUrl} className='w-full rounded-full' alt="" />
                </div>

                <div className="flex flex-col items-center">
                  <p className='font-bold text-xl'>{data[0]?.name}</p>
                  <p className='border bg-[#0A4D68] w-fit text-white p-0.5 rounded-lg'>
                    {data[0]?.specialty}
                  </p>
                </div>

                <div className="flex gap-1">
                  <BadgeCheck />
                  <p className='font-light'>{data[0]?.experience} years experience</p>
                </div>

                <Button
                  className='bg-[#0A4D68] w-full text-white'
                  onClick={() => settogglebook(prev => !prev)}
                >
                  Book Appointments
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='md:w-[69%] w-full'>
            <CardHeader>
              <CardTitle className='text-xl font-bold'>
                About Dr. {data[0]?.name}
              </CardTitle>
              <CardDescription>Professional background and expertise.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <File className='w-5 h-5 ' />
                  <p className='font-bold'>Description</p>
                </div>
                <p className='text-muted-foreground'>{data[0]?.description}</p>
              </div>

              <Separator className='mt-5 mb-5' />

              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <Clock1 className='w-5 h-5 ' />
                  <p className='font-bold'>Availabilty</p>
                </div>
                <p>Check availability by clicking the book appointment button.</p>
              </div>

            // Inside your return statement, find the Tabs section:

{togglebook && (
  <div className="w-full mt-6 flex flex-col gap-10">
    <Tabs defaultValue='d1'>
      <TabsList className='flex md:flex-row flex-col border justify-between h-fit w-full'>
        {slots.map((daySlot, index) => (
          <TabsTrigger key={index} value={`d${index + 1}`} className='w-full'>
            {/* Display "Tue, Dec 23" properly */}
            {daySlot.displayDate}
          </TabsTrigger>
        ))}
      </TabsList>

      {[0, 1, 2, 3].map((dayIndex) => (
        <TabsContent key={dayIndex} value={`d${dayIndex + 1}`}>
          <div className="w-full flex flex-wrap gap-2 md:mt-0 ">
            {slots[dayIndex]?.slots.map((item: any, i: number) => (
              <p
                key={i}
                onClick={() => setactive({ day: dayIndex, index: i, item })}
                className={`border w-[170px] cursor-pointer h-[90px] rounded-lg p-3 text-[18px] flex items-center gap-1
                  ${active?.day === dayIndex && active?.index === i
                    ? "border-[#0A4D68] bg-[#0A4D68]/10"
                    : "hover:bg-accent"
                  }`}
              >
                <Clock className='w-5 h-5' />
                {/* FIX: Removed .slice(0,4) to show full time like "7:24 PM" */}
                {item.formatted}
              </p>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>

    <div className="w-full flex justify-end">
        <Button
          disabled={!active}
          className='md:w-[280px] w-[95%] md:mx-0 mx-auto bg-[#0a4d68] text-white'
          onClick={() => setOpen(true)}
        >
          Continue
        </Button>
    </div>
  </div>
)}
            </CardContent>
          </Card>

          {/* 🔴 FIX: Proper dialog content */}
          <DialogContent className="h-[50vh] md:min-h-[60vh] min-h-[80vh] w-[60vw] md:min-w-[50vw] min-w-[98%] flex flex-col overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>Book your Appointment...</DialogTitle>
              <DialogDescription>Fill your consultation details</DialogDescription>

            </DialogHeader>

            {active && (
              <div className="flex flex-col gap-5">
          <div className="">
                  <p className='flex items-center gap-1'><Calendar1 className='w-4 h-4'/>Date: {slots[active.day]?.date}</p>
                <p className='flex items-center gap-1'><Clock1 className='w-4 h-4'/>Time: {active.item.formatted}</p>
                <p className='flex items-center gap-1'><Wallet2 className='w-4 h-4'/>Cost : 2 Credits</p>
          </div>
                 <div className="flex flex-col gap-1">
                  <p className='font-bold'>Describe your medical concern(optional)</p>
                  <Textarea placeholder='Enter your medical concern..' className='h-[20vh]' onChange={(e)=>{setdescription(e.target.value)}}></Textarea>
                  <p className='font-light'>*This information can be shared with your doctor before appointment</p>
                 </div>
                 {/* buttons */}
                 <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-2">
               <DialogClose asChild ><Button> Change timeslot</Button></DialogClose> 
                  <Button onClick={()=>{bookslot(active),setconfirming(true)}}>{(confirming)?"Confirming...":"Confirm Booking"}</Button>
                 </div>
              </div>
            )}
          </DialogContent>
        </div>
      </div>
    </Dialog>
  )
}

export default Profileview
