"use client";

import { useSearchParams } from "next/navigation";
import VideoCall from "./video-call-ui";

export default function VideoCallClient() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");
  const token = searchParams.get("token");

  if (!sessionId || !token) {
    return <div>Invalid or missing session details</div>;
  }

  return <VideoCall sessionId={sessionId} token={token} />;
}
