import { ClipboardCheck, AlertCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, resetUser } from "@/action/onboarding";
export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const user = await getCurrentUser();

  // Already verified → dashboard
  if (user?.verificationStatus === "VERIFIED") {
    redirect("/doctor");
  }

  const isRejected = user?.verificationStatus === "REJECTED";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-emerald-900/20">
          <CardHeader className="text-center">
            <div
              className={`mx-auto p-4 ${
                isRejected ? "bg-red-900/20" : "bg-amber-900/20"
              } rounded-full mb-4 w-fit`}
            >
              {isRejected ? (
                <XCircle className="h-8 w-8 text-red-400" />
              ) : (
                <ClipboardCheck className="h-8 w-8 text-amber-400" />
              )}
            </div>

            <CardTitle className="text-2xl font-bold text-white">
              {isRejected
                ? "Verification Declined"
                : "Verification in Progress"}
            </CardTitle>

            <CardDescription className="text-lg">
              {isRejected
                ? "Unfortunately, your application needs revision"
                : "Thank you for submitting your information"}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            {isRejected ? (
              <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 shrink-0" />
                <div className="text-muted-foreground text-left">
                  <p className="mb-2">
                    Our administrative team reviewed your application and found
                    issues such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Unclear credential documentation</li>
                    <li>Experience requirements not met</li>
                    <li>Incomplete profile details</li>
                  </ul>
                  <p>You can update and reapply.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-900/10 border border-amber-900/20 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-400 mr-3 mt-0.5 shrink-0" />
                <p className="text-muted-foreground text-left">
                  Your profile is under review. This usually takes 1–2 business
                  days. You’ll receive an email once verified.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>

              {isRejected ? (
                <form action={resetUser}>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Reapply
                  </Button>
                </form>
              ) : (
                <p className="bg-emerald-600 hover:bg-emerald-700 p-2 rounded-md text-white">
                  Query mail: mishratarang123@gmail.com
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
