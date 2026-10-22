import type { Metadata } from "next";
import { Public_Sans, Noto_Serif, Libre_Franklin } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Noto_Serif({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});
const alt = Libre_Franklin({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-alt",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://recallguardian.ca"),
  title: {
    default: "RecallGuardian — Canada's recalls, ranked",
    template: "%s · RecallGuardian",
  },
  description:
    "Every Canadian safety recall in one ranked, plain-language feed — food and medicine first. Product photos, who's at risk, and what to do, with the official Government of Canada source on every item.",
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
      <body className={`${sans.variable} ${serif.variable} ${alt.variable}`}>
        <div className="topband" />
        <header className="masthead">
          <div className="wrap row">
            <Link className="brand" href="/">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2.5 20 5.2v6.1c0 4.7-3.2 8.3-8 10.2-4.8-1.9-8-5.5-8-10.2V5.2L12 2.5Z"
                  fill="var(--brand)"
                />
                <path d="M10.6 14.3 7.8 11.5l1.3-1.3 1.5 1.5 4-4 1.3 1.3-5.3 5.3Z" fill="#fff" />
              </svg>
              RecallGuardian
              <span className="tag">Canada</span>
            </Link>
          </div>
        </header>
        {children}
        <footer>
          <div className="wrap">
            <p>
              Recall data from the Government of Canada{" "}
              <a
                href="https://recalls-rappels.canada.ca"
                target="_blank"
                rel="noopener"
                style={{ color: "var(--brand)", fontWeight: 700 }}
              >
                Recalls and Safety Alerts
              </a>{" "}
              open data (CFIA · Health Canada · Transport Canada). RecallGuardian
              ranks, illustrates and rewords these notices in plain language;
              always confirm details with the official notice.
            </p>
            <div className="links">
              <Link href="/privacy">Privacy</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
