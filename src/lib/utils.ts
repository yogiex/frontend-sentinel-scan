/**
 * SentinelScan Utility Functions
 * Path: /home/mirage/Documents/code/sec/research/inkubasi-btp-cybersecurity/code/frontend/src/lib/utils.ts
 *
 * Utility functions for className merging and other common operations.
 * Uses clsx and tailwind-merge for conditional styling.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
