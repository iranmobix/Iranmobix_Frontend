export type Intent = "SEARCH" | "IMPORT_URL" | "IMPORT_IMAGE";

export function resolveIntent(input: string): Intent {
  const urlRegex = /^(https?:\/\/|www\.)/i;

  if (urlRegex.test(input)) return "IMPORT_URL";

  // image detection placeholder
  if (input.startsWith("image:")) {
    return "IMPORT_IMAGE";
  }

  return "SEARCH";
}