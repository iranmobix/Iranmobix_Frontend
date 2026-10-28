import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

export function ProductMobileFilters({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 lg:hidden" />
        <Dialog.Content
          dir="rtl"
          className="fixed top-0 right-0 bottom-0 z-[61] w-[min(92vw,360px)] overflow-y-auto bg-white p-5 lg:hidden"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-sm font-medium">
              فیلتر محصولات
            </Dialog.Title>
            <Dialog.Close
              aria-label="بستن فیلترها"
              className="text-primary-500 focus-visible:ring-primary-300 rounded p-1 focus-visible:ring-2"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            انتخاب و اعمال فیلترهای لیست محصولات
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
