import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWorkModel(workModel?: string | null): string {
  if (!workModel) return 'Belirtilmemiş';
  
  const map: Record<string, string> = {
    remote: "Uzaktan (Remote)",
    onsite: "Yüz Yüze (Onsite)",
    hybrid: "Hibrit (Hybrid)"
  };

  return workModel.split(',')
    .map(s => {
      const t = s.trim().toLowerCase();
      return map[t] || t;
    })
    .join(', ');
}

export function formatLocation(loc?: string | null): string {
  if (!loc) return 'Belirtilmemiş';
  const parts = loc.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 81) return "Tüm Türkiye";
  if (parts.length > 3) return `${parts.slice(0, 3).join(', ')} ve ${parts.length - 3} diğer şehir`;
  return parts.join(', ');
}
