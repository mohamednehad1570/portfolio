/**
 * WordReveal: a heading or paragraph whose words fade in one after another when `play` is true, and again every
 * time `replay` changes (ADR 0008).
 * Why (ADR 0003): each About topic reveals its title and text when its photo comes to the front. The vendored
 * BlurText can only start on load/view/hover, not on a prop that comes from scroll position, so this small Motion
 * component does it instead (word from opacity 0 + blur 8px + 14px below, to normal; 600 ms, transform 700 ms).
 * Replay: the words are keyed by `replay`, so a new value remounts them in the hidden state (an instant reset)
 * and they play again. `play` false snaps them hidden with no fade (the item has left the front for good).
 *
 * Accessibility: screen readers get the full sentence once (an `sr-only` copy); the animated words are
 * `aria-hidden`. `[bracketed]` placeholders stay grey (`.todo`), as TodoText does elsewhere.
 * The replay remounts only the `aria-hidden` words; the `sr-only` copy stays put, so nothing is read twice.
 * `animate` false (server render, reduced motion, no JavaScript) shows the plain words with no animation.
 */
"use client";

import { Fragment } from "react";
import { motion } from "motion/react";

type Props = {
  text: string;
  /** True while the words should be shown (plays when it turns true, or when `replay` changes). */
  play: boolean;
  /** Changes every time the reveal must start over (the item became the front item again). */
  replay?: number;
  /** False = plain visible text, no motion. */
  animate: boolean;
  as?: "h3" | "p";
  className?: string;
  /** Seconds before the first word starts. */
  startDelay?: number;
  /** Seconds between two words. */
  stagger?: number;
};

const HIDDEN = { opacity: 0, filter: "blur(8px)", y: 14 };
const SHOWN = { opacity: 1, filter: "blur(0px)", y: 0 };
const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Splits into words and marks the words that sit inside [brackets] as placeholders. */
function tokenize(text: string): { word: string; todo: boolean }[] {
  let open = false;
  return text.split(" ").map((word) => {
    if (word.includes("[")) open = true;
    const todo = open;
    if (word.includes("]")) open = false;
    return { word, todo };
  });
}

export default function WordReveal({ text, play, replay = 0, animate, as: Tag = "p", className, startDelay = 0, stagger = 0.08 }: Props) {
  const words = tokenize(text);
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" key={replay}>
        {words.map(({ word, todo }, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            {animate ? (
              <motion.span
                className={todo ? "todo" : undefined}
                style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
                initial={HIDDEN}
                animate={play ? SHOWN : HIDDEN}
                transition={
                  play
                    ? { duration: 0.6, ease: EASE, delay: startDelay + i * stagger, y: { duration: 0.7, ease: EASE, delay: startDelay + i * stagger } }
                    : { duration: 0 } // hiding is instant (a reset), never a slow fade-out
                }
              >
                {word}
              </motion.span>
            ) : (
              <span className={todo ? "todo" : undefined}>{word}</span>
            )}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
