"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserPanel } from "../hooks/use-user-panel";
import type {
  PanelAccountChange,
  PanelEditor,
  PanelSection,
} from "../types/user-panel.types";
import UserPanelSidebar from "./user-panel-sidebar";
import AccountInfo from "./account-info";
import AccountAddresses from "./account-addresses";
import PanelFavorites from "./panel-favorites";
import PanelComments from "./panel-comments";
import PanelTickets from "./panel-tickets";
import PanelWallet from "./panel-wallet";
import PanelPayments from "./panel-payments";
import PanelOrders from "./panel-orders";
import AccountEditDialog from "./account-edit-dialog";
import { useLogout } from "@/features/auth/hooks/use-logout";

export default function UserPanelPage({ initialSection = "account" }: { initialSection?: PanelSection }) {
  const { logout, isLoggingOut } = useLogout();
  const {
    data: account,
    addressQuery,
    isPending,
    isError,
    refetch,
    save,
    updateProfile,
    deleteAddress,
  } = useUserPanel();
  const [section, setSection] = useState<PanelSection>(initialSection);
  const [editor, setEditor] = useState<PanelEditor | null>(null);
  const [notice, setNotice] = useState("");

  if (isPending)
    return (
      <div
        role="status"
        aria-busy="true"
        className="mx-auto min-h-[70vh] max-w-7xl bg-neutral-50 px-4 py-8"
      >
        <span className="sr-only">در حال دریافت اطلاعات حساب...</span>
        <div
          aria-hidden="true"
          className="grid gap-4 motion-safe:animate-pulse lg:grid-cols-[240px_minmax(0,1fr)]"
        >
          <div className="h-96 rounded-lg bg-white" />
          <div className="h-[640px] rounded-lg bg-white" />
        </div>
      </div>
    );
  if (isError || !account)
    return (
      <div
        role="alert"
        className="flex min-h-80 flex-col items-center justify-center gap-4 bg-neutral-50 px-4"
      >
        <p className="text-sm text-neutral-800">
          دریافت اطلاعات حساب ناموفق بود.
        </p>
        <Button onClick={() => void refetch()}>تلاش دوباره</Button>
      </div>
    );
  const handleSave = async (change: PanelAccountChange) => {
    setNotice("");
    try {
      if (change.type === "address") {
        throw new Error("برای این آدرس عملیاتی مشخص نشده است.");
      }
      if (change.type === "delete-address") {
        await deleteAddress(change.id);
        setNotice("آدرس حذف شد.");
        return;
      }
      if (change.type === "mobile") {
        save(change);
      } else if (["personal", "email", "avatar"].includes(change.type)) {
        await updateProfile(change);
      } else {
        save(change);
      }
      setNotice("تغییرات ذخیره شد.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ذخیره تغییرات ناموفق بود.");
      throw error;
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-[80vh] bg-neutral-50 px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto grid max-w-7xl items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <UserPanelSidebar
          name={`${account.firstName} ${account.lastName}`}
          onExit={() => void logout()}
          isLoggingOut={isLoggingOut}
          activeSection={section}
          onSelect={(value) => {
            setSection(value);
            setEditor(null);
            setNotice("");
          }}
        />
        <div className="min-w-0 rounded-lg bg-white p-4 sm:p-6">
          {section === "orders" ? (
            <PanelOrders />
          ) : section === "payments" ? (
            <PanelPayments />
          ) : section === "wallet" ? (
            <PanelWallet />
          ) : section === "tickets" ? (
            <PanelTickets />
          ) : section === "comments" ? (
            <PanelComments />
          ) : section === "favorites" ? (
            <PanelFavorites />
          ) : (
            <>
              <AccountInfo
                account={account}
                onEdit={(value) => {
                  setEditor(value);
                  setNotice("");
                }}
                onAvatar={(value) => handleSave({ type: "avatar", value })}
              />
              <AccountAddresses
                addresses={(addressQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  title: item.label,
                  province: item.province,
                  provinceId: item.provinceId,
                  city: item.city,
                  cityId: item.cityId,
                  street: item.street,
                  no: item.no,
                  unit: item.unit,
                  postalCode: item.postalCode,
                  receiverName: item.receiverName,
                  receiverMobile: item.receiverMobile,
                }))}
                isPending={addressQuery.isPending}
                isError={addressQuery.isError}
                onRetry={() => void addressQuery.refetch()}
                onEdit={(value) => {
                  setEditor(value);
                  setNotice("");
                }}
              />
              <p
                role="status"
                aria-live="polite"
                className="mt-3 text-xs text-success"
              >
                {notice}
              </p>
            </>
          )}
        </div>
      </div>
      {editor && (
        <AccountEditDialog
          account={account}
          editor={editor}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}
