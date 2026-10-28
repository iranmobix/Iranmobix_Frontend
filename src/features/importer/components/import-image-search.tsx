"use client";

import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import { Popover } from "radix-ui";
import { Image as ImageIcon, LoaderCircle, X } from "lucide-react";
import { useImportImage } from "../hooks/use-import-image";
import { runImportSearch } from "../services/import-search-navigation";
import {
  ProductImportError,
  validateImportImage,
} from "../services/importer.service";

/** The expanded image state covers the search field itself, preserving its layout space. */
export function ImportImageSearch({ children }: { children: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [anchorHeight, setAnchorHeight] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const request = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const titleId = useId();
  const descriptionId = useId();
  const router = useRouter();
  const upload = useImportImage();

  useEffect(() => () => request.current?.abort(), []);

  useLayoutEffect(() => {
    if (!open || !anchor.current) return;
    const element = anchor.current;
    const measure = () =>
      setAnchorHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open]);

  function changeOpen(next: boolean) {
    if (!next) request.current?.abort();
    setSelectedImage(null);
    setError("");
    setDragging(false);
    dragDepth.current = 0;
    setOpen(next);
  }

  function selectImage(file: File) {
    if (request.current) return;
    setError("");
    setSelectedImage(null);
    try {
      validateImportImage(file);
      setSelectedImage(file);
    } catch (error) {
      setError((error as Error).message);
    }
  }

  async function importFile(file: File) {
    if (request.current) return;
    setError("");
    try {
      validateImportImage(file);
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    try {
      await runImportSearch({
        request: () =>
          upload.mutateAsync({ image: file, signal: controller.signal }),
        openTab: () => window.open("about:blank", "_blank"),
        navigate: (path) => router.push(path),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setOpen(false);
      }
    } catch (error) {
      if (!controller.signal.aborted)
        setError(
          error instanceof ProductImportError
            ? error.message
            : "بارگذاری عکس ناموفق بود؛ دوباره تلاش کنید یا عکس دیگری انتخاب کنید.",
        );
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen} modal>
      <Popover.Anchor asChild>
        <div ref={anchor} className={open ? "invisible" : undefined}>
          {children}
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <div
          aria-hidden="true"
          className="pointer-events-auto fixed inset-0 z-[80] bg-black/40"
          onClick={() => changeOpen(false)}
        />
      </Popover.Portal>
      <Popover.Portal>
        <Popover.Content
          dir="rtl"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          side="bottom"
          align="end"
          sideOffset={-anchorHeight}
          collisionPadding={12}
          className="z-[81] w-[var(--radix-popper-anchor-width)] max-w-[calc(100vw-24px)] min-w-[min(360px,calc(100vw-24px))] rounded-[26px] border border-[#bdb2ed] bg-white px-3 pt-2 pb-3 text-neutral-700 shadow-sm outline-none"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-xs font-normal">
              جستجو بر اساس عکس
            </h2>
            <Popover.Close
              aria-label="بستن جستجوی عکس"
              className="text-primary-500 focus-visible:ring-primary-300 rounded-md p-1 focus-visible:ring-2"
            >
              <X size={18} strokeWidth={1.5} />
            </Popover.Close>
          </div>
          <p id={descriptionId} className="sr-only">
            یک عکس تا حجم ۵ مگابایت انتخاب کنید یا داخل کادر بکشید.
          </p>
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="hidden"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) selectImage(file);
            }}
          />
          <button
            type="button"
            disabled={upload.isPending}
            aria-describedby={descriptionId}
            aria-busy={upload.isPending}
            className={`focus-visible:ring-primary-300 flex min-h-[78px] w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-[#bdb2ed] px-3 py-3 text-xs leading-6 focus-visible:ring-2 ${dragging ? "bg-primary-50" : "bg-white"}`}
            onClick={() => input.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              dragDepth.current++;
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (--dragDepth.current <= 0) setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              dragDepth.current = 0;
              setDragging(false);
              if (event.dataTransfer.files.length > 1) {
                setError("هر بار یک عکس انتخاب کنید.");
                return;
              }
              const file = event.dataTransfer.files[0];
              if (file) selectImage(file);
            }}
          >
            {upload.isPending ? (
              <span role="status" className="flex flex-col items-center gap-1">
                <LoaderCircle
                  aria-hidden="true"
                  size={32}
                  strokeWidth={1.5}
                  className="animate-spin text-[#9282d0]"
                />
                در حال بارگذاری
              </span>
            ) : selectedImage ? (
              <>
                <ImageIcon size={32} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-primary-500" />
                <span className="min-w-0">
                  <span className="block max-w-[220px] truncate" dir="auto">{selectedImage.name}</span>
                  <span className="text-primary-500">برای تغییر عکس کلیک کنید.</span>
                </span>
              </>
            ) : (
              <>
                <ImageIcon
                  size={32}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-primary-500 shrink-0"
                />
                <span>
                  برای بارگذاری عکس را داخل کادر بکشید یا
                  <br />
                  <span className="text-primary-500">
                    برای انتخاب فایل عکس از سیستم کلیک کنید.
                  </span>
                </span>
              </>
            )}
          </button>
          {selectedImage && !upload.isPending && (
            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-primary-500 px-3 py-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-primary-300"
              onClick={() => void importFile(selectedImage)}
            >
              جستجو با عکس
            </button>
          )}
          {error && (
            <p role="alert" className="mt-2 text-xs leading-5 text-red-600">
              {error}
            </p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
