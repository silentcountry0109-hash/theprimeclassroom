import { useEffect } from "react";
import { useLocation } from "wouter";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserPlus } from "lucide-react";

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

  const lineOaUrl = import.meta.env.VITE_LINE_OA_URL || "https://lin.ee/placeholder";

  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-1">
            質數教室
          </h1>
          <p className="text-sm text-muted-foreground">加入 LINE 官方帳號</p>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06C755] flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">步驟 1 / 2</p>
              <p className="text-xs text-muted-foreground">加入好友以接收課程通知</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <div
              className="mx-auto mb-4 rounded-xl overflow-hidden border border-border"
              style={{ width: 160, height: 160, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg viewBox="0 0 100 100" width="140" height="140">
                <rect width="100" height="100" fill="white" />
                {Array.from({ length: 7 }).map((_, r) =>
                  Array.from({ length: 7 }).map((__, c) => {
                    const isCorner = (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3);
                    const fill = isCorner ? "#06C755" : Math.random() > 0.5 ? "#222" : "white";
                    return <rect key={`${r}-${c}`} x={8 + c * 12} y={8 + r * 12} width={10} height={10} fill={fill} />;
                  })
                )}
                <rect x={38} y={38} width={24} height={24} fill="#06C755" rx={4} />
              </svg>
            </div>

            <p className="text-sm text-foreground font-medium mb-1">質數教室 官方帳號</p>
            <p className="text-xs text-muted-foreground mb-4">掃描 QR Code 或點下方按鈕加入好友</p>

            <a
              href={lineOaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-line-add-friend"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition"
              style={{ background: "#06C755" }}
            >
              <UserPlus size={16} />
              點此加入好友
            </a>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-4 text-center">
              加入好友後，老師的課程提醒和點數通知都會透過 LINE 傳送給您。
            </p>
            <Button
              className="w-full"
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
