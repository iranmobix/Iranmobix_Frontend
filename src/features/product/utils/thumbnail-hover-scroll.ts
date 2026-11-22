/** Scroll the thumbnail rail while a mouse rests over its first or last visible image. */
export function attachThumbnailHoverScroll(container: HTMLElement) {
  const host = container.parentElement;
  const document = container.ownerDocument;
  const view = document.defaultView;
  if (!host || !view) return () => {};

  let frame = 0;
  let direction = 0;
  let previousTime: number | null = null;
  const stop = () => {
    if (frame) view.cancelAnimationFrame(frame);
    frame = 0;
    direction = 0;
    previousTime = null;
  };
  const tick = (time: number) => {
    frame = 0;
    const elapsed =
      previousTime === null ? 0 : Math.min(time - previousTime, 50);
    previousTime = time;
    const maximum = Math.max(
      0,
      container.scrollHeight - container.clientHeight,
    );
    const next = Math.max(
      0,
      Math.min(maximum, container.scrollTop + direction * elapsed * 0.12),
    );
    container.scrollTop = next;
    if ((direction < 0 && next <= 0) || (direction > 0 && next >= maximum)) {
      stop();
      return;
    }
    frame = view.requestAnimationFrame(tick);
  };
  const move = (event: PointerEvent) => {
    if (
      event.pointerType !== "mouse" ||
      view.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      stop();
      return;
    }
    const box = container.getBoundingClientRect();
    const edge = Math.min(
      container.firstElementChild?.getBoundingClientRect().height ?? 56,
      box.height / 2,
    );
    const offset = event.clientY - box.top;
    const nextDirection =
      offset >= 0 && offset < edge
        ? -1
        : offset <= box.height && offset > box.height - edge
          ? 1
          : 0;
    if (!nextDirection) {
      stop();
      return;
    }
    direction = nextDirection;
    if (!frame) {
      previousTime = null;
      frame = view.requestAnimationFrame(tick);
    }
  };
  const visibility = () => {
    if (document.visibilityState === "hidden") stop();
  };
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", stop);
  host.addEventListener("pointercancel", stop);
  view.addEventListener("blur", stop);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    stop();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", stop);
    host.removeEventListener("pointercancel", stop);
    view.removeEventListener("blur", stop);
    document.removeEventListener("visibilitychange", visibility);
  };
}
