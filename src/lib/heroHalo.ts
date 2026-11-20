/**
 * Hero constellation halo (batch 12): the star points around the head and shoulders, as % of the photo box.
 * Why one file: the points were placed by measuring the real cutout (hero-cutout-final.png, as generated) and checked
 * on a screenshot; if the photo is re-cropped, only this file changes.
 * Silhouette at the time of placing (left..right edge, % of width): 4% height 47..53 (top of the head), 20% 30..69,
 * 24% 27..72 (ears), 44% 35..64 (neck), 52% 17..83 and 56% 11..89 (shoulders). Every point keeps ~6-10% clear of it.
 */

/** [x %, y %] from the left shoulder, up over the head, down to the right shoulder. */
export const HALO_POINTS: readonly (readonly [number, number])[] = [
  [5, 61],
  [13, 52.5],
  [23, 46],
  [20, 33],
  [21, 20],
  [29, 9],
  [42, 2.5],
  [58, 2.5],
  [71, 9],
  [79, 20],
  [80, 33],
  [77.5, 46],
  [87, 52.5],
  [95, 61],
];

/** Extra faint lines between non-neighbours (indexes into HALO_POINTS); none of them crosses the head. */
export const HALO_CHORDS: readonly (readonly [number, number])[] = [
  [4, 6],
  [9, 7],
  [1, 3],
];

/** How long a tap on a touch screen (or the automatic play after the photo returns) shows the halo. */
export const HALO_TAP_MS = 1700;
