"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userPanelService } from "../services/user-panel.service";
import { latinDigits } from "../utils/panel-form.utils";
export default function AccountMobileForm({
  currentMobile,
  onStageChange,
  onSave,
}: {
  currentMobile: string;
  onStageChange: (verifying: boolean) => void;
  onSave: (mobile: string) => void | Promise<void>;
}) {
  const [mobile, setMobile] = useState(currentMobile);
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendRemaining, setResendRemaining] = useState(0);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const mobileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (otpRequested) inputs.current[0]?.focus();
    else mobileInput.current?.focus();
  }, [otpRequested]);
  useEffect(() => {
    if (!otpRequested || resendRemaining <= 0) return;
    const timer = window.setInterval(
      () => setResendRemaining((remaining) => Math.max(remaining - 1, 0)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [otpRequested, resendRemaining]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      if (!otpRequested) {
        const value = latinDigits(mobile.trim());
        if (value === currentMobile)
          throw new Error("شماره جدید با شماره فعلی یکسان است.");
        const result = await userPanelService.requestMobileChange(value);
        setMobile(value);
        setOtpRequested(true);
        setResendRemaining(result.resend_after_seconds);
        setDigits(Array(6).fill(""));
        onStageChange(true);
      } else {
        const verified = await userPanelService.verifyMobileChange(
          mobile,
          digits.join(""),
        );
        await onSave(verified);
      }
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : "تأیید شماره ناموفق بود.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const resend = async () => {
    if (locked.current || busy || resendRemaining > 0) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await userPanelService.resendMobileChange();
      setResendRemaining(result.resend_after_seconds);
      setDigits(Array(6).fill(""));
    } catch (issue) {
      setError(
        issue instanceof Error ? issue.message : "ارسال دوباره کد ناموفق بود.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const enter = (index: number, value: string) => {
    const normalized = latinDigits(value).replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    if (!normalized) next[index] = "";
    else {
      const start = normalized.length === 6 ? 0 : index;
      for (
        let offset = 0;
        offset < normalized.length && start + offset < 6;
        offset++
      )
        next[start + offset] = normalized[offset];
      inputs.current[Math.min(start + normalized.length, 5)]?.focus();
    }
    setDigits(next);
    setError("");
  };
  const navigate = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      inputs.current[
        Math.max(0, Math.min(5, index + (event.key === "ArrowLeft" ? -1 : 1)))
      ]?.focus();
    } else if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputs.current[index - 1]?.focus();
    }
  };
  return (
    <form onSubmit={(event) => void submit(event)} className="mt-4">
      {otpRequested ? (
        <>
          <p className="mb-3 text-xs text-neutral-700">
            کد تأیید به شمارهٔ <bdi>{mobile}</bdi> ارسال شد. کد را وارد کنید.
          </p>
          <div
            dir="ltr"
            role="group"
            aria-label="کد تأیید شش‌رقمی"
            className="grid grid-cols-6 gap-2"
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => enter(index, event.target.value)}
                onPaste={(event) => {
                  event.preventDefault();
                  enter(index, event.clipboardData.getData("text"));
                }}
                onKeyDown={(event) => navigate(event, index)}
                onFocus={(event) => event.target.select()}
                disabled={busy}
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={"رقم " + (index + 1) + " کد تأیید"}
                aria-invalid={Boolean(error)}
                className="h-11 min-w-0 rounded-md border border-neutral-300 text-center text-sm text-neutral-900 outline-none focus:border-primary-700 focus:ring-1 focus:ring-primary-700"
              />
            ))}
          </div>
          <button
            type="button"
            disabled={busy || resendRemaining > 0}
            onClick={() => void resend()}
            className="mt-3 text-[11px] text-primary-500 disabled:cursor-not-allowed disabled:text-neutral-500"
          >
            {resendRemaining > 0
              ? `ارسال دوباره کد تا ${resendRemaining} ثانیه دیگر`
              : "ارسال دوباره کد"}
          </button>
        </>
      ) : (
        <label className="block space-y-2 text-xs text-neutral-800">
          <span>شماره موبایل جدید</span>
          <Input
            ref={mobileInput}
            value={mobile}
            onChange={(event) => {
              setMobile(event.target.value);
              setError("");
            }}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={11}
            dir="ltr"
            disabled={busy}
            className="h-10 text-sm"
          />
        </label>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs leading-6 text-error">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={
          busy ||
          (otpRequested
            ? digits.some((digit) => !digit)
            : !/^09\d{9}$/.test(latinDigits(mobile.trim())))
        }
        className="mt-4 h-10 w-full text-xs"
      >
        {busy
          ? "در حال بررسی…"
          : otpRequested
            ? "تأیید و تغییر شماره"
            : "دریافت کد تأیید"}
      </Button>
      {otpRequested && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setOtpRequested(false);
            setResendRemaining(0);
            setDigits(Array(6).fill(""));
            setError("");
            onStageChange(false);
          }}
          className="mt-3 text-[11px] text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          ویرایش شماره / دریافت کد جدید
        </button>
      )}
    </form>
  );
}
