"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { usePanelFavorites } from "@/features/user-panel/hooks/use-panel-favorites";

export default function ProductDetailActions({
  slug,
  title,
}: {
  slug?: string;
  title?: string;
}) {
  const favorites = usePanelFavorites();
  const [notice, setNotice] = useState("");
  const isFavorite = Boolean(
    slug && (favorites.data ?? []).some((item) => item.slug === slug),
  );
  const iconClass =
    "flex size-8 items-center justify-center rounded text-primary-500 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label={
          isFavorite ? "حذف از مورد علاقه‌ها" : "افزودن به مورد علاقه‌ها"
        }
        aria-pressed={isFavorite}
        disabled={!slug || favorites.isAdding}
        className={iconClass}
        onClick={() => {
          if (!slug) return;
          setNotice("");
          void favorites
            .add(slug)
            .then((result) =>
              setNotice(
                result.added
                  ? "محصول به مورد علاقه‌ها اضافه شد."
                  : result.removed
                    ? "محصول از مورد علاقه‌ها حذف شد."
                    : "وضعیت مورد علاقه‌ها به‌روز شد.",
              ),
            )
            .catch(() =>
              setNotice("ثبت مورد علاقه ناموفق بود؛ دوباره تلاش کنید."),
            );
        }}
      >
        <Heart
          size={18}
          className={isFavorite ? "fill-primary-100" : undefined}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        aria-label="اشتراک‌گذاری محصول"
        className={iconClass}
        onClick={() => {
          void (async () => {
            try {
              if (navigator.share)
                await navigator.share({ title, url: window.location.href });
              else {
                await navigator.clipboard.writeText(window.location.href);
                setNotice("لینک محصول کپی شد.");
              }
            } catch (error) {
              if (!(
                error instanceof DOMException && error.name === "AbortError"
              ))
                setNotice("اشتراک‌گذاری ناموفق بود.");
            }
          })();
        }}
      >
        <Share2 size={18} aria-hidden="true" />
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {notice}
      </p>
    </div>
  );
}
