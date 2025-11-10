/**
 * API Test Component
 * Компонент для тестирования подключения к School Rating API
 */

"use client";

import { useState } from "react";
import { schoolRatingApiService } from "@/services/school-rating-api.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestResult {
  id: number;
  name: string;
  success: boolean;
  data: Record<string, unknown>;
  timestamp: string;
}

export default function ApiTestComponent() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "admin@test.com",
    password: "admin123456",
  });

  const addTestResult = (name: string, success: boolean, data: unknown) => {
    setTestResults((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        success,
        data: data as Record<string, unknown>,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const result = await schoolRatingApiService.login(credentials);
      addTestResult("Login Test", result.success, result);

      if (result.success && result.data) {
        // Сохраним токен в localStorage для дальнейших тестов
        localStorage.setItem("testToken", result.data.token);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addTestResult("Login Test", false, { error: errorMessage });
    }
    setIsLoading(false);
  };

  const testGetRoles = async () => {
    setIsLoading(true);
    try {
      const result = await schoolRatingApiService.getRoles();
      addTestResult("Get Roles Test", result.success, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addTestResult("Get Roles Test", false, { error: errorMessage });
    }
    setIsLoading(false);
  };

  const testGetUsers = async () => {
    setIsLoading(true);
    try {
      const result = await schoolRatingApiService.getUsers();
      addTestResult("Get Users Test", result.success, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addTestResult("Get Users Test", false, { error: errorMessage });
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>School Rating API Tester</CardTitle>
          <CardDescription>
            Тестирование подключения к{" "}
            {process.env.NEXT_PUBLIC_SCHOOL_RATING_API_URL}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="admin@test.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="password123"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={testLogin} disabled={isLoading} variant="default">
              Test Login
            </Button>
            <Button
              onClick={testGetRoles}
              disabled={isLoading}
              variant="outline"
            >
              Test Get Roles
            </Button>
            <Button
              onClick={testGetUsers}
              disabled={isLoading}
              variant="outline"
            >
              Test Get Users
            </Button>
            <Button onClick={clearResults} variant="destructive" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "SUCCESS" : "FAILED"}
                      </Badge>
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
