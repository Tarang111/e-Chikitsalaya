"use client";
import { bookAppointment, getAvailableTimeSlots } from '@/action/appointment';
import { getDoctorProfile } from '@/action/doctor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { id, specialty } = useParams();
  const [description, setdescription] = useState("");
  const [data, setdata] = useState<any[]>([]);
  const [slots, setslots] = useState<any[]>([]);
  const [active, setactive] = useState<{ day: number, index: number, item: any } | null>(null);
  const [togglebook, settogglebook] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirming, setconfirming] = useState(false);

  if (!id) return <h1>Not available</h1>;

  const backlabell = specialty?.toString().split("%20").join(" ");

  async function getdata(id: any) {
    try {
      const res = await getDoctorProfile(id);
      const slotres = await getAvailableTimeSlots(id);
      setdata(res.doctors);
      setslots(slotres.days);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function bookslot(active: any) {
    try {
      setconfirming(true);
      const formdata = new FormData();
      formdata.append("doctorId", id as string);
      formdata.append("startTime", active.item.startTime);
      formdata.append("endTime", active.item.endTime);
      formdata.append("description", description);

      const appointment = await bookAppointment(formdata);

      if (!appointment.success) {
        toast(appointment.error);
        setconfirming(false);
        return;
      }

      toast("Appointment booked successfully");
      setOpen(false);
      setactive(null);
      settogglebook(false);
      setdescription("");
      setconfirming(false);
      await getdata(id);
    } catch (error) {
      setconfirming(false);
      console.log(error);
    }
  }

  useEffect(() => {
    getdata(id);
  }, [id]);

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
          {/* Photo Card */}
          <Card className='md:w-[25%] w-full h-fit'>
            <CardContent>
              <div className="w-full justify-center items-center flex gap-5 flex-col pt-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border">
                  <img src={data[0]?.imageUrl} className='w-full h-full object-cover' alt="Doctor" />
                </div>
                <div className="flex flex-col items-center">
                  <p className='font-bold text-xl'>{data[0]?.name}</p>
                  <p className='border bg-[#0A4D68] w-fit text-white px-3 py-0.5 rounded-lg text-sm mt-1'>
                    {data[0]?.specialty}
                  </p>
                </div>
                <div className="flex gap-1 items-center">
                  <BadgeCheck className="text-blue-500 w-5 h-5" />
                  <p className='font-light text-sm'>{data[0]?.experience} years experience</p>
                </div>
                <Button
                  className='bg-[#0A4D68] w-full text-white'
                  onClick={() => settogglebook(prev => !prev)}
                >
                  {togglebook ? "Hide Availability" : "Book Appointment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className='md:w-[73%] w-full'>
            <CardHeader>
              <CardTitle className='text-xl font-bold'>About Dr. {data[0]?.name}</CardTitle>
              <CardDescription>Professional background and expertise.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center text-[#0A4D68]">
                  <File className='w-5 h-5' />
                  <p className='font-bold'>Description</p>
                </div>
                <p className='text-muted-foreground text-sm leading-relaxed'>{data[0]?.description}</p>
              </div>

              <Separator className='my-6' />

              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center text-[#0A4D68]">
                  <Clock1 className='w-5 h-5' />
                  <p className='font-bold'>Availability</p>
                </div>
                <p className="text-sm text-muted-foreground">Select a preferred time slot below.</p>
              </div>

          {togglebook && (
  <div className="w-full mt-6 flex flex-col gap-10">
    <Tabs defaultValue='d1'>
      <TabsList className='flex md:flex-row flex-col border justify-between h-fit w-full'>
        {/* Restores original date tabs */}
        <TabsTrigger value='d1' className='w-full'>{slots[0]?.date}</TabsTrigger>
        <TabsTrigger value='d2' className='w-full'>{slots[1]?.date}</TabsTrigger>
        <TabsTrigger value='d3' className='w-full'>{slots[2]?.date}</TabsTrigger>
        <TabsTrigger value='d4' className='w-full'>{slots[3]?.date}</TabsTrigger>
      </TabsList>

      {[0, 1, 2, 3].map((day) => (
        <TabsContent key={day} value={`d${day + 1}`}>
          <div className="w-full flex flex-wrap gap-2 md:mt-0 ">
            {slots[day]?.slots.map((item: any, i: number) => (
              <p
                key={i}
                onClick={() => setactive({ day, index: i, item })}
                className={`border w-[170px] cursor-pointer h-[90px] rounded-lg p-3 text-[18px] flex items-center gap-1
                  ${active?.day === day && active?.index === i ? "border-[#0A4D68]" : ""}`}
              >
                <Clock className='w-5 h-5' />
                {/* Restores your original slice logic if that's what you prefer */}
                {item.formatted.toString()}
              </p>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>

    <div className="w-full flex justify-end">
      <DialogTrigger asChild>
        <Button
          disabled={!active}
          className='md:w-[280px] w-[95%] md:mx-0 mx-auto bg-[#0a4d68] text-white'
          onClick={() => setOpen(true)}
        >
          Continue
        </Button>
      </DialogTrigger>
    </div>
  </div>
)}
            </CardContent>
          </Card>

          {/* Booking Confirmation Dialog */}
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Appointment</DialogTitle>
              <DialogDescription>Review your details before confirming the booking.</DialogDescription>
            </DialogHeader>

            {active && (
              <div className="flex flex-col gap-6 pt-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-3 border">
                  <p className='flex items-center gap-3 text-sm'>
                    <Calendar1 className='w-4 h-4 text-[#0A4D68]'/> 
                    <span className="font-semibold">Date:</span> {slots[active.day]?.displayDate}
                  </p>
                  <p className='flex items-center gap-3 text-sm'>
                    <Clock1 className='w-4 h-4 text-[#0A4D68]'/> 
                    <span className="font-semibold">Time:</span> {active.item.formatted}
                  </p>
                  <p className='flex items-center gap-3 text-sm'>
                    <Wallet2 className='w-4 h-4 text-[#0A4D68]'/> 
                    <span className="font-semibold">Cost:</span> 2 Credits
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className='font-bold text-sm'>Medical Concern (Optional)</p>
                  <Textarea 
                    placeholder='Describe your symptoms or reason for visit...' 
                    className='min-h-[120px] resize-none' 
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    *This note will be visible to Dr. {data[0]?.name} before your call.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </DialogClose> 
                  <Button 
                    className="flex-1 bg-[#0A4D68] text-white" 
                    onClick={() => bookslot(active)}
                    disabled={confirming}
                  >
                    {confirming ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </div>
      </div>
    </Dialog>
  );
}

export default Profileview;
