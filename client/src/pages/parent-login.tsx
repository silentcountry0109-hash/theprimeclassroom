import { useSearch } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import ip13Img from "@assets/工作區域_13_1776423698455.png";
import deco15Img from "@assets/工作區域_15_1776423698456.png";

export default function ParentLogin() {
  const search = useSearch();
  const urlError = new URLSearchParams(search).get("error");

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
              家長登入 / 註冊
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
              使用 LINE 帳號一鍵登入，無需記憶帳號密碼
            </p>

            {urlError && (
              <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-md px-3 py-2 text-center" data-testid="text-line-error">
                {urlError === "line_not_configured" && "LINE 登入目前暫時無法使用，請稍後再試或聯繫客服"}
                {urlError === "line_denied" && "您取消了 LINE 授權"}
                {urlError === "line_state" && "LINE 授權驗證失敗，請再試一次"}
                {urlError === "line_token" && "LINE 登入失敗，請稍後再試"}
                {urlError === "line_profile" && "無法取得 LINE 個人資料，請稍後再試"}
                {urlError === "line_server" && "LINE 登入發生錯誤，請稍後再試"}
                {urlError === "line_id_taken" && "此 LINE 帳號已綁定其他身份（例如老師帳號），無法同時作為家長使用"}
                {urlError === "line_redirect_unregistered" && "LINE 登入設定未完成（callback 網址未登記）。請聯絡管理員至 LINE Developers Console 新增此網站的 Callback URL。"}
                {!["line_not_configured","line_denied","line_state","line_token","line_profile","line_server","line_id_taken","line_redirect_unregistered"].includes(urlError || "") && "登入發生錯誤，請稍後再試"}
              </p>
            )}

            <a
              href="/api/auth/line"
              data-testid="button-line-login"
              className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-lg border text-sm font-medium transition-colors hover:bg-green-50 hover:border-[#06C755]"
              style={{ borderColor: "#06C755", color: "#06C755" }}
            >
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#06C755" />
                <path d="M20 8C13.373 8 8 12.722 8 18.5c0 4.697 3.119 8.76 7.637 10.433.334.121.79.372.907.854.103.44.067 1.125.033 1.566l-.147.882c-.044.268-.203 1.048.918.572C18.72 31.788 27.2 26.25 29.94 23.1 31.9 20.9 32 19.75 32 18.5 32 12.722 26.627 8 20 8z" fill="white" />
                <path d="M17.333 21.333h-2.666a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666.368 0 .666.298.666.666v4.667h2c.368 0 .667.298.667.666a.667.667 0 0 1-.667.667zM22 20.667a.667.667 0 0 1-.667.666h-2.666a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666h2.666c.368 0 .667.298.667.666a.667.667 0 0 1-.667.667H19.333v1.333h1.333c.368 0 .667.299.667.667a.667.667 0 0 1-.667.667H19.333V20h1.333c.368.001.667.3.334.667zm7.333-4.667c0 .368-.298.667-.666.667h-2v1.333h2c.368 0 .666.299.666.667a.667.667 0 0 1-.666.666h-2V20h2c.368 0 .666.299.666.667a.667.667 0 0 1-.666.666H26a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666h2.667c.368 0 .666.298.666.666z" fill="#06C755" />
              </svg>
              使用 LINE 帳號登入 / 註冊
            </a>
          </div>

          <motion.div
            className="mt-8 w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            data-testid="section-line-login-guide"
          >
            <div className="text-center mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">如何登入</p>
              <p className="text-sm text-foreground/80 mt-1">
                無需記憶密碼，兩步驟完成
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center gap-2" data-testid="step-login-entry">
                <div className="w-12 h-12 rounded-full bg-[#06C755]/10 flex items-center justify-center border border-[#06C755]/20">
                  <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <rect width="40" height="40" rx="8" fill="#06C755" />
                    <path d="M20 8C13.373 8 8 12.722 8 18.5c0 4.697 3.119 8.76 7.637 10.433.334.121.79.372.907.854.103.44.067 1.125.033 1.566l-.147.882c-.044.268-.203 1.048.918.572C18.72 31.788 27.2 26.25 29.94 23.1 31.9 20.9 32 19.75 32 18.5 32 12.722 26.627 8 20 8z" fill="white" />
                    <path d="M17.333 21.333h-2.666a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666.368 0 .666.298.666.666v4.667h2c.368 0 .667.298.667.666a.667.667 0 0 1-.667.667zM22 20.667a.667.667 0 0 1-.667.666h-2.666a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666h2.666c.368 0 .667.298.667.666a.667.667 0 0 1-.667.667H19.333v1.333h1.333c.368 0 .667.299.667.667a.667.667 0 0 1-.667.667H19.333V20h1.333c.368.001.667.3.334.667zm7.333-4.667c0 .368-.298.667-.666.667h-2v1.333h2c.368 0 .666.299.666.667a.667.667 0 0 1-.666.666h-2V20h2c.368 0 .666.299.666.667a.667.667 0 0 1-.666.666H26a.667.667 0 0 1-.667-.666v-5.334c0-.368.299-.666.667-.666h2.667c.368 0 .666.298.666.666z" fill="#06C755" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground leading-snug">① 點擊 LINE 登入</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">進入 LINE 授權頁面</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-2" data-testid="step-line-auth">
                <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center border border-tiffany/20">
                  <ShieldCheck className="w-5 h-5 text-tiffany" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground leading-snug">② LINE 授權</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">一鍵同意 LINE 登入</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-2" data-testid="step-phone-verify">
                <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center border border-coral/20">
                  <Smartphone className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground leading-snug">③ 手機驗證</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">首次需輸入驗證碼</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-amber-warm/60 border border-amber-200/60 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/70 leading-relaxed">
                首次使用 LINE 登入時需完成手機驗證，之後每次只需點擊「LINE 登入」即可一鍵進入。
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
