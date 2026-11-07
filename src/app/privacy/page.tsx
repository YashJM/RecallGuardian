import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "RecallGuardian has no accounts and no tracking. Your watchlist stays on your device; if you turn on recall alerts, we store only an anonymous push token and the categories you follow.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="wrap legal">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: November 7, 2026</p>

      <p>
        RecallGuardian is built to be private. There are no accounts, no
        analytics, no advertising, and no tracking. We do not collect your name,
        email, location, or contacts, and we never sell or share personal
        information.
      </p>

      <h2>What stays on your device</h2>
      <p>
        Your watchlist (the brands and products you choose to watch) and your
        alert settings are stored on your device. The brands and products you
        watch are never uploaded. Matches against your brand watchlist are found
        on your phone.
      </p>

      <h2>What we store if you turn on recall alerts</h2>
      <p>
        Recall alerts are optional. If you turn them on, the app sends our server
        three things so we can notify you when a new recall is published:
      </p>
      <ul>
        <li>
          <strong>A push notification token</strong> issued by Apple. It lets us
          deliver a notification to your device. It is not your Apple ID, phone
          number, or any other personal identifier, and we don&rsquo;t link it to
          who you are.
        </li>
        <li>
          <strong>The recall categories you follow</strong> (for example, Food or
          Baby &amp; kids).
        </li>
        <li>
          <strong>Your severity setting</strong> (critical only, high and
          critical, or everything).
        </li>
      </ul>
      <p>
        We use this only to send you recall alerts. Turning alerts off in the
        app deletes it from our server. If you delete the app, Apple invalidates
        the token and we remove it automatically the next time an alert would be
        sent.
      </p>

      <h2>Services we use</h2>
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
        <li>
          <strong>Apple Push Notification service</strong>: delivers recall
          alerts to your device if you turn them on.
        </li>
        <li>
          <strong>Vercel and Supabase</strong>: host this website and the small
          server that stores the alert information described above.
        </li>
      </ul>

      <h2>Permissions</h2>
      <ul>
        <li>
          <strong>Notifications</strong> (optional): used only to alert you about
          new recalls in the categories you follow and matches with your own
          watchlist.
        </li>
        <li>
          <strong>Camera</strong> (optional): used only for barcode scanning to add
          a product to your watchlist. Images are processed on-device and are not
          stored or uploaded.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        RecallGuardian does not knowingly collect personal information from
        anyone, including children.
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
        Questions, or want your data deleted? Email{" "}
        <a href="mailto:privacy@recallguardian.ca">privacy@recallguardian.ca</a>.
      </p>
    </main>
  );
}
