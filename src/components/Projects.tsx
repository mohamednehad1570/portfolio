/**
 * Projects (#projects): two cards side by side (stacked on phones) with identical frames.
 * Why (D16): Emaar in a light browser frame, the Kubernetes autoscaling project in a dark terminal frame;
 * the cards slide in from opposite sides. The Emaar link stays "#projects" until the client approves showing it.
 */
import { site } from "@/content/site";
import ScrollReveal from "./rb/ScrollReveal";
import SplitText from "./rb/SplitText";
import CtaButton from "./CtaButton";
import { BrowserFrame, TerminalFrame } from "./ProjectFrame";
import Reveal from "./Reveal";
import TodoText from "./TodoText";

export default function Projects() {
  const { projects } = site;
  return (
    <section id="projects" className="section">
      <div className="wrap">
        <p className="eyebrow">{projects.label}</p>
        <SplitText tag="h2" text={projects.title} className="h2" splitType="words" delay={60} textAlign="left" trigger="view" />
        <ScrollReveal baseOpacity={0} enableBlur blurStrength={4} baseRotation={0} containerClassName="intro" textClassName="intro-text">
          {projects.intro}
        </ScrollReveal>

        <div className="projects">
          {projects.items.map((p, i) => {
            const Frame = p.frame === "browser" ? BrowserFrame : TerminalFrame;
            return (
              <Reveal key={p.title} from={i === 0 ? "left" : "right"} delay={i === 0 ? 0 : 120} className="project">
                <Frame href={p.href} external={p.external} ariaLabel={p.ariaLabel} address={p.address} shot={p.shot} />
                <h3 className="h3">{p.title}</h3>
                <p className="body">
                  <TodoText text={p.body} />
                </p>
                <ul className="tags">
                  {p.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <a
                  className="text-link"
                  href={p.href}
                  {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {p.linkLabel}
                </a>
              </Reveal>
            );
          })}
        </div>

        <div className="actions actions--end">
          <CtaButton href={projects.primaryCta.href}>{projects.primaryCta.label}</CtaButton>
          <a className="text-link" href={projects.secondaryLink.href}>
            {projects.secondaryLink.label}
          </a>
        </div>
      </div>
    </section>
  );
}
