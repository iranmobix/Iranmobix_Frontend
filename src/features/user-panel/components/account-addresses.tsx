import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type {
  PanelAddress,
  PanelEditor,
} from "../types/user-panel.types";

type Props = {
  addresses: PanelAddress[];
  onEdit: (editor: PanelEditor) => void;
  isPending?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export default function AccountAddresses({
  addresses,
  onEdit,
  isPending,
  isError,
  onRetry,
}: Props) {
  return (
    <section aria-labelledby="account-addresses-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="account-addresses-heading"
          className="text-sm font-medium text-neutral-900"
        >
          آدرس‌ها
        </h2>
        <button
          type="button"
          onClick={() => onEdit({ type: "address" })}
          className="flex items-center gap-1 rounded text-xs text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <Plus size={14} aria-hidden="true" />
          آدرس جدید
        </button>
      </div>
      <div className="space-y-3">
        {isPending && addresses.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-700">
            در حال دریافت آدرس‌ها…
          </p>
        )}
        {isError && addresses.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-700">
            <p>دریافت آدرس‌ها ناموفق بود.</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="mt-2 text-primary-500">
                تلاش دوباره
              </button>
            )}
          </div>
        )}
        {!isPending && !isError && addresses.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-700">
            هنوز آدرسی ثبت نکرده‌اید.
          </p>
        )}
        {addresses.map((address) => (
          <article
            key={address.id}
            className="relative rounded-lg border border-neutral-300 px-4 py-3 text-xs leading-6 text-neutral-700"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 items-center gap-1 text-neutral-900">
                <MapPin
                  size={15}
                  strokeWidth={1.5}
                  className="shrink-0"
                  aria-hidden="true"
                />
                {address.title}
              </h3>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit({ type: "delete-address", address })}
                  aria-label={`حذف آدرس ${address.title}`}
                  className="rounded p-1 text-error focus-visible:ring-2 focus-visible:ring-error/30"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit({ type: "address", address })}
                  aria-label={`ویرایش آدرس ${address.title}`}
                  className="rounded p-1 text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="break-words">
              {address.province}، {address.city}، {address.street}
              {address.no && `، پلاک ${address.no}`}
              {address.unit && `، واحد ${address.unit}`}
            </p>
            <p>
              کد پستی: <bdi>{address.postalCode}</bdi>
            </p>
            <p>
              گیرنده: {address.receiverName} <span className="mx-1">|</span>
              <bdi>{address.receiverMobile}</bdi>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
