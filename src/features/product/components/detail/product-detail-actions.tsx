"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
import likeIcon from "../../assets/like.svg";
import shareIcon from "../../assets/share.svg";
import { usePanelFavorites } from "@/features/user-panel/hooks/use-panel-favorites";

export default function ProductDetailActions({
  slug,
  title,
  glass = false,
}: {
  slug?: string;
  title?: string;
  glass?: boolean;
}) {
  const favorites = usePanelFavorites();
  const [notice, setNotice] = useState("");
  const isFavorite = Boolean(
    slug && (favorites.data ?? []).some((item) => item.slug === slug),
  );
  const iconClass = glass
    ? "flex size-8 items-center justify-center rounded-lg border border-white/80 bg-white/40 text-neutral-1000 shadow-sm backdrop-blur-[20px] transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-40"
    : "flex size-8 items-center justify-center rounded text-primary-500 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div dir={glass ? "ltr" : undefined} className={`flex shrink-0 items-center ${glass ? "gap-2" : "gap-1"}`}>
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
        {glass ? (
          <span aria-hidden="true" className={`size-6 bg-current [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain] ${isFavorite ? "text-primary-600" : ""}`}
            style={{ maskImage: `url("${likeIcon.src}")`, WebkitMaskImage: `url("${likeIcon.src}")` }} />
        ) : (
          <Heart size={18} className={isFavorite ? "fill-primary-100" : undefined} aria-hidden="true" />
        )}
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
        {glass ? (
          <span aria-hidden="true" className="size-6 bg-current [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]"
            style={{ maskImage: `url("${shareIcon.src}")`, WebkitMaskImage: `url("${shareIcon.src}")` }} />
        ) : <Share2 size={18} aria-hidden="true" />}
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {notice}
      </p>
    </div>
  );
}
