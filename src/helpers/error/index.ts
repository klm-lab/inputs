import type { ErrorType } from "../../types";

function UtilError(options: ErrorType, ...rest: any[]): ErrorType {
  console.error(options.name, "\n\n", options.message, "\n");
  return { ...options, ...rest };
}

export function updateErrorMessage(entry: any, restErrorMessage: any) {
  return entry.label
    ? `La valeur "${entry.label}" ${restErrorMessage}`
    : `Cette valeur ${restErrorMessage}`;
}

export const _UtilError =
  process.env.NODE_ENV !== "production" ? UtilError : () => void 0;
