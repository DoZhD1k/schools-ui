"use client";

import dynamic from "next/dynamic";

// Динамически импортируем карту, чтобы избежать проблем с серверным рендерингом
const MapContainerWithNoSSR = dynamic(
  () => import("@/components/map/MapContainer"),
  { ssr: false }
);

export default function DemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex-col items-center">
        <h1 className="text-4xl font-bold">Datapolis Demo</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Интерактивная демонстрация ключевых возможностей картографического
          модуля платформы
        </p>
      </div>

      <div className="h-[500px] w-full border rounded-md overflow-hidden">
        <MapContainerWithNoSSR />
      </div>
    </div>
  );
}
