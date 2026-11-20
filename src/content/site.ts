/**
 * Site content as typed data: every sentence shown on the page lives here, never in a component.
 * Why: Mohammed edits wording in one place; components only lay it out.
 * Text in [square brackets] is a placeholder he will write; components render it grey (the `.todo` style).
 * Wording: final copy approved by Mohammed (batch 10). The website client is never named on the site.
 * Batch 12: hero label and meta description without "Remote"; mobile menu labels; the projects' scrolling
 * screenshot and scaling-chart copy; the Projects "Schedule a call" button goes to the intro call.
 * Batch 13: the website card's screenshot frame links to the client site preview (CLIENT_PREVIEW_URL).
 * Batch 15 (SEO, approved by Mohammed): the hero label is the page's H1 and starts with the name (`labelName`).
 */

export type NavItem = { id: "about" | "projects" | "contact"; label: string; href: string };

// photoId = the generated photo (scripts/images.config.mjs, ADR 0013); alt = what the photo shows, in plain words.
// title = the sr-only heading and the label under the topic's star in the constellation navigation.
export type AboutTopic = { title: string; photoId: string; alt: string; body: string };

export type Project = {
  title: string;
  body: string;
  tags: string[];
  link?: { href: string; label: string }; // the card's text link (opens in a new tab)
  frame: "browser" | "terminal";
  address: string; // text in the frame's address bar
  // What the frame shows (batch 12): a tall page screenshot that scrolls, or the animated scaling chart.
  // Batch 13: a screenshot may link somewhere (the whole frame is the link; linkLabel = its accessible name).
  media: { kind: "screenshot"; imageId: string; alt: string; href?: string; linkLabel?: string } | { kind: "chart" };
};

// The autoscaling card's chart (batch 12): numbers come from src/data/scaling-chart.json.
export type ScalingChartCopy = {
  ariaLabel: string; // the whole chart for screen readers (the SVG itself is hidden from them)
  caption: string;
  yLabel: string;
  marker: string; // the dotted line at t = 0
  xLabels: { at: number; long: string; short: string }[]; // at = seconds from traffic arrival; short below 420 px
  predictive: string;
  reactive: string;
};

// A bubble of the mobile menu (batch 12). accent = the filled bubble (the booking link).
export type MenuItem = { label: string; href: string; accent?: boolean };

export type ContactRing = {
  id: "email" | "whatsapp" | "linkedin" | "github" | "booking"; // picks the logo in ContactRings
  label: string; // the link's accessible name (the ring text itself is decorative)
  href: string;
  ringText: string; // text that runs around the ring
};

// A privacy paragraph: plain text, or text with phrases to show as links / code (each must occur in `text`).
export type PrivacyParagraph = string | { text: string; links?: { text: string; href: string }[]; code?: string[] };
export type PrivacySection = { heading: string; paragraphs: PrivacyParagraph[] };

const LINKEDIN_URL = "https://linkedin.com/in/mohdman";
const GITHUB_URL = "https://github.com/mohamednehad1570";

// The one public email address (Proton Mail, ADR 0009). Use this constant wherever an address is needed.
export const CONTACT_EMAIL = "hello@mohammednehad.com";

// Where every "Schedule a call" link goes (Hero button, Contact ring 5, the mobile menu; not Projects, see below): the Cal.com profile page,
// which lists both call types (batch 10; replaces the /intro event).
// ADR 0007: a link, no embedded calendar or Cal.com script; ADR 0011: it opens in a new tab (src/lib/links.tsx).
export const BOOKING_URL = "https://cal.com/mohammednehad";

// The Projects section's "Schedule a call" button only (batch 12): straight to the intro call event.
export const INTRO_CALL_URL = "https://cal.com/mohammednehad/intro";

// The website card's screenshot frame (batch 13). TEMPORARY, owner-approved exception to the client-masking rule:
// this preview URL is the only place the client's name may appear in the repo or the built site (the masking grep
// over the repo and out/ may match this URL and its rendered href, nothing else). Remove it with the exception.
export const CLIENT_PREVIEW_URL = "https://emaar-site-preview.mnehad.workers.dev/";

export const site = {
  name: "Mohammed Nehad",
  // Confirmed public profiles (used for the structured data in the page head)
  profiles: [LINKEDIN_URL, GITHUB_URL],

  seo: {
    title: "Mohammed Nehad · Cloud & Infrastructure Engineer",
    description:
      "Cloud and infrastructure engineer. Four years in IT operations, a Master's in Cloud Computing Networks and a predictive autoscaling project.",
    ogImageAlt: "Mohammed Nehad", // the card itself is generated (og-image.jpg, ADR 0013)
  },
  nav: [
    { id: "about", label: "About", href: "#about" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "contact", label: "Contact", href: "#contact" },
  ] satisfies NavItem[],
  navAriaLabel: "Sections",
  // Mobile menu (below 768 px, batch 12): the burger's name and the bubbles, in this order.
  menuLabel: "Menu",
  menu: [
    { label: "Home", href: "#top" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Let's talk", href: "#contact" },
    { label: "Schedule a call", href: BOOKING_URL, accent: true },
  ] satisfies MenuItem[],

  hero: {
    // The H1 reads labelName + label; below 768 px labelName is screen-reader only (the name sits top-left there).
    labelName: "Mohammed Nehad · ",
    label: "Cloud & infrastructure engineer",
    title: "I don't let go until it's solved, for everyone.",
    description: "Four years of chasing tricky IT issues to their cause led me to the cloud systems behind them.",
    primaryCta: { label: "Get in touch", href: "#contact" },
    secondaryCta: { label: "Schedule a call", href: BOOKING_URL },
    photo: { alt: "Mohammed Nehad" }, // files come from the image pipeline (src/lib/images.ts)
  },

  about: {
    title: "How I got here",
    // Card stack controls (ADR 0015): the stack's and the constellation's group names, each star's label.
    stackLabel: "About photos",
    dotsLabel: "About topics",
    dotLabel: (n: number, total: number, title: string) => `Show topic ${n} of ${total}: ${title}`,
    // Order = the photo order (batch 7). The titles are screen-reader headings and the constellation star labels.
    topics: [
      {
        title: "Where it starts",
        photoId: "about-who",
        alt: "Mohammed sitting on a stone wall above a valley",
        body: "I was born in Dubai to a Palestinian family and grew up between Sharjah, Cairo and Gaza before university in North Cyprus. Every move taught me to listen first, adapt fast and stay calm. Those habits still guide me: I stay curious, I don't give up on a problem, and nothing eases me more than making someone's day easier.",
      },
      {
        title: "The groundwork",
        photoId: "about-study",
        alt: "Mohammed's Computer Engineering diploma",
        body: "Computer Engineering at Eastern Mediterranean University in North Cyprus gave me the foundations. Back in Cairo, I kept building on them while working full time: first a CCNA networking course, then a Master's in Cloud Computing Networks at Cairo University. It all came together in a system that scales servers before traffic spikes arrive.",
      },
      {
        title: "On the job",
        photoId: "about-work",
        alt: "Mohammed receiving a certificate at a work event",
        body: "It started with a headset and a UK telecom queue at Concentrix. Three months later I was in IT operations, and for four years the problems kept getting more curious. I learned that the real fix is the one nobody needs to report again. Then a friendly request became my first website, for a manufacturer in the UAE, which you'll find below.",
      },
      {
        title: "Off the clock",
        photoId: "about-beyond",
        alt: "Mohammed in a hooded sweatshirt beside a running track",
        body: "In Famagusta I had a ritual: cycle to the beach, run barefoot along the shore, swim, then sit and listen to the sea in the quiet hours. I still chase that calm in seaside bungalows, old castles and green fields. The rest of the time, you'll find me reading slowly, wandering a book fair, at a horror film, over a board game, or at a long dinner with family.",
      },
    ] satisfies AboutTopic[],
  },

  projects: {
    label: "Projects",
    title: "Built for the other side of the screen",
    intro: "Behind every system I build is someone who just wants it to work.",
    items: [
      {
        title: "Bilingual website for a UAE manufacturer",
        body: "For their customers, it simply speaks their language: English or Arabic, on any screen. It took three designs to make it feel that simple.",
        tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Figma", "Bilingual (EN / AR)", "RTL layout", "Claude Code (AI-assisted)"],
        // The client stays unnamed in the text (batch 10): no link row; the screenshot frame links to the preview
        // (batch 13, CLIENT_PREVIEW_URL). linkLabel gets " (opens in a new tab)" added by newTabLabel.
        frame: "browser",
        address: "client-website",
        media: {
          kind: "screenshot",
          imageId: "client-home-full",
          alt: "Homepage of a bilingual website for a UAE manufacturer, scrolling from top to bottom",
          href: CLIENT_PREVIEW_URL,
          linkLabel: "Open the client website preview",
        },
      },
      {
        title: "Predictive Kubernetes autoscaling",
        body: "For a shopper, Black Friday should feel like any other day. This system predicts the rush from past traffic and scales Kubernetes before anyone feels it. My Master's project, with more to build.",
        tags: ["GKE", "KEDA", "Time-series forecasting", "Holt-Winters", "FastAPI", "ArgoCD", "Prometheus & Grafana", "Locust", "Claude Code (AI-assisted)"],
        link: { href: GITHUB_URL, label: "View on GitHub ↗" },
        frame: "terminal",
        address: "k8s-ecommerce-autoscaler",
        media: { kind: "chart" },
      },
    ] satisfies Project[],
    chart: {
      ariaLabel:
        "Chart: with predictive scaling all pods were ready about a minute before traffic arrived; with reactive scaling full capacity came about 90 seconds after.",
      caption:
        "Two load tests. Predictive had every pod ready about a minute before traffic; reactive caught up about 90 seconds after.",
      yLabel: "Pods ready, % of full",
      marker: "Traffic arrives",
      xLabels: [
        { at: -120, long: "-2 min", short: "-2m" },
        { at: -60, long: "-1 min", short: "-1m" },
        { at: 60, long: "+1 min", short: "+1m" },
        { at: 120, long: "+2 min", short: "+2m" },
      ],
      predictive: "Predictive",
      reactive: "Reactive",
    } satisfies ScalingChartCopy,
    primaryCta: { label: "Discuss this work", href: "#contact" },
    secondaryCta: { label: "Schedule a call", href: INTRO_CALL_URL },
  },

  contact: {
    label: "Contact",
    title: "Let's talk.",
    intro: "Hiring, or have a project in mind? Pick whatever feels easiest, or schedule a call.",
    // Five rings in one line (ADR 0006), in this order: Book sits in the middle. Spin direction and text colour
    // come from the position (see ContactRings), not from these entries.
    rings: [
      { id: "email", label: "Email Mohammed", href: `mailto:${CONTACT_EMAIL}`, ringText: "SAY HELLO • SAY HELLO • " },
      {
        id: "whatsapp",
        label: "Message Mohammed on WhatsApp",
        href: "https://wa.me/201029092128",
        ringText: "QUICK CHAT • QUICK CHAT • ",
      },
      { id: "booking", label: "Schedule a call", href: BOOKING_URL, ringText: "SCHEDULE A CALL • SCHEDULE A CALL • " },
      { id: "linkedin", label: "Mohammed on LinkedIn", href: LINKEDIN_URL, ringText: "LET’S CONNECT • LET’S CONNECT • " },
      { id: "github", label: "Mohammed on GitHub", href: GITHUB_URL, ringText: "SEE THE CODE • OPEN WORK • " },
    ] satisfies ContactRing[],
  },

  footer: {
    copyright: "© 2026 Mohammed Nehad",
    privacy: { label: "Privacy", href: "/privacy/" },
  },
  toTopLabel: "Back to top",
  newTabNote: "(opens in a new tab)", // screen-reader-only suffix on links that open a new tab (src/lib/links.tsx)

  // /privacy (batch 10, final text): sections of paragraphs. A paragraph is plain text, or { text, links, code }:
  // each link's / code's `text` must be a phrase of the paragraph (the page wraps it in <a> / <code>).
  privacy: {
    title: "Privacy",
    metaDescription: "How this website handles personal data.",
    backLabel: "← Back to home",
    updatedLabel: "Last updated:", // followed by the build date (src/app/privacy/page.tsx)
    sections: [
      {
        heading: "The short version",
        paragraphs: [
          "I keep this simple: no tracking, no ads, no analytics. If you contact me or schedule a call, I use your details only to reply.",
        ],
      },
      {
        heading: "Who runs this site",
        paragraphs: [
          {
            text: `This is the personal website of Mohammed Nehad, and I'm responsible for any personal data handled through it. You can reach me at ${CONTACT_EMAIL}.`,
            links: [{ text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
          },
        ],
      },
      {
        heading: "Services that help run this site",
        paragraphs: [
          {
            text: "Cloudflare hosts and protects the site. To deliver pages and block attacks, it processes technical data such as your IP address and browser type. Cloudflare's privacy policy.",
            links: [{ text: "Cloudflare's privacy policy", href: "https://www.cloudflare.com/privacypolicy/" }],
          },
          {
            text: "Cal.com handles call scheduling. Cal.com's privacy policy.",
            links: [{ text: "Cal.com's privacy policy", href: "https://cal.com/privacy" }],
          },
          "These services may process data outside your country, including in the United States, under the safeguards described in their own policies.",
        ],
      },
      {
        heading: "Scheduling a call",
        paragraphs: [
          "If you schedule a call, you give Cal.com your name, email and any notes you add. I use them only to prepare for and hold the call. Booking is optional, but a call can't be booked without a name and email.",
        ],
      },
      {
        heading: "Contacting me",
        paragraphs: [
          "If you email me or message me on WhatsApp or LinkedIn, I use what you send only to reply and continue our conversation.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          {
            text: "This site doesn't set cookies of its own. Cloudflare may set one small security cookie (cf_clearance) that helps tell real visitors from bots. It's strictly necessary and is never used for tracking or advertising.",
            code: ["cf_clearance"],
          },
        ],
      },
      {
        heading: "Why I use your data",
        paragraphs: [
          "To reply to you and arrange calls, because you asked me to. To keep the site secure, because protecting it is necessary. I never sell your data, share it for advertising, or make automated decisions about you.",
        ],
      },
      {
        heading: "How long I keep things",
        paragraphs: [
          "I keep messages and booking details only as long as we need them, and delete them within 12 months.",
        ],
      },
      {
        heading: "Questions or requests about your data",
        paragraphs: [
          {
            text: `Want to know what I have, or want it gone? Email me at ${CONTACT_EMAIL} and I'll take care of it within 30 days.`,
            links: [{ text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }],
          },
          {
            text: "If you're ever unhappy with how I've handled your data, you can also contact a data protection authority, such as the one in your EU country, the UK's ICO, or Egypt's Personal Data Protection Centre.",
            links: [{ text: "ICO", href: "https://ico.org.uk" }],
          },
        ],
      },
      {
        heading: "Changes to this page",
        paragraphs: [
          "If anything changes, for example if I add analytics, I'll update this page and its date.",
        ],
      },
    ] satisfies PrivacySection[],
  },

  notFound: {
    text: "This page does not exist.",
    linkLabel: "Go to the home page",
  },
};
