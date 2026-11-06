/**
 * CalendarIcon: a simple calendar page, drawn for this site (24x24, filled).
 * Why: the Contact ring for "Book a free call"; no brand mark involved. Two paths: the page with its header band
 * (even-odd cut-out), and the two binder tabs plus six date squares. Decorative: the link carries the name.
 */
export default function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M3 5H21V21H3Z M4.6 10V19.4H19.4V10Z" />
      <path d="M7 2.6H8.8V7H7Z M15.2 2.6H17V7H15.2Z M7 12.2H9V14.2H7Z M11 12.2H13V14.2H11Z M15 12.2H17V14.2H15Z M7 15.8H9V17.8H7Z M11 15.8H13V17.8H11Z" />
    </svg>
  );
}
