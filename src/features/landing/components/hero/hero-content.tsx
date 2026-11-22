import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, Check } from "lucide-react";
import styles from "./hero.module.css";

export function HeroContent() {
  return (
    <div className={styles.copy}>
      <div className={styles.eyebrow}>
        <span aria-hidden="true" />
        واردات، با یک همراه مطمئن
      </div>
      <h1 id="landing-hero-title" className={styles.title}>
        <span>از چین و امارات،</span>
        <span className={styles.accent}>
          تا کسب‌وکار شما.
          <svg aria-hidden="true" viewBox="0 0 430 16" preserveAspectRatio="none">
            <path d="M4 11C110 1 282 0 425 8M150 13C246 6 342 7 402 12" />
          </svg>
        </span>
      </h1>
      <p className={styles.description}>
        جهان پر از فرصت است؛ مسیر رسیدن به آن را با <strong>ایران موبیکس</strong> بسازید.
        از پیدا کردن تأمین‌کننده و خرید کالا تا حمل، ترخیص و تحویل؛ در تمام مسیر کنار شما هستیم.
      </p>
      <div className={styles.actions}>
        <Link href="/products" className={styles.primaryAction}>
          کالای خود را پیدا کنید
          <span aria-hidden="true"><ArrowLeft size={19} strokeWidth={1.7} /></span>
        </Link>
        <Link href="/contact-us" className={styles.secondaryAction}>
          دریافت مشاوره واردات
          <ArrowUpLeft size={18} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.assurance}>
        <Check size={15} strokeWidth={2} aria-hidden="true" />
        یک تیم متخصص؛ از اولین جست‌وجو تا رسیدن کالا
      </div>
    </div>
  );
}
