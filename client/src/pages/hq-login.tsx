import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, User, ArrowLeft, Crown, Shield, Eye, EyeOff } from "lucide-react";

export default function HqLogin() {
  const [, navigate] = useLocation();
  const savedHqUsername = localStorage.getItem("rememberedHqUsername") || "";
  const [username, setUsername] = useState(savedHqUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedHqUsername);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (data.role === "admin") {
        if (rememberMe) {
          localStorage.setItem("rememberedHqUsername", username);
        } else {
          localStorage.removeItem("rememberedHqUsername");
        }
        navigate("/admin");
      } else {
        setError("此帳號不是總部管理員帳號");
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251,191,36,0.6) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 left-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 p-6">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer" data-testid="link-back-home-hq">
            <ArrowLeft className="w-4 h-4" />
            返回
          </span>
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="font-serif text-2xl tracking-[0.15em] text-white mb-2">
              質數教室
            </h1>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-sm font-medium">
              <Shield className="w-3.5 h-3.5" />
              總部管理系統
            </div>
          </div>

          <div className="bg-[#1a2028] rounded-xl border border-white/8 shadow-2xl p-6 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm text-gray-400">帳號</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="請輸入管理員帳號"
                    className="pl-10 bg-[#0f1419] border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20"
                    autoComplete="username"
                    data-testid="input-hq-username"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-sm text-gray-400">密碼</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    className="pl-10 pr-10 bg-[#0f1419] border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:ring-amber-500/20"
                    autoComplete="current-password"
                    data-testid="input-hq-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
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
                    if (!checked) localStorage.removeItem("rememberedHqUsername");
                  }}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 border-white/20"
                  data-testid="checkbox-remember-me"
                />
                <span className="text-sm text-gray-400">記住帳號</span>
              </label>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2" data-testid="text-hq-login-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0f1419] font-semibold"
                disabled={loading || !username || !password}
                data-testid="button-hq-login"
              >
                {loading ? "登入中..." : "登入管理系統"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
