export default function MobileStickyCta() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 backdrop-blur-xl bg-black/60 border-t border-white/10">
      <a href="#book" className="btn-primary block text-center text-black font-semibold text-sm py-3.5 rounded-lg">
        Book Call
      </a>
    </div>
  );
}
