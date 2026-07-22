import Image from "next/image";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="PulseLogica" width={120} height={32} className="h-8 w-auto" />
        </div>
        <div className="hidden md:flex gap-8 text-sm text-slate-400">
          <a href="#phases" className="hover:text-white transition">How it works</a>
          <a href="#cases" className="hover:text-white transition">Case Studies</a>
          <a href="#proof" className="hover:text-white transition">Proof</a>
          <a href="#book" className="hover:text-white transition">Book a call</a>
        </div>
        <a href="#book" className="btn-primary text-black font-semibold text-sm px-5 py-2.5 rounded-lg">
          Book Strategy Session
        </a>
      </div>
    </nav>
  );
}
