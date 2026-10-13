import { Fragment, type ReactNode } from "react";

/**
 * Splits text into words, each in its own clipped slot, so an entrance can
 * slide them up into view ([data-word]). `tail` rides with the last word.
 */
export function Words({ text, tail }: { text: string; tail?: ReactNode }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          {/* Padding + negative margin give descenders room inside the clip. */}
          <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
            <span data-word className="inline-block will-change-transform">
              {word}
              {index === words.length - 1 && tail}
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}

/** A hairline that an entrance can draw in from the left ([data-rule]). */
export function Rule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      data-rule
      className={`absolute inset-x-0 top-0 h-px origin-left bg-[var(--bp-hairline)] ${className}`}
    />
  );
}
