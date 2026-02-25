import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "認識質數", href: "#about" },
  { label: "教學特色", href: "#teaching" },
  { label: "教材介紹", href: "#textbook" },
  { label: "成功案例", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 md:h-20 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4 px-4 md:px-6">
        <span
          className="font-serif text-xl md:text-2xl tracking-[0.15em] text-foreground cursor-pointer"
          data-testid="link-home"
          onClick={() => {
            if (window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              window.location.href = "/";
            }
          }}
        >
          質數教室
        </span>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-sm text-muted-foreground transition-colors relative group cursor-pointer bg-transparent border-none"
              data-testid={`link-${link.href.slice(1)}`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-tiffany transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a
            href="/parent-login"
            className="text-sm text-muted-foreground transition-colors"
            data-testid="link-login"
          >
            家長登入
          </a>
          <Button
            className="rounded-full px-6"
            data-testid="button-book-diagnosis"
            onClick={() => scrollToSection("#hero-search")}
          >
            預約診斷
          </Button>
        </div>

        <button
          className="md:hidden bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 shadow-lg">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="block w-full text-left py-3 text-sm text-muted-foreground bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
            <a href="/parent-login" className="text-sm text-muted-foreground py-2">
              家長登入
            </a>
            <Button className="rounded-full w-full">預約診斷</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
