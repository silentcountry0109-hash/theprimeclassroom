import { useLocation } from "wouter";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentResult() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-washi flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">付款成功！</h1>
            <p className="text-gray-500 mb-6">
              堂數已成功加值至您的帳戶，感謝您的購買。
            </p>
            <Button
              data-testid="button-go-to-dashboard"
              className="w-full bg-tiffany hover:bg-tiffany/90 text-white"
              onClick={() => navigate("/dashboard?tab=credits")}
            >
              查看我的點數
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">付款未完成</h1>
            <p className="text-gray-500 mb-6">
              付款流程未完成或遭取消，您的帳戶點數未變動。如有疑問請聯繫我們。
            </p>
            <div className="flex flex-col gap-3">
              <Button
                data-testid="button-retry-payment"
                className="w-full bg-tiffany hover:bg-tiffany/90 text-white"
                onClick={() => navigate("/dashboard?tab=credits")}
              >
                重新購買
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                data-testid="button-back-to-account"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                回到帳戶
              </Button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 mt-4">
          若尚未登入，請先
          <button
            className="underline mx-1"
            onClick={() => navigate("/parent-login")}
          >
            重新登入
          </button>
          後查看帳戶
        </p>
        <p className="text-xs text-gray-400 mt-1">
          質數教室 · 如有疑問請聯繫您的分校
        </p>
      </div>
    </div>
  );
}
