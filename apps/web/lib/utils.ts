import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-50 dark:bg-red-950/40",
        border: "border-red-500",
        text: "text-red-700 dark:text-red-400",
        badge: "bg-red-100 text-red-800 border-red-300",
        mark: "bg-red-200/80 border-b-2 border-red-500 hover:bg-red-300 cursor-pointer"
      };
    case "warning":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-500",
        text: "text-amber-700 dark:text-amber-400",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        mark: "bg-amber-200/80 border-b-2 border-amber-500 hover:bg-amber-300 cursor-pointer"
      };
    case "info":
    default:
      return {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        border: "border-blue-500",
        text: "text-blue-700 dark:text-blue-400",
        badge: "bg-blue-100 text-blue-800 border-blue-300",
        mark: "bg-blue-200/80 border-b-2 border-blue-500 hover:bg-blue-300 cursor-pointer"
      };
  }
}
