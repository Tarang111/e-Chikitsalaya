import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/doctors(.*)",
  "/onboarding(.*)",
  "/doctor(.*)",
  "/admin(.*)",
  "/video-call(.*)",
  "/appointments(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth(); // ✅ only one call

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();                      // 🔥 now it will properly redirect
  }

  return NextResponse.next();
});


export const config = {
  matcher: [
    "/((?!_next|static|images|public|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)", // 🚀 Allows images
    "/(api|trpc)(.*)", // API still protected
  ],
};


