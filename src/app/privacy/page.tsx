import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "RecallGuardian collects nothing about you. No account, no tracking; your watchlist and all recall matching stay on your device.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="wrap legal">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: October 22, 2026</p>

      <p>
        RecallGuardian is built to be private. We do not have accounts, we do not
        track you, and we do not run a server that stores anything about you.
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>Nothing about you.</strong> RecallGuardian has no account or
        login, no analytics, no advertising, and no tracking. We do not collect,
        sell, or share personal information.
      </p>

      <h2>What stays on your device</h2>
      <p>
        Your watchlist (the brands, products, and categories you choose to watch)
        and your alert settings are stored only on your device. They are never
        uploaded to us or anyone else. New recalls are matched against your
        watchlist on your phone.
      </p>

      <h2>Network requests the app makes</h2>
      <p>
        To do its job, the app contacts two public services. Neither receives
        anything that identifies you.
      </p>
      <ul>
        <li>
          <strong>Government of Canada — Recalls and Safety Alerts</strong>{" "}
          (recalls-rappels.canada.ca): to download the public recall data. This is
          a normal request for public information; we send no personal data.
        </li>
        <li>
          <strong>Open Food Facts</strong> (openfoodfacts.org),{" "}
          <em>only when you scan a barcode</em>: the scanned barcode number is sent
          to look up the product&rsquo;s name. The barcode is not linked to you,
          and nothing else is sent.
        </li>
      </ul>

      <h2>Permissions</h2>
      <ul>
        <li>
          <strong>Notifications</strong> (optional): used only to alert you about
          recalls that match your own watchlist.
        </li>
        <li>
          <strong>Camera</strong> (optional): used only for barcode scanning to add
          a product to your watchlist. Images are processed on-device and are not
          stored or uploaded.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        RecallGuardian does not collect data from anyone, including children.
      </p>

      <h2>Data source &amp; disclaimer</h2>
      <p>
        Recall information comes from the Government of Canada &ldquo;Recalls and
        Safety Alerts&rdquo; open data, used under the Open Government Licence –
        Canada. RecallGuardian re-ranks and rewords recalls to make them easier to
        use; the official Government of Canada notice is always the authoritative
        source and is linked on every recall. RecallGuardian is not affiliated with
        or endorsed by the Government of Canada.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we&rsquo;ll update the date above and post the new
        version at{" "}
        <a href="https://recallguardian.ca/privacy">recallguardian.ca/privacy</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:privacy@recallguardian.ca">privacy@recallguardian.ca</a>.
      </p>
    </main>
  );
}
