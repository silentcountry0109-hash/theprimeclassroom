import { useEffect } from "react";
import { useLocation } from "wouter";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserPlus } from "lucide-react";
import qrCodeImg from "@assets/M_643apwlp_GW_1777563962977.png";
import mascotImg from "@assets/工作區域_13_1776423698455.png";

export default function ParentRegisterAddFriend() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useCredentialAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/parent-login");
    }
    if (!isLoading && user?.lineRegistrationComplete) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const lineOaUrlDesktop = import.meta.env.VITE_LINE_OA_URL || "https://line.me/R/ti/p/@643apwlp";
  const lineOaUrlMobile = import.meta.env.VITE_LINE_OA_MOBILE_URL || "line://ti/p/@643apwlp";

  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  const lineOaUrl = isMobile ? lineOaUrlMobile : lineOaUrlDesktop;

  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <img
        src={mascotImg}
        alt=""
        className="absolute bottom-6 right-4 w-28 pointer-events-none select-none opacity-10 animate-float-deco-slow"
        aria-hidden="true"
      />

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-1">
            質數教室
          </h1>
          <p className="text-sm text-muted-foreground">加入 LINE 官方帳號</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="bg-[#06C755]/8 px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06C755] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">步驟 1 / 2</p>
                <p className="text-xs text-muted-foreground">加入好友以接收課程通知</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="flex flex-col items-center mb-5">
              <div className="relative mb-4">
                <div className="rounded-2xl overflow-hidden border-2 border-[#06C755]/20 shadow-md p-2 bg-white">
                  <img
                    src={qrCodeImg}
                    alt="質數教室 LINE 官方帳號 QR Code"
                    className="w-44 h-44 object-contain"
                    data-testid="img-line-qr-code"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-1 shadow-md border border-border">
                  <img
                    src={mascotImg}
                    alt="質數教室吉祥物"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  質數教室 官方帳號
                </p>
                <p className="text-xs text-muted-foreground">
                  掃描 QR Code 或點下方按鈕加入好友
                </p>
              </div>
            </div>

            <a
              href={lineOaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-line-add-friend"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: "#06C755" }}
            >
              <UserPlus size={16} />
              點此加入好友
            </a>
          </div>

          <div className="px-6 pb-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-3 text-center leading-relaxed">
              加入好友後，老師的課程提醒和點數通知都會透過 LINE 傳送給您。
            </p>
            <Button
              className="w-full rounded-xl"
              data-testid="button-next-verify-phone"
              onClick={() => navigate("/parent-register/verify-phone")}
            >
              <CheckCircle2 size={16} className="mr-2" />
              我已加好友，繼續下一步
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          步驟 1 / 2 — 下一步：手機號碼驗證
        </p>
      </div>
    </div>
  );
}
