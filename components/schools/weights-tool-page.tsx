"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  RotateCcw,
  Calculator,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

import { RatingWeights } from "@/types/schools";
import { SchoolsService } from "@/services/schools.service";
import { defaultWeights } from "@/lib/mock-data";
import { validateWeights, getIndicatorLabel } from "@/lib/rating-utils";

export default function WeightsToolPage() {
  const [weights, setWeights] = useState<RatingWeights>(defaultWeights);
  const [originalWeights, setOriginalWeights] =
    useState<RatingWeights>(defaultWeights);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadWeights();
  }, []);

  useEffect(() => {
    checkForChanges();
    validateCurrentWeights();
  }, [weights]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadWeights = async () => {
    try {
      setLoading(true);
      const weightsData = await SchoolsService.getWeights();
      setWeights(weightsData);
      setOriginalWeights(weightsData);
    } catch (err) {
      console.error("Ошибка при загрузке весов:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkForChanges = () => {
    const changed = Object.keys(weights).some(
      (key) =>
        weights[key as keyof RatingWeights] !==
        originalWeights[key as keyof RatingWeights]
    );
    setHasChanges(changed);
  };

  const validateCurrentWeights = () => {
    const validation = validateWeights(weights);
    setErrors(validation.errors);
  };

  const handleWeightChange = (
    indicator: keyof RatingWeights,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setWeights((prev) => ({
      ...prev,
      [indicator]: Math.max(0, Math.min(100, numValue)),
    }));
  };

  const handleSave = async () => {
    const validation = validateWeights(weights);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);
      await SchoolsService.updateWeights(weights);
      setOriginalWeights({ ...weights });
      setHasChanges(false);
      setErrors([]);

      // Показать уведомление об успехе
      alert("Веса критериев успешно обновлены!");
    } catch (err) {
      console.error("Ошибка при сохранении весов:", err);
      alert("Ошибка при сохранении весов");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWeights({ ...originalWeights });
  };

  const handleResetToDefault = () => {
    setWeights({ ...defaultWeights });
  };

  const autoAdjustWeights = () => {
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    if (totalWeight === 0) return;

    const adjustmentFactor = 100 / totalWeight;
    const adjustedWeights: RatingWeights = {} as RatingWeights;

    Object.keys(weights).forEach((key) => {
      const indicator = key as keyof RatingWeights;
      adjustedWeights[indicator] =
        Math.round(weights[indicator] * adjustmentFactor * 10) / 10;
    });

    // Корректируем погрешности округления
    const newTotal = Object.values(adjustedWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    const diff = 100 - newTotal;
    if (Math.abs(diff) > 0.1) {
      // Добавляем разность к наибольшему весу
      const maxKey = Object.keys(adjustedWeights).reduce((a, b) =>
        adjustedWeights[a as keyof RatingWeights] >
        adjustedWeights[b as keyof RatingWeights]
          ? a
          : b
      ) as keyof RatingWeights;
      adjustedWeights[maxKey] += diff;
    }

    setWeights(adjustedWeights);
  };

  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  const isValidTotal = Math.abs(totalWeight - 100) < 0.1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка настроек весов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Инструмент весов критериев
        </h1>
        <p className="text-xl text-gray-600">
          Настройка весовых коэффициентов для расчета рейтинга школ
        </p>
      </div>

      {/* Информационный блок */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Веса критериев определяют важность каждого показателя в общем рейтинге
          школы. Общая сумма всех весов должна равняться 100. После изменения
          весов будет произведен автоматический пересчет рейтингов всех школ.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Настройка весов */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Редактирование весов критериев</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Общая сумма */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Общая сумма весов:</span>
                  <span
                    className={`font-bold text-lg ${
                      isValidTotal ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {totalWeight.toFixed(1)}
                  </span>
                </div>
                <Progress
                  value={Math.min(totalWeight, 100)}
                  className={`h-3 ${
                    totalWeight > 100 ? "bg-red-100" : "bg-gray-200"
                  }`}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {isValidTotal
                    ? "Сумма корректна"
                    : `Требуется: 100, текущая: ${totalWeight.toFixed(1)}`}
                </p>
              </div>

              {/* Поля ввода весов */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(weights) as Array<keyof RatingWeights>).map(
                  (indicator) => (
                    <div key={indicator} className="space-y-2">
                      <Label
                        htmlFor={indicator}
                        className="flex items-center gap-2"
                      >
                        <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {indicator}
                        </span>
                        <span className="text-sm">
                          {getIndicatorLabel(indicator)}
                        </span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={indicator}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={weights[indicator]}
                          onChange={(e) =>
                            handleWeightChange(indicator, e.target.value)
                          }
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-8">%</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{
                            width: `${Math.min(weights[indicator], 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Ошибки валидации */}
              {errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-red-700">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Кнопки управления */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={!isValidTotal || saving || !hasChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Сохранение..." : "Сохранить веса"}
                </Button>

                <Button
                  variant="outline"
                  onClick={autoAdjustWeights}
                  disabled={totalWeight === 0}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Автокоррекция до 100%
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Отменить изменения
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Сбросить к умолчанию
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель с информацией */}
        <div className="space-y-6">
          {/* Текущее состояние */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Текущее состояние</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {isValidTotal ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={isValidTotal ? "text-green-700" : "text-red-700"}
                >
                  {isValidTotal ? "Веса корректны" : "Требуется корректировка"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Общая сумма:</span>
                  <span className="font-medium">{totalWeight.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Изменения:</span>
                  <span
                    className={
                      hasChanges ? "text-orange-600" : "text-green-600"
                    }
                  >
                    {hasChanges ? "Есть несохраненные" : "Сохранено"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Описание критериев */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Описание критериев</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(weights) as Array<keyof RatingWeights>).map(
                (indicator) => (
                  <div key={indicator} className="text-sm">
                    <div className="font-medium flex items-center gap-2 mb-1">
                      <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded text-xs">
                        {indicator}
                      </span>
                      <span>{weights[indicator].toFixed(1)}%</span>
                    </div>
                    <p className="text-gray-600 text-xs">
                      {getIndicatorLabel(indicator)}
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Веса по умолчанию */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Веса по умолчанию</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.keys(defaultWeights) as Array<keyof RatingWeights>).map(
                (indicator) => (
                  <div key={indicator} className="flex justify-between text-sm">
                    <span className="font-mono">{indicator}:</span>
                    <span>{defaultWeights[indicator]}%</span>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
