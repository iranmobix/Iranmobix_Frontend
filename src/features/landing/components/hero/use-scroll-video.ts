"use client";

import { useEffect, useRef } from "react";

const FRAME_DURATION = 1 / 24;
const FRAME_TOLERANCE = FRAME_DURATION / 2;
const SCROLL_SMOOTHING_MS = 70;
const TOUCH_SEEK_INTERVAL_MS = 1000 / 30;

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
    const touchPointer = window.matchMedia("(pointer: coarse)");
    let frame = 0;
    let lastFrame = 0;
    let lastSeekAt = -Infinity;
    let layoutDirty = true;
    let sectionTop = 0;
    let travel = 1;
    let stageHeight = 1;
    let lastExit = 0;
    let restorePosition = false;
    let disposed = false;
    let priming = false;
    let primed = false;
    let sourceGeneration = 0;

    const measure = () => {
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      stageHeight = Math.max(1, stage.offsetHeight);
      travel = Math.max(1, section.offsetHeight - stageHeight);
      layoutDirty = false;
    };

    const update = (timestamp: number) => {
      frame = 0;
      if (disposed) return;
      if (layoutDirty) measure();
      const exitProgress = reducedMotion.matches
        ? 0
        : Math.min(
            1,
            Math.max(0, (window.scrollY - sectionTop - travel) / stageHeight),
          );
      const exit = exitProgress * exitProgress * (3 - 2 * exitProgress);
      if (Math.abs(exit - lastExit) > 0.001 || (exit === 0 && lastExit !== 0)) {
        section.style.setProperty("--hero-exit", String(exit));
        lastExit = exit;
      }
      // HAVE_METADATA is sufficient for seeking. Waiting for loadeddata can
      // stall paused videos on mobile browsers that defer decoding that frame.
      if (
        video.seeking ||
        video.readyState < 1 ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      )
        return;

      const progress = reducedMotion.matches
        ? 0
        : Math.min(1, Math.max(0, (window.scrollY - sectionTop) / travel));
      const endTime = Math.max(0, video.duration - FRAME_DURATION);
      const rawTarget = progress * endTime;
      // On touch devices track the latest scroll position, without decoding
      // extra easing frames or repeatedly requesting the same video frame.
      const target = touchPointer.matches
        ? Math.min(
            endTime,
            Math.round(rawTarget / FRAME_DURATION) * FRAME_DURATION,
          )
        : rawTarget;
      const difference = target - video.currentTime;
      if (Math.abs(difference) < FRAME_TOLERANCE) {
        lastFrame = 0;
        restorePosition = false;
        return;
      }
      if (
        touchPointer.matches &&
        !restorePosition &&
        timestamp - lastSeekAt < TOUCH_SEEK_INTERVAL_MS
      ) {
        schedule();
        return;
      }

      const elapsed = lastFrame
        ? Math.min(50, Math.max(1, timestamp - lastFrame))
        : 1000 / 60;
      const alpha = 1 - Math.exp(-elapsed / SCROLL_SMOOTHING_MS);
      const nextTime =
        touchPointer.matches ||
        restorePosition ||
        reducedMotion.matches ||
        Math.abs(difference) <= FRAME_DURATION
          ? target
          : video.currentTime + difference * alpha;
      try {
        video.currentTime = nextTime;
        lastFrame = timestamp;
        lastSeekAt = timestamp;
        restorePosition = false;
      } catch {
        // Metadata/source can change between the readiness check and the seek.
        // Resume on the next media event instead of blocking the scroll handler.
        restorePosition = true;
      }
    };

    function schedule() {
      if (!disposed && !frame) frame = window.requestAnimationFrame(update);
    }
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
      if (!next || next.src === video.currentSrc) return;
      restorePosition = true;
      lastFrame = 0;
      lastSeekAt = -Infinity;
      sourceGeneration++;
      primed = false;
      priming = false;
      delete section.dataset.unavailable;
      video.pause();
      // Select explicitly as well as in HTML, including Safari versions that
      // do not reselect video <source media> after a viewport change.
      video.src = next.src;
      video.load();
      layoutChanged();
    };

    const primeVideo = () => {
      if (
        disposed ||
        !touchPointer.matches ||
        reducedMotion.matches ||
        primed ||
        priming
      )
        return;
      if (!layoutDirty && window.scrollY > sectionTop + travel + stageHeight)
        return;
      const generation = sourceGeneration;
      priming = true;
      try {
        // Muted, inline play/pause inside the first gesture initializes iOS
        // decoding. Rejections (e.g. power-saving policies) stay recoverable.
        Promise.resolve(video.play()).then(
          () => {
            if (disposed) {
              video.pause();
              return;
            }
            if (generation !== sourceGeneration) return;
            priming = false;
            primed = true;
            video.pause();
            restorePosition = true;
            schedule();
          },
          () => {
            if (disposed || generation !== sourceGeneration) return;
            priming = false;
            schedule();
          },
        );
      } catch {
        priming = false;
      }
    };
    const metadataReady = () => {
      schedule();
      if (video.readyState === 1) primeVideo();
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
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "");
    video.pause();
    video.addEventListener("loadedmetadata", metadataReady);
    video.addEventListener("loadeddata", schedule);
    video.addEventListener("canplay", schedule);
    video.addEventListener("progress", schedule);
    video.addEventListener("seeked", schedule);
    video.addEventListener("error", failed);
    window.addEventListener("touchstart", primeVideo, { passive: true });
    window.addEventListener("pointerdown", primeVideo, { passive: true });
    window.addEventListener("touchend", primeVideo, { passive: true });
    window.addEventListener("click", primeVideo, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", layoutChanged);
    window.addEventListener("pageshow", layoutChanged);
    window.visualViewport?.addEventListener("resize", layoutChanged);
    reducedMotion.addEventListener("change", motionChanged);
    const observer = new ResizeObserver(layoutChanged);
    if (header) observer.observe(header);
    observer.observe(stage);
    observer.observe(section);
    sourceChanged();
    if (video.error) failed();
    schedule();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      sources.forEach(({ query }) =>
        query?.removeEventListener("change", sourceChanged),
      );
      video.pause();
      video.removeEventListener("loadedmetadata", metadataReady);
      video.removeEventListener("loadeddata", schedule);
      video.removeEventListener("canplay", schedule);
      video.removeEventListener("progress", schedule);
      video.removeEventListener("seeked", schedule);
      video.removeEventListener("error", failed);
      window.removeEventListener("touchstart", primeVideo);
      window.removeEventListener("pointerdown", primeVideo);
      window.removeEventListener("touchend", primeVideo);
      window.removeEventListener("click", primeVideo);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", layoutChanged);
      window.removeEventListener("pageshow", layoutChanged);
      window.visualViewport?.removeEventListener("resize", layoutChanged);
      reducedMotion.removeEventListener("change", motionChanged);
    };
  }, []);

  return { sectionRef, stageRef, videoRef };
}
