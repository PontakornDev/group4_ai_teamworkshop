import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SwipeClient from "./SwipeClient";

export default async function SwipePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="bg-surface text-on-surface h-screen flex flex-col overflow-hidden antialiased">
      <Navbar />

      <div className="md:ml-64 flex flex-col h-full">
        {/* Mobile header */}
        <header className="md:hidden w-full pt-sm pb-xs px-container-padding flex justify-center items-center flex-shrink-0 z-10">
          <h1 className="font-display text-headline-lg text-primary tracking-tight">Dogs Tinder</h1>
        </header>

        <SwipeClient
          username={session.user.name ?? session.user.email ?? "user"}
          email={session.user.email ?? ""}
        />
      </div>
    </div>
  );
}
