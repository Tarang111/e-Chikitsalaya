import { getCurrentUser } from '@/action/onboarding'
import { PageHeader } from '@/components/ui/PageHeader'
import { Stethoscope } from 'lucide-react'
import { redirect } from 'next/navigation'


import React from 'react'

async function DoctorDashboard({children}:{children:React.ReactNode}) {
      const user=await getCurrentUser()
      if(user.role!="DOCTOR") redirect("/")
//     if (user.verificationStatus !== "VERIFIED") {
//     redirect("/doctor/verification")
//   }
    return (
      
     <div className=" w-[90%] mx-auto mt-4">
        <PageHeader icon={<Stethoscope/>} title={"Doctor Dashboard"}/>
        {children}
     </div>
  )
}

export default DoctorDashboard