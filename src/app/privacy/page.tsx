/**
 * /privacy: the privacy page. Headings with bracketed placeholder paragraphs for Mohammed to fill in.
 * Why: the footer links here; booking (Cal.com, a link only) and analytics (later) process personal data, so the
 * page must exist from day one. A simple standalone page: no section nav, no starfield. Finished paragraphs (the
 * Booking section, ADR 0014) may carry one inline link; the rest are still bracketed placeholders.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Heading } from "@/components/sections/SectionText";
import TodoText from "@/components/TodoText";
import { site } from "@/content/site";
import { newTabProps, NewTabNote } from "@/lib/links";

const { privacy } = site;

export const metadata: Metadata = {
  title: `${privacy.title} · ${site.name}`,
  description: privacy.metaDescription,
  alternates: { canonical: "/privacy/" }, // not the home page's canonical inherited from the layout
  openGraph: { url: "/privacy/" },
};

// A finished paragraph with one link inside it (the Booking section: Cal.com's privacy policy). The link text is
// a phrase of the body, so the copy stays one sentence in site.ts.
function BodyWithLink({ body, link }: { body: string; link: { text: string; href: string } }) {
  const at = body.indexOf(link.text);
  if (at < 0) return <TodoText text={body} />;
  return (
    <>
      {body.slice(0, at)}
      <a className="text-link" href={link.href} {...newTabProps(link.href)}>
        {link.text}
        <NewTabNote href={link.href} />
      </a>
      {body.slice(at + link.text.length)}
    </>
  );
}

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
              {section.link ? <BodyWithLink body={section.body} link={section.link} /> : <TodoText text={section.body} />}
            </p>
          </Reveal>
        </section>
      ))}
    </main>
  );
}
