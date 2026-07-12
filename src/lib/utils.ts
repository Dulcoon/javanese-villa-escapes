import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format price as compact string: 
 * ID: 1500000 → "1.5jt", 800000 → "800rb"
 * EN: 1500000 → "1.5M", 800000 → "800K"
 */
export function formatPriceCompact(value: number, lang: "id" | "en" = "id"): string {
  if (lang === "en") {
    if (value >= 1_000_000) {
      const m = value / 1_000_000;
      return m % 1 === 0 ? `${m}M` : `${parseFloat(m.toFixed(1))}M`;
    }
    if (value >= 1_000) {
      const k = value / 1_000;
      return k % 1 === 0 ? `${k}K` : `${parseFloat(k.toFixed(1))}K`;
    }
    return `${value}`;
  } else {
    if (value >= 1_000_000) {
      const jt = value / 1_000_000;
      return jt % 1 === 0 ? `${jt}jt` : `${parseFloat(jt.toFixed(1))}jt`;
    }
    if (value >= 1_000) {
      const rb = value / 1_000;
      return rb % 1 === 0 ? `${rb}rb` : `${parseFloat(rb.toFixed(1))}rb`;
    }
    return `${value}`;
  }
}
