import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, User, ArrowLeft, Mail, UserPlus, Phone, MapPin, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";

const REFERRAL_OPTIONS = [
  "網路搜尋（Google、Yahoo 等）",
  "社群媒體（Facebook、Instagram、LINE 等）",
  "親友推薦",
  "學校老師推薦",
  "路過看到教室",
  "其他",
];

export default function ParentLogin() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const savedUsername = localStorage.getItem("rememberedParentUsername") || "";
  const [username, setUsername] = useState(savedUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedUsername);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [referralSource, setReferralSource] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

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
    setOtpError("");
    if (!phone) { setOtpError("請先輸入手機號碼"); return; }
    if (!/^09\d{8}$/.test(phone)) { setOtpError("請輸入正確格式（09 開頭 10 碼）"); return; }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.message || "發送失敗，請稍後再試"); return; }
      setOtpSent(true);
      startCountdown();
    } catch {
      setOtpError("網路錯誤，請稍後再試");
    } finally {
      setOtpLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setFirstName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setReferralSource([]);
    setError("");
    setShowSuccess(false);
    setOtp("");
    setOtpSent(false);
    setOtpError("");
    setCountdown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const toggleReferral = (option: string) => {
    setReferralSource((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/credential-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "登入失敗");
        setLoading(false);
        return;
      }
      if (data.role === "parent") {
        if (rememberMe) {
          localStorage.setItem("rememberedParentUsername", username);
        } else {
          localStorage.removeItem("rememberedParentUsername");
        }
        navigate("/dashboard");
      } else {
        setError("請使用家長帳號登入");
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parent-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
          firstName,
          email,
          phone,
          address: address || undefined,
          referralSource: referralSource.length > 0 ? referralSource : undefined,
          otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "註冊失敗");
        setLoading(false);
        return;
      }
      if (data.isNewUser) {
        localStorage.setItem("newlyRegistered", "true");
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch {
      setError("網路錯誤，請稍後再試");
    }
    setLoading(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-washi flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-tiffany/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-tiffany" />
          </div>
          <h2 className="font-serif text-xl tracking-[0.08em] text-foreground mb-2" data-testid="text-register-success">
            註冊成功！
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            歡迎加入質數教室
          </p>
          <p className="text-xs text-muted-foreground/60">
            正在為您導向家長後台...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-washi flex flex-col">
      <div className="p-6">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            返回官網
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-2">
              質數教室
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "家長登入" : "家長註冊"}
            </p>
          </div>

          <div className="flex gap-1 mb-4 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); resetForm(); }}
              className={`flex-1 py-2 text-sm rounded-md transition-all ${mode === "login" ? "bg-white shadow-sm font-medium text-foreground" : "text-muted-foreground"}`}
              data-testid="tab-login"
            >
              登入
            </button>
            <button
              onClick={() => { setMode("register"); resetForm(); }}
              className={`flex-1 py-2 text-sm rounded-md transition-all ${mode === "register" ? "bg-white shadow-sm font-medium text-foreground" : "text-muted-foreground"}`}
              data-testid="tab-register"
            >
              註冊
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-sm">帳號</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="請輸入帳號"
                      className="pl-10"
                      autoComplete="username"
                      data-testid="input-parent-username"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm">密碼</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      data-testid="input-parent-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => {
                      setRememberMe(!!checked);
                      if (!checked) localStorage.removeItem("rememberedParentUsername");
                    }}
                    className="data-[state=checked]:bg-tiffany data-[state=checked]:border-tiffany"
                    data-testid="checkbox-remember-me"
                  />
                  <span className="text-sm text-muted-foreground">記住帳號</span>
                </label>
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2" data-testid="text-login-error">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-lg"
                  disabled={loading || !username || !password}
                  data-testid="button-parent-login"
                >
                  {loading ? "登入中..." : "登入"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="reg-name" className="text-sm">姓名 <span className="text-coral">*</span></Label>
                  <div className="relative mt-1.5">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="您的姓名"
                      className="pl-10"
                      data-testid="input-register-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-phone" className="text-sm">手機號碼 <span className="text-coral">*</span></Label>
                  <div className="flex gap-2 mt-1.5">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (otpSent) { setOtpSent(false); setOtp(""); setOtpError(""); setCountdown(0); if (countdownRef.current) clearInterval(countdownRef.current); }
                        }}
                        placeholder="0912345678"
                        className="pl-10"
                        data-testid="input-register-phone"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={otpLoading || countdown > 0}
                      className="shrink-0 text-xs whitespace-nowrap"
                      data-testid="button-send-otp"
                    >
                      {otpLoading ? "發送中..." : countdown > 0 ? `${countdown}s 後重發` : otpSent ? "重新發送" : "發送驗證碼"}
                    </Button>
                  </div>
                  {otpError && (
                    <p className="text-xs text-red-500 mt-1" data-testid="text-otp-error">{otpError}</p>
                  )}
                  {otpSent && !otpError && (
                    <p className="text-xs text-tiffany mt-1">驗證碼已發送至 {phone}，請查收簡訊</p>
                  )}
                </div>
                {otpSent && (
                  <div>
                    <Label htmlFor="reg-otp" className="text-sm">手機驗證碼 <span className="text-coral">*</span></Label>
                    <div className="relative mt-1.5">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="請輸入 6 位數驗證碼"
                        className="pl-10 tracking-widest font-mono text-center"
                        data-testid="input-register-otp"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="reg-email" className="text-sm">Email <span className="text-coral">*</span></Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      data-testid="input-register-email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-address" className="text-sm">地址（選填）</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="請輸入您的地址"
                      className="pl-10"
                      data-testid="input-register-address"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-username" className="text-sm">帳號 <span className="text-coral">*</span></Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="至少 3 個字元"
                      className="pl-10"
                      autoComplete="username"
                      data-testid="input-register-username"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-password" className="text-sm">密碼 <span className="text-coral">*</span></Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 6 個字元"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      data-testid="input-register-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      data-testid="button-toggle-reg-password"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">如何得知質數教室？（選填）</Label>
                  <div className="space-y-2.5 mt-2">
                    {REFERRAL_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2.5 cursor-pointer group"
                        data-testid={`checkbox-referral-${option}`}
                      >
                        <Checkbox
                          checked={referralSource.includes(option)}
                          onCheckedChange={() => toggleReferral(option)}
                          className="data-[state=checked]:bg-tiffany data-[state=checked]:border-tiffany"
                        />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2" data-testid="text-register-error">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-lg"
                  disabled={loading || !username || !password || !firstName || !phone || !email || !otpSent || otp.length !== 6}
                  data-testid="button-parent-register"
                >
                  {loading ? "註冊中..." : "註冊"}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            註冊即表示您同意我們的服務條款與隱私政策
          </p>
        </div>
      </div>
    </div>
  );
}
