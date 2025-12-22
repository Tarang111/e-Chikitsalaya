import { Calendar, CreditCard, HeartPulseIcon ,ShieldCheck,Stethoscope,User,Wallet } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { currentUser } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import checkUser from '@/action/checkUser';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { checkAndAllocateCredits } from '@/action/credit';





export default async function Navbar() {
  const user= await checkUser()

  await checkAndAllocateCredits(user) 

  return (
   <div className="w-full h-[50px] sticky top-0 z-10 supports-backdrop-filter:bg-background/60 border flex items-center  ">
        <div className="w-[95%] mx-auto  flex items-center justify-between">
           {/* logo */}
          <div className=" flex items-center gap-1">
          <p><HeartPulseIcon className='fill-red-600 cursor-pointer'/></p>
          <Link href={"/"}><p className='font-bold text-xl cursor-pointer'>e-Chikitsalaya</p></Link>
          </div>
            
            <div className="flex items-center md:gap-5 gap-1">
                 <SignedIn>
            {/* Admin Links */}
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Doctor Links */}
            {user?.role === "DOCTOR" && (
              <Link href="/doctor">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Stethoscope className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Patient Links */}
            {user?.role === "PATIENT" && (
              <Link href="/appointments">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  My Appointments
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Unassigned Role */}
            {user?.role === "UNASSIGNED" && (
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
         

          {(!user || user?.role !== "ADMIN") && (
            <Link href={user?.role === "PATIENT" ? "/pricing" : "/doctor"}>
              <Badge
                variant="outline"
                className="h-9 bg-[#0A4D68] border-emerald-700/30 px-3 py-1 flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                <span className="">
                  {user && user.role !== "ADMIN" ? (
                    <>
                      {user.credits}{" "}
                      <span className="hidden md:inline">
                        {user?.role === "PATIENT"
                          ? "Credits"
                          : "Earned Credits"}
                      </span>
                    </>
                  ) : (
                    <>Pricing</>
                  )}
                </span>
              </Badge>
            </Link>
          )}
           </SignedIn>
                <SignedOut>
                    <Link href="/signin"><Button>Sign in</Button></Link>
                </SignedOut>
              {/* <Button className="border bg-emerald-900/40 cursor-pointer text-emerald-400   "> <Wallet className='text-emerald-400'/><span className='md:block hidden'>Pricing</span></Button> */}
            
              <UserButton/>
            </div>
        
        </div>

   </div>

  )
}

 