/**
 * BubbleMenu: full-screen menu of round "bubble" links that pop in one after another, opened by a round burger.
 * From React Bits (github.com/DavidHDev/react-bits, src/ts-default/Components/BubbleMenu), MIT + Commons Clause,
 * see LICENSE-react-bits.md. Vendored for this site (batch 12, mobile menu below 768 px); every change is marked
 * `MODIFIED` (see README.md in this folder).
 * Batch 13: level pills (rotation 0) that spring out of the top-right corner one after another and fold back in
 * reverse order; the backdrop fades in and out (0.35 s). Behaviour (focus, Esc, backdrop, scroll lock) unchanged.
 */
'use client';

import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

import './BubbleMenu.css';

// MODIFIED: items carry `target` / `rel` (new-tab links) and `accent` (the filled bubble) instead of per-item
// rotation and hover colours; the colours come from the site's tokens in BubbleMenu.css.
export type BubbleMenuItem = {
  label: string;
  href: string;
  accent?: boolean;
  target?: string;
  rel?: string;
  srNote?: string; // screen-reader-only text appended to the label (e.g. "(opens in a new tab)")
};

export type BubbleMenuProps = {
  items: BubbleMenuItem[];
  menuAriaLabel: string; // MODIFIED: the burger's name (it carries aria-expanded, so one name serves both states)
  navAriaLabel: string; // MODIFIED: name of the <nav> landmark inside the panel
  panelId?: string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

// MODIFIED: removed the default demo items and the logo bubble (the site name sits in the hero instead).

export default function BubbleMenu({
  items,
  menuAriaLabel,
  navAriaLabel,
  panelId = 'bubble-menu-panel',
  onMenuClick,
  className,
  style,
  animationEase = 'back.out(1.6)', // MODIFIED (batch 13): was back.out(1.5)
  animationDuration = 0.5,
  staggerDelay = 0.07 // MODIFIED (batch 13): 70 ms (was 80 ms plus a random +-50 ms)
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);

  // MODIFIED: the page behind the open menu. While open: scroll locked (overflow hidden on <html> and <body>),
  // every sibling of the menu inert (no focus, no clicks, hidden from screen readers), and <html data-menu-open>
  // for CSS (the back-to-top button hides). `release` undoes it synchronously, so a clicked in-page link can
  // scroll to its section in the same click.
  const lock = useCallback(() => {
    const root = rootRef.current;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.dataset.menuOpen = '';
    if (root?.parentElement) {
      Array.from(root.parentElement.children).forEach(el => {
        if (el !== root) (el as HTMLElement).inert = true;
      });
    }
  }, []);
  const release = useCallback(() => {
    const root = rootRef.current;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    delete document.documentElement.dataset.menuOpen;
    if (root?.parentElement) {
      Array.from(root.parentElement.children).forEach(el => {
        (el as HTMLElement).inert = false;
      });
    }
  }, []);

  // MODIFIED: one close path for link, backdrop and Esc: release the page, close, focus back on the burger.
  const close = useCallback(() => {
    release();
    setIsMenuOpen(false);
    onMenuClick?.(false);
    toggleRef.current?.focus({ preventScroll: true });
  }, [release, onMenuClick]);

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) {
      setShowOverlay(true);
      lock();
    } else {
      release();
    }
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);

    if (!overlay || !bubbles.length) return;

    // MODIFIED: reduced motion: the bubbles and the backdrop appear and disappear at once (no pop, no fade).
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([overlay, ...bubbles]);
      // MODIFIED: focus moves into the menu (the first bubble) as soon as it opens.
      bubbles[0]?.focus({ preventScroll: true });
      if (reduced) {
        gsap.set(overlay, { opacity: 1 });
        gsap.set(bubbles, { scale: 1, rotation: 0 });
        return;
      }
      // MODIFIED (batch 13): backdrop fades in; every pill level (rotation 0) and scaled from its top-right corner
      // (transform-origin in CSS), 70 ms apart. The label no longer rises separately: it scales with its pill.
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' });
      gsap.fromTo(
        bubbles,
        { scale: 0, rotation: 0 },
        { scale: 1, rotation: 0, duration: animationDuration, ease: animationEase, stagger: staggerDelay }
      );
    } else if (showOverlay) {
      gsap.killTweensOf([overlay, ...bubbles]);
      const hide = () => {
        gsap.set(overlay, { display: 'none' });
        setShowOverlay(false);
      };
      if (reduced) {
        hide();
        return;
      }
      // MODIFIED (batch 13): close in reverse order, 40 ms apart, while the backdrop fades out (0.35 s).
      gsap.to(bubbles, { scale: 0, duration: 0.2, ease: 'power3.in', stagger: { each: 0.04, from: 'end' } });
      gsap.to(overlay, { opacity: 0, duration: 0.35, ease: 'power1.in', onComplete: hide });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  // MODIFIED: removed the desktop rotation resize handler (the menu only exists below 768 px).

  // MODIFIED: Esc closes; Tab and Shift+Tab cycle between the burger and the bubbles (focus stays in the menu).
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = [toggleRef.current, ...bubblesRef.current].filter(Boolean) as HTMLElement[];
      const i = focusables.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? focusables.length - 1 : i - 1) : i === focusables.length - 1 ? 0 : i + 1;
      e.preventDefault();
      focusables[next]?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen, close]);

  // MODIFIED: never leave the page locked (unmount, e.g. a resize past 768 px removing the menu in a future change).
  useEffect(() => release, [release]);

  // MODIFIED: a click on the panel itself (not on a bubble) is the backdrop: it closes the menu.
  const onBackdrop = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('.pill-link')) close();
  };

  return (
    // MODIFIED: one root (burger + panel) so everything else on the page can be made inert while the menu is open.
    <div ref={rootRef} className={['bubble-menu-root', className].filter(Boolean).join(' ')} style={style}>
      <div className="bubble-menu fixed">
        {/* MODIFIED: aria-expanded + aria-controls instead of aria-pressed; glass styling in CSS (no inline colours) */}
        <button
          ref={toggleRef}
          type="button"
          className={`bubble toggle-bubble menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-expanded={isMenuOpen}
          aria-controls={panelId}
        >
          <span className="menu-line" />
          <span className="menu-line short" />
        </button>
      </div>
      {/* MODIFIED: always rendered (aria-controls needs its target) and `hidden` while closed; no menu/menuitem
          roles (these are page links, so a plain nav list); the click handler is the backdrop. */}
      <div
        ref={overlayRef}
        id={panelId}
        className="bubble-menu-items fixed"
        hidden={!showOverlay}
        onClick={onBackdrop}
      >
        <nav aria-label={navAriaLabel} className="pill-nav">
          <ul className="pill-list">
            {items.map((item, idx) => (
              <li key={item.label} className="pill-col">
                <a
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  className={`pill-link${item.accent ? ' pill-link--accent' : ''}`}
                  onClick={close}
                  ref={el => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  {/* MODIFIED (batch 13): the label scales with its pill (no separate rise, so no ref) */}
                  <span className="pill-label">{item.label}</span>
                  {item.srNote ? <span className="sr-only"> {item.srNote}</span> : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
