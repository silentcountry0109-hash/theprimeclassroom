import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, ArrowLeft } from "lucide-react";

export default function HqLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-washi flex flex-col">
      <div className="p-6">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-back-home-hq">
            <ArrowLeft className="w-4 h-4" />
            返回
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-2">
              質數數學
            </h1>
            <p className="text-sm text-muted-foreground">總部管理系統</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    data-testid="input-hq-username"
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
                    data-testid="input-hq-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2" data-testid="text-hq-login-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full rounded-lg"
                disabled={loading || !username || !password}
                data-testid="button-hq-login"
              >
                {loading ? "登入中..." : "登入"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
