/**
 * /privacy: the privacy page. Headings with bracketed placeholder paragraphs for Mohammed to fill in.
 * Why: the footer links here; a booking form and analytics (later) will process personal data, so the
 * page must exist from day one. A simple standalone page: no section nav, no cubes.
 */
import type { Metadata } from "next";
import Link from "next/link";
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
      <h1 className="h1">{privacy.title}</h1>
      {privacy.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="h3 doc-heading">{section.heading}</h2>
          <p className="body">
            <TodoText text={section.body} />
          </p>
        </section>
      ))}
    </main>
  );
}
