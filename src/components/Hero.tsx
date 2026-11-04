/**
 * Hero (#home): label, the one H1, description, two calls to action, and the photo on the other side.
 * Why: first screen; the text animates in (DecryptedText label, SplitText H1, BlurText description) and the
 * photo slides in from the right. All wording comes from src/content/site.ts.
 */
import Image from "next/image";
import { site } from "@/content/site";
import BlurText from "./rb/BlurText";
import DecryptedText from "./rb/DecryptedText";
import SplitText from "./rb/SplitText";
import CtaButton from "./CtaButton";
import Reveal from "./Reveal";

export default function Hero() {
  const { hero } = site;
  return (
    <section id="home" className="hero">
      <div className="wrap hero-grid">
        <div className="hero-text">
          <DecryptedText
            text={hero.label}
            animateOn="view"
            sequential
            revealDirection="start"
            speed={35}
            parentClassName="eyebrow"
            className="eyebrow-char"
            encryptedClassName="eyebrow-enc"
          />
          <SplitText tag="h1" text={hero.title} className="h1" splitType="words" delay={70} duration={0.9} textAlign="left" trigger="load" />
          <BlurText text={hero.description} className="lead" animateBy="words" delay={28} trigger="load" />
          <div className="actions">
            <CtaButton href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaButton>
            <a className="text-link" href={hero.secondaryLink.href}>
              {hero.secondaryLink.label}
            </a>
          </div>
        </div>
        <Reveal from="right" delay={250} className="hero-photo-wrap">
          <figure className="hero-photo">
            <Image src={hero.photo.src} alt={hero.photo.alt} width={340} height={425} priority sizes="(max-width: 760px) 280px, 420px" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
