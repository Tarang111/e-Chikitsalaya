import React from 'react'
import { Separator } from './separator'
import { Calendar, Check, File, Stethoscope, User, Verified, Video, Wallet } from 'lucide-react'
import { Button } from './button'
import Pricing from './pricing'
import Link from 'next/link'

function Howitworks() {
  return (
    <div className="md:w-[90%] w-[98%] mx-auto    ">
         <Separator className="w-full mb-10"/>
         <div className="w-full flex gap-5 flex-col">
               <div className="w-full flex gap-4 flex-col items-center justify-center">
                 <p className='font-bold text-4xl'>How it Works?</p>
                 <p className='font-light md:text-[18px] text-[14px]  '>Our platform make healthcare accessible with just few clicks.</p>

               </div>
       <div className="w-full flex flex-wrap gap-8 justify-center">

            <div className="w-[400px] h-[280px]  cursor-pointer   border rounded-lg p-6 flex flex-col gap-6">
              <p className='p-1 w-fit bg-[#0A4D68] rounded-lg'><User className=''/></p>
              <p className='font-bold text-2xl'>Create Your Profile</p>
              <p className='font-extralight'>Sign up and complete your profile to get personalized healthcare recommendations and services.</p>
            </div>

            <div className="w-[400px] h-[280px] cursor-pointer  border rounded-lg p-6 flex flex-col gap-6">
              <p className='p-1 w-fit bg-[#0A4D68] rounded-lg'><Calendar /></p>
              <p className='font-bold text-2xl'>Book Appointments</p>
              <p className='font-extralight'>Browse doctor profiles, check availability, and book appointments that fit your schedule.</p>
            </div>

            <div className="w-[400px] h-[280px] cursor-pointer  border rounded-lg p-6 flex flex-col gap-6">
              <p className='p-1 w-fit bg-[#0A4D68] rounded-lg'><Video/></p>
              <p className='font-bold text-2xl'>Video Consultation</p>
              <p className='font-extralight'>Connect with doctors through secure, high-quality video consultations from the comfort of your home.</p>
            </div>

            <div className="w-[400px] h-[280px]  cursor-pointer border rounded-lg p-6 flex flex-col gap-6">
              <p className='p-1 w-fit bg-[#0A4D68] rounded-lg'><Wallet /></p>
              <p className='font-bold text-2xl'>Consultation Credits</p>
              <p className='font-extralight'>Purchase credit packages that fit your healthcare needs with our simple subscription model.</p>
            </div>

            <div className="w-[400px] h-[280px] cursor-pointer  border rounded-lg p-6 flex flex-col gap-6">
              <p className='p-1 w-fit bg-[#0A4D68] rounded-lg'><Verified /></p>
              <p className='font-bold text-2xl'>Verified Doctors</p>
              <p className='font-extralight'>Sign up and complete your profile to get personalized healthcare recommendations and services.</p>
            </div>

            <div className="w-[400px] h-[280px]  cursor-pointer border rounded-lg p-6 flex flex-col gap-6">
              <p className='p-0.5 w-fit bg-[#0A4D68] rounded-lg'><File /></p>
              <p className='font-bold text-2xl'>Medical Documentation</p>
              <p className='font-extralight'>Access and manage your appointment history, doctor’s notes, and medical recommendations.</p>
            </div>


        </div>

         </div>

         <div className="w-full  flex flex-col gap-10 mt-10   ">
                    <div className="w-full flex gap-4 flex-col items-center justify-center mt-3">
                  <p className='p-1 border bg-[#0A4D68] rounded-lg w-fit'>Affordable Healthcare</p>
                 <p className='font-bold md:text-4xl text-2xl'>Consultation Packages</p>
                 <p className='font-light md:text-[18px] text-[10px]  '>Choose the perfect consultation package that meet your needs.</p>
                </div>
                {/* pricing section */}
                  <Pricing/>
                   <div className="w-full rounded-lg border gap-4 flex flex-col md:p-6 p-1 ">
                    <p className='flex gap-1 items-center md:text-2xl text-[16px]'><Stethoscope/>How Our Credit System Works</p>
                   <div className="w-full">
                  
                     <p className='flex md:gap-1 gap-0.5 md:text-[16px] text-[10px]  items-center'><Check className='text-emerald-400'/>Each consultation requires <span className='text-blue-400'> 2 credits </span> regardless of duration</p>
                              <p className='flex md:gap-1 gap-0.5 md:text-[16px] text-[10px]  items-center'><Check className='text-emerald-400'/>Credits <span className='text-blue-400'> never expire </span> – use them whenever you need</p>
                      <p className='flex md:gap-1 gap-0.5 md:text-[16px] text-[10px]  items-center'><Check className='text-emerald-400'/>Monthly subscriptions give you <span className='text-blue-400'> fresh credits </span>every month </p>
                                      <p className='flex md:gap-1 gap-0.5 md:text-[16px] text-[10px]  items-center'><Check className='text-emerald-400'/>Cancel or change your subscription <span className='text-blue-400'>anytime </span></p>
                   </div>
                   </div>
         </div>
       
       <div className="w-full flex flex-col mt-10 gap-10">
                    <div className="w-full flex gap-4 flex-col items-center justify-center mt-3">
                  <p className='p-1 border bg-[#0A4D68]  rounded-lg w-fit'>Success Stories</p>
                 <p className='font-bold md:text-4xl text-2xl'>What Our Users Say</p>
                 <p className='font-light md:text-[18px] text-[10px]  '>Hear from patients and doctors who use our platform</p>
                   </div>
       {/* reviews */}
      <div className="w-full flex flex-wrap gap-8 justify-center">
            <div className="w-[400px] h-[250px]  cursor-pointer   border rounded-lg p-6 flex flex-col gap-6">
                <div className=" flex gap-2 items-center">
              <p className='p-2 text-center w-10 bg-[#0A4D68] h-fit   rounded-full'>VP</p>
                  <div className=" flex flex-col">
                    <p>Vinod Pandey</p>
                    <p className='font-extralight'>Patient</p>
                  </div>
                </div>
              <p className='font-extralight'>"The video consultation feature saved me so much time. I was able to get medical advice without taking time off work or traveling to a clinic."</p>
            </div>

           <div className="w-[400px] h-[250px]  cursor-pointer   border rounded-lg p-6 flex flex-col gap-6">
                <div className=" flex gap-2 items-center">
              <p className='p-2 text-center w-10 bg-[#0A4D68] h-fit   rounded-full'>PS</p>
                  <div className=" flex flex-col">
                    <p>Priya Sharma</p>
                    <p className='font-extralight'>Doctor</p>
                  </div>
                </div>
              <p className='font-extralight'>"This platform has revolutionized my practice. I can now reach more patients and provide timely care without the constraints of a physical office."</p>
            </div>

            <div className="w-[400px] h-[250px]  cursor-pointer   border rounded-lg p-6 flex flex-col gap-6">
                <div className=" flex gap-2 items-center">
              <p className='p-2 text-center w-10 bg-[#0A4D68] h-fit rounded-full'>DS</p>
                  <div className=" flex flex-col">
                    <p>Digvijay Singh</p>
                    <p className='font-extralight'>Patient</p>
                  </div>
                </div>
              <p className='font-extralight'>"The credit system is so convenient. I purchased a package for my family, and we've been able to consult with specialists whenever needed."</p>
            </div>
      </div>

       </div>
       <div className="md:w-[80%] w-[95%] mx-auto border mt-10 rounded-lg md:h-[220px] h-fit p-6 gap-8 flex flex-col bg-[#0A4D68] ">
      
          <p className='font-bold text-3xl'>Ready to take control of your healthcare?</p>
        <p className='font-light '>Join thousands of users who have simplified their healthcare journey with our platform. Get started today and experience healthcare the way it should be.</p>
        <div className=" flex gap-2">
          <Link href={"/signin"}><Button>Sign up</Button></Link>
           <Link href={"/pricing"}><Button>View Pricing</Button></Link>
        </div>

       </div>
    </div>
  )
}

export default Howitworks