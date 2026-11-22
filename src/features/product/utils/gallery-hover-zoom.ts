import type { PointerEvent, SyntheticEvent } from "react";

export function updateGalleryHoverZoom(event: PointerEvent<HTMLButtonElement>) {
  const target = event.currentTarget;
  if (event.pointerType !== "mouse") {
    delete target.dataset.zoom;
    return;
  }
  const box = target.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const percent = (value: number, size: number) =>
    Math.max(0, Math.min(100, (value / size) * 100));
  target.style.setProperty(
    "--zoom-x",
    `${percent(event.clientX - box.left, box.width)}%`,
  );
  target.style.setProperty(
    "--zoom-y",
    `${percent(event.clientY - box.top, box.height)}%`,
  );
  target.dataset.zoom = "true";
}

export function clearGalleryHoverZoom(
  event: SyntheticEvent<HTMLButtonElement>,
) {
  delete event.currentTarget.dataset.zoom;
}
