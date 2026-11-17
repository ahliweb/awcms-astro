/**
 * Reading preferences (ADR-0055) — the pure part: storage contract, OS
 * defaults, and the `<html>` attributes every preference becomes.
 *
 * ## Why this is a module of pure functions
 *
 * The panel itself is DOM glue in `PanelAksesibilitas.astro`, and DOM glue is
 * hard to prove without a browser, which this repo does not test with. What can
 * go wrong silently is in THIS file: a stored value of an unexpected shape, a
 * storage that throws, an OS preference resolved the wrong way round. Each is a
 * plain function over plain values, so `tests/aksesibilitas.test.mjs` covers
 * them directly.
 *
 * ## The same logic exists a second time, on purpose
 *
 * `public/aksesibilitas.js` must run BEFORE first paint, so it is a classic
 * blocking script that cannot import this module (same constraint as
 * `public/tema.js`). Its parse and attribute rules are therefore a hand-written
 * copy of the ones below. That is the cost the repo already accepted for the
 * theme; what keeps the copies honest is `tests/aksesibilitas.test.mjs`, which
 * runs the classic file against the same fixtures as this module and compares
 * the attributes they produce.
 *
 * ## What is stored, and where
 *
 * One `localStorage` key, `awcms-a11y`, holding the whole preference object
 * after any change. Nothing is sent anywhere: no request, no cookie, no event
 * to an analytics service. A reader's preferences about how they read are not
 * something this site has any reason to learn.
 */

export const STORAGE_KEY = "awcms-a11y";

/** Set on `<html>` by the early script once it has resolved preferences. */
export const READY_ATTRIBUTE = "data-a11y-ready";

/** The event the panel dispatches on `document`; `detail` is the effective preferences. */
export const CHANGE_EVENT = "awcms-a11y-change";

export const TEXT_SIZES = ["normal", "large", "x-large"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

/** The six on/off preferences, in the order the panel lists them. */
export const SWITCHES = [
  "contrast",
  "mono",
  "dyslexia",
  "underline",
  "highlight",
  "motion",
] as const;
export type SwitchKey = (typeof SWITCHES)[number];

export interface Preferences {
  v: 1;
  text: TextSize;
  contrast: boolean;
  mono: boolean;
  dyslexia: boolean;
  underline: boolean;
  highlight: boolean;
  /** `true` means REDUCE motion. */
  motion: boolean;
}

export const DEFAULT_PREFERENCES: Readonly<Preferences> = Object.freeze({
  v: 1,
  text: "normal",
  contrast: false,
  mono: false,
  dyslexia: false,
  underline: false,
  highlight: false,
  motion: false,
});

/** What the operating system asks for when the reader has stored nothing. */
export interface OsDefaults {
  /** `prefers-contrast: more` */
  moreContrast: boolean;
  /** `prefers-reduced-motion: reduce` */
  reduceMotion: boolean;
}

/** The slice of `Storage` this module uses, so tests can pass a plain object. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The slice of an element this module writes attributes on. */
export interface AttributeTarget {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

/**
 * Parse a stored value. Anything that is not exactly the v1 shape — invalid
 * JSON, a wrong version, a missing key, an unknown value — is "no stored
 * preference" (`null`), never a partial object: a half-valid object would
 * silently mix the reader's old choices with defaults they never made.
 */
export function parsePreferences(raw: unknown): Preferences | null {
  let value: unknown = raw;

  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

  const o = value as Record<string, unknown>;
  if (o.v !== 1) return null;
  if (!TEXT_SIZES.includes(o.text as TextSize)) return null;
  for (const key of SWITCHES) {
    if (typeof o[key] !== "boolean") return null;
  }

  return {
    v: 1,
    text: o.text as TextSize,
    contrast: o.contrast as boolean,
    mono: o.mono as boolean,
    dyslexia: o.dyslexia as boolean,
    underline: o.underline as boolean,
    highlight: o.highlight as boolean,
    motion: o.motion as boolean,
  };
}

/** The exact JSON written to storage: fixed key order, nothing else. */
export function serializePreferences(prefs: Preferences): string {
  return JSON.stringify({
    v: 1,
    text: prefs.text,
    contrast: prefs.contrast,
    mono: prefs.mono,
    dyslexia: prefs.dyslexia,
    underline: prefs.underline,
    highlight: prefs.highlight,
    motion: prefs.motion,
  });
}

/** Read and parse; `null` for absent, invalid, or storage that throws. */
export function readPreferences(storage: StorageLike | null): Preferences | null {
  if (!storage) return null;
  try {
    return parsePreferences(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Write the whole object. Returns whether it was stored; never throws. */
export function writePreferences(storage: StorageLike | null, prefs: Preferences): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, serializePreferences(prefs));
    return true;
  } catch {
    return false;
  }
}

/** Remove the key. Returns whether the call succeeded; never throws. */
export function clearPreferences(storage: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Read the two OS media queries; a missing or throwing `matchMedia` means "no preference". */
export function readOsDefaults(
  matchMedia: ((query: string) => { matches: boolean }) | undefined
): OsDefaults {
  const matches = (query: string): boolean => {
    try {
      return matchMedia ? matchMedia(query).matches : false;
    } catch {
      return false;
    }
  };

  return {
    moreContrast: matches("(prefers-contrast: more)"),
    reduceMotion: matches("(prefers-reduced-motion: reduce)"),
  };
}

/**
 * The preferences actually in force.
 *
 * A stored object wins outright, including a stored `false` for a preference the
 * OS asks for: a reader who turned motion back on in the panel meant it. With
 * nothing stored, the two OS-backed preferences follow the OS and the rest are
 * off.
 */
export function resolvePreferences(stored: Preferences | null, os: OsDefaults): Preferences {
  if (stored) return stored;
  return {
    ...DEFAULT_PREFERENCES,
    contrast: os.moreContrast,
    motion: os.reduceMotion,
  };
}

/**
 * The `<html>` attributes for a set of preferences. `null` means "remove it":
 * an absent attribute is how a feature is off, so every selector in
 * `src/styles/aksesibilitas.css` is scoped under one of these and nothing
 * changes for a reader who never opens the panel.
 */
export function attributesFor(prefs: Preferences): Record<string, string | null> {
  return {
    "data-a11y-text": prefs.text === "normal" ? null : prefs.text,
    "data-a11y-contrast": prefs.contrast ? "" : null,
    "data-a11y-mono": prefs.mono ? "" : null,
    "data-a11y-dyslexia": prefs.dyslexia ? "" : null,
    "data-a11y-underline": prefs.underline ? "" : null,
    "data-a11y-highlight": prefs.highlight ? "" : null,
    "data-a11y-motion": prefs.motion ? "reduce" : null,
  };
}

/** Names of every preference attribute, for clearing. `READY_ATTRIBUTE` is not one. */
export const PREFERENCE_ATTRIBUTES: readonly string[] = Object.keys(
  attributesFor(DEFAULT_PREFERENCES)
);

export function applyAttributes(root: AttributeTarget, prefs: Preferences): void {
  for (const [name, value] of Object.entries(attributesFor(prefs))) {
    if (value === null) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }
}

export function clearAttributes(root: AttributeTarget): void {
  for (const name of PREFERENCE_ATTRIBUTES) root.removeAttribute(name);
}
