import Pricing from '@/components/ui/pricing'
import { ArrowLeft, Check, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Pricingg() {
  return (
    <div className="w-full mx-auto ">
           <div className="w-[90%] mx-auto">
            <Link href="/">
              <p className=' flex gap-1 items-center'> <ArrowLeft/>Back to home</p>
           </Link>
                <div className="w-full  flex flex-col gap-10 mt-10   ">
                    <div className="w-full flex gap-4 flex-col items-center justify-center mt-3">
                  <p className='p-1 border bg-emerald-800  rounded-lg w-fit'>Affordable Healthcare</p>
                 <p className='font-bold md:text-4xl text-2xl'>Simple,Transparent Packages</p>
                 <p className='font-light md:text-[18px] text-[10px]  '>Choose the perfect consultation package that meet your needs.</p>
                </div>
                {/* pricing section */}
                  <Pricing/>
                   
       </div>
           </div>
    </div>
  )
}

export default Pricingg