import { specialtydoctors } from "@/action/doctor"
import { SPECIALTIES } from "@/lib/specialty"
import { PageHeader } from "@/components/ui/PageHeader"
import { Dot } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
export const dynamic = "force-dynamic";

export default async function Page(props: any) {

  const { specialty } = await props.params   // 🔥 required fix

  const decoded = decodeURIComponent(specialty)
  const res = await specialtydoctors(decoded)

  const data = SPECIALTIES.find(s => s.name.includes(decoded))

  return (
    <div>
      <PageHeader 
        title={data?.name || decoded}
        icon={data?.icon}
        backLabel="All Specialities"
        backLink="/doctors"
      />

      {res?.doctorlist?.length ? (<div className=" flex flex-col gap-2">
       { res.doctorlist.map((doctor:any)=>(
          <div className="md:w-[50%] w-full border flex md:flex-row flex-col md:gap-0 gap-2 justify-between rounded-lg items-center p-2" key={doctor.id}>
              {/* info */}
              <div className="flex gap-1.5 ">
                <div className="w-8 h-8 object-cover rounded-full">
                  <img src={doctor.imageUrl} className="w-full rounded-full" alt="" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">{doctor.name}</p>
                  <p className=" flex  font-light items-center">
                    {doctor.specialty}
                    <Dot />
                    {doctor.experience} years experience
                  </p>
                  {/* <Separator className="md:block hidden"/> */}
                  <p className="font-light">{doctor.description}</p>
                </div>
              </div>
          
              <div className="flex gap-1">
                <p className="border p-1 bg-emerald-900/40  text-white w-fit rounded-sm">Verified</p>
          
                
  <Link href={`/doctors/${doctor.specialty}/${doctor.id}`}><Button className="bg-[#0A4D68]  text-white">View Profile</Button></Link>
              </div>
          </div>
        ))
      }</div>) : (
        <p className="p-3 text-gray-500">No doctors found.</p>
      )}
    </div>
  )
}
