import { getCurrentUser } from '@/action/onboarding'
import { HeartPulse } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'

async function layout({children}:{children:React.ReactNode}) {
  const user=await getCurrentUser()
  if(user.role=="PATIENT")
  {
    redirect("/doctors")
  }
  else if(user.role=="DOCTOR")
  {
    if(user.verificationStatus==="VERIFIED")
    {
      redirect("/doctor")
    }
    else{
      redirect("/doctor/verification")
    }
  }
  else if(user.role=="ADMIN")
  {
    redirect("/admin");
  }
  
  return (
    <div className="w-[90%]  mx-auto flex flex-col items-center mt-10 gap-4 ">
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className='flex gap-1 items-center md:text-3xl text-xl font-bold'>Welcome to <HeartPulse className='fill-red-600 text-8xl'/> e-Chikitsalaya</h1>
            <p className='font-light md:text-xl'>Tell us how you want to use the platform</p>
          </div>
        <main className='w-full flex justify-center '>{children}</main>
    </div>
  )
}

export default layout