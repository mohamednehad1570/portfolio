/**
 * EnvelopeOpenIcon: an open envelope, drawn for this site (24x24, stroke 1.7, round joins and caps, no fill).
 * Why: the Contact ring for email; there is no brand mark to respect here. Decorative: the link carries the name.
 */
export default function EnvelopeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 10.6V18.8A2.2 2.2 0 0 0 5.2 21H18.8A2.2 2.2 0 0 0 21 18.8V10.6L13.3 4.5A2.1 2.1 0 0 0 10.7 4.5Z" />
      <path d="M3.4 11L12 16.4L20.6 11" />
      <path d="M3.6 20.3L9.6 14.9M20.4 20.3L14.4 14.9" />
    </svg>
  );
}
