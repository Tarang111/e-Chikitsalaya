"use client"
import { canpayout, getapprovedpayout, getcredits, payoutdetails } from '@/action/payout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar1Icon, CaptionsIcon, CoinsIcon, ShieldAlert, Videotape, Wallet2, WalletCards } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function EarningTab() {
    const [credits,setcredits]=useState({creditss:0,appointemntcount:0})
    const [canpayy,setcanpayy]=useState(true)
    const [emaill,setemail]=useState("")
    const [open,setopen]=useState(false)
    const [history,sethistory]=useState<any[]>([])
   async function getcreditsdetails() {
     try {
         const res=await getcredits()
         const res1=await canpayout()
         const res2=await getapprovedpayout()

         setcanpayy(res1)
         sethistory(res2.payoutrequest||[])
     if(res.success)
     {
        setcredits({creditss:res.credits.credits,appointemntcount:res.credits._count.doctorAppointments})
     }
     } catch (error) {
          console.log(error);
          
     }
   }
   async function setPayout() {
     try {
          const formdata=new FormData()
          formdata.append("netamount",(payoutcredits).toString() )
          formdata.append("amount",(credits.creditss*10).toString())
          formdata.append("platformfee",(credits.creditss*10-payoutcredits).toString())
          formdata.append("credits",(credits.creditss).toString())
          formdata.append("paypalemail",emaill)
          const res=await payoutdetails(formdata)
          if(res.success)
          {
            toast("Payout requested successfully")
            getcreditsdetails()
          }
          else{
            toast("Enter email or try again later..")
          }
     } catch (error) {
         toast("try again later")
         console.log(error);
         
     } 
     finally
     {
        setopen(false)
     }
   }
   const payoutcredits=credits.creditss*8;
   useEffect(()=>{
    getcreditsdetails()
   },[])
  return (
    <Dialog open={open} onOpenChange={setopen}>
    {/* <Card className='w-full flex justify-start'>
     <CardContent className='w-full flex flex-wrap gap-10'> */}
     <div className="w-[90%]  flex md:flex-wrap md:flex-row flex-col gap-10 justify-start items-start md:static absolute left-5 top-125 ">
         <div className=" border rounded-lg md:w-[350px] w-full h-[200px] flex gap-10  p-1 justify-around items-center">
                               <div className="">
                                 <p className='text-muted-foreground text-xl'>Available Credits</p>
                                 <p className='font-bold text-2xl'>{credits.creditss}</p>
                                 <p className='text-muted-foreground'>${payoutcredits} available for payout</p>
                               </div>
                  
                 <CoinsIcon className='w-8 h-8'/>


         </div>
          <div className=" border rounded-lg md:w-[350px] w-full h-[200px] flex gap-10 justify-around items-center">
                               <div className="">
                                 <p className='text-muted-foreground text-xl'>Total Appointments</p>
                                 <p className='font-bold text-2xl'>{credits.appointemntcount}</p>
                                 {/* <p className='text-muted-foreground'>${payoutcredits} available for payout</p> */}
                               </div>
                  
                 <Calendar1Icon className='w-8 h-8'/>


         </div>
        {canpayy? <div className="w-[98%] mx-auto  rounded-lg flex flex-col gap-3">
               <p className='font-bold text-2xl flex gap-1 items-center'><Wallet2/> Payout Management</p>
               <Card className='w-[98%] mx-auto'>
                <CardContent className='flex flex-col gap-5'>
                    <p className='font-bold text-xl'>Availabe For Payout</p>
                    <div className=" flex justify-between border p-2 rounded-lg">
                        <div className="flex flex-col gap-2">
                            <p className='text-muted-foreground '>Available Credits</p>
                            <p  className='font-bold '>{credits.creditss}</p>
                        </div>
                         <div className="flex flex-col gap-2">
                            <p className='text-muted-foreground '>Payout Amount</p>
                            <p  className='font-bold '>${payoutcredits}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-muted-foreground '>Platform fess</p>
                            <p  className='font-bold '>${credits.creditss*10-payoutcredits}</p>
                        </div>
                    </div>
                        <DialogTrigger asChild><Button onClick={()=>{setopen(true)}}>Payout all credits</Button></DialogTrigger>
                    {/* payout structure */}
                    <div className=" flex flex-col border p-2 rounded-lg">
                       <p className='font-light flex gap-1 items-center'><WalletCards className='w-4 h-4'/> Payout Structure</p>
                       <p className='text-muted-foreground text-sm'>You earn $8 per credit. Platform fee is $2 per credit. Payouts include all your available credits and are processed via PayPal.
</p>
                    </div>
                </CardContent>
                </Card>
         </div>:
           <div className="">
            <p className='font-bold text-xl'>Kindly wait untill your previous payout gets approved before making next payout 🛑</p>
           </div>
         }
       

<div className="w-full flex flex-col gap-1">
      <p className='text-2xl font-bold flex items-center gap-1'><WalletCards className='w-6 h-6'/>Payout History</p>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-2 w-full">
            {
              history.map((item,i)=>(
                <div className=" border rounded-lg p-2" key={i}>
                      <p className='font-bold'>{item.processedAt.toDateString()}</p>
                      <p className='font-light'>${item.netAmount} and deducted {item.credits} Credits</p>
                </div>
              ))
            }
          </div>
       </CardContent>
      </Card>
    </div>
   </div>
    <DialogContent>
        <DialogHeader>
            <DialogTitle className='text-xl'>Request Payout</DialogTitle>
            <DialogDescription>Request payout for all available credits.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
            {/* availbale credits gross amount section */}
            <div className="flex flex-col">
                  <div className="flex justify-between gap-2">
                            <p className='text-muted-foreground '>Available Credits :-</p>
                            <p  className='font-bold '>{credits.creditss}</p>
                        </div>
                         <div className="flex justify-between gap-2">
                            <p className='text-muted-foreground '>Gross Amount :-</p>
                            <p  className='font-bold '>${credits.creditss*10}</p>
                        </div>
                        <div className="flex justify-between gap-2">
                            <p className='text-muted-foreground '>Platform fees(20%) :-</p>
                            <p  className='font-bold '>-${credits.creditss*10-payoutcredits}</p>
                        </div>
            </div>
            {/* net payment */}
             <div className="flex justify-between gap-2">
                            <p className='font-bold '>Net Payment :-</p>
                            <p  className='font-bold '>${payoutcredits}</p>
             </div>
                  
             <div className="flex flex-col gap-1">
                <p className='font-bold'>Paypal Email</p>
                <input type="text" name="" id="" className='outline-0 border rounded-sm p-1' placeholder='your-Email@paypal.com' onChange={(e)=>{setemail(e.target.value)}}/>
                <p className='text-muted-foreground'>*Enter your paypal email to receive your amount.</p>
             </div>
             <div className="flex gap-2 items-center">
                <ShieldAlert className='w-6 h-6'/>
                <p className='text-muted-foreground text-sm'>{`Once processed by admin, ${credits.creditss} credits will be deducted from your account and $${payoutcredits} will be sent to your PayPal.`}</p>
             </div>
             <div className="flex mt-3 gap-1">
                <Button onClick={()=>{setPayout()}}>Request Approval</Button>
                <DialogClose asChild><Button>Close</Button></DialogClose>
             </div>
        </div>
    </DialogContent>

    
  </Dialog>
  )
}

export default EarningTab