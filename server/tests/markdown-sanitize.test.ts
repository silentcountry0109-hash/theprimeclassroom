import { describe, it, expect, beforeAll } from "vitest";
import { JSDOM } from "jsdom";
import { marked } from "marked";
import createDOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button", "img", "svg", "math", "link", "meta", "base"],
  FORBID_ATTR: ["style", "onerror", "onload", "onclick", "onmouseover", "onmouseout", "onfocus", "onblur", "onchange", "onsubmit", "onkeydown", "onkeyup", "onkeypress"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
};

let DOMPurify: ReturnType<typeof createDOMPurify>;

beforeAll(() => {
  const window = new JSDOM("").window;
  DOMPurify = createDOMPurify(window as unknown as Window);
});

function render(md: string) {
  const raw = marked.parse(md, { async: false }) as string;
  const clean = DOMPurify.sanitize(raw, SANITIZE_CONFIG);
  return typeof clean === "string" ? clean : String(clean);
}

describe("policy markdown sanitization", () => {
  it("preserves benign Chinese policy content and tables", () => {
    const md = "# 退費規則\n\n質數教室希望每位家長都能安心購買。\n\n| 情境 | 結果 |\n| --- | --- |\n| 案例 1 | **全額退費** |\n";
    const out = render(md);
    expect(out).toContain("退費規則");
    expect(out).toContain("質數教室希望每位家長");
    expect(out).toContain("<table");
    expect(out).toContain("案例 1");
    expect(out).toContain("<strong>全額退費</strong>");
  });

  it("strips <script> tags from policy content", () => {
    const md = "## 退費規則\n\n<script>window.__pwned = true;</script>\n\n正常段落";
    const out = render(md);
    expect(out).not.toContain("<script");
    expect(out).not.toContain("window.__pwned");
    expect(out).toContain("正常段落");
  });

  it("strips inline event handlers from links", () => {
    const md = "請見 <a href=\"https://example.com\" onclick=\"alert(1)\" onmouseover=\"alert(2)\">這裡</a>";
    const out = render(md);
    expect(out).not.toMatch(/onclick=/i);
    expect(out).not.toMatch(/onmouseover=/i);
    expect(out).toContain("這裡");
  });

  it("rejects javascript: URLs in links", () => {
    const md = "[惡意連結](javascript:alert(1))";
    const out = render(md);
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("rejects data: URLs in links", () => {
    const md = "[惡意](data:text/html,<script>alert(1)</script>)";
    const out = render(md);
    expect(out.toLowerCase()).not.toContain("data:text/html");
    expect(out).not.toContain("<script");
  });

  it("strips iframe, object, and embed tags", () => {
    const md = "段落\n\n<iframe src=\"https://evil.example.com\"></iframe>\n<object data=\"x\"></object>\n<embed src=\"x\">";
    const out = render(md);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<object/i);
    expect(out).not.toMatch(/<embed/i);
  });

  it("strips img tags with onerror payloads", () => {
    const md = "<img src=x onerror=\"alert(1)\">";
    const out = render(md);
    expect(out).not.toMatch(/<img/i);
    expect(out).not.toMatch(/onerror=/i);
  });

  it("strips form/input/button tags to avoid clickjacking widgets", () => {
    const md = "<form action=\"//evil\"><input name=\"x\"><button>送出</button></form>";
    const out = render(md);
    expect(out).not.toMatch(/<form/i);
    expect(out).not.toMatch(/<input/i);
    expect(out).not.toMatch(/<button/i);
  });

  it("allows safe http(s)/mailto/tel links", () => {
    const md = "[官網](https://primemath.tw) [信箱](mailto:hello@primemath.tw) [電話](tel:0212345678)";
    const out = render(md);
    expect(out).toContain("href=\"https://primemath.tw\"");
    expect(out).toContain("href=\"mailto:hello@primemath.tw\"");
    expect(out).toContain("href=\"tel:0212345678\"");
  });
});
