"use client";

import { setuserrole } from "@/action/onboarding";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SPECIALTIES } from "@/lib/specialty";
import { Stethoscope, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();
   const options=SPECIALTIES
  const [speciality, setspeciality] = useState("");
  const [experience, setexp] = useState("");
  const [description, setdes] = useState("");
  const [credentiallink, setlink] = useState("");

  async function setroleuser(role: string) {
    try {
      const formdata = new FormData();
      formdata.append("speciality", speciality);
      formdata.append("role", role);
      formdata.append("experience", experience);
      formdata.append("description", description);
      formdata.append("credentiallink", credentiallink);

      const res = await setuserrole(formdata);
     toast("Role created")
      router.push(res?.redirect || "/");

    } catch (error) {
      console.log("error", error);
      toast.error("Try again later")
    }
  }

  return (
    <div className="w-full">
      <div className="w-full flex flex-wrap gap-5 justify-center">

        {/* PATIENT CARD */}
        <div className="w-[400px] h-[280px] cursor-pointer border rounded-lg p-6 flex flex-col gap-6">
          <p className="p-1 w-fit bg-emerald-800 rounded-lg">
            <User className="text-emerald-400" />
          </p>
          <p className="font-bold text-2xl">Join as a Patient</p>
          <p className="font-extralight text-left">
            Book appointments, consult with doctors and manage your healthcare journey.
          </p>
          <Button onClick={() => setroleuser("PATIENT")} className="bg-emerald-400">
            Continue as Patient
          </Button>
        </div>

        {/* DOCTOR CARD WITH DIALOG */}
        <Dialog>
          <div className="w-[400px] h-[280px] cursor-pointer border rounded-lg p-6 flex flex-col gap-6">
            <p className="p-1 w-fit bg-emerald-800 rounded-lg">
              <Stethoscope className="text-emerald-400" />
            </p>
            <p className="font-bold text-2xl">Join as a Doctor</p>
            <p className="font-extralight text-left">
              Create your professional profile, set your availability, and provide consultations.
            </p>

            <DialogTrigger asChild>
              <Button className="bg-emerald-400">Continue as Doctor</Button>
            </DialogTrigger>
          </div>

          {/* MODAL CONTENT */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete your Doctor Profile</DialogTitle>
              <DialogDescription>Please provide your professional details.</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5">

              {/* SPECIALITY */}
              <div className="flex flex-col gap-1">
                <p>Medical Speciality</p>
                <select
                  className="border rounded p-2 bg-emerald-400"
                  value={speciality}
                  onChange={(e) => setspeciality(e.target.value)}
                >
                  <option value="">Select Speciality</option>
                  {/* <option value="General Physician">General Physician</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="ENT">ENT Specialist</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Gastroenterology">Gastroenterology</option> */}
                  {options.map((item,i)=>(
                     <option key={i} value={item.name}>{` ${item.name}`}</option>
                  ))}
                </select>
              </div>

              {/* EXPERIENCE */}
              <div className="flex flex-col gap-1">
                <p>Years of Experience</p>
                <input
                  type="number"
                  className="border rounded p-2"
                  value={experience}
                  onChange={(e) => setexp(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-1">
                <p>Short Description</p>
                <textarea
                  className="border rounded p-2"
                  value={description}
                  onChange={(e) => setdes(e.target.value)}
                  placeholder="Describe your expertise..."
                />
              </div>

              {/* Credential Link */}
              <div className="flex flex-col gap-1">
                <p>Credential / Certification Link</p>
                <input
                  type="text"
                  className="border rounded p-2"
                  value={credentiallink}
                  onChange={(e) => setlink(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <Button onClick={() => setroleuser("DOCTOR")} className="bg-emerald-600">
                Submit & Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
