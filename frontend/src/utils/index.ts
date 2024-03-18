import { clsx, type ClassValue } from "clsx";
import djs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { twMerge } from "tailwind-merge";

djs.extend(utc);
djs.extend(timezone);
djs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dayjs = djs;
