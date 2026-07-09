import { Header } from "@/components/header";
import { MatchList } from "@/components/match-list";

export default function Home() {
  return (
    <div className="sl-app">
      <Header />
      <MatchList />
    </div>
  );
}
