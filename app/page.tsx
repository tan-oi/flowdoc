
import { Auth } from "@/components/auth-modal";
import { ModeToggle } from "@/components/mode-toggle";


export default function Home() {
  return (
    <>

    <ModeToggle/>
    <Auth/>
    <div className="flex items-center justify-center h-full">
       Docs that understand, and do the jobs
      </div>
    
    </>
  )
}
