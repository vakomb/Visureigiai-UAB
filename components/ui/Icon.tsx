import type { ReactNode, SVGProps } from "react";
import type { NodeId } from "@/lib/types";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.5 20.5c0-4 3.4-7 7.5-7s7.5 3 7.5 7" />
  </Svg>
);
export const IconCar = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 13l1.7-4.6A2 2 0 0 1 6.6 7h10.8a2 2 0 0 1 1.9 1.4L21 13" />
    <rect x="2.5" y="13" width="19" height="5" rx="1.8" />
    <circle cx="7" cy="18" r="1.2" />
    <circle cx="17" cy="18" r="1.2" />
  </Svg>
);
export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11 12 4l8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);
export const IconBag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Svg>
);
export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconArrow = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4-4" />
  </Svg>
);
export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);
export const IconTruck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 6.5h11v10h-11z" />
    <path d="M13.5 10h4l3 3v3.5h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Svg>
);
export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 7V4.5h4V7M6.5 7l1 13h9l1-13" />
  </Svg>
);
export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
  </Svg>
);
export const IconInvoice = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3.5h8l3.5 3.5V20.5H7z" />
    <path d="M15 3.5V7h3.5M9.5 12h6M9.5 15.5h6" />
  </Svg>
);
export const IconGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Svg>
);
export const IconChart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Svg>
);
export const IconBox = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </Svg>
);
export const IconEdit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
  </Svg>
);
export const IconUndo = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4 4 9l5 5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </Svg>
);
export const IconImage = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
  </Svg>
);
export const IconSpark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
  </Svg>
);

export const NODE_ICON: Record<NodeId, (p: IconProps) => ReactNode> = {
  zmogui: IconUser,
  masinai: IconCar,
  namams: IconHome,
};

export function NodeIcon({ node, ...rest }: IconProps & { node: NodeId }) {
  const Cmp = NODE_ICON[node];
  return <>{Cmp(rest)}</>;
}

/** Vaidore geometrinis ženklas (šešiakampis kristalas). */
export function Mark({ size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      <path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5L12 2.5Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 2.5v19M3.8 7.25 20.2 16.75M20.2 7.25 3.8 16.75" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
    </svg>
  );
}
