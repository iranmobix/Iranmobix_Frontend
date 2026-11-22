"use client";

import { useEffect, useRef } from "react";

const FRAME_TOLERANCE = 1 / 48;
const SCROLL_SMOOTHING_MS = 70;

export function useScrollVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!section || !stage || !video) return;

    const header = document.querySelector("header");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastFrame = 0;
    let layoutDirty = true;
    let headerHeight = -1;
    let sectionTop = 0;
    let travel = 1;
    let stageHeight = 1;
    let lastExit = 0;
    let restorePosition = false;

    const measure = () => {
      const height = header?.getBoundingClientRect().height ?? 0;
      // Geometry changes only on resize/header changes, never on each scroll tick.
      if (height !== headerHeight) {
        headerHeight = height;
        section.style.setProperty("--hero-header-height", height + "px");
      }
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      stageHeight = Math.max(1, stage.offsetHeight);
      travel = Math.max(1, section.offsetHeight - stageHeight);
      layoutDirty = false;
    };

    const update = (timestamp: number) => {
      frame = 0;
      if (layoutDirty) measure();
      const exitProgress = reducedMotion.matches
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              (window.scrollY + headerHeight - sectionTop - travel) /
                stageHeight,
            ),
          );
      const exit = exitProgress * exitProgress * (3 - 2 * exitProgress);
      if (Math.abs(exit - lastExit) > 0.001 || (exit === 0 && lastExit !== 0)) {
        section.style.setProperty("--hero-exit", String(exit));
        lastExit = exit;
      }
      if (
        video.seeking ||
        video.readyState < 2 ||
        !Number.isFinite(video.duration)
      )
        return;

      const progress = reducedMotion.matches
        ? 0
        : Math.min(
            1,
            Math.max(0, (window.scrollY + headerHeight - sectionTop) / travel),
          );
      const target = progress * Math.max(0, video.duration - 1 / 24);
      const difference = target - video.currentTime;
      if (Math.abs(difference) < FRAME_TOLERANCE) {
        lastFrame = 0;
        restorePosition = false;
        return;
      }

      // Ease wheel/touch jumps without accumulating stale seek requests.
      // Wait for decoding (seeked) before submitting the next frame.
      const elapsed = lastFrame
        ? Math.min(50, Math.max(1, timestamp - lastFrame))
        : 1000 / 60;
      const alpha = 1 - Math.exp(-elapsed / SCROLL_SMOOTHING_MS);
      const nextTime =
        restorePosition ||
        reducedMotion.matches ||
        Math.abs(difference) <= 1 / 24
          ? target
          : video.currentTime + difference * alpha;
      lastFrame = timestamp;
      restorePosition = false;
      video.currentTime = nextTime;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const layoutChanged = () => {
      layoutDirty = true;
      schedule();
    };
    const sources = Array.from(
      video.querySelectorAll<HTMLSourceElement>("source"),
    ).map((source) => ({
      source,
      query: source.media ? window.matchMedia(source.media) : null,
    }));
    const preferredSource = () =>
      sources.find(({ query }) => !query || query.matches)?.source;
    const updatePoster = () => {
      const poster = preferredSource()?.dataset?.poster;
      if (poster && video.getAttribute("poster") !== poster)
        video.poster = poster;
    };
    const sourceChanged = () => {
      const next = preferredSource();
      updatePoster();
      if (!next || !video.currentSrc || next.src === video.currentSrc) return;
      restorePosition = true;
      lastFrame = 0;
      delete section.dataset.unavailable;
      video.pause();
      video.load();
      layoutChanged();
    };
    const failed = () => {
      section.dataset.unavailable = "true";
    };
    const motionChanged = () => {
      video.pause();
      if (reducedMotion.matches && video.readyState >= 1) video.currentTime = 0;
      lastFrame = 0;
      schedule();
    };

    sources.forEach(({ query }) =>
      query?.addEventListener("change", sourceChanged),
    );
    updatePoster();
    video.muted = true;
    video.pause();
    video.addEventListener("loadedmetadata", schedule);
    video.addEventListener("loadeddata", schedule);
    video.addEventListener("canplay", schedule);
    video.addEventListener("progress", schedule);
    video.addEventListener("seeked", schedule);
    video.addEventListener("error", failed);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", layoutChanged);
    window.addEventListener("pageshow", layoutChanged);
    window.visualViewport?.addEventListener("resize", layoutChanged);
    reducedMotion.addEventListener("change", motionChanged);
    const observer = new ResizeObserver(layoutChanged);
    if (header) observer.observe(header);
    observer.observe(stage);
    observer.observe(section);
    if (video.error) failed();
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      sources.forEach(({ query }) =>
        query?.removeEventListener("change", sourceChanged),
      );
      video.pause();
      video.removeEventListener("loadedmetadata", schedule);
      video.removeEventListener("loadeddata", schedule);
      video.removeEventListener("canplay", schedule);
      video.removeEventListener("progress", schedule);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("error", failed);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", layoutChanged);
      window.removeEventListener("pageshow", layoutChanged);
      window.visualViewport?.removeEventListener("resize", layoutChanged);
      reducedMotion.removeEventListener("change", motionChanged);
    };
  }, []);

  return { sectionRef, stageRef, videoRef };
}
