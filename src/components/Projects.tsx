/**
 * Projects (#projects): two cards side by side (stacked on phones) with identical frames.
 * Alignment (D16 final): the cards share five rows through CSS subgrid, so titles, descriptions, tags and links line up.
 * Why (D16): the client website in a light browser frame, the Kubernetes autoscaling project in a dark terminal
 * frame; the cards slide in from opposite sides. Batch 10: the client is never named and its card has no link
 * (no text link, and its frame is not a link). Below the cards: the two buttons from site.ts (ADR 0011).
 */
import { site } from "@/content/site";
import { newTabProps, NewTabNote } from "@/lib/links";
import CtaButton from "./CtaButton";
import { BrowserFrame, TerminalFrame } from "./ProjectFrame";
import Reveal from "./Reveal";
import TodoText from "./TodoText";
import { Eyebrow, Heading, Intro } from "./sections/SectionText";

export default function Projects() {
  const { projects } = site;
  return (
    <section id="projects" className="section">
      <div className="wrap">
        <Eyebrow text={projects.label} />
        <Heading tag="h2" text={projects.title} className="h2" />
        <Intro text={projects.intro} />

        <div className="projects">
          {projects.items.map((p, i) => {
            const Frame = p.frame === "browser" ? BrowserFrame : TerminalFrame;
            return (
              // One card = five grid rows (frame, title, description, tags, link) shared with the other card
              // through CSS subgrid, so those rows line up across the cards whatever the text length (D16).
              <article key={p.title} className="project">
                <Reveal from={i === 0 ? "left" : "right"} delay={i === 0 ? 0 : 120}>
                  <Frame href={p.link?.href} ariaLabel={p.ariaLabel} address={p.address} shot={p.shot} />
                </Reveal>
                <Heading tag="h3" text={p.title} className="h3" />
                <Reveal from="fade">
                  <p className="body">
                    <TodoText text={p.body} />
                  </p>
                </Reveal>
                <Reveal from="fade">
                  <ul className="tags">
                    {p.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </Reveal>
                {/* the link row stays empty for a card without a link; the subgrid keeps the other rows aligned */}
                {p.link ? (
                  <Reveal from="fade">
                    <a className="text-link" href={p.link.href} {...newTabProps(p.link.href)}>
                      {p.link.label}
                      <NewTabNote href={p.link.href} />
                    </a>
                  </Reveal>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="actions actions--end">
          <CtaButton href={projects.primaryCta.href}>{projects.primaryCta.label}</CtaButton>
          <CtaButton href={projects.secondaryCta.href}>{projects.secondaryCta.label}</CtaButton>
        </div>
      </div>
    </section>
  );
}
