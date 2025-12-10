import { Auth } from "@/components/auth-modal";
import { Features } from "@/components/features";
import { SectionTwo } from "@/components/landing-section-two";

import * as motion from "motion/react-client";
import { Menu, Play, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen bg-black overflow-hidden flex flex-col">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "#000000",
            backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 50% 40%, rgba(255,255,255,0.14) 0.1%, rgba(255,255,255,0.1) 40%, transparent 70%),
            radial-gradient(circle at 20% 10%, rgba(255,255,255,0.8) 1px, transparent 2px),
            radial-gradient(circle at 80% 15%, rgba(255,255,255,0.6) 1px, transparent 2px),
            radial-gradient(circle at 15% 25%, rgba(255,255,255,0.7) 1px, transparent 2px),
            radial-gradient(circle at 75% 8%, rgba(255,255,255,0.5) 1px, transparent 2px),
            radial-gradient(circle at 35% 12%, rgba(255,255,255,0.9) 1px, transparent 2px),
            radial-gradient(circle at 65% 20%, rgba(255,255,255,0.4) 1px, transparent 2px),
            radial-gradient(circle at 90% 25%, rgba(255,255,255,0.6) 1px, transparent 2px),
            radial-gradient(circle at 5% 18%, rgba(255,255,255,0.7) 1px, transparent 2px)
          `,
            backgroundSize:
              "80px 80px, 80px 80px, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
            filter: "blur(0.8px)",
          }}
        />

        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-orange-600/10 rounded-full blur-[80px] sm:blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[20%] right-[-5%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-orange-600/10 rounded-full blur-[80px] sm:blur-[120px] opacity-30" />
        </div>
        <nav className="relative z-50 max-w-6xl w-full mx-auto px-6 pt-6 flex flex-col justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              className="sm:w-12 sm:h-12"
            >
              <path
                d="M 8 12 Q 14 8 24 12 T 40 12"
                stroke="#fb923c"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <rect
                x="12"
                y="20"
                width="24"
                height="2.5"
                rx="1.25"
                fill="#f97316"
              />
              <rect
                x="12"
                y="26"
                width="18"
                height="2.5"
                rx="1.25"
                fill="#ea580c"
              />
              <rect
                x="12"
                y="32"
                width="20"
                height="2.5"
                rx="1.25"
                fill="#dc2626"
              />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-tighter text-white">
              FlowDocs
            </span>
          </motion.div>
          {/* 
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:block"
          >
            <Auth type="minimal" />
          </motion.div> */}
          <div className="w-full bg-amber-50 border-l-4 border-amber-500 px-6 py-3 text-center shadow-sm">
            <p className="text-amber-800 font-medium text-sm">
              Temporarily paused due to llm credit limits. Working on a better, 
              solution. {" "}
              <Link href={"https://www.youtube.com/watch?v=EyPwyjhCJvY"} className="underline">
                Watch demo
              </Link>
            </p>
          </div>
        </nav>

        <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col justify-center items-center flex-grow py-20 min-h-[80vh]">
          <div className="relative text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[0.95] sm:leading-[0.9]"
            >
              Think. Write. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400">
                Done.
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed text-center px-4"
          >
            FlowDocs repairs the bridge between your intent and the page.
            Intelligence-native writing for the modern builder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* <div className="sm:w-auto">
              <Auth type="main" />
            </div> */}

            <Link
              href={"https://www.youtube.com/watch?v=EyPwyjhCJvY"}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant={"ghost"}
                className="w-full sm:w-auto px-8 py-2 sm:rounded border border-white/10 transition-colors text-zinc-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Play size={14} fill="currentColor" /> Watch Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-black border-y-[1px] border-white/10">
        <div className="max-w-6xl mx-auto sm:border-x-[1px] sm:border-white/10 sm:border-double">
          <div className="px-4 py-12 sm:py-20">
            <SectionTwo />
          </div>
        </div>
      </section>

      <section className="bg-black min-h-screen">
        <div className="max-w-6xl mx-auto sm:border-x-[1px] sm:border-white/10 h-full">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
            <Features />
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto sm:border-x-[1px] sm:border-white/10 sm:border-double">
          <div className="max-w-4xl mx-auto items-center flex flex-col px-4 py-10 gap-1">
            <h1 className="text-primary text-2xl tracking-widest">FlowDocs</h1>

            <p className="text-neutral-600">Docs, reimagined</p>
          </div>
        </div>
      </footer>
    </>
  );
}
