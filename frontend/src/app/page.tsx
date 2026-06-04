import { Header } from "@/components/header";
import { MatchList } from "@/components/match-list";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-8">
        <MatchList />
      </main>
    </div>
  );
}
