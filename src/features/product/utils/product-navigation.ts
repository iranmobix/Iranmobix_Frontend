/** Call synchronously from the user's click so browsers allow the new tab. */
export function openProductDetailsTab(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}
