import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import HistoryList from "@/components/HistoryList";
import { readDogs } from "@/lib/storage";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const records = await readDogs();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex antialiased">
      <Navbar />

      <main className="flex-1 md:ml-64 pb-24 md:pb-0">
        {/* Mobile header */}
        <header className="md:hidden bg-surface shadow-sm sticky top-0 z-40">
          <div className="flex justify-between items-center px-container-padding h-16">
            <div className="font-display text-headline-md text-primary">Dogs Tinder</div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-container-padding md:px-xl pt-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
            <div>
              <h2 className="font-display text-display text-on-surface mb-xs">Your Furry Matches</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Here are the companions you&apos;ve connected with recently.</p>
            </div>
          </div>

          <HistoryList
            records={records}
            currentUser={session.user.name ?? session.user.email ?? undefined}
          />
        </div>
      </main>
    </div>
  );
}
