/**
 * Portfolio one-page prototype (sample only, not the project build).
 * Runs the real React Bits components; files changed for this site are marked "MODIFIED" in src/rb/.
 * Sections: Hero → About (pinned circular gallery) → Projects → Contact (flowing menu) → Footer.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CubesBackground from './CubesBackground';
import CircularGallery from './rb/CircularGallery';
import FlowingMenu from './rb/FlowingMenu';
import StarBorder from './rb/StarBorder';
import Magnet from './rb/Magnet';
import ClickSpark from './rb/ClickSpark';
import GlareHover from './rb/GlareHover';
import SplitText from './rb/SplitText';
import BlurText from './rb/BlurText';
import DecryptedText from './rb/DecryptedText';
import ScrollReveal from './rb/ScrollReveal';
import VariableProximity from './rb/VariableProximity';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#1f5f8b';
const INK = '#14171c';
const ACCENT_HEX = ACCENT;
const INK_HEX = INK;

// About topics: one photo + one paragraph each. Text in [brackets] is for Mohammed to write.
const TOPICS = [
  { text: 'Who I am', image: 'img/hero.jpg', body: "Born in Dubai, based in Cairo, and working in English and Arabic with clients around the world. [Add one or two lines about what drives you.]" },
  { text: 'Experience and work', image: 'img/ph-work.jpg', body: "Over four years in IT support at Concentrix, then freelance web development, including a website for a UAE manufacturer client below. [Add what this means for the people you work with.]" },
  { text: 'Study', image: 'img/ph-study.jpg', body: "Computer Engineering at Eastern Mediterranean University (ABET accredited), and a Professional Master's in Cloud Computing Networks at Cairo University. [Add what you focused on.]" },
  { text: 'Beyond work', image: 'img/outdoor.jpg', body: "[What you enjoy when you're offline, in your own words.]" }
];

// Contact rows for the flowing menu. The round photo repeats in each hover band.
const BLUE = { bandColor: ACCENT_HEX, bandText: '#ffffff' };
const CLEAR = { bandColor: 'transparent', bandText: INK_HEX };
const CONTACTS = [
  { text: 'Email', marquee: 'Email · hello@[your-domain]', link: '#contact', image: 'img/avatar.jpg', ...BLUE },
  { text: 'WhatsApp', marquee: 'WhatsApp · chat with me', link: 'https://wa.me/201021282909?text=Hi%20Mohammed%2C%20I%20saw%20your%20website', image: 'img/avatar.jpg', ...CLEAR },
  { text: 'LinkedIn', marquee: 'LinkedIn · /in/mohdman', link: 'https://linkedin.com/in/mohdman', image: 'img/avatar.jpg', ...BLUE },
  { text: 'GitHub', marquee: 'GitHub · mohamednehad1570', link: 'https://github.com/mohamednehad1570', image: 'img/avatar.jpg', ...CLEAR },
  { text: 'Book a free call', marquee: 'Book a free call · 30 min · no commitment', link: '#book', image: 'img/avatar.jpg', ...BLUE }
];

/** Main button: StarBorder (light theme) + Magnet pull + ClickSpark on click. */
function Btn({ href, children }) {
  return (
    <Magnet padding={60} magnetStrength={4} wrapperClassName="btn-magnet">
      <ClickSpark sparkColor={ACCENT} sparkCount={10} sparkRadius={28} sparkSize={12} style={{ display: 'inline-block' }}>
        <StarBorder as="a" href={href} theme="light" color={ACCENT} trailColor={ACCENT} radius={26} glow={0.5} thickness={1.2} className="cta">
          {children}
        </StarBorder>
      </ClickSpark>
    </Magnet>
  );
}

/** Fades/slides its children in once when they enter the screen (used for photos and small text). */
function Reveal({ from = 'up', delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal reveal--${from} ${shown ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function App() {
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const vpBoxRef = useRef(null);
  const [slide, setSlide] = useState(0); // gallery position driven by page scroll
  const [shown, setShown] = useState(0); // topic whose paragraph is shown (follows the gallery)
  const [aboutPinned, setAboutPinned] = useState(false);
  const [active, setActive] = useState('home'); // section in view, for the nav underline
  const [contactSeen, setContactSeen] = useState(false);

  // Pin the About section and turn the gallery one photo per scroll step, then release.
  useLayoutEffect(() => {
    const n = TOPICS.length;
    const st = ScrollTrigger.create({
      trigger: aboutRef.current,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 0.7 * (n - 1))}`,
      pin: true,
      // snap to each photo: 0, 1/3, 2/3, 1 → every topic gets its own stop
      snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: 'power1.inOut' },
      onUpdate: self => {
        const i = Math.min(n - 1, Math.round(self.progress * (n - 1)));
        setSlide(prev => (prev === i ? prev : i));
      },
      onToggle: self => setAboutPinned(self.isActive)
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => st.kill();
  }, []);

  // Scrollspy for the nav, and mount the flowing menu only when Contact is reached (so its intro is seen).
  useEffect(() => {
    const ids = ['home', 'about', 'projects', 'contact'];
    const seen = {};
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { seen[e.target.id] = e.intersectionRect.height; });
      let best = 'home';
      ids.forEach(id => { if ((seen[id] || 0) > (seen[best] || 0)) best = id; });
      setActive(best);
      if ((seen.contact || 0) > window.innerHeight * 0.25) setContactSeen(true);
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const navClass = id => `nav-link${active === id ? ' is-active' : ''}`;

  return (
    <div className="page">
      <CubesBackground color={ACCENT} lineAlpha={0.22} paused={aboutPinned} />

      {/* Navigation: section titles only. Top bar on desktop, floating bottom bar on phones. */}
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#home">Mohammed Nehad</a>
          <nav className="nav-links" aria-label="Sections">
            <a className={navClass('about')} href="#about">About</a>
            <a className={navClass('projects')} href="#projects">Projects</a>
            <a className={navClass('contact')} href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section id="home" className="hero">
          <div className="wrap hero-grid">
            <div className="hero-text">
              <DecryptedText
                text="Web developer · Cairo, working worldwide"
                animateOn="view" sequential revealDirection="start" speed={35}
                parentClassName="eyebrow" className="eyebrow-char" encryptedClassName="eyebrow-enc"
              />
              <SplitText tag="h1" text="Websites that are fast, clear and built to last." className="h1"
                splitType="words" delay={70} duration={0.9} textAlign="left" trigger="load" />
              <BlurText text="I design and build modern websites for businesses around the world. It starts with a free 30-minute call, with no pressure and no commitment."
                className="lead" animateBy="words" delay={28} trigger="load" />
              <div className="actions">
                <Btn href="#about">About me</Btn>
                <a className="text-link" href="#contact">or book a free call</a>
              </div>
            </div>
            <Reveal from="right" delay={250} className="hero-photo-wrap">
              <figure className="hero-photo"><img src="img/hero.jpg" alt="Mohammed Nehad smiling, outdoors" /></figure>
            </Reveal>
          </div>
        </section>

        {/* 2. About: pinned while the gallery turns, one topic per scroll step */}
        <section id="about" ref={aboutRef} className="about">
          <div className="wrap about-head">
            <p className="eyebrow">About</p>
            <SplitText tag="h2" text="A little about me" className="h2" splitType="words" delay={60} textAlign="left" trigger="view" />
          </div>
          <div className="gallery">
            <CircularGallery
              items={TOPICS}
              activeIndex={slide}
              onActiveChange={setShown}
              bend={2}
              textColor={INK}
              font="600 30px 'Bricolage Grotesque', sans-serif"
              borderRadius={0.04}
              scrollEase={0.07}
              itemSize={1}
              openOnClick={false}
              fadeEdges={0.1}
              shadow={0.15}
            />
          </div>
          <div className="wrap about-copy">
            <BlurText key={shown} text={TOPICS[shown].body} className="about-body" animateBy="words" delay={22} trigger="load" />
            <ol className="dots" aria-label="About topics">
              {TOPICS.map((t, i) => <li key={t.text} className={i === shown ? 'is-on' : ''}><span className="sr-only">{t.text}</span></li>)}
            </ol>
            <p className="hint">Scroll to turn the photos. Dragging or swiping works too.</p>
          </div>
        </section>

        {/* 3. Projects */}
        <section id="projects" className="section">
          <div className="wrap">
            <p className="eyebrow">Projects</p>
            <SplitText tag="h2" text="Selected projects" className="h2" splitType="words" delay={60} textAlign="left" trigger="view" />
            <ScrollReveal baseOpacity={0.15} enableBlur blurStrength={4} baseRotation={0} containerClassName="intro" textClassName="intro-text">
              One website for a real client, and one cloud engineering project.
            </ScrollReveal>

            <div className="projects">
              <Reveal from="left" className="project">
                <GlareHover width="100%" height="auto" background="#ffffff" borderRadius="18px" borderColor="#e2e6eb"
                  glareColor="#ffffff" glareOpacity={0.55} blendMode="normal" className="frame-glare">
                  <a className="frame" href="#projects" aria-label="Visit the client website">
                    <span className="frame-bar"><i /><i /><i /><span className="frame-addr">client-website</span></span>
                    <span className="frame-shot">Screenshot of the client website home page (after the client's OK)</span>
                  </a>
                </GlareHover>
                <h3 className="h3">A UAE manufacturer client</h3>
                <p className="body">A bilingual English and Arabic website for a uPVC and aluminium windows and doors manufacturer in Sharjah, UAE. <span className="todo">[One line on the result.]</span></p>
                <ul className="tags"><li>Next.js</li><li>TypeScript</li><li>Tailwind CSS</li><li>English / Arabic</li></ul>
                <a className="text-link" href="#projects">Visit website ↗</a>
              </Reveal>

              <Reveal from="right" delay={120} className="project">
                <GlareHover width="100%" height="auto" background="#0f1216" borderRadius="18px" borderColor="#262a31"
                  glareColor="#ffffff" glareOpacity={0.35} className="frame-glare">
                  <a className="frame frame--dark" href="https://github.com/mohamednehad1570" target="_blank" rel="noopener noreferrer" aria-label="View the autoscaling project on GitHub">
                    <span className="frame-bar"><i /><i /><i /><span className="frame-addr">k8s-ecommerce-autoscaler</span></span>
                    <span className="frame-shot"><span className="term-lines">$ [screenshot placeholder]<br />Grafana: predicted vs. actual traffic,<br />pods scaling up before the spike<b className="caret" /></span></span>
                  </a>
                </GlareHover>
                <h3 className="h3">Predictive Kubernetes autoscaling</h3>
                <p className="body">Graduation project: forecasts e-commerce traffic from historical data and scales Kubernetes pods before spikes like Black Friday arrive. <span className="todo">[One line on the result.]</span></p>
                <ul className="tags"><li>Kubernetes</li><li>GKE</li><li>KEDA</li><li>Prophet</li><li>Prometheus and Grafana</li></ul>
                <a className="text-link" href="https://github.com/mohamednehad1570" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>
              </Reveal>
            </div>

            <div className="actions actions--end">
              <Btn href="#contact">Contact me</Btn>
              <a className="text-link" href="#book">Book a free call</a>
            </div>
          </div>
        </section>

        {/* 4. Contact: flowing menu fills the section, cubes stay visible behind it */}
        <section id="contact" ref={contactRef} className="section contact">
          <div className="wrap" ref={vpBoxRef}>
            <p className="eyebrow">Contact</p>
            <h2 className="h2 vp-title">
              <VariableProximity label="Let's talk." containerRef={vpBoxRef} radius={160}
                fromFontVariationSettings="'wght' 500, 'opsz' 48" toFontVariationSettings="'wght' 800, 'opsz' 96" />
            </h2>
            <ScrollReveal baseOpacity={0.15} enableBlur blurStrength={4} baseRotation={0} containerClassName="intro" textClassName="intro-text">
              Pick whatever feels easiest. No forms and no pressure.
            </ScrollReveal>
          </div>
          <div className="menu-box">
            {contactSeen && (
              <FlowingMenu
                items={CONTACTS}
                alwaysOn direction="alternate"
                speed={55} stretch={0.6} magnet={0.25} followCursor={0.4}
                textColor={INK} bgColor="transparent"
                marqueeBgColor={ACCENT} marqueeTextColor="#ffffff"
                borderColor="#dfe3e8" imageShape="circle" ariaLabel="Contact options"
              />
            )}
          </div>
          <div id="book" className="wrap book">
            <Reveal className="book-panel">
              <h3 className="h3">Book a free call</h3>
              <p className="body">30 minutes, online, no commitment. You only give a first name and an email for the meeting link.</p>
              <div className="book-slot">The Cal.com calendar appears here. Every booking waits for Mohammed's approval.</div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <span>© 2026 Mohammed Nehad</span>
          <a className="footer-privacy" href="#home">Privacy</a>
        </div>
      </footer>

      {/* Go to top: the only icon on the site, shown after the hero */}
      <a className={`to-top${active !== 'home' ? ' is-shown' : ''}`} href="#home" aria-label="Back to top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
      </a>
    </div>
  );
}
