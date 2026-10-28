export type InputType = "search" | "url" | "image";

export function detectInputType(value: string): InputType {
  if (!value) return "search";

  // URL detection
  const urlRegex = /^(https?:\/\/|www\.)/i;
  if (urlRegex.test(value)) return "url";

  return "search";
}