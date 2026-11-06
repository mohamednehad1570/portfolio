/**
 * Site content as typed data: every sentence shown on the page lives here, never in a component.
 * Why: Mohammed edits wording in one place; components only lay it out.
 * Text in [square brackets] is a placeholder he will write; components render it grey (the `.todo` style).
 * Wording is copied from the approved prototype (reference/prototype/src/App.jsx).
 */

export type NavItem = { id: "about" | "projects" | "contact"; label: string; href: string };

export type AboutTopic = { title: string; image: string; body: string };

export type Project = {
  title: string;
  body: string;
  tags: string[];
  href: string; // "#projects" until the client approves showing the Emaar link
  linkLabel: string;
  external: boolean; // opens in a new tab
  ariaLabel: string; // name of the frame link for screen readers
  frame: "browser" | "terminal";
  address: string; // text in the frame's address bar
  shot: string; // placeholder text inside the frame until real screenshots exist
};

export type ContactRing = {
  id: "email" | "whatsapp" | "linkedin" | "github" | "booking"; // picks the logo in ContactRings
  label: string; // the link's accessible name (the ring text itself is decorative)
  href: string;
  ringText: string; // text that runs around the ring
};

const LINKEDIN_URL = "https://linkedin.com/in/mohdman";
const GITHUB_URL = "https://github.com/mohamednehad1570";

// The one public email address (Proton Mail, ADR 0009). Use this constant wherever an address is needed.
export const CONTACT_EMAIL = "hello@mohammednehad.com";

// Where every "Book a free call" link goes (Hero and Projects buttons, Contact ring 5). ADR 0007: a link, no embedded
// calendar; ADR 0011: once this is an external URL, those links open it in a new tab (src/lib/links.ts).
// TODO(batch-4): Cal.com event URL (until then the link only scrolls to Contact).
export const BOOKING_URL = "#contact";

export const site = {
  name: "Mohammed Nehad",
  // Confirmed public profiles (used for the structured data in the page head)
  profiles: [LINKEDIN_URL, GITHUB_URL],

  seo: {
    title: "Mohammed Nehad · Web developer",
    description:
      "Websites that are fast, clear and built to last. Web developer based in Cairo, working with clients worldwide. Start with a free 30-minute call.",
    ogImage: "/images/hero.jpg",
    ogImageAlt: "Mohammed Nehad smiling, outdoors",
  },
  nav: [
    { id: "about", label: "About", href: "#about" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "contact", label: "Contact", href: "#contact" },
  ] satisfies NavItem[],
  navAriaLabel: "Sections",

  hero: {
    label: "Web developer · Cairo, working worldwide",
    title: "Websites that are fast, clear and built to last.",
    description:
      "I design and build modern websites for businesses around the world. It starts with a free 30-minute call, with no pressure and no commitment.",
    primaryCta: { label: "About me", href: "#about" },
    secondaryCta: { label: "Book a free call", href: BOOKING_URL },
    photo: { src: "/images/hero.jpg", alt: "Mohammed Nehad smiling, outdoors" },
  },

  about: {
    label: "About",
    title: "A little about me",
    topics: [
      {
        title: "Who I am",
        image: "/images/hero.jpg",
        body: "Born in Dubai, based in Cairo, and working in English and Arabic with clients around the world. [Add one or two lines about what drives you.]",
      },
      {
        title: "Experience and work",
        image: "/images/about-work.jpg",
        body: "Over four years in IT support at Concentrix, then freelance web development, including the Emaar International website below. [Add what this means for the people you work with.]",
      },
      {
        title: "Study",
        image: "/images/about-study.jpg",
        body: "Computer Engineering at Eastern Mediterranean University (ABET accredited), and a Professional Master's in Cloud Computing Networks at Cairo University. [Add what you focused on.]",
      },
      {
        title: "Beyond work",
        image: "/images/about-beyond.jpg",
        body: "[What you enjoy when you're offline, in your own words.]",
      },
    ] satisfies AboutTopic[],
  },

  projects: {
    label: "Projects",
    title: "Selected projects",
    intro: "One website for a real client, and one cloud engineering project.",
    items: [
      {
        title: "Emaar International",
        body: "A bilingual English and Arabic website for a uPVC and aluminium windows and doors manufacturer in Sharjah, UAE. [One line on the result.]",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "English / Arabic"],
        href: "#projects",
        linkLabel: "Visit website ↗",
        external: false,
        ariaLabel: "Visit the Emaar International website",
        frame: "browser",
        address: "emaarupvc.ae",
        shot: "Screenshot of the Emaar International home page (after the client's OK)",
      },
      {
        title: "Predictive Kubernetes autoscaling",
        body: "Graduation project: forecasts e-commerce traffic from historical data and scales Kubernetes pods before spikes like Black Friday arrive. [One line on the result.]",
        tags: ["Kubernetes", "GKE", "KEDA", "Prophet", "Prometheus and Grafana"],
        href: GITHUB_URL,
        linkLabel: "View on GitHub ↗",
        external: true,
        ariaLabel: "View the autoscaling project on GitHub",
        frame: "terminal",
        address: "k8s-ecommerce-autoscaler",
        shot: "$ [screenshot placeholder]\nGrafana: predicted vs. actual traffic,\npods scaling up before the spike",
      },
    ] satisfies Project[],
    primaryCta: { label: "Contact me", href: "#contact" },
    secondaryCta: { label: "Book a free call", href: BOOKING_URL },
  },

  contact: {
    label: "Contact",
    title: "Let's talk.",
    intro: "Pick whatever feels easiest, or book a free 30-minute intro call. No forms and no pressure.",
    // Five rings in one line (ADR 0006), in this order: Book sits in the middle. Spin direction and text colour
    // come from the position (see ContactRings), not from these entries.
    rings: [
      { id: "email", label: "Email Mohammed", href: `mailto:${CONTACT_EMAIL}`, ringText: "SAY HELLO • SAY HELLO • " },
      {
        id: "whatsapp",
        label: "Message Mohammed on WhatsApp",
        href: "https://wa.me/201021282909?text=Hi%20Mohammed%2C%20I%20saw%20your%20website",
        ringText: "QUICK CHAT • QUICK CHAT • ",
      },
      { id: "booking", label: "Book a free call", href: BOOKING_URL, ringText: "NO PRESSURE • 30 MIN • FREE • " },
      { id: "linkedin", label: "Mohammed on LinkedIn", href: LINKEDIN_URL, ringText: "LET’S CONNECT • LET’S CONNECT • " },
      { id: "github", label: "Mohammed on GitHub", href: GITHUB_URL, ringText: "SEE THE CODE • OPEN WORK • " },
    ] satisfies ContactRing[],
  },

  footer: {
    copyright: "© 2026 Mohammed Nehad",
    privacy: { label: "Privacy", href: "/privacy/" },
  },
  toTopLabel: "Back to top",

  // /privacy: headings only, with bracketed placeholders for Mohammed (and a lawyer, if needed) to write.
  privacy: {
    title: "Privacy",
    metaDescription: "How this website handles personal data.",
    backLabel: "← Back to home",
    sections: [
      { heading: "Who runs this site", body: "[Name, country and contact address of the person responsible for this website.]" },
      {
        heading: "What data is collected",
        body: "[When the booking calendar is added: first name and email, processed by Cal.com to arrange the call. Say what is stored, why, and for how long.]",
      },
      {
        heading: "Analytics",
        body: "[If cookieless analytics is added later: which tool, what it counts, and that no cookies are used.]",
      },
      { heading: "How to ask for deletion", body: "[How a visitor can ask to see or delete their data, and how fast Mohammed replies.]" },
      { heading: "Contact", body: CONTACT_EMAIL },
    ],
  },

  notFound: {
    text: "This page does not exist.",
    linkLabel: "Go to the home page",
  },
};
