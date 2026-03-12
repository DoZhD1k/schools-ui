// Временный скрипт для проверки доступности API endpoints
// Выполните этот код в консоли браузера

const API_BASE_URL =
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring";

async function checkApiEndpoints() {
  const endpoints = [
    `${API_BASE_URL}/school-rating/login/`,
    `${API_BASE_URL}/auth/login/`,
    `${API_BASE_URL}/login/`,
    `${API_BASE_URL}/school-rating/auth/login/`,
  ];

  console.log("🔍 Checking API endpoints availability...");

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.com",
          password: "test123",
        }),
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (response.status !== 404) {
        console.log("✅ Endpoint exists!");

        // Если не 404, попробуем получить содержимое ответа
        try {
          const data = await response.json();
          console.log("Response data:", data);
        } catch (e) {
          console.log("Response is not JSON");
        }
      } else {
        console.log("❌ Endpoint not found (404)");
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error);
    }
  }

  // Также проверим базовый URL
  try {
    console.log(`\n📡 Testing base URL: ${API_BASE_URL}/`);
    const response = await fetch(`${API_BASE_URL}/`);
    console.log(`Base URL Status: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error("❌ Error testing base URL:", error);
  }
}

checkApiEndpoints();
