import type { SVGProps } from 'react';

// Bitcoin Icon SVG (Simplified)
export function BitcoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a10.5 10.5 0 100 21 10.5 10.5 0 000-21zm4.28 5.73a.75.75 0 00-1.06-1.06l-1.22 1.22H12.75V6a.75.75 0 00-1.5 0v1.44H9.75a.75.75 0 000 1.5h1.5v1.19H9.75a.75.75 0 000 1.5h1.5V13.1h-1.5a.75.75 0 000 1.5h1.5v1.19H9.75a.75.75 0 000 1.5h1.5V18a.75.75 0 001.5 0v-1.44h1.25l1.22 1.22a.75.75 0 101.06-1.06l-1.22-1.22h.97a.75.75 0 000-1.5h-.97v-1.19h.97a.75.75 0 000-1.5h-.97V8.91h.97l1.22-1.22a.75.75 0 000-1.06l-1.22-1.22h.28zm-3.03 7.3V13.1h1.5v1.44h-1.5zm1.5-2.69V8.91h-1.5v1.44h1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Ethereum Icon SVG (Simplified)
export function EthereumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M11.95 1.913l-.11.065-6.5 3.75a.5.5 0 00-.24.433v7.5a.5.5 0 00.24.433l6.5 3.75c.14.08.31.08.45 0l6.5-3.75a.5.5 0 00.24-.433v-7.5a.5.5 0 00-.24-.433l-6.5-3.75a.47.47 0 00-.45 0l-.11-.065zm-5.6 4.26L12 9.413l5.65-3.238-5.65-3.24-5.65 3.24zm.4 1.11v5.434l5.25 3.03 5.25-3.03V7.283L12 10.52l-5.25-3.03z" />
    </svg>
  );
}

// Tether (USDT) Icon SVG (Simplified - Generic T)
export function TetherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a10.5 10.5 0 100 21 10.5 10.5 0 000-21zM7.5 7.5a.75.75 0 01.75-.75h7.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V9h-2.25v7.5a.75.75 0 01-1.5 0V9H8.25v-.75a.75.75 0 01-.75-.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Litecoin Icon SVG (Simplified - L inside circle)
export function LitecoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a10.5 10.5 0 100 21 10.5 10.5 0 000-21zM9.895 8.03l-.645 2.58 1.5.375.5-2-.62-.15zm1.01 4.04l-.64 2.56 4.5-1.125.64-2.56-4.5 1.125zm.75-5.32l-1 4 4.75 1.18.5-2-4.25-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
