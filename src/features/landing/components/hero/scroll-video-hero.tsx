"use client";

import { useScrollVideo } from "./use-scroll-video";
import styles from "./scroll-video-hero.module.css";

export function ScrollVideoHero() {
  const { sectionRef, stageRef, videoRef } = useScrollVideo();

  return (
    <section
      ref={sectionRef}
      aria-label="مسیر واردات کالا از چین و امارات"
      className={styles.hero}
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.media} aria-hidden="true">
          <video
            ref={videoRef}
            className={styles.video}
            poster="/videos/hero-poster.jpg"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
          >
            <source
              media="(max-width: 767px)"
              src="/videos/hero-scroll-mobile.mp4"
              data-poster="/videos/hero-poster-mobile.jpg"
              type="video/mp4"
            />
            <source
              src="/videos/hero-scroll.mp4"
              data-poster="/videos/hero-poster.jpg"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </section>
  );
}
