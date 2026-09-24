/**
 * The brand mark: a house whose body is a calculator, beside a two-line
 * wordmark with "Calculators" in brand blue. Drawn as SVG so it stays sharp
 * at any size and costs nothing to load.
 *
 * `onDark` switches the wordmark to light text for the navy footer.
 */
export function LogoMark({
  className = "h-10 w-10",
  onDark = false,
}: {
  className?: string;
  /** Lifts the calculator body, which is navy, off a navy background. */
  onDark?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id={onDark ? "logo-roof-dark" : "logo-roof"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={onDark ? "logo-body-dark" : "logo-body"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={onDark ? "#3b82f6" : "#1e3a8a"} />
          <stop offset="1" stopColor={onDark ? "#1d4ed8" : "#0b1a3c"} />
        </linearGradient>
      </defs>
      {/* Roof */}
      <path d="M24 3 3 20.5h6.5L24 9.2l14.5 11.3H45Z" fill={onDark ? "url(#logo-roof-dark)" : "url(#logo-roof)"} />
      {/* Chimney */}
      <rect x="33" y="7" width="5" height="8" rx="1" fill={onDark ? "url(#logo-roof-dark)" : "url(#logo-roof)"} />
      {/* Body: the calculator */}
      <rect className="logo-body" x="10" y="19" width="28" height="26" rx="4" fill={onDark ? "url(#logo-body-dark)" : "url(#logo-body)"} />
      {/* Display */}
      <rect x="14" y="23" width="20" height="6" rx="1.5" fill={onDark ? "#dbeafe" : "#60a5fa"} />
      {/* Keys */}
      <g fill="#dbeafe">
        <rect x="14" y="32" width="5" height="4" rx="1" />
        <rect x="21.5" y="32" width="5" height="4" rx="1" />
        <rect x="14" y="38" width="5" height="4" rx="1" />
        <rect x="21.5" y="38" width="5" height="4" rx="1" />
      </g>
      <rect x="29" y="32" width="5" height="10" rx="1" fill="#facc15" />
    </svg>
  );
}

export function Logo({
  name,
  onDark = false,
  className = "",
}: {
  name: string;
  onDark?: boolean;
  className?: string;
}) {
  // "House of Calculators" splits into two lines at the last word, which is
  // how the design sets it. Any other name simply sits on one line.
  const split = name.lastIndexOf(" ");
  const lead = split > 0 ? name.slice(0, split) : name;
  const tail = split > 0 ? name.slice(split + 1) : "";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark onDark={onDark} />
      <span className="flex flex-col leading-[1.05]">
        <span
          className={`text-[15px] font-extrabold tracking-tight ${
            onDark ? "text-white" : "text-heading"
          }`}
        >
          {lead}
        </span>
        {tail ? (
          <span
            className={`text-[17px] font-extrabold tracking-tight ${
              onDark ? "text-sky-300" : "text-primary"
            }`}
          >
            {tail}
          </span>
        ) : null}
      </span>
    </span>
  );
}
