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
            <span
              className="material-symbols-outlined fill"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              pets
            </span>
          </div>
          <div>
            <h1 className="font-display text-headline-lg text-primary">
              Dogs Tinder
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Adoption Portal
            </p>
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
            <span
              className="material-symbols-outlined"
              style={
                pathname === "/swipe"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              dogs
            </span>
            <span className="font-body-md text-body-md">Swipe</span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-sm px-4 py-3 rounded-xl transition-all active:scale-[0.98] duration-200 ${
              pathname === "/history"
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                pathname === "/history"
                  ? { fontVariationSettings: "'FILL' 1" }
                  : {}
              }
            >
              favorite
            </span>
            <span className="font-body-md text-body-md">Dogs</span>
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
              <span className="font-label-lg text-label-lg text-on-surface truncate">
                {session.user.name}
              </span>
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

      {/* Mobile top nav */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-5">
        <Link href="/swipe" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
          <span className="text-base font-semibold text-primary" style={{ fontFamily: "Quicksand, sans-serif" }}>Dogs Tinder</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/history"
            className={`p-2 rounded-full transition-colors ${pathname === "/history" ? "text-primary bg-primary-container" : "text-on-surface-variant hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined text-[22px]" style={pathname === "/history" ? { fontVariationSettings: "'FILL' 1" } : {}}>history</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1 rounded-full hover:bg-surface-container transition-colors active:scale-95"
          >
            {session?.user?.image ? (
              <Image src={session.user.image} alt={session.user.name ?? "User"} width={32} height={32} className="rounded-full" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
