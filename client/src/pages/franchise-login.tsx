import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Lock, User, ArrowLeft, Building2, ShieldCheck, GraduationCap, BookOpen, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import ip12Img from "@assets/工作區域_12_1776423698455.png";

type LoginMode = "franchise" | "coach";

export default function FranchiseLogin() {
  const [location, navigate] = useLocation();
  const initialMode: LoginMode = location === "/coach-login" ? "coach" : "franchise";
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const lsKey = mode === "franchise" ? "rememberedFranchiseUsername" : "rememberedCoachUsername";
  const savedUsername = localStorage.getItem(lsKey) || "";
  const [username, setUsername] = useState(savedUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedUsername);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    const key = newMode === "franchise" ? "rememberedFranchiseUsername" : "rememberedCoachUsername";
    const saved = localStorage.getItem(key) || "";
    setUsername(saved);
    setRememberMe(!!saved);
    setPassword("");
    setShowPassword(false);
    setError("");
  };

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
      const currentKey = mode === "franchise" ? "rememberedFranchiseUsername" : "rememberedCoachUsername";
      if (rememberMe) {
        localStorage.setItem(currentKey, username);
      } else {
        localStorage.removeItem(currentKey);
      }
      if (mode === "franchise") {
        if (data.role === "franchise_admin") {
          navigate("/franchise-admin");
        } else {
          setError("此帳號不是分校管理帳號");
        }
      } else {
        if (data.role === "coach") {
          if (data.mustChangePassword) {
            setShowChangePassword(true);
          } else {
            navigate("/coach-dashboard");
          }
        } else {
          setError("此帳號不是老師帳號");
        }
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    }
    setLoading(false);
  };

  const isFranchise = mode === "franchise";

  return (
    <div className="min-h-screen bg-[#1a2332] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(129,216,208,0.5) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tiffany/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tiffany/3 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 p-6">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            返回官網
          </span>
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-20">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8 relative overflow-visible">
            <img src={ip12Img} alt="" className="absolute -top-8 -right-4 w-12 h-auto object-contain pointer-events-none select-none opacity-50 animate-float-ip-alt" aria-hidden="true" />
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-tiffany/10 border border-tiffany/20 mb-4">
              {isFranchise
                ? <Building2 className="w-7 h-7 text-tiffany" />
                : <GraduationCap className="w-7 h-7 text-tiffany" />
              }
            </div>
            <h1 className="font-serif text-2xl tracking-[0.15em] text-white mb-2">
              質數教室
            </h1>
            <div className="inline-flex items-center gap-1.5 text-tiffany text-sm font-medium">
              {isFranchise
                ? <><ShieldCheck className="w-3.5 h-3.5" />分校管理系統</>
                : <><BookOpen className="w-3.5 h-3.5" />老師登入</>
              }
            </div>
          </div>

          <div className="flex mb-4 bg-[#222f3e] rounded-lg border border-white/10 p-1">
            <button
              type="button"
              onClick={() => switchMode("franchise")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                isFranchise
                  ? "bg-tiffany text-[#1a2332]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              data-testid="tab-franchise-login"
            >
              <Building2 className="w-3.5 h-3.5" />
              分校主任
            </button>
            <button
              type="button"
              onClick={() => switchMode("coach")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                !isFranchise
                  ? "bg-tiffany text-[#1a2332]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              data-testid="tab-coach-login"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              老師
            </button>
          </div>

          <div className="bg-[#222f3e] rounded-xl border border-white/10 shadow-2xl p-6 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm text-gray-300">帳號</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isFranchise ? "請輸入分校帳號" : "請輸入老師帳號"}
                    className="pl-10 bg-[#1a2332] border-white/10 text-white placeholder:text-gray-500 focus:border-tiffany/50 focus:ring-tiffany/20"
                    autoComplete="username"
                    data-testid="input-franchise-username"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-sm text-gray-300">密碼</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    className="pl-10 pr-10 bg-[#1a2332] border-white/10 text-white placeholder:text-gray-500 focus:border-tiffany/50 focus:ring-tiffany/20"
                    autoComplete="current-password"
                    data-testid="input-franchise-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
                    if (!checked) {
                      const key = mode === "franchise" ? "rememberedFranchiseUsername" : "rememberedCoachUsername";
                      localStorage.removeItem(key);
                    }
                  }}
                  className="data-[state=checked]:bg-tiffany data-[state=checked]:border-tiffany border-white/20"
                  data-testid="checkbox-remember-me"
                />
                <span className="text-sm text-gray-400">記住帳號</span>
              </label>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2" data-testid="text-login-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full rounded-lg bg-tiffany hover:bg-tiffany/90 text-[#1a2332] font-semibold"
                disabled={loading || !username || !password}
                data-testid="button-franchise-login"
              >
                {loading ? "登入中..." : isFranchise ? "登入管理系統" : "登入"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            {isFranchise
              ? "如需開通帳號，請聯繫總部管理員"
              : "如需開通帳號，請聯繫分校主任"
            }
          </p>
        </motion.div>
      </div>

      <Dialog open={showChangePassword} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-tiffany" />
              首次登入 — 請修改密碼
            </DialogTitle>
            <DialogDescription>
              為了帳號安全，請設定您的新密碼
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>新密碼 *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="請輸入新密碼（至少 6 個字元）"
                data-testid="input-new-password"
              />
            </div>
            <div>
              <Label>確認新密碼 *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="請再次輸入新密碼"
                data-testid="input-confirm-password"
              />
            </div>
            {changePasswordError && (
              <p className="text-sm text-red-500" data-testid="text-change-password-error">{changePasswordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setChangePasswordError("");
                if (newPassword.length < 6) { setChangePasswordError("密碼至少需要 6 個字元"); return; }
                if (newPassword !== confirmPassword) { setChangePasswordError("兩次密碼不一致"); return; }
                setChangingPassword(true);
                try {
                  const res = await fetch("/api/auth/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ newPassword }),
                  });
                  if (!res.ok) {
                    const err = await res.json();
                    setChangePasswordError(err.message || "修改密碼失敗");
                  } else {
                    setShowChangePassword(false);
                    navigate("/coach-dashboard?firstLogin=1");
                  }
                } catch {
                  setChangePasswordError("網路錯誤，請稍後再試");
                }
                setChangingPassword(false);
              }}
              disabled={changingPassword || newPassword.length < 6 || !confirmPassword}
              className="bg-tiffany hover:bg-tiffany/90 text-[#1a2332]"
              data-testid="button-submit-change-password"
            >
              {changingPassword ? "修改中..." : "確認修改密碼"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
