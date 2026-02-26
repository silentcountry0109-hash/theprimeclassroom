import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, ArrowLeft, Building2, ShieldCheck, GraduationCap, BookOpen } from "lucide-react";

type LoginMode = "franchise" | "coach";

export default function FranchiseLogin() {
  const [location, navigate] = useLocation();
  const initialMode: LoginMode = location === "/coach-login" ? "coach" : "franchise";
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    setUsername("");
    setPassword("");
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
      if (mode === "franchise") {
        if (data.role === "franchise_admin") {
          navigate("/franchise-admin");
        } else {
          setError("此帳號不是分校管理帳號");
        }
      } else {
        if (data.role === "coach") {
          navigate("/coach-dashboard");
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
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    className="pl-10 bg-[#1a2332] border-white/10 text-white placeholder:text-gray-500 focus:border-tiffany/50 focus:ring-tiffany/20"
                    autoComplete="current-password"
                    data-testid="input-franchise-password"
                  />
                </div>
              </div>

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
        </div>
      </div>
    </div>
  );
}
