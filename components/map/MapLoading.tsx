import { Loader2 } from "lucide-react";

export default function MapLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h3 className="text-sm font-medium uppercase tracking-wide">
          Loading map data
        </h3>
      </div>
    </div>
  );
}
