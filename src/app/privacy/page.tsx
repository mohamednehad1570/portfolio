/**
 * /privacy: the privacy page (final text, batch 10): "Last updated" with the build date, then headed sections of
 * paragraphs from site.ts. A paragraph may carry inline links (external ones open in a new tab via lib/links) and
 * inline code (the cf_clearance cookie name).
 * Why: the footer links here; Cloudflare (hosting) and Cal.com (booking) process personal data. A simple standalone
 * page: no section nav, no starfield.
 */
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { Heading } from "@/components/sections/SectionText";
import { site, type PrivacyParagraph } from "@/content/site";
import { newTabProps, NewTabNote } from "@/lib/links";

const { privacy } = site;

export const metadata: Metadata = {
  title: `${privacy.title} · ${site.name}`,
  description: privacy.metaDescription,
  alternates: { canonical: "/privacy/" }, // not the home page's canonical inherited from the layout
  openGraph: { url: "/privacy/" },
};

// The page is a static export, so this runs once at build time: the date is the build date, e.g. "9 November 2026".
const UPDATED = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Wraps each link / code phrase of a paragraph in <a> / <code>, in the order they occur in the text.
function Paragraph({ p }: { p: PrivacyParagraph }) {
  if (typeof p === "string") return <>{p}</>;
  const marks = [
    ...(p.links ?? []).map((l) => ({ text: l.text, href: l.href as string | undefined })),
    ...(p.code ?? []).map((text) => ({ text, href: undefined })),
  ];
  const out: ReactNode[] = [];
  let rest = p.text;
  for (;;) {
    // the earliest phrase still in the rest of the text
    const next = marks
      .map((m) => ({ m, at: rest.indexOf(m.text) }))
      .filter((x) => x.at >= 0)
      .sort((a, b) => a.at - b.at)[0];
    if (!next) break;
    const { m, at } = next;
    out.push(rest.slice(0, at));
    out.push(
      m.href ? (
        <a key={out.length} className="text-link" href={m.href} {...newTabProps(m.href)}>
          {m.text}
          <NewTabNote href={m.href} />
        </a>
      ) : (
        <code key={out.length}>{m.text}</code>
      ),
    );
    rest = rest.slice(at + m.text.length);
  }
  out.push(rest);
  return <>{out}</>;
}

export default function PrivacyPage() {
  return (
    <main className="doc wrap">
      <Link className="text-link" href="/">
        {privacy.backLabel}
      </Link>
      <Heading tag="h1" text={privacy.title} className="h1" />
      <p className="body doc-updated">
        <em>
          {privacy.updatedLabel} <time dateTime={new Date().toISOString().slice(0, 10)}>{UPDATED}</time>
        </em>
      </p>
      {privacy.sections.map((section) => (
        <section key={section.heading}>
          <Heading tag="h2" text={section.heading} className="h3 doc-heading" />
          {section.paragraphs.map((p, i) => (
            <Reveal key={i} from="fade">
              <p className="body">
                <Paragraph p={p} />
              </p>
            </Reveal>
          ))}
        </section>
      ))}
    </main>
  );
}
