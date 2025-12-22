import { ActivityIcon, Baby, Bone, Brain, CircleDot, Eye, Flower2, HeartPulse, Microscope, Milestone, Stethoscope, Target, Thermometer, Timer } from "lucide-react";



export const SPECIALTIES = [
  {
    name: "General Medicine",
    icon: <Stethoscope className="h-6 w-6" />,
  },
  {
    name: "Cardiology",
    icon: <HeartPulse
     className="h-6 w-6" />,
  },
  {
    name: "Dermatology",
    icon: <CircleDot className="h-6 w-6" />,
  },
  {
    name: "Endocrinology",
    icon: <Timer className="h-6 w-6" />,
  },
  {
    name: "Gastroenterology",
    icon: <Thermometer className="h-6 w-6" />,
  },
  {
    name: "Neurology",
    icon: <Brain className="h-6 w-6" />,
  },
  {
    name: "Obstetrics & Gynecology",
    icon: <Flower2 className="h-6 w-6" />,
  },
  {
    name: "Oncology",
    icon: <Target className="h-6 w-6" />,
  },
  {
    name: "Ophthalmology",
    icon: <Eye className="h-6 w-6" />,
  },
  {
    name: "Orthopedics",
    icon: <Bone className="h-6 w-6" />,
  },
  {
    name: "Pediatrics",
    icon: <Baby className="h-6 w-6" />,
  },
  {
    name: "Psychiatry",
    icon: <Brain className="h-6 w-6" />,
  },
  {
    name: "Pulmonology",
    icon: <ActivityIcon className="h-6 w-6" />,
  },
  {
    name: "Radiology",
    icon: <CircleDot className="h-6 w-6" />,
  },
  {
    name: "Urology",
    icon: <Milestone className="h-6 w-6" />,
  },
  {
    name: "Other",
    icon: <Microscope className="h-6 w-6"/>,
  },
];