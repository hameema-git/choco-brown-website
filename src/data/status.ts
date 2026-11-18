import { useCallback, useEffect, useState } from "react";

export type ShopStatus = {
  shopOpen: boolean;
  closedMessage: string;
  unavailable: string[];
};

export const DEFAULT_STATUS: ShopStatus = {
  shopOpen: true,
  closedMessage: "",
  unavailable: [],
};

export function parseStatus(input: unknown): ShopStatus {
  const s = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;
  return {
    shopOpen: s.shopOpen !== false,
    closedMessage:
      typeof s.closedMessage === "string" ? s.closedMessage.slice(0, 140) : "",
    unavailable: Array.isArray(s.unavailable)
      ? s.unavailable.filter((id): id is string => typeof id === "string")
      : [],
  };
}

export async function fetchStatus(pin?: string) {
  const res = await fetch("/api/status", {
    cache: "no-store",
    headers: pin ? { "x-admin-pin": pin } : undefined,
  });
  if (!res.ok) throw new Error("status unavailable");
  const body = await res.json();
  return {
    status: parseStatus(body),
    authorized: body.authorized === true,
    storageConnected: body.storageConnected !== false,
  };
}

export async function saveStatus(pin: string, status: ShopStatus) {
  const res = await fetch("/api/status", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-pin": pin },
    body: JSON.stringify(status),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Could not save.");
  return parseStatus(body);
}

/** Customer-side status. If the status can't be loaded, the site stays fully open. */
export function useShopStatus() {
  const [status, setStatus] = useState<ShopStatus>(DEFAULT_STATUS);
  const refresh = useCallback(() => {
    fetchStatus()
      .then((r) => setStatus(r.status))
      .catch(() => {
        /* keep the last known status */
      });
  }, []);
  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    const onFocus = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);
  return status;
}
