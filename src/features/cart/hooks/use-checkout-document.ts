"use client";
import { useRef, useState } from "react";
import { getCheckoutDocument } from "../services/checkout-document.service";

export function useCheckoutDocument() {
  const lock = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const openDocument = async (pdfUrl: string | null) => {
    if (!pdfUrl || lock.current) return;
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError("اجازه بازشدن تب جدید را بدهید.");
      return;
    }
    tab.opener = null;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const file = await getCheckoutDocument(pdfUrl);
      const url = URL.createObjectURL(file);
      if (!tab.closed) tab.location.replace(url);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      if (!tab.closed) tab.close();
      setError("دریافت فایل ناموفق بود؛ دوباره تلاش کنید.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  };
  return { openDocument, loading, error };
}
