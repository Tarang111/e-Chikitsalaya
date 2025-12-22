import { Suspense } from "react";
import VideoCallClient from "./videocallclient";


export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading video call...</div>}>
      <VideoCallClient />
    </Suspense>
  );
}
