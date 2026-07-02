import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import MarkdownContent from "@/components/markdown-content";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import ParentDashboard from "@/pages/parent-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import FranchiseAdminDashboard from "@/pages/franchise-admin";
import FranchiseLogin from "@/pages/franchise-login";
import HqLogin from "@/pages/hq-login";
import ParentLogin from "@/pages/parent-login";
import SearchResults from "@/pages/search-results";
import ClassroomDetail from "@/pages/classroom-detail";
import CoachDashboard from "@/pages/coach-dashboard";
import ParentRegisterAddFriend from "@/pages/parent-register-add-friend";
import ParentRegisterVerifyPhone from "@/pages/parent-register-verify-phone";
import PaymentResult from "@/pages/payment-result";
import PrivacyPage from "@/pages/privacy";
import RefundPage from "@/pages/refund";
import LiffApp from "@/pages/liff-app";
import Maintenance from "@/pages/maintenance";
import { useLocation } from "wouter";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-washi flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl tracking-[0.15em] text-foreground mb-6">
          質數教室
        </h1>
        <div className="flex gap-2 justify-center">
          <div
            className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function PolicyScrollSection({
  title,
  content,
  agreed,
  onAgree,
  disabled,
}: {
  title: string;
  content: string;
  agreed: boolean;
  onAgree: (v: boolean) => void;
  disabled: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const checkBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 10 || el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setScrolledToBottom(true);
    }
  }, []);

  useEffect(() => {
    checkBottom();
  }, [content, checkBottom]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div
        ref={scrollRef}
        onScroll={checkBottom}
        className="h-40 overflow-y-scroll overflow-x-auto border border-gray-200 rounded-lg p-3 bg-gray-50"
        data-testid={`policy-scroll-${title}`}
      >
        <MarkdownContent source={content} className="prose-xs" />
      </div>
      {!scrolledToBottom && (
        <p className="text-[11px] text-muted-foreground">請閱讀完畢後勾選</p>
      )}
      <label className={`flex items-center gap-2 cursor-pointer ${(!scrolledToBottom || disabled) ? "opacity-50 cursor-not-allowed" : ""}`}>
        <Checkbox
          checked={agreed}
          onCheckedChange={(v) => { if (scrolledToBottom && !disabled) onAgree(!!v); }}
          disabled={!scrolledToBottom || disabled}
          data-testid={`checkbox-agree-${title}`}
        />
        <span className="text-xs text-foreground">我已閱讀並同意上述{title}</span>
      </label>
    </div>
  );
}

function PoliciesAgreementModal({
  privacyPolicy,
  refundPolicy,
  onAgreed,
}: {
  privacyPolicy: string;
  refundPolicy: string;
  onAgreed: () => void;
}) {
  const { toast } = useToast();
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [refundAgreed, setRefundAgreed] = useState(false);

  const agreeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/parent/agree-policies");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credential-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onAgreed();
    },
    onError: () => {
      toast({ title: "記錄失敗，請稍後再試", variant: "destructive" });
    },
  });

  const canConfirm = privacyAgreed && refundAgreed;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      data-testid="modal-policies-agreement"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-serif text-xl tracking-[0.05em] text-foreground mb-1" data-testid="text-policies-modal-title">
            服務條款與政策同意
          </h2>
          <p className="text-sm text-muted-foreground">
            使用本平台前，請閱讀並同意以下政策。請將每份文件捲動至底部後勾選同意。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <PolicyScrollSection
            title="隱私權政策"
            content={privacyPolicy}
            agreed={privacyAgreed}
            onAgree={setPrivacyAgreed}
            disabled={agreeMutation.isPending}
          />
          <PolicyScrollSection
            title="退費規則"
            content={refundPolicy}
            agreed={refundAgreed}
            onAgree={setRefundAgreed}
            disabled={agreeMutation.isPending}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <Button
            className="w-full rounded-full"
            disabled={!canConfirm || agreeMutation.isPending}
            onClick={() => agreeMutation.mutate()}
            style={{ backgroundColor: canConfirm ? "#81D8D0" : undefined, color: canConfirm ? "white" : undefined }}
            data-testid="button-confirm-policies"
          >
            {agreeMutation.isPending ? "記錄中…" : "確認同意"}
          </Button>
          {!canConfirm && (
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              請閱讀並勾選兩份文件後才能繼續
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PoliciesGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isLiff = location.startsWith("/liff");
  const { user: replitUser, isLoading: replitLoading } = useAuth();
  const { user: credUser, isLoading: credLoading } = useCredentialAuth();
  const [dismissed, setDismissed] = useState(false);

  const { data: siteContent } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-content"],
    enabled: !isLiff,
  });

  if (isLiff) {
    return <>{children}</>;
  }

  const isLoading = replitLoading || credLoading;
  const user = credUser || replitUser;

  const isParent = !isLoading && !!user && (user as any).role === "parent";
  const lineComplete = (user as any)?.lineRegistrationComplete !== false;

  const policiesUpdatedAt = siteContent?.["policies_updated_at"];
  const agreedAt = (user as any)?.policiesAgreedAt;

  const needsAgreement = isParent && lineComplete && !dismissed && (() => {
    if (!agreedAt) return true;
    if (policiesUpdatedAt) {
      try {
        const updatedTime = new Date(policiesUpdatedAt).getTime();
        const agreedTime = new Date(agreedAt).getTime();
        return agreedTime < updatedTime;
      } catch {
        return false;
      }
    }
    return false;
  })();

  const privacyPolicy = siteContent?.["privacy_policy"] || "（尚未設定隱私權政策，請由總部後台編輯）";
  const refundPolicy = siteContent?.["refund_policy"] || "（尚未設定退費規則，請由總部後台編輯）";

  return (
    <>
      {children}
      {needsAgreement && (
        <PoliciesAgreementModal
          privacyPolicy={privacyPolicy}
          refundPolicy={refundPolicy}
          onAgreed={() => setDismissed(true)}
        />
      )}
    </>
  );
}

function HomePage() {
  const { user: replitUser, isLoading: replitLoading } = useAuth();
  const { user: credUser, isLoading: credLoading } = useCredentialAuth();

  if (replitLoading || credLoading) {
    return <LoadingScreen />;
  }

  const user = credUser || replitUser;
  if (user && user.role === "parent") {
    return <ParentDashboard />;
  }

  return <LandingPage />;
}

function Router() {
  const { data: maint, isLoading: maintLoading } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/maintenance"],
    staleTime: 60_000,
  });
  if (maintLoading) return <LoadingScreen />;
  if (maint?.enabled) {
    // 維修模式:開放「老師端」+「家長註冊/綁定/新增學生」+「主任端」(7/1–7/2 催註冊/現場核對用);
    // 其餘(首頁/預約/總部…)一律維修頁。家長 dashboard 僅開放「我的孩子」tab(見 parent-dashboard)。
    return (
      <Switch>
        <Route path="/coach-login" component={FranchiseLogin} />
        <Route path="/coach-dashboard" component={CoachDashboard} />
        <Route path="/franchise-login" component={FranchiseLogin} />
        <Route path="/franchise-admin" component={FranchiseAdminDashboard} />
        <Route path="/parent-login" component={ParentLogin} />
        <Route path="/parent-register/add-friend" component={ParentRegisterAddFriend} />
        <Route path="/parent-register/verify-phone" component={ParentRegisterVerifyPhone} />
        <Route path="/dashboard" component={ParentDashboard} />
        <Route path="/liff" component={LiffApp} />
        <Route path="/liff/:tab*" component={LiffApp} />
        <Route component={Maintenance} />
      </Switch>
    );
  }
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/classroom/:id" component={ClassroomDetail} />
      <Route path="/dashboard" component={ParentDashboard} />
      <Route path="/parent-login" component={ParentLogin} />
      <Route path="/franchise-login" component={FranchiseLogin} />
      <Route path="/hq-login" component={HqLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/franchise-admin" component={FranchiseAdminDashboard} />
      <Route path="/coach-login" component={FranchiseLogin} />
      <Route path="/coach-dashboard" component={CoachDashboard} />
      <Route path="/parent-register/add-friend" component={ParentRegisterAddFriend} />
      <Route path="/parent-register/verify-phone" component={ParentRegisterVerifyPhone} />
      <Route path="/payment-result" component={PaymentResult} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/refund" component={RefundPage} />
      <Route path="/liff" component={LiffApp} />
      <Route path="/liff/:tab*" component={LiffApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PoliciesGate>
          <Router />
        </PoliciesGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
