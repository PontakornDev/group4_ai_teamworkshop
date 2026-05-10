"use client";

import { signIn } from "next-auth/react";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GoogleButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/swipe" })}
      className="inline-flex items-center whitespace-nowrap h-12 bg-white text-on-surface-variant rounded-full px-6 font-semibold text-sm gap-3 border border-outline-variant hover:bg-surface-container-low hover:shadow-md transition-all duration-200 shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_rgba(60,64,67,0.15)] active:scale-[0.98]"
    >
      <GoogleIcon />
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
            <span
              className="material-symbols-outlined fill text-display"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              Dogs
            </span>
            Tinder
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
            Join the pack
          </p>
        </div>
        <div className="flex justify-center">
          <GoogleButton />
        </div>
      </div>

      {/* DESKTOP: left panel — hero photo */}
      <div className="hidden md:block md:w-3/5 relative bg-secondary-container h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-bright/90 lg:to-surface-bright/80" />
      </div>

      {/* DESKTOP: right panel — login card */}
      <div className="hidden md:flex md:w-2/5 min-h-screen items-center justify-center relative overflow-hidden bg-surface-bright px-container-padding py-xl">
        {/* Floating decoration icons */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <span
            className="material-symbols-outlined absolute top-12 left-8 text-primary-fixed-dim opacity-40 rotate-12 scale-150 text-display"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            Dogs
          </span>
          <span
            className="material-symbols-outlined absolute top-1/3 right-12 text-tertiary-fixed-dim opacity-30 rotate-45 scale-150 text-display"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span
            className="material-symbols-outlined absolute bottom-12 right-1/4 text-primary-fixed-dim opacity-40 text-headline-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            Dogs
          </span>
        </div>

        <main className="w-full max-w-sm relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-xl text-center">
            <div className="flex items-center justify-center text-primary mb-sm">
              <span
                className="material-symbols-outlined text-display"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                Dogs
              </span>
              <h1 className="font-display text-display ml-xs tracking-tight">
                Tinder
              </h1>
            </div>
            <p className="font-headline-md text-headline-md text-on-surface-variant">
              Join the pack
            </p>
          </div>

          <div className=" bg-surface rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-md border border-surface-container">
            <GoogleButton />
          </div>
        </main>
      </div>
    </div>
  );
}
