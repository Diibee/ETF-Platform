/** Shared easing curves. Mirrors the CSS tokens in `src/index.css`. */
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** Slight overshoot. Use for things that "arrive", never for text. */
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;
