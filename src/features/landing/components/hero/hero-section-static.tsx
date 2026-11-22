"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import shipping from "../../assets/shipping.png";
import { HeroContent } from "./hero-content";
import { ArrowDownLeft, MapPin, PackageSearch, ShieldCheck, Ship } from "lucide-react";
import styles from "./hero.module.css";
export function StaticHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Subtract the space occupied by both the ticker and the actual header.
    const updateViewport = () => {
      const top = Math.ceil(
        section.getBoundingClientRect().top + window.scrollY,
      );
      section.style.setProperty("--hero-top", `${top}px`);
    };

    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    const header = document.querySelector("header");
    if (header) {
      observer.observe(header);
      if (header.previousElementSibling)
        observer.observe(header.previousElementSibling);
    }
    window.addEventListener("resize", updateViewport);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return (
    <section ref={sectionRef} dir="rtl" aria-labelledby="landing-hero-title" className={styles.hero}>
      <div aria-hidden="true" className={styles.ambient} />
      <div className={styles.shell}>
        <div className={styles.main}>
          <HeroContent />
          <div className={styles.visual}>
            <span aria-hidden="true" className={styles.visualHalo} />
            <span aria-hidden="true" className={styles.orbit} />
            <span aria-hidden="true" className={styles.orbitPoint} />
            <div className={styles.imageLayer}>
              <Image
                src={shipping}
                alt="مسیر تأمین و واردات کالا؛ شبکه‌ای از کشتی، هواپیما، انبار و حمل زمینی"
                priority
                sizes="(min-width: 1440px) 700px, (min-width: 1024px) 50vw, 100vw"
                className={styles.shippingImage}
              />
            </div>
            <div className={styles.originTag}>
              <span className={styles.locationIcon}><MapPin size={16} strokeWidth={1.6} aria-hidden="true" /></span>
              <div><span className={styles.tagEyebrow}>شروع مسیر</span><span className={styles.tagTitle}>چین و امارات</span></div>
              <span aria-hidden="true" className={styles.countryCode}>CN / AE</span>
            </div>
            <div className={styles.destinationTag}>
              <span aria-hidden="true" className={styles.destinationDot} />
              مقصد بعدی: ایران
              <ArrowDownLeft size={15} strokeWidth={1.6} aria-hidden="true" />
            </div>
            <div className={styles.visualCaption}>
              <span className={styles.captionIcon}><ShieldCheck size={24} strokeWidth={1.5} aria-hidden="true" /></span>
              <div><strong>یک همراه، تمام مسیر.</strong><span>تأمین، حمل و ترخیص در کنار هم</span></div>
              <span aria-hidden="true" className={styles.captionLine} />
            </div>
            <span aria-hidden="true" className={styles.visualLabel}>CONNECTED TO YOUR NEXT OPPORTUNITY</span>
          </div>
        </div>
        <div className={styles.steps} aria-label="مراحل خدمات واردات">
          {[
            { number: "01", icon: PackageSearch, title: "پیدا کنید. انتخاب کنید.", description: "تأمین و خرید از بازارهای چین و امارات" },
            { number: "02", icon: Ship, title: "مسیر مناسب کالای شما", description: "حمل هوایی، دریایی و زمینی" },
            { number: "03", icon: ShieldCheck, title: "تا رسیدن کالا، کنار شما", description: "همراهی در ترخیص و تحویل در مقصد" },
          ].map(({ number, icon: Icon, title, description }) => (
            <div key={number} className={styles.step}>
              <span aria-hidden="true" className={styles.stepNumber}>{number}</span>
              <Icon size={23} strokeWidth={1.4} className={styles.stepIcon} aria-hidden="true" />
              <div><h2>{title}</h2><p>{description}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
