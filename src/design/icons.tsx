/**
 * House 刻線圖示集 —— 整個系統唯一的一套圖示（禁用 emoji 當功能圖示）。
 *
 * 為什麼自造而非裝 Lucide：識別錨點是「銅版刻線」，統一的細線重（1.75）與
 * 方形端點比市面圓角圖示更貼標本圖鑑氣質，且與植物插畫同一種筆觸。
 * 全部走 24 網格、currentColor、線重來自 --icon-stroke token。
 */
import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; label?: string };

function Icon({ size = 20, label, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="var(--icon-stroke, 1.75)"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconLeaf = (p: IconProps) => (
  <Icon {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 3-8 9-9 1 6-1 12-9 12" /><path d="M11 20c0-4 1-7 4-10" /></Icon>
);
export const IconDroplet = (p: IconProps) => (
  <Icon {...p}><path d="M12 3.5c3 3.6 5 6.4 5 9a5 5 0 0 1-10 0c0-2.6 2-5.4 5-9Z" /></Icon>
);
export const IconSprout = (p: IconProps) => (
  <Icon {...p}><path d="M12 20v-8" /><path d="M12 12C12 8 9 6 4 6c0 4 3 6 8 6Z" /><path d="M12 13c0-3 2-5 6-5 0 3-2 5-6 5Z" /></Icon>
);
export const IconSun = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></Icon>
);
export const IconFlower = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="9" r="2.2" /><path d="M12 6.8c0-2.5 1-3.8 0-3.8s0 1.3 0 3.8M12 11.2c0 2.5-1 3.8 0 3.8s0-1.3 0-3.8M9.8 9c-2.5 0-3.8 1-3.8 0s1.3 0 3.8 0M14.2 9c2.5 0 3.8-1 3.8 0s-1.3 0-3.8 0" /><path d="M12 13v8" /></Icon>
);
export const IconWilt = (p: IconProps) => (
  <Icon {...p}><path d="M12 21v-7" /><path d="M12 14c-4 1-6-1-7-4 4-1 6 1 7 4Z" /><path d="M12 12c1-3 3-4 6-3-1 3-3 4-6 3Z" opacity="0.5" /><path d="M8 10l-2 2M16 8l2 1" /></Icon>
);
export const IconSeed = (p: IconProps) => (
  <Icon {...p}><path d="M12 4c3.5 2 5 5 3 9-2 3.5-5 4-9 2 0-5 2-9 6-11Z" /></Icon>
);
export const IconCheck = (p: IconProps) => (
  <Icon {...p}><path d="M4 12.5 9.5 18 20 6" /></Icon>
);
export const IconPlus = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
);
export const IconX = (p: IconProps) => (
  <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>
);
export const IconPencil = (p: IconProps) => (
  <Icon {...p}><path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17v3Z" /><path d="M14.5 7.5 17 10" /></Icon>
);
export const IconTrash = (p: IconProps) => (
  <Icon {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></Icon>
);
export const IconCalendar = (p: IconProps) => (
  <Icon {...p}><rect x="4" y="5" width="16" height="16" rx="1.5" /><path d="M4 9h16M8 3v4M16 3v4" /></Icon>
);
export const IconSettings = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5 6.7 6.7M17.3 17.3l2.2 2.2M19.5 4.5 17.3 6.7M6.7 17.3l-2.2 2.2" /></Icon>
);
export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}><path d="M9 5l7 7-7 7" /></Icon>
);
export const IconAlert = (p: IconProps) => (
  <Icon {...p}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v5M12 17.5v.5" /></Icon>
);
export const IconMoon = (p: IconProps) => (
  <Icon {...p}><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z" /></Icon>
);
export const IconBook = (p: IconProps) => (
  <Icon {...p}><path d="M4 4h9a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4Z" /><path d="M20 4h-4a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h4V4Z" /></Icon>
);
