import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function checkUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const loggedin = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (loggedin) return loggedin;

    // Create new user WITHOUT initial credits
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl || "",
      },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}
