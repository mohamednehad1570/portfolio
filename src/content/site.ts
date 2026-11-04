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

export type ContactRow = {
  label: string; // link text read by screen readers
  marquee: string; // text that scrolls in the band
  href: string;
  band: "blue" | "clear";
};

const LINKEDIN_URL = "https://linkedin.com/in/mohdman";
const GITHUB_URL = "https://github.com/mohamednehad1570";

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
    secondaryLink: { label: "or book a free call", href: "#contact" },
    photo: { src: "/images/hero.jpg", alt: "Mohammed Nehad smiling, outdoors" },
  },

  about: {
    label: "About",
    title: "A little about me",
    hint: "Scroll to turn the photos. Dragging or swiping works too.",
    dotsAriaLabel: "About topics",
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
    secondaryLink: { label: "Book a free call", href: "#book" },
  },

  contact: {
    label: "Contact",
    title: "Let's talk.",
    intro: "Pick whatever feels easiest. No forms and no pressure.",
    menuAriaLabel: "Contact options",
    // Round photo repeated in every band of the menu.
    image: "/images/avatar.jpg",
    rows: [
      // TODO(Mohammed): the Email row stays on #contact until a real mailbox address exists.
      { label: "Email", marquee: "Email · hello@[your-domain]", href: "#contact", band: "blue" },
      {
        label: "WhatsApp",
        marquee: "WhatsApp · chat with me",
        href: "https://wa.me/201021282909?text=Hi%20Mohammed%2C%20I%20saw%20your%20website",
        band: "clear",
      },
      { label: "LinkedIn", marquee: "LinkedIn · /in/mohdman", href: LINKEDIN_URL, band: "blue" },
      {
        label: "GitHub",
        marquee: "GitHub · mohamednehad1570",
        href: GITHUB_URL,
        band: "clear",
      },
      { label: "Book a free call", marquee: "Book a free call · 30 min · no commitment", href: "#book", band: "blue" },
    ] satisfies ContactRow[],
    book: {
      title: "Book a free call",
      body: "30 minutes, online, no commitment. You only give a first name and an email for the meeting link.",
      slot: "The Cal.com calendar appears here. Every booking waits for Mohammed's approval.",
    },
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
      { heading: "Contact", body: "[Email address for privacy questions.]" },
    ],
  },

  notFound: {
    text: "This page does not exist.",
    linkLabel: "Go to the home page",
  },
};
