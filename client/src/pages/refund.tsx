import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ReceiptText } from "lucide-react";
import Navbar from "@/components/navbar";

export default function RefundPage() {
  const { data: siteContent, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-content"],
  });

  const refundPolicy =
    siteContent?.["refund_policy"] ||
    "（尚未設定退費規則，請由總部後台編輯）";
  const updatedAt = siteContent?.["policies_updated_at"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            回首頁
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ReceiptText className="w-7 h-7 text-tiffany" />
          <h1
            className="font-serif text-2xl md:text-3xl tracking-wide text-foreground"
            data-testid="heading-refund"
          >
            退費規則
          </h1>
        </div>

        {updatedAt && (
          <p className="text-xs text-muted-foreground mb-8" data-testid="text-updated-at">
            最後更新：{updatedAt}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted rounded animate-pulse"
                style={{ width: `${75 + Math.random() * 25}%` }}
              />
            ))}
          </div>
        ) : (
          <div
            className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap"
            data-testid="content-refund-policy"
          >
            {refundPolicy}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} The Prime 質數教室. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="footer-link-privacy">
            隱私權政策
          </Link>
          <Link href="/refund" className="hover:text-foreground transition-colors" data-testid="footer-link-refund">
            退費規則
          </Link>
        </div>
      </footer>
    </div>
  );
}
