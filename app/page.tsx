
import Landingpage from "@/components/landingpage";

import { Button } from "@/components/ui/button";
import Howitworks from "@/components/ui/howitworks";
import { Separator } from "@/components/ui/separator";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
export const dynamic = "force-dynamic";

export default async function Home() {


  
  return (
    <div className="w-full">
       <Landingpage/>
       
       <Howitworks/>
    </div>
      
  )
}
