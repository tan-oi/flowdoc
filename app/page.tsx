import { Auth } from "@/components/auth-modal";
import { Features } from "@/components/features";
import { SectionTwo } from "@/components/landing-section-two";

import * as motion from "motion/react-client";
import { Play } from "lucide-react";
export default function Home() {
  const texts = [
    "write with intelligence",
    "make docs that react",
    "stop wrestling tools",
    "write in a flash",
  ];
  return (
    <>
      <section className="relative min-h-screen bg-black overflow-hidden">
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
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] opacity-30" />
        </div>

        <nav className="relative z-10 max-w-6xl mx-auto px-6 pt-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
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
            <span className="text-xl font-bold tracking-tighter text-white">
              Flowdocs
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Auth type="minimal" />
          </motion.div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col justify-center items-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          ></motion.div>

          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white max-w-5xl leading-[0.9] relative z-10 text-center"
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
            className="mt-8 text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed text-center"
          >
            FlowDocs repairs the bridge between your intent and the page.
            Intelligence-native writing for the modern builder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <Auth type="main" />
            <a
              href="https://youtu.be/EyPwyjhCJvY?si=NLjzGacbKwyacW4s"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-2 rounded border border-white/10 hover:bg-white/5 transition-colors text-zinc-300 flex items-center gap-2"
            >
              <Play size={14} fill="currentColor" /> Watch Demo
            </a>
          </motion.div>
        </div>
      </section>

      <section className="bg-black min-h-screen border-y-[3px]">
        <div className="max-w-5xl mx-auto backdrop-blur-md border-x-[3px] border-double">
          <div className="max-w-4xl mx-auto px-4 py-20">
            <SectionTwo />
          </div>
        </div>
      </section>

      <section className="bg-black min-h-screen">
        <div className="max-w-5xl mx-auto border-x-[3px] h-full">
          <div className="max-w-4xl mx-auto px-4 py-10">
            <Features />
          </div>
        </div>
      </section>

      <footer className="bg-black border-y-[3px]">
        <div className="max-w-5xl mx-auto border-x-[3px] border-double">
          <div className="max-w-4xl mx-auto items-center flex flex-col px-4 py-10 gap-1">
            <h1 className="text-primary text-2xl tracking-widest">FlowDocs</h1>

            <p className="text-neutral-600">Docs, reimagined</p>
          </div>
        </div>
      </footer>
    </>
  );
}
