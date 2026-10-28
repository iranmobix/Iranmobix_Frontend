"use client";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePanelFavorites } from "../hooks/use-panel-favorites";
import { formatPanelMoney } from "../utils/panel-display.utils";
import PanelFavoriteCard from "./panel-favorite-card";
export default function PanelFavorites() {
  const query = usePanelFavorites();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const favorites = query.data ?? [];
  const selected = favorites.find((item) => item.id === selectedId);
  return (
    <section aria-labelledby="panel-favorites-heading">
      <h1
        id="panel-favorites-heading"
        className="border-b border-neutral-200 pb-4 text-sm font-medium text-neutral-900"
      >
        مورد علاقه‌ها
      </h1>
      <p
        role="status"
        aria-live="polite"
        className={notice ? "mt-3 text-xs text-teal-700" : "sr-only"}
      >
        {notice}
      </p>
      {query.isPending ? (
        <p role="status" className="py-20 text-center text-xs">
          در حال دریافت مورد علاقه‌ها…
        </p>
      ) : query.isError ? (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm"
        >
          <p>دریافت مورد علاقه‌ها ناموفق بود.</p>
          <Button onClick={() => void query.refetch()}>تلاش مجدد</Button>
        </div>
      ) : favorites.length === 0 ? (
        <div
          role="status"
          className="flex min-h-72 flex-col items-center justify-center gap-3 text-xs text-neutral-600"
        >
          <Heart size={32} className="text-primary-200" aria-hidden="true" />
          <p>هنوز محصولی به مورد علاقه‌ها اضافه نکرده‌اید.</p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <li key={product.id} className="min-w-0">
              <PanelFavoriteCard
                product={product}
                onDetails={() => setSelectedId(product.id)}
                onRemove={() =>
                  void query
                    .remove(product.slug)
                    .then(() => setNotice("محصول از مورد علاقه‌ها حذف شد."))
                    .catch(() => setNotice("حذف محصول ناموفق بود؛ دوباره تلاش کنید."))
                }
              />
            </li>
          ))}
        </ul>
      )}
      <Dialog.Root
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            dir="rtl"
            className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-sm font-medium">
                جزئیات محصول
              </Dialog.Title>
              <Dialog.Close
                aria-label="بستن"
                className="rounded p-1 text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              اطلاعات محصول انتخاب‌شده در مورد علاقه‌ها
            </Dialog.Description>
            {selected && (
              <div className="mt-4 space-y-3 text-xs leading-6">
                <h2 dir="ltr" className="text-left">
                  {selected.title}
                </h2>
                <p>
                  قیمت: <bdi>{selected.priceCny ? `¥${formatPanelMoney(selected.priceCny, "")}` : "بدون مقدار از سمت بک‌اند"}</bdi>
                </p>
                <p>
                  معادل: {selected.priceToman !== null ? formatPanelMoney(selected.priceToman, "IRT") : "بدون مقدار از سمت بک‌اند"}
                </p>
                <p>
                  فروشنده: <bdi>{selected.sellerName}</bdi>
                </p>
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-primary-500"
                >
                  مشاهده سایت مرجع
                </a>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
