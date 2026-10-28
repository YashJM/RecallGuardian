import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Help with RecallGuardian — how it works, how alerts work, data sources, and how to get in touch.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <main className="wrap legal">
      <h1>Support</h1>
      <p className="updated">RecallGuardian for iOS &amp; web</p>

      <p>
        RecallGuardian puts every Canadian safety recall in one ranked,
        plain-language place, and can alert you when something your household owns
        is recalled. Here&rsquo;s how it works and how to get help.
      </p>

      <h2>Contact us</h2>
      <div className="card">
        <p style={{ margin: 0 }}>
          Email{" "}
          <a href="mailto:support@recallguardian.ca">support@recallguardian.ca</a>{" "}
          — we read every message. Include your device and iOS version if
          something isn&rsquo;t working.
        </p>
      </div>

      <h2>How alerts work</h2>
      <p>
        In the <strong>Guardian</strong> tab, add the brands and categories your
        household cares about and turn on alerts. The app checks new recalls in the
        background and notifies you only when one matches your list. You choose how
        loud — Critical only, High &amp; critical, or Everything. Your watchlist
        never leaves your device.
      </p>
      <p className="muted">
        Background checks are scheduled by iOS, so timing can vary. For the latest,
        open the app any time — the feed refreshes on launch.
      </p>

      <h2>Common questions</h2>
      <ul>
        <li>
          <strong>I&rsquo;m not getting notifications.</strong> Make sure alerts are
          turned on in the Guardian tab, that you&rsquo;ve added at least one brand
          or category, and that notifications are allowed for RecallGuardian in
          iOS Settings.
        </li>
        <li>
          <strong>A barcode scan didn&rsquo;t find my product.</strong> Scanning uses
          Open Food Facts, which is strongest for food and grocery items. If a code
          isn&rsquo;t recognized, just type the brand or product name instead.
        </li>
        <li>
          <strong>Is a recall affecting me?</strong> Tap any recall for plain-language
          steps and the official Government of Canada notice, which has the exact lot
          numbers, dates, and remedies.
        </li>
      </ul>

      <h2>Where the data comes from</h2>
      <p>
        Recalls come from the Government of Canada{" "}
        <a href="https://recalls-rappels.canada.ca" target="_blank" rel="noopener">
          Recalls and Safety Alerts
        </a>{" "}
        open data (CFIA, Health Canada, Transport Canada), under the Open Government
        Licence – Canada. RecallGuardian re-ranks and rewords recalls to make them
        useful; the official notice is always authoritative and one tap away. We are
        not affiliated with or endorsed by the Government of Canada.
      </p>

      <h2>Report a product safety incident</h2>
      <p>
        To report a problem with a product (not an app issue), use the Government of
        Canada&rsquo;s{" "}
        <a
          href="https://recalls-rappels.canada.ca/en/report-incident"
          target="_blank"
          rel="noopener"
        >
          Report an incident
        </a>{" "}
        service.
      </p>

      <h2>Privacy</h2>
      <p>
        RecallGuardian collects nothing about you. Read the full{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </main>
  );
}
