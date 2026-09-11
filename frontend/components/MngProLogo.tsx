import type { HTMLAttributes } from "react";

type MngProLogoProps = HTMLAttributes<HTMLSpanElement> & {
  compact?: boolean;
};

export default function MngProLogo({ compact = false, className = "", ...props }: MngProLogoProps) {
  return (
    <span className={`mngpro-logo ${compact ? "mngpro-logo-compact" : ""} ${className}`} {...props}>
      <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">
        <rect className="mngpro-logo-frame" x="2" y="2" width="52" height="52" rx="16" />
        <rect className="mngpro-logo-module mngpro-logo-module-one" x="13" y="14" width="11" height="11" rx="3" />
        <rect className="mngpro-logo-module mngpro-logo-module-two" x="13" y="30" width="11" height="11" rx="3" />
        <rect className="mngpro-logo-module mngpro-logo-module-three" x="29" y="30" width="11" height="11" rx="3" />
        <path className="mngpro-logo-route" d="M29 19.5h8.5c3.6 0 6.5 2.9 6.5 6.5v2" />
        <path className="mngpro-logo-check" d="m29 20 3.8 3.8L43 13.5" />
        <circle className="mngpro-logo-signal" cx="43" cy="34" r="3" />
      </svg>
      <span className="mngpro-logo-wordmark">
        Mng<span>Pro</span>
      </span>
    </span>
  );
}
