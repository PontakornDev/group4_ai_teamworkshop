import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import HistoryList from "@/components/HistoryList";
import TopDogsSection from "@/components/TopDogsSection";
import { getHistoryWithCounts, getTopDogs } from "@/lib/storage";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const records = await getHistoryWithCounts(session.user.name ?? undefined);
  const topDogs = await getTopDogs();

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
              {/* Title: text-headline-lg per UI-SPEC — not text-display (UI-SPEC typography correction) */}
              <h2 className="font-bold text-headline-lg text-on-surface mb-xs">Your Swipe History</h2>
              {/* Mobile subtitle */}
              <p className="font-body-md text-body-md text-on-surface-variant md:hidden">
                All the dogs you&apos;ve swiped on.
              </p>
              {/* Desktop subtitle */}
              <p className="font-body-md text-body-md text-on-surface-variant hidden md:block">
                Here are the companions you&apos;ve connected with recently.
              </p>
            </div>
          </div>

          <TopDogsSection topDogs={topDogs} />
          <HistoryList records={records} />
        </div>
      </main>
    </div>
  );
}
