import { GOOGLE_CALENDAR_STRATEGY_SESSION } from "@/lib/constants";
import Footer from "@/components/Footer";

export default function CTAFooter() {
  return (
    <>
      <section id="book" className="py-28 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
            Build a company you can hand over —{" "}
            <span className="font-serif italic" style={{ color: "#FF7A00" }}>
              not a job you can&rsquo;t leave.
            </span>
          </h2>

          <div className="mt-14 flex flex-col items-center gap-4">
            <a
              href={GOOGLE_CALENDAR_STRATEGY_SESSION}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-black font-semibold text-[15px] px-10 py-2 rounded-lg"
            >
              Book A Call Now
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
