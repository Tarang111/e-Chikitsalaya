import { SPECIALTIES } from '@/lib/specialty'
import Link from 'next/link'
import React from 'react'
export const dynamic = "force-dynamic";

function Specialitypage() {
    const allSpecialities=SPECIALTIES
  return (
    <div className='w-full flex flex-col gap-2'>
     <div className=" flex flex-col justify-center items-center gap-1">
          <p className='font-bold text-4xl'>Find your doctor</p>
          <p className='font-light'>Browse by speciality or view all available healthcare providers.</p>
        </div>
  <div className=" flex flex-wrap gap-2 mt-2 ">

{
    allSpecialities.map((item,i)=>(
       <Link href={`/doctors/${item.name}`} key={i}>
        <div key={i} className="w-[250px]  h-[200px] border flex justify-center items-center flex-col bg-[#0A4D68] gap-2 rounded-lg">
            <p>{item.icon}</p>
            <p className='font-bold text-xl'>{item.name}</p>
        </div>
       </Link>
    ))
}

 
  </div>
  </div>
  )
}

export default Specialitypage
