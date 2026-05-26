import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export default function ParentRegisterVerifyPhone() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useCredentialAuth();
  const { toast } = useToast();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [bypassMode, setBypassMode] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  useEffect(() => {
    if (!isLoading && !user) navigate("/parent-login");
    if (!isLoading && user?.lineRegistrationComplete) navigate("/dashboard");
  }, [user, isLoading, navigate]);

  const startCountdown = () => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setError("");
    if (!/^09\d{8}$/.test(phone)) {
      setError("請輸入有效的台灣手機號碼（09 開頭 10 碼）");
      return;
    }
    setOtpLoading(true);
    try {
      const resp = await apiRequest("POST", "/api/auth/line/send-otp", { phone });
      const data = await resp.json().catch(() => ({}));
      const isBypass = !!data?.bypassMode;
      setBypassMode(isBypass);
      setOtpSent(true);
      startCountdown();
      toast({
        title: "驗證碼已發送",
        description: isBypass
          ? "目前為測試模式，請聯絡管理員取得驗證碼"
          : `簡訊已送至 ${phone}`,
      });
    } catch (e: any) {
      setError(e?.message || "發送失敗，請稍後再試");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("請輸入完整的 6 位數驗證碼");
      return;
    }
    setError("");
    setVerifyLoading(true);
    try {
      await apiRequest("POST", "/api/auth/line/confirm-otp", { phone, otp: otpValue });
      await queryClient.refetchQueries({ queryKey: ["/api/credential-user"] });
      toast({ title: "驗證成功！", description: "歡迎加入質數教室" });
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.message || "驗證失敗，請稍後再試");
    } finally {
      setVerifyLoading(false);
    }
  };

  const otpValue = otp.join("");

  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-1">
            質數教室
          </h1>
          <p className="text-sm text-muted-foreground">手機號碼驗證</p>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tiffany flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">步驟 2 / 2</p>
              <p className="text-xs text-muted-foreground">驗證手機號碼以完成註冊</p>
            </div>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm">手機號碼</Label>
                <div className="relative mt-1.5">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    maxLength={10}
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500" data-testid="error-message">{error}</p>}
              <Button
                className="w-full"
                data-testid="button-send-otp"
                onClick={handleSendOtp}
                disabled={otpLoading || phone.length < 10}
              >
                {otpLoading ? "發送中…" : "發送驗證碼"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tiffany/10 mb-3">
                  <ShieldCheck size={24} className="text-tiffany" />
                </div>
                <p className="text-sm text-foreground">驗證碼已發送至</p>
                <p className="font-medium text-tiffany">{phone}</p>
              </div>

              {bypassMode && (
                <div
                  className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 leading-relaxed text-center"
                  data-testid="text-bypass-mode-hint"
                >
                  目前為測試模式（簡訊服務暫時停用），請聯絡管理員取得 6 位數驗證碼後再輸入。
                </div>
              )}

              <div>
                <Label className="text-sm mb-3 block text-center">請輸入 6 位數驗證碼</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      data-testid={`input-otp-${i}`}
                      className="w-11 h-13 text-center text-xl font-semibold border rounded-lg outline-none focus:border-tiffany focus:ring-2 focus:ring-tiffany/20 transition"
                      style={{ height: 52 }}
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500 text-center" data-testid="error-otp">{error}</p>}

              <div className="text-center text-xs text-muted-foreground">
                {countdown > 0 ? (
                  <span>重新發送（<span className="text-tiffany tabular-nums">{countdown}s</span>）</span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="text-tiffany underline"
                    data-testid="button-resend-otp"
                  >
                    重新發送驗證碼
                  </button>
                )}
              </div>

              <Button
                className="w-full"
                data-testid="button-confirm-otp"
                onClick={handleVerify}
                disabled={verifyLoading || otpValue.length !== 6}
              >
                {verifyLoading ? "驗證中…" : "驗證並完成"}
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          步驟 2 / 2 — 完成後即可使用質數教室
        </p>
      </div>
    </div>
  );
}
