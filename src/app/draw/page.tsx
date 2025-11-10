import NavBar from "@/components/NavBar";
import TrackVisits from "@/components/TrackVisits";
import CanvasDraw from "@/components/CanvasDraw";
import { cookies } from "next/headers";

export default async function DrawPage() {
  const lang = (await cookies()).get("lang")?.value;
  return (
    <div className="min-h-screen">
      <NavBar initialLang={lang} />
      <TrackVisits />
      <main className="pt-20 px-6">
        <h1 className="text-white text-2xl font-semibold mb-4 drop-shadow">绘画页</h1>
        <CanvasDraw />
      </main>
    </div>
  );
}
