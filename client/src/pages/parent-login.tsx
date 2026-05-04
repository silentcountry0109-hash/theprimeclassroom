import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, User, ArrowLeft, Mail, UserPlus, Phone, MapPin, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import ip13Img from "@assets/工作區域_13_1776423698455.png";
import deco15Img from "@assets/工作區域_15_1776423698456.png";

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
  const search = useSearch();
  const urlError = new URLSearchParams(search).get("error");
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
    <div className="min-h-screen bg-washi flex flex-col relative overflow-hidden">
      <img src={deco15Img} alt="" className="absolute bottom-8 left-4 md:left-10 w-24 md:w-32 pointer-events-none select-none opacity-[0.08] animate-float-deco-slow" aria-hidden="true" />
      <div className="p-6">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            返回官網
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8 relative overflow-visible">
            <img src={ip13Img} alt="" className="absolute -top-8 -left-2 md:-left-8 w-20 md:w-24 h-auto object-contain pointer-events-none select-none animate-float-ip-slow" aria-hidden="true" />
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
            ) : null}

            {urlError && (
              <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-md px-3 py-2 text-center" data-testid="text-line-error">
                {urlError === "line_not_configured" && "LINE 登入尚未開放，請使用帳號密碼登入"}
                {urlError === "line_denied" && "您取消了 LINE 授權"}
                {urlError === "line_state" && "LINE 授權驗證失敗，請再試一次"}
                {urlError === "line_token" && "LINE 登入失敗，請稍後再試"}
                {urlError === "line_profile" && "無法取得 LINE 個人資料，請稍後再試"}
                {urlError === "line_server" && "LINE 登入發生錯誤，請稍後再試"}
                {urlError === "line_id_taken" && "此 LINE 帳號已綁定其他身份（例如老師帳號），無法同時作為家長使用"}
                {!["line_not_configured","line_denied","line_state","line_token","line_profile","line_server","line_id_taken"].includes(urlError || "") && "登入發生錯誤，請稍後再試"}
              </p>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">或</span>
              </div>
            </div>

            <a
              href="/api/auth/line"
              data-testid="button-line-login"
              className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors hover:bg-green-50 hover:border-[#06C755]"
              style={{ borderColor: "#06C755", color: "#06C755" }}
            >
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#06C755" />
                <path d="M20 8C13.373 8 8 12.722 8 18.5c0 4.697 3.119 8.76 7.637 10.433.334.121.79.372.907.854.103.44.067 1.125.033 1.566l-.147.882c-.044.268-.203 1.048.918.572C18.72 31.788 27.2 26.25 29.94 23.1 31.9 20.9 32 19.75 32 18.5 32 12.722 26.627 8 20 8z" fill="white" />
                <path d="M17.333 21.333h-2.666a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666.368 0 .666.298.666.666v4.667h2c.368 0 .667.298.667.666a.667.667 0 0 1-.667.667zM22 20.667a.667.667 0 0 1-.667.666h-2.666a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666h2.666c.368 0 .667.298.667.666a.667.667 0 0 1-.667.667H19.333v1.333h1.333c.368 0 .667.299.667.667a.667.667 0 0 1-.667.667H19.333V20h1.333c.368.001.667.3.334.667zm7.333-4.667c0 .368-.298.667-.666.667h-2v1.333h2c.368 0 .666.299.666.667a.667.667 0 0 1-.666.666h-2V20h2c.368 0 .666.299.666.667a.667.667 0 0 1-.666.666H26a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666h2.667c.368 0 .666.298.666.666z" fill="#06C755" />
              </svg>
              使用 LINE 帳號登入 / 註冊
            </a>

            {mode === "login" ? null : (
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
        </motion.div>
      </div>
    </div>
  );
}
