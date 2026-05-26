import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const SANITIZE_CONFIG = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button", "img", "svg", "math", "link", "meta", "base"],
  FORBID_ATTR: ["style", "onerror", "onload", "onclick", "onmouseover", "onmouseout", "onfocus", "onblur", "onchange", "onsubmit", "onkeydown", "onkeyup", "onkeypress"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
};

interface MarkdownContentProps {
  source: string;
  className?: string;
  testId?: string;
}

export default function MarkdownContent({ source, className, testId }: MarkdownContentProps) {
  const html = useMemo(() => {
    try {
      const raw = marked.parse(source ?? "", { async: false }) as string;
      const sanitized = DOMPurify.sanitize(raw, SANITIZE_CONFIG);
      const out = typeof sanitized === "string" ? sanitized : String(sanitized);
      return out.replace(
        /<a\s+([^>]*?)href=/gi,
        '<a target="_blank" rel="noopener noreferrer nofollow" $1href=',
      );
    } catch {
      return "";
    }
  }, [source]);

  return (
    <div
      className={
        "prose prose-sm md:prose-base max-w-none text-foreground/85 leading-relaxed " +
        "prose-headings:font-serif prose-headings:tracking-wide prose-headings:text-foreground " +
        "prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-6 " +
        "prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-1 prose-h2:border-b prose-h2:border-tiffany/30 " +
        "prose-h3:text-base md:prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-tiffany " +
        "prose-p:my-2 prose-p:leading-relaxed " +
        "prose-strong:text-foreground " +
        "prose-a:text-tiffany prose-a:no-underline hover:prose-a:underline " +
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-1 " +
        "prose-blockquote:border-l-4 prose-blockquote:border-coral prose-blockquote:bg-amber-warm/40 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-md prose-blockquote:not-italic prose-blockquote:text-foreground/80 " +
        "prose-table:my-4 prose-table:text-sm prose-th:bg-tiffany/10 prose-th:text-foreground prose-th:font-medium prose-th:p-2 prose-th:border prose-th:border-tiffany/30 prose-td:p-2 prose-td:border prose-td:border-tiffany/20 prose-td:align-top " +
        "prose-hr:my-6 prose-hr:border-tiffany/20 " +
        (className || "")
      }
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
