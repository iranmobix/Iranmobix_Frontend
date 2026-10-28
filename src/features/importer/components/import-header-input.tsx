"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Popover } from "radix-ui";
import { ImportImageSearch } from "./import-image-search";
import { Input } from "@/components/ui/input";
import search from "@/features/header/assets/search.svg";
import camera from "@/features/header/assets/camera.svg";
import {
  createDiscoverPayload,
  isDiscoverUrlInput,
  importerService,
  ProductImportError,
} from "../services/importer.service";
import { runImportSearch } from "../services/import-search-navigation";
export default function ImportHeaderInput({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const router = useRouter();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const input = value.trim();
    if (lock.current || !input) return;
    setError("");
    const isUrl = isDiscoverUrlInput(input);
    let payload;
    try {
      payload = createDiscoverPayload(input);
    } catch {
      setError(
        isUrl
          ? "لینک معتبر وارد کنید."
          : "عبارت جستجو باید بین ۱ تا ۳۰۰ نویسه باشد.",
      );
      return;
    }
    lock.current = true;
    setPending(true);
    try {
      await runImportSearch({
        request: () => importerService.discover(payload),
        openTab: () => window.open("about:blank", "_blank"),
        navigate: (path) => router.push(path),
        payload,
      });
    } catch (error) {
      setError(
        error instanceof ProductImportError
          ? error.message
          : "شروع دریافت محصولات ناموفق بود؛ دوباره تلاش کنید.",
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  return (
    <div className={compact ? "min-w-0 flex-1" : "w-full max-w-[500px]"}>
      <ImportImageSearch>
        <form
          onSubmit={submit}
          className={
            compact
              ? "flex h-[38px] min-w-0 items-center gap-1 rounded-full border border-[#d4d0c6] bg-white px-2 py-1 transition-colors duration-200 hover:border-[#b0a0e8] focus-within:border-[#b0a0e8] active:border-[#b0a0e8]"
              : "flex h-[64px] items-center gap-2 rounded-full border border-[#d4d0c6] bg-white px-4 py-2 transition-colors duration-200 hover:border-[#b0a0e8] focus-within:border-[#b0a0e8] active:border-[#b0a0e8]"
          }
        >
          <button
            type="submit"
            disabled={pending}
            aria-label="جستجو یا دریافت محصولات از لینک"
            className="shrink-0"
          >
            <Image
              src={search}
              alt=""
              className={compact ? "size-3.5" : undefined}
            />
          </button>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
            aria-label="نام یا لینک محصول و یا نام فروشنده"
            placeholder={
              pending
                ? "در حال شروع دریافت…"
                : "نام یا لینک محصول و یا نام فروشنده"
            }
            className={
              compact
                ? "h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-[10px] text-neutral-900 placeholder:text-neutral-500 hover:border-0 focus-visible:border-0 focus-visible:ring-0"
                : "flex-1 border-0 bg-transparent p-0 text-neutral-900 placeholder:text-neutral-600 hover:border-0 focus-visible:border-0 focus-visible:ring-0"
            }
          />
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={pending}
              aria-label="جستجو بر اساس عکس"
              className="focus-visible:ring-primary-300 shrink-0 rounded focus-visible:ring-2"
            >
              <Image
                src={camera}
                alt=""
                className={compact ? "size-3.5" : undefined}
              />
            </button>
          </Popover.Trigger>
        </form>
      </ImportImageSearch>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
