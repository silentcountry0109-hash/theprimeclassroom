import { useEffect, useState, useCallback } from "react";
import liff from "@line/liff";

export type LiffAuthStatus =
  | { status: "loading" }
  | { status: "not-in-liff"; message: string }
  | { status: "no-liff-id"; message: string }
  | { status: "unbound"; lineProfile: { userId: string; displayName: string; pictureUrl?: string } }
  | { status: "incomplete"; lineProfile: { userId: string; displayName: string; pictureUrl?: string } }
  | { status: "error"; message: string }
  | { status: "ok"; user: any; lineProfile: { userId: string; displayName: string; pictureUrl?: string } };

let liffInitPromise: Promise<void> | null = null;

function ensureLiffInit(liffId: string): Promise<void> {
  if (!liffInitPromise) {
    liffInitPromise = liff.init({ liffId, withLoginOnExternalBrowser: false });
  }
  return liffInitPromise;
}

export function useLiff() {
  const [state, setState] = useState<LiffAuthStatus>({ status: "loading" });

  const authenticate = useCallback(async () => {
    const liffId = (import.meta.env.VITE_LIFF_ID as string | undefined) || "";
    if (!liffId) {
      setState({ status: "no-liff-id", message: "尚未設定 LIFF ID（VITE_LIFF_ID）。請聯絡管理員。" });
      return;
    }

    try {
      await ensureLiffInit(liffId);
    } catch (err: any) {
      setState({ status: "error", message: `LIFF 初始化失敗：${err?.message || err}` });
      return;
    }

    if (!liff.isInClient()) {
      // 任務需求：非 LINE 環境一律顯示「請從 LINE 開啟」提示，不允許走外部瀏覽器登入流程。
      setState({
        status: "not-in-liff",
        message: "請從 LINE 開啟此頁面以使用完整功能。",
      });
      return;
    }

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href });
      return;
    }

    const accessToken = liff.getAccessToken();
    if (!accessToken) {
      setState({ status: "error", message: "無法取得 LINE access token，請重新進入。" });
      return;
    }

    try {
      const res = await fetch("/api/auth/liff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      let lineProfile = { userId: "", displayName: "" } as { userId: string; displayName: string; pictureUrl?: string };
      try { lineProfile = await liff.getProfile(); } catch {}

      if (data.status === "ok") {
        setState({ status: "ok", user: data.user, lineProfile });
      } else if (data.status === "unbound") {
        setState({ status: "unbound", lineProfile });
      } else if (data.status === "incomplete") {
        setState({ status: "incomplete", lineProfile });
      } else {
        setState({ status: "error", message: data.message || "LIFF 驗證失敗" });
      }
    } catch (err: any) {
      setState({ status: "error", message: `登入失敗：${err?.message || err}` });
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  const openExternal = useCallback((url: string) => {
    try {
      if (liff.isInClient()) {
        liff.openWindow({ url, external: true });
        return;
      }
    } catch {}
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const closeLiff = useCallback(() => {
    try { if (liff.isInClient()) liff.closeWindow(); } catch {}
  }, []);

  return { state, retry: authenticate, openExternal, closeLiff };
}
