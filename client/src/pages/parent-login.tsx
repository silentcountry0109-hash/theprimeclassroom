import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, ArrowLeft, Mail, UserPlus } from "lucide-react";

export default function ParentLogin() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setFirstName("");
    setEmail("");
    setError("");
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
        body: JSON.stringify({ username, password, firstName, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "註冊失敗");
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch {
      setError("網路錯誤，請稍後再試");
    }
    setLoading(false);
  };

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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="pl-10"
                      autoComplete="current-password"
                      data-testid="input-parent-password"
                    />
                  </div>
                </div>
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 6 個字元"
                      className="pl-10"
                      autoComplete="new-password"
                      data-testid="input-register-password"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email" className="text-sm">Email（選填）</Label>
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
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2" data-testid="text-register-error">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-lg"
                  disabled={loading || !username || !password || !firstName}
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
