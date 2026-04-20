import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ip2Img from "@assets/工作區域_2_1776423698455.png";
import deco5Img from "@assets/工作區域_5_1776423714787.png";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-washi flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <img src={deco5Img} alt="" className="absolute top-16 right-8 md:right-20 w-28 md:w-40 pointer-events-none select-none opacity-[0.07] animate-float-deco" aria-hidden="true" />
      <img src={deco5Img} alt="" className="absolute bottom-16 left-8 md:left-20 w-20 md:w-32 pointer-events-none select-none opacity-[0.05] animate-float-deco-rev" aria-hidden="true" />

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative inline-block mb-8">
          <img
            src={ip2Img}
            alt="質數先生"
            className="w-36 h-auto object-contain mx-auto animate-float-ip"
          />
          <span className="absolute -top-2 -right-4 text-4xl font-black text-tiffany opacity-80 font-serif select-none">?</span>
        </div>

        <h1 className="font-serif text-6xl md:text-8xl tracking-[0.05em] text-tiffany mb-2">
          404
        </h1>
        <p className="font-serif text-lg md:text-xl tracking-[0.12em] text-foreground mb-2">
          找不到頁面
        </p>
        <p className="text-sm text-muted-foreground mb-10 max-w-xs mx-auto">
          這個頁面不存在或已被移除，質數先生也找不到它。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-tiffany hover:bg-tiffany/90 text-white rounded-full px-6"
            data-testid="button-back-home"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              回到首頁
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="rounded-full px-6"
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一頁
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
