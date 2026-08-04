import type { Metadata } from "next";
import PulseCheck from "@/components/PulseCheck";

export const metadata: Metadata = {
  title: "Pulse Check — PulseLogica",
  description:
    "A short, self-serve diagnostic to see where your business stands — dependency, urgency, and what to fix first.",
};

export default function ClientDiagnosticPage() {
  return (
    <main>
      <PulseCheck />
    </main>
  );
}
