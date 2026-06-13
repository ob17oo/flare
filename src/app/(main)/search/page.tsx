import { SearchPageView } from "@/views";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        <p className="text-[14px] text-[var(--text-secondary)]">Инициализация поиска...</p>
      </div>
    }>
      <SearchPageView />
    </Suspense>
  );
}
