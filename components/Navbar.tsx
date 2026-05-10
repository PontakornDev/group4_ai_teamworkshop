"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col p-md h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-40">
        <div className="flex items-center gap-sm mb-xl px-sm">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
          <div>
            <h1 className="font-display text-headline-lg text-primary">Pawnder</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Adoption Portal</p>
          </div>
        </div>

        <div className="flex flex-col space-y-base flex-1">
          <Link
            href="/swipe"
            className={`flex items-center gap-sm px-4 py-3 rounded-xl transition-all active:scale-[0.98] duration-200 ${
              pathname === "/swipe"
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined" style={pathname === "/swipe" ? { fontVariationSettings: "'FILL' 1" } : {}}>pets</span>
            <span className="font-body-md text-body-md">Find Pets</span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-sm px-4 py-3 rounded-xl transition-all active:scale-[0.98] duration-200 ${
              pathname === "/history"
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined" style={pathname === "/history" ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            <span className="font-body-md text-body-md">My Matches</span>
          </Link>
        </div>

        {/* User info + sign out */}
        <div className="mt-auto pt-md border-t border-outline-variant flex flex-col gap-sm">
          {session?.user && (
            <div className="flex items-center gap-sm px-sm py-xs">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="font-label-lg text-label-lg text-on-surface truncate">{session.user.name}</span>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-full font-label-lg text-label-lg hover:bg-surface-tint transition-colors active:scale-95 shadow-sm hover:shadow-md"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-container-lowest shadow-[0_-4px_12px_rgba(0,0,0,0.04)] rounded-t-xl">
        <Link
          href="/swipe"
          className={`flex flex-col items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
            pathname === "/swipe"
              ? "bg-primary-container text-on-primary-container px-6 py-1"
              : "text-secondary p-2 hover:bg-secondary-container"
          }`}
        >
          <span className="material-symbols-outlined" style={pathname === "/swipe" ? { fontVariationSettings: "'FILL' 1" } : {}}>pets</span>
          <span className="font-label-lg text-label-lg mt-xs">Swipe</span>
        </Link>
        <Link
          href="/history"
          className={`flex flex-col items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
            pathname === "/history"
              ? "bg-primary-container text-on-primary-container px-6 py-1"
              : "text-secondary p-2 hover:bg-secondary-container"
          }`}
        >
          <span className="material-symbols-outlined" style={pathname === "/history" ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
          <span className="font-label-lg text-label-lg mt-xs">Matches</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center justify-center text-secondary p-2 hover:bg-secondary-container rounded-full active:scale-90 transition-transform duration-150"
        >
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <span className="material-symbols-outlined">person</span>
          )}
          <span className="font-label-lg text-label-lg mt-xs">Profile</span>
        </button>
      </nav>
    </>
  );
}
