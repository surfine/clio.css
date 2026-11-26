/** Class names from strings and flags: cx("window", inactive && "inactive"). */
export const cx = (...names: (string | false | null | undefined)[]): string => names.filter(Boolean).join(" ");
