"use client";
import { getdoctoravailability, setAvailability } from '@/action/doctor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Heading1 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { toast } from 'sonner';
function createLocalDateFromTime(timeStr:string) {
  const [hours, minutes] = timeStr.split(":").map(Number);

  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
      
  );
}

function Availabilitysetting() {
       const [loading,setloading]=useState(false)
    const [show,setshow]=useState(false)
     const [data,setdata]=useState({start:"",end:""})
      const [slot,setslott]=useState<any[]>([])
   
   
      async function setslot(data:any) {
      
        
        try {
          setloading(true)
           const start=createLocalDateFromTime(data.start)
            const end=createLocalDateFromTime(data.end)
             if (start.getTime() >= end.getTime()) {
          return toast("Start time must be before end time.");
        }
            const formdata=new FormData()
          formdata.append("starttime",start.toISOString())
          formdata.append("endtime",end.toISOString())
          
          const set=await setAvailability(formdata)
           
            if(set.success=="false")
            {
             toast(set.message)
            }
          getslot()
          setshow(false)
        } catch (error) {
            console.log(error);
            
        }
        finally{
          setloading(false)
        }
          
          
     }
     async function getslot()
     {
      try {
            const res=await getdoctoravailability()
            setslott(res.availabilty)
      } catch (error) {
         console.log(error);
         
      }
     }
     useEffect(()=>{
      getslot()
     },[])
    return (
    <div className="w-full">
        <Card className='w-full'>
         <CardHeader>
            <CardTitle className='flex gap-1 text-2xl  items-center'><Clock className='text-[#0A4D68]'/>Set Availability Here</CardTitle>
            <CardDescription>Set your daily availability for patient appointments</CardDescription>
         </CardHeader>
   
     <CardContent className='flex flex-col gap-2 '>
        <div className=" flex flex-col gap-2 border p-1 rounded-lg ">
          <p className='font-bold text-2xl'>Available Slots</p>
     {slot.length>0? slot.map((item,i)=>(<div className="w-[50%] flex justify-between md:flex-row flex-col" key={i}>
      <p className='border p-1 w-[200px] font-bold flex justify-center rounded-lg'>{item.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      <p className='text-2xl font-bold md:ml-0 ml-auto'>To</p>
            <p className='border p-1 w-[200px] font-bold rounded-lg flex justify-center'>{item.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    
      )): <p>No Availabilty Slot found...😕</p>}
     
        </div>
     {show && <div className="w-full border p-1 rounded-lg  flex flex-col gap-2">
        <p className=' font-bold'>Set Daily Availability...</p>
        <div className="flex justify-between md:flex-row flex-col md:gap-0 gap-1 ">
           {/* //starttime */}
          <div className="flex flex-col gap-1">
             <p className=' font-bold'>Start time</p>
          <input type="time" name="starttime" className='md:w-[280px] w-full p-1  border rounded-lg' id="" onChange={(e)=>{setdata((prev)=>({...prev,start:e.target.value}))}}/>
          </div>

   {/* end time */}
           <div className="flex flex-col gap-1">
             <p className=' font-bold'>End time</p>
          <input type="time" name="endtime" className=' md:w-[280px] w-full p-1  border rounded-lg' id="" onChange={(e)=>{setdata((prev)=>({...prev,end:e.target.value}))}} />
          </div>
        </div>
       <div className="w-full flex justify-end gap-1">
                 <Button onClick={()=>{setshow(prev=>!prev)}} className='bg-[#0A4D68] text-white'>Cancel</Button>
                 <Button onClick={()=>{setslot(data)}}>{(loading)?"Saving...":"Save Availabilty"}</Button>
       </div>

      </div>}
      <Button onClick={()=>{setshow(prev=>!prev)}} className='bg-[#0A4D68] text-white'>Set Availability slot</Button>
     </CardContent>


        </Card>
    </div>
  )
}

export default Availabilitysetting