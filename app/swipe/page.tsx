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

      <div className="md:ml-64 pt-16 md:pt-0 flex flex-col h-full">
        <SwipeClient
          username={session.user.name ?? session.user.email ?? "user"}
          email={session.user.email ?? ""}
        />
      </div>
    </div>
  );
}
