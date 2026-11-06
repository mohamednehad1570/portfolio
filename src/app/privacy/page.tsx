/**
 * /privacy: the privacy page. Headings with bracketed placeholder paragraphs for Mohammed to fill in.
 * Why: the footer links here; a booking form and analytics (later) will process personal data, so the
 * page must exist from day one. A simple standalone page: no section nav, no starfield.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Heading } from "@/components/sections/SectionText";
import TodoText from "@/components/TodoText";
import { site } from "@/content/site";

const { privacy } = site;

export const metadata: Metadata = {
  title: `${privacy.title} · ${site.name}`,
  description: privacy.metaDescription,
  alternates: { canonical: "/privacy/" }, // not the home page's canonical inherited from the layout
  openGraph: { url: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <main className="doc wrap">
      <Link className="text-link" href="/">
        {privacy.backLabel}
      </Link>
      <Heading tag="h1" text={privacy.title} className="h1" />
      {privacy.sections.map((section) => (
        <section key={section.heading}>
          <Heading tag="h2" text={section.heading} className="h3 doc-heading" />
          <Reveal from="fade">
            <p className="body">
              <TodoText text={section.body} />
            </p>
          </Reveal>
        </section>
      ))}
    </main>
  );
}
