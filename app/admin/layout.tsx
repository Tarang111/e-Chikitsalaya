import { verifyAdmin } from '@/action/admin'
import { PageHeader } from '@/components/ui/PageHeader'
import { Shield, ShieldAlert, ShieldPlusIcon, UserIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

import React from 'react'

async function adminDashboard({children}:{children:React.ReactNode}) {
    const isadmin=await verifyAdmin()
    if(!isadmin) redirect("/")
  return (
   <div className="w-[90%] mx-auto mt-10">
    <PageHeader icon={<ShieldPlusIcon/>} title={"Admin Settings"} />  
      {children}
   </div>
  )
}

export default adminDashboard