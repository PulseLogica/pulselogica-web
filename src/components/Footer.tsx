import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-6 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <span>PulseLogica</span>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-white transition">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-white transition">
            Terms &amp; Conditions
          </Link>
        </div>
        <a href="mailto:kevin@pulselogica.com" className="hover:text-white transition">
          kevin@pulselogica.com
        </a>
      </div>
    </footer>
  );
}
