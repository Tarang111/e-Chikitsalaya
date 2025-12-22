import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/PageHeader'
import React from 'react'

function doctorpage({children}:{children:React.ReactNode}) {
  return (
    <div className="w-[90%] mx-auto mt-20">
        {/* <div className=" flex flex-col justify-center items-center gap-1">
          <p className='font-bold text-4xl'>Find your doctor</p>
          <p className='font-light'>Browse by speciality or view all available healthcare providers.</p>
        </div> */}
         <div className="w-full mt-4 ">
          {children}
         </div>
        
      
      
    </div>
  )
}

export default doctorpage