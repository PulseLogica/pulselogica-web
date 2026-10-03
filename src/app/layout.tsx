import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulselogica — Where your pulse becomes logic.",
  description:
    "Systems consulting for SMEs. We organize it. We simplify it. You run the company.",
  icons: {
    icon: "/assets/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProduction = process.env.VERCEL_ENV === "production";

  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {isProduction && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="https://tracker.metricool.com/c3po.jpg?hash=1557ec19f686b25f18330c6ff58027a"
            alt=""
            aria-hidden="true"
          />
        )}
      </body>
    </html>
  );
}
