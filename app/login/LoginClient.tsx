"use client";

import { signIn } from "next-auth/react";

const GOOGLE_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function GoogleButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/swipe" })}
      className="w-full bg-white text-on-surface-variant rounded-full py-sm px-md font-label-lg text-label-lg flex items-center justify-center gap-sm border border-outline-variant hover:bg-surface-container-low transition-colors duration-200 shadow-sm active:scale-95"
    >
      {GOOGLE_SVG}
      Sign in with Google
    </button>
  );
}

export default function LoginClient() {
  return (
    <div className="bg-background text-on-background h-screen flex flex-col md:flex-row overflow-hidden antialiased">
      {/* MOBILE: top half hero image */}
      <div className="md:hidden h-1/2 w-full relative flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80"
          alt="Happy dog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
      </div>

      {/* MOBILE: bottom half login card */}
      <div className="md:hidden flex-1 bg-surface rounded-t-[32px] -mt-6 relative z-10 flex flex-col px-container-padding pt-lg pb-md shadow-[0_-8px_24px_rgba(0,0,0,0.06)] overflow-y-auto">
        <div className="text-center mb-lg flex flex-col items-center">
          <h1 className="font-display text-display text-primary flex items-center justify-center gap-xs">
            <span className="material-symbols-outlined fill text-display" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            Pawnder
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Join the pack</p>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <GoogleButton />
        </div>
      </div>

      {/* DESKTOP: left panel — hero photo */}
      <div className="hidden md:block md:w-3/5 relative bg-secondary-container h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-bright/90 lg:to-surface-bright/80" />
      </div>

      {/* DESKTOP: right panel — login card */}
      <div className="hidden md:flex md:w-2/5 min-h-screen items-center justify-center relative overflow-hidden bg-surface-bright px-container-padding py-xl">
        {/* Floating decoration icons */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="material-symbols-outlined absolute top-12 left-8 text-primary-fixed-dim opacity-40 rotate-12 scale-150 text-display" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          <span className="material-symbols-outlined absolute top-1/3 right-12 text-tertiary-fixed-dim opacity-30 rotate-45 scale-150 text-display" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span className="material-symbols-outlined absolute bottom-12 right-1/4 text-primary-fixed-dim opacity-40 text-headline-lg" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
        </div>

        <main className="w-full max-w-sm relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-xl text-center">
            <div className="flex items-center justify-center text-primary mb-sm">
              <span className="material-symbols-outlined text-display" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
              <h1 className="font-display text-display ml-xs tracking-tight">Pawnder</h1>
            </div>
            <p className="font-headline-md text-headline-md text-on-surface-variant">Join the pack</p>
          </div>

          <div className="w-full bg-surface rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-md border border-surface-container">
            <GoogleButton />
          </div>
        </main>
      </div>
    </div>
  );
}
