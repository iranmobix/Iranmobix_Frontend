"use client";

import { useCallback, useState } from "react";

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
  };
}
