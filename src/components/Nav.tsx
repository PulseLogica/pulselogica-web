"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GOOGLE_CALENDAR_STRATEGY_SESSION } from "@/lib/constants";

const LINKS = [
  { href: "#phases", label: "How it works" },
  { href: "#cases", label: "Case Studies" },
  { href: "#proof", label: "Proof" },
  { href: "#book", label: "Book a call" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="PulseLogica home" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="PulseLogica" width={120} height={32} className="h-8 w-auto" />
        </Link>
        <div className="hidden md:flex gap-8 text-sm text-slate-400">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition">
              {link.label}
            </a>
          ))}
        </div>
        <a
          href={GOOGLE_CALENDAR_STRATEGY_SESSION}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-block btn-primary text-black font-semibold text-sm px-5 py-2.5 rounded-lg"
        >
          Book Strategy Session
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden h-9 w-9 flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-slate-400">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="hover:text-white transition"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
