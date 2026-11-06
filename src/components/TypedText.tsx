/**
 * TypedText: the site's typewriter text (TextType) with the project's settings (ADR 0005).
 * Why: the hero label, the hero title and every section label type once, with the same accessibility and
 * layout rules, so those rules live here and not in every caller:
 *  - types ONCE (loop off, no delete phase), at `speed` ms per character after `startDelay` ms;
 *  - reserves the final text box from the first paint (`reserveSpace`), so nothing shifts while typing;
 *  - screen readers get the full text once (TextType keeps an `sr-only` copy and hides the typed pieces);
 *  - the cursor either stays (`keep`: the hero title) or hides `hideAfter` ms after the last character
 *    (`hide`: the hero label hides at once, section labels after 0.9 s);
 *  - `start` lets a parent hold the typing (the hero title waits for the label) and `onDone` tells it when
 *    the last character is typed.
 * Without JavaScript or with reduced motion the full text is shown at once (rules in TextType.css).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import TextType from "./rb/TextType";
import { ACCENT } from "@/lib/theme";

type Props = {
  text: string;
  as?: "p" | "h1" | "h2" | "span";
  className?: string;
  /** Milliseconds per character. */
  speed: number;
  /** Milliseconds to wait before the first character. */
  startDelay?: number;
  /** Start only when ~20% of the element is on screen (section labels); false = start on load (hero). */
  onView?: boolean;
  /** Parent gate: false holds the typing. */
  start?: boolean;
  /** `keep` = the cursor keeps blinking; `hide` = it disappears `hideAfter` ms after the last character. */
  cursor: "keep" | "hide";
  hideAfter?: number;
  onDone?: () => void;
};

export default function TypedText({
  text,
  as = "p",
  className = "",
  speed,
  startDelay = 0,
  onView = false,
  start = true,
  cursor,
  hideAfter = 0,
  onDone,
}: Props) {
  const [cursorOn, setCursorOn] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finished = () => {
    onDone?.();
    if (cursor === "hide") {
      if (hideAfter <= 0) setCursorOn(false);
      else timer.current = window.setTimeout(() => setCursorOn(false), hideAfter);
    }
  };

  return (
    <TextType
      as={as}
      text={text}
      className={className}
      typingSpeed={speed}
      initialDelay={startDelay}
      loop={false}
      deleteMode="backspace"
      showCursor={cursorOn}
      cursorStyle="bar"
      cursorColor={ACCENT}
      startOnVisible={onView}
      threshold={0.2}
      enabled={start}
      reserveSpace
      onTypingComplete={finished}
    />
  );
}
