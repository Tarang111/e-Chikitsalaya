"use client";
import { approvePayout, pendingList, updateDoctor, verifieddoctorlist } from "@/action/admin"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Link from "next/link";


import { AlertCircle, ArrowUpLeft, ArrowUpRight, Badge, BadgeCheck, Calendar1, CheckCheck, Clock1, Dot,  DotIcon,  File,  Inbox,  Link2,  MailCheck,  MessageSquare,  Search } from "lucide-react"
import React, { useEffect, useState } from 'react'
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getpendingpayout } from "@/action/payout";

  export const dynamic = "force-dynamic";

function page() {
    const [pending,setpending]=useState<any[]>([])
    const [verified,setverified]=useState<any[]>([])
      const [filterd,setfiltered]=useState<any[]>([])
      const [payoutrequest,setpayoutrequest]=useState<any[]>([])
      const [selected, setselected] = useState<any>(null);
      const [open,setopen]=useState(false)
      const [approve,setapprove]=useState(false)
    const router=useRouter()
       async function fetchpendinglist() {
          try {
             const pendingdoctor=await pendingList()
               setpending(pendingdoctor.pending)
                const verified=await verifieddoctorlist()
                setverified(verified.listdoctor)
                 setfiltered(verified.listdoctor)
                 const res=await getpendingpayout()
                 if(res.success)
                 {
                   setpayoutrequest(res.payoutrequest||[])
                   
                 }
          } catch (error) {
             console.log(error);
             toast("Try again later") 
             
          }
       } 
       async function approvepayout(id:string) {
        try {
             const formdata=new FormData()
             formdata.append("payoutId",id)
             const res=await approvePayout(formdata)
             if(res.success)
             {
              toast("Aprroved Request")
             }
        } catch (error) {
          console.log(error);
          
        }
        finally{
          setopen(false)
          setapprove(false)
          fetchpendinglist()
        }
       }

       async function handleapproval(id:string,status:string) {
          try {
            const formdata=new FormData
            formdata.append("status",status)
            formdata.append("id",id)
            const user=await updateDoctor(formdata)
            if(user.success)
            {
              toast("Status Updated")
              fetchpendinglist();
            }

          } catch (error) {
              console.log(error);
              
          }
          finally
          {
            router.refresh()
          }
       }

       async function handlesearch(keyy:string)
       {
        const value = keyy.toLowerCase().trim()

    if (!value) {
      // empty search → show all
      setfiltered(verified)
      return
    }
           const filtered=filterd.filter((doctor)=>{
                   const name = doctor.name?.toLowerCase() || ""
      const specialty = doctor.specialty?.toLowerCase() || ""
      const email = doctor.email?.toLowerCase() || ""
       const exp=doctor.experience.toLocaleString()
      return (
        name.includes(value) ||
        specialty.includes(value) ||
        email.includes(value)||
        exp.includes(value)

      )
       })||[]
       setfiltered(filtered)
       }
       
       useEffect(()=>{
     fetchpendinglist()
},[])  

  return (    
    <Dialog open={open} onOpenChange={setopen}>
    <div className="w-full ">
      <Tabs defaultValue="pending" className=" ">
<div className="flex md:flex-row flex-col gap-5 w-full">
    <TabsList className="flex flex-col h-fit md:w-[20%] w-[90%]">
    <TabsTrigger className="w-full" value="pending">Pending Approval</TabsTrigger>
    <TabsTrigger className="w-full" value="payout">Payout requests</TabsTrigger>
    <TabsTrigger className="w-full" value="doctor">Doctors</TabsTrigger>
  </TabsList>
   {/* pendinglist */}
  <TabsContent value="pending">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold text-2xl">Pending Doctor Verifications</CardTitle>
        <CardDescription>Review and approve doctor applications</CardDescription>
      </CardHeader>
         <CardContent className="w-full">
          {pending.length>0 ? 
            <div className=" flex flex-col gap-2.5">
                  {
                    pending.map((doctor)=>(


      <Dialog key={doctor.id}  >
  <div className="w-full border flex md:flex-row flex-col md:gap-0 gap-2 justify-between rounded-lg items-center p-2" key={doctor.id}>
    {/* info */}
    <div className="flex gap-1.5 items-center">
      <div className="w-8 h-8 object-cover rounded-full">
        <img src={doctor.imageUrl} className="w-full rounded-full" alt="" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold">{doctor.name}</p>
        <p className=" md:flex hidden  font-light items-center">
          {doctor.specialty}
          <Dot />
          {doctor.experience} years experience
        </p>
      </div>
    </div>

    <div className="flex gap-1">
      <p className="border p-1 bg-amber-800 border-amber-400 text-white w-fit rounded-sm">Pending</p>

      {/* CLICK TO OPEN MODAL */}
      <DialogTrigger asChild>
        <Button>View Details</Button>
      </DialogTrigger>
    </div>
  </div>

  {/* DIALOG BOX CONTENT → moved here properly */}
  <DialogContent className="md:w-[50%] w-[98%] md:min-w-[50%]  min-w-[98%] md:h-[90vh] md:min-h-screen h-[80vh] min-h-[80vh]  md:overflow-hidden overflow-y-scroll ">
    <DialogHeader className="">
      <DialogTitle>Doctor Verification Details</DialogTitle>
      <DialogDescription>Review the doctors information carefully before making a decission.</DialogDescription>
    </DialogHeader>

    {/* You can add profile details here later */}
    <div className=" flex justify-between md:flex-row flex-col md:gap-0 gap-2">
         <div className=" flex flex-col justify-start">
          <p className="font-light">Full Name</p>
          <p className="font-bold">{doctor.name}</p>
         </div>

         <div className=" flex flex-col justify-start ">
          <p className="font-light">Email</p>
          <p className="font-bold">{doctor.email}</p>
         </div>

         <div className=" flex flex-col justify-start">
          <p className="font-light">Apllication Date</p>
          <p className="font-bold"> {new Date(doctor.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })}</p>
         </div>
    </div>
    <Separator className="mt-1 mb-1"/>
    <div className="">
      <div className=" flex items-center gap-1 ">
        <BadgeCheck/>
        <p className="font-bold text-xl">Professional information</p>
      </div>

      <div className=" flex justify-between w-[80%]  md:flex-row flex-col md:gap-0 gap-1">
         <div className=" flex flex-col justify-start">
          <p className="font-light">Specialty</p>
          <p className="font-bold">{doctor.specialty}</p>
         </div>

         <div className=" flex flex-col justify-start">
          <p className="font-light">Years of experience</p>
          <p className="font-bold">{doctor.experience} years</p>
         </div>

         
        
    </div>
    </div>
     <Separator className="mt-1 mb-1"/>
      <div className=" flex justify-between w-[80%]">
         <div className=" flex flex-col justify-start">
          <div className="font-light flex gap-1 items-center ">Credential link <Link2 className="w-4 h-4"/></div>
     <Link href={doctor.credentialUrl} className="" target="_blank">       <div className="font-bold flex gap-1 items-center ">View Credentials <ArrowUpRight className="w-4 h-4"/></div></Link>
         </div>
         </div>
          <Separator className="mt-1 mb-1"/>
           <div className=" flex justify-between w-[80%]">
         <div className=" flex flex-col justify-start">
          <div className="font-light flex gap-1 items-center "><File className="w-4 h-4"/> Servive Description</div>
        <div className="font-bold flex gap-1 items-center ">{doctor.description}</div>
         </div>
         </div>
    {/* Action Buttons */}
    <div className="flex justify-end gap-3 mt-5">
      <Button variant="destructive" onClick={()=>{handleapproval(doctor.id,"REJECTED")}}>Reject</Button>
      <Button onClick={()=>{handleapproval(doctor.id,"VERIFIED")}}>Approve</Button>
    </div>
  </DialogContent >
</Dialog>

                    ))
                  }
          </div>
           : 
           <h1>No request found</h1>
          }
         </CardContent>
    </Card>
  </TabsContent>

  {/* doctor */}
  <TabsContent value="doctor"> 
    <Card className="w-full">
      <CardHeader className="flex justify-between md:flex-row flex-col gap-2">
        <div className="flex flex-col gap-2">
          <CardTitle className="font-bold text-2xl">Manage Doctors</CardTitle>
        <CardDescription>View and manage all Verified Doctors</CardDescription>
        </div>
       <div className=" border-2 rounded-lg items-center h-fit flex gap-1 p-1">
        <Search/>
        <input type="search" name="" id="" placeholder="Search here..." className="focus:outline-0" onChange={(e)=>{handlesearch(e.target.value)}}/>
       </div>
      </CardHeader>
      <CardContent>
       {filterd.length>0 ? 
            <div className=" flex flex-col gap-2.5">
                  {
                    filterd.map((doctor)=>(


      <Dialog key={doctor.id}  >
  <div className="w-full border flex md:flex-row flex-col gap-2 justify-between rounded-lg items-center p-2" key={doctor.id}>
    {/* info */}
    <div className="flex gap-1.5 items-center">
      <div className="w-8 h-8 object-cover rounded-full">
        <img src={doctor.imageUrl} className="w-full rounded-full" alt="" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold">{doctor.name}</p>
        <p className=" font-light items-center md:flex hidden">
          {doctor.specialty}
          <Dot />
          {doctor.experience} years experience
        </p>
        <p className="md:hidden block">{doctor.specialty}</p>
      </div>
    </div>

    <div className="flex gap-1">
      <p className="border p-1 bg-emerald-400 border-emerald-800 text-white w-fit rounded-sm">Verified</p>

      {/* CLICK TO OPEN MODAL */}
      <DialogTrigger asChild>
        <Button variant={"destructive"}>Suspend</Button>
      </DialogTrigger>
    </div>
  </div>

  {/* DIALOG BOX CONTENT → moved here properly */}
  <DialogContent className="md:w-[50%] w-[98%] md:min-w-[50%]  min-w-[98%] md:h-[90vh] md:min-h-screen h-[80vh] min-h-[80vh]  md:overflow-hidden overflow-y-scroll ">
    <DialogHeader>
      <DialogTitle>Doctor Suspension form</DialogTitle>
      <DialogDescription>Review the doctors information carefully before making a decission.</DialogDescription>
    </DialogHeader>

    {/* You can add profile details here later */}
    <div className=" flex justify-between md:flex-row flex-col gap-1">
         <div className=" flex flex-col justify-start">
          <p className="font-light">Full Name</p>
          <p className="font-bold">{doctor.name}</p>
         </div>

         <div className=" flex flex-col justify-start">
          <p className="font-light">Email</p>
          <p className="font-bold">{doctor.email}</p>
         </div>

         <div className=" flex flex-col justify-start">
          <p className="font-light">Apllication Date</p>
          <p className="font-bold"> {new Date(doctor.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })}</p>
         </div>
    </div>
    <Separator className="mt-1 mb-1"/>
    <div className="">
      <div className=" flex items-center gap-1 ">
        <BadgeCheck/>
        <p className="font-bold text-xl">Professional information</p>
      </div>

      <div className=" flex justify-between w-[80%] md:flex-row flex-col gap-1">
         <div className=" flex flex-col justify-start ">
          <p className="font-light">Specialty</p>
          <p className="font-bold">{doctor.specialty}</p>
         </div>

         <div className=" flex flex-col justify-start">
          <p className="font-light">Years of experience</p>
          <p className="font-bold">{doctor.experience} years</p>
         </div>

         
        
    </div>
    </div>
     <Separator className="mt-1 mb-1"/>
      <div className=" flex justify-between w-[80%]">
         <div className=" flex flex-col justify-start">
          <div className="font-light flex gap-1 items-center ">Credential link <Link2 className="w-4 h-4"/></div>
     <Link href={doctor.credentialUrl} className="" target="_blank">       <div className="font-bold flex gap-1 items-center ">View Credentials <ArrowUpRight className="w-4 h-4"/></div></Link>
         </div>
         </div>
          <Separator className="mt-1 mb-1"/>
           <div className=" flex justify-between w-[80%]">
         <div className=" flex flex-col justify-start">
          <div className="font-light flex gap-1 items-center "><File className="w-4 h-4"/> Servive Description</div>
        <div className="font-bold flex gap-1 items-center ">{doctor.description}</div>
         </div>
         </div>
    {/* Action Buttons */}
    <div className="flex justify-end gap-3 mt-5">
      <Button variant="destructive" onClick={()=>{handleapproval(doctor.id,"REJECTED")}}>Suspend</Button>
      <DialogClose asChild><Button>Close</Button></DialogClose>
      
    </div>
  </DialogContent >
    </Dialog>

                    ))
                  }
          </div>
           : 
           <h1>No Verified doctors found</h1>
          }
      </CardContent>
    </Card>
    </TabsContent>

    {/* payout request */}
    <TabsContent value="payout">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pending Payout requests</CardTitle>
          <CardDescription>Review and approve doctor payout requests</CardDescription>
        </CardHeader>
        <CardContent>
           <div className=" flex flex-col gap-2">
             {payoutrequest.length>0?payoutrequest.map((item,i)=>(
                         <div className="w-[97%] flex justify-between border p-1 md:flex-row flex-col rounded-lg" key={i}>
                                <div className=" flex gap-2 items-center  ">
                                   <div className="w-8 h-8 rounded-full object-cover">
                                    <img src={item?.doctor?.imageUrl} className='w-full rounded-full' alt="" />
                                   </div>
                                   <div className=" flex flex-col">
                                    <p className='font-light'>{item?.doctor?.name}</p>
                                    <p className='font-light'>{item?.doctor?.specialty}</p>
                                    <p className='font-light flex items-center ' >{item?.credits} Credits <DotIcon className="w-5 h-5"/>${item.netAmount}</p>
                                     <p className='font-light flex items-center gap-1'><MailCheck className="w-4 h-4"/>  {item.paypalEmail}</p>
                                   </div>
                                </div>
                            
            
                           <div className="flex md:justify-center  md:items-center">
                              <div className="flex gap-1 md:items-center md:flex-row flex-wrap">
                                               <p className='border p-0.5 w-fit border-amber-500 rounded-sm bg-amber-800 text-white'>Pending</p>
                                               <DialogTrigger asChild><Button onClick={()=>{setselected(item),setopen(true)}}>View details</Button></DialogTrigger>
                                                   <Button className="bg-emerald-900/40 text-emerald-400 flex gap-1 items-center" onClick={()=>{setselected(item),setopen(true)}}>Approve<CheckCheck/></Button>
               
                              </div>
                          
            </div>
                         </div>
                         
                      )):(<h1>No request found...</h1>)}
           </div>
        </CardContent>
      </Card>
    </TabsContent>
</div>
</Tabs>

    </div>
    <DialogContent>
     <DialogHeader>
      <DialogTitle className="text-xl">Confirm payout approval</DialogTitle>
      <DialogDescription>Are you sure you want to approve this payout?</DialogDescription>
     </DialogHeader>
      <Card>
        <CardContent className="flex flex-col gap-5">
            <p className="flex items-center gap-1 text-sm font-light"><AlertCircle className="w-4 h-4"/>This action will</p>
          <div className="">
            <p className="text-muted-foreground items-center flex gap-1"><Dot className="w-4 h-4"/>Deduct {selected?.credits} credits from Dr.{selected?.doctor?.name}'s account</p>
               <p className="text-muted-foreground items-center flex gap-1"><Dot className="w-4 h-4"/>Mark the payout as PROCESSED</p>
                       <p className="text-muted-foreground items-center flex gap-1"><Dot className="w-4 h-4"/>This action can't be undone</p>
          </div>
           <div className="flex flex-col">
                  <div className="flex md:flex-row flex-col md:justify-between md:gap-2 ">
                            <p className='text-muted-foreground '>Doctor :-</p>
                            <p  className='font-bold '>Dr.{selected?.doctor?.name}</p>
                        </div>
                         <div className="flex justify-between gap-2">
                            <p className='text-muted-foreground '>Amount to pay :-</p>
                            <p  className='font-bold '>${selected?.netAmount}</p>
                        </div>
                        <div className="flex justify-between gap-2">
                            <p className='text-muted-foreground '>PayPal :-</p>
                            <p  className='font-bold '>{selected?.paypalEmail}</p>
                        </div>
            </div>
        </CardContent>
      </Card>
      <div className="flex gap-1 items-center justify-end">
        <DialogClose asChild><Button>Close</Button></DialogClose>
        <Button onClick={()=>{approvepayout(selected?.id),setapprove(true)}}>{(approve)?"Approving...":"Approve Payout"}</Button>
      </div>
    </DialogContent>


    </Dialog> 
  )
}

export default page