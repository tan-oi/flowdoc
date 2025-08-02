import { Auth } from "@/components/auth-modal";
import { Features } from "@/components/features";
import { SectionTwo } from "@/components/landing-section-two";
import { ModeToggle } from "@/components/mode-toggle";
import TextRotate from "@/components/ui/text-rotate";

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

        <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col justify-center items-center min-h-screen">
          <div className="flex flex-col justify-center items-center gap-4 text-white tracking-wide">
            <div className="flex flex-col items-center justify-center gap-2 text-center lg:text-left">
              <p className="text-xl sm:text-2xl lg:text-4xl font-semibold text-foreground">
                Docs are{" "}
                <span className="line-through text-gray-400">broken</span>
              </p>

              <div className="flex items-center gap-1">
                <p className="text-md sm:text-xl lg:text-3xl font-semibold">
                  its time to
                </p>
                <TextRotate
                  texts={texts}
                  mainClassName="text-sm sm:text-xl lg:text-3xl bg-orange-500 font-semibold px-1 py-1 rounded"
                />
              </div>
            </div>

            <p className="text-sm sm:text-md md:text-lg text-muted-foreground text-center max-w-2xl">
              The newest way to write documents!
            </p>
            <p className="text-xs md:text-lg text-accent-foreground font-medium mb-3">
              Think. Write. Done.
            </p>
          </div>

          {/* <Button
            size="sm"
            className="mt-3 bg-card hover:bg-card/40 shadow-md text-white px-8 py-3"
          >
            Try it now!
          </Button> */}
          <Auth />
          {/* <ModeToggle/> */}
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
