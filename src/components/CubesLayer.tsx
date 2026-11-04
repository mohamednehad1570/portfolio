/**
 * CubesLayer: loads the WebGL cubes background in the browser only, after the page text.
 *
 * Why it exists: `next/dynamic` with `ssr: false` is only allowed inside a Client Component. Loading the
 * canvas code as a separate chunk means it never blocks the first paint of the headline and text.
 * While it loads (and when WebGL2 is missing) the page is simply white, so there is nothing to shift.
 */
"use client";

import dynamic from "next/dynamic";

const CubesBackground = dynamic(() => import("./CubesBackground"), { ssr: false, loading: () => null });

type Props = { color?: string; lineAlpha?: number; paused?: boolean };

export default function CubesLayer(props: Props) {
  return <CubesBackground {...props} />;
}
