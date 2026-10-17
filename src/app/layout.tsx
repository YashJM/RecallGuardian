import type { Metadata } from "next";
import { Archivo, Newsreader, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const body = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://recallguardian.ca"),
  title: {
    default: "RecallGuardian — Canada's recalls, ranked",
    template: "%s · RecallGuardian",
  },
  description:
    "Every Canadian safety recall in one ranked, plain-language feed — food and medicine first. Food, drugs, vehicles, toys and more, with the official Government of Canada source on every item.",
  keywords: [
    "Canada recall",
    "product recall Canada",
    "food recall Canada",
    "Health Canada recall",
    "CFIA recall",
    "Transport Canada recall",
    "safety alert Canada",
  ],
  openGraph: {
    title: "RecallGuardian — Canada's recalls, ranked",
    description:
      "Every Canadian safety recall in one ranked, plain-language feed — food and medicine first.",
    url: "https://recallguardian.ca",
    siteName: "RecallGuardian",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RecallGuardian — Canada's recalls, ranked",
    description:
      "Every Canadian safety recall in one ranked, plain-language feed.",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <div className="topbar">
          <div className="wrap row">
            <Link className="brandmark" href="/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2.5 20 5.2v6.1c0 4.7-3.2 8.3-8 10.2-4.8-1.9-8-5.5-8-10.2V5.2L12 2.5Z"
                  fill="var(--brand)"
                />
                <path
                  d="M12 7.3l1.2 2.9 3.1.2-2.4 2 .8 3-2.7-1.7-2.7 1.7.8-3-2.4-2 3.1-.2L12 7.3Z"
                  fill="var(--paper)"
                />
              </svg>
              RecallGuardian
            </Link>
            <span className="domain">recallguardian.ca</span>
          </div>
        </div>
        {children}
        <footer>
          <div className="wrap">
            <p>
              Recall data from the Government of Canada{" "}
              <a
                href="https://recalls-rappels.canada.ca"
                target="_blank"
                rel="noopener"
                style={{ color: "var(--brand)" }}
              >
                Recalls and Safety Alerts
              </a>{" "}
              open data (CFIA · Health Canada · Transport Canada). RecallGuardian
              re-ranks and rewords; always confirm details with the official
              notice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
