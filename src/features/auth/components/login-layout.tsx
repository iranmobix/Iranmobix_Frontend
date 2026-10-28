import React from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-svh bg-[#F6F5F3] p-1.5 sm:p-2">
      <div className="mx-auto flex min-h-[calc(100svh-12px)] w-full max-w-[1600px] overflow-hidden rounded-md bg-white sm:min-h-[calc(100svh-16px)]">
        {children}
      </div>
    </main>
  );
}
