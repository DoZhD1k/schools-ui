"use client";

import { useEffect, useState } from "react";
import { SchoolsMapService } from "@/services/schools-map.service";
import type { SchoolFeature } from "@/types/schools-map";

interface SchoolsDebugProps {
  onClose: () => void;
}

export default function SchoolsDebug({ onClose }: SchoolsDebugProps) {
  const [schools, setSchools] = useState<SchoolFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await SchoolsMapService.fetchSchools();
        setSchools(data);
        console.log("🔍 Schools Debug Data:", data.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div>Загрузка школ...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h3 className="text-red-600 font-bold mb-2">Ошибка</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Закрыть
          </button>
        </div>
      </div>
    );

  const withColors = schools.filter((s) => s.properties.circle_color).length;
  const withRadius = schools.filter((s) => s.properties.circle_radius).length;
  const sampleSchool = schools[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">🔍 Отладка данных школ</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <strong>Всего школ:</strong> {schools.length}
          </div>

          <div>
            <strong>С API цветами:</strong> {withColors} (
            {Math.round((withColors / schools.length) * 100)}%)
          </div>

          <div>
            <strong>С API радиусом:</strong> {withRadius} (
            {Math.round((withRadius / schools.length) * 100)}%)
          </div>

          {sampleSchool && (
            <div className="border-t pt-4">
              <strong>Пример первой школы:</strong>
              <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-xs">
                <div>
                  <strong>Название:</strong>{" "}
                  {sampleSchool.properties.organization_name}
                </div>
                <div>
                  <strong>Район:</strong> {sampleSchool.properties.district}
                </div>
                <div>
                  <strong>Координаты:</strong> [
                  {sampleSchool.geometry.coordinates.join(", ")}]
                </div>
                <div>
                  <strong>Цвет API:</strong>{" "}
                  <span style={{ color: sampleSchool.properties.circle_color }}>
                    ●
                  </span>{" "}
                  {sampleSchool.properties.circle_color}
                </div>
                <div>
                  <strong>Радиус API:</strong>{" "}
                  {sampleSchool.properties.circle_radius}px
                </div>
                <div>
                  <strong>Статус:</strong>{" "}
                  {sampleSchool.properties.overload_status}
                </div>
                <div>
                  <strong>Рейтинг:</strong> {sampleSchool.properties.rating}
                </div>
                <div>
                  <strong>Частная:</strong>{" "}
                  {sampleSchool.properties.is_private ? "Да" : "Нет"}
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <strong>Распределение цветов:</strong>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Array.from(
                new Set(schools.map((s) => s.properties.circle_color))
              )
                .filter(Boolean)
                .slice(0, 10)
                .map((color) => (
                  <div key={color} className="flex items-center text-xs">
                    <span style={{ color }} className="mr-2">
                      ●
                    </span>
                    <span className="font-mono">{color}</span>
                    <span className="ml-auto">
                      (
                      {
                        schools.filter(
                          (s) => s.properties.circle_color === color
                        ).length
                      }
                      )
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
