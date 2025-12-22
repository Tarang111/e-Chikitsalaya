import { MoveRightIcon } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

function Landingpage() {
  return (
    <div className="md:w-[90%] w-[98%] mx-auto flex gap-2 mt-10 md:p-0 p-1  md:flex-row flex-col ">
        <div className=" flex flex-col md:w-[50%] w-full md:gap-10 gap-6">
            <p className='p-1 border bg-[#0A4D68] text-blue-200 font-bold rounded-lg w-fit'>Heartcare made simple</p>
           <div className="flex flex-col">
             <p className='md:text-6xl text-4xl font-bold'>Connect with</p>
            <p className='md:text-6xl text-4xl font-bold'>doctors</p>
            <p className='text-[#0A4D68] md:text-6xl text-3xl font-bold'>anytime ,anywhere</p>
           </div>
            <p className='font-light md:text-[16px] text-[14px]'>Book appointments, consult via video, and <br /> manage your healthcare journey all in one <br /> secure platform</p>
            <div className=" flex gap-4">
        <Link href={"/doctors"}><Button className="bg-[#0A4D68] text-white">Get Started <MoveRightIcon className='w-3'/></Button></Link>
             <Link href={"/doctors"}> <Button>Find Doctors</Button></Link>
            </div>
        </div>
        <div className="md:w-[50%] w-full ">
            <img  className='w-[80%]' src="/detailed-doctors-nurses.png" alt="" />
        </div>
    </div> 
  )
}

export default Landingpage