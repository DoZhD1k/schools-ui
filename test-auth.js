console.log("Testing authentication...");

// Test localStorage token
const token = localStorage.getItem("accessToken");
console.log(
  "Token from localStorage:",
  token ? token.substring(0, 20) + "..." : "null"
);

// Test making a request to the API
fetch(
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring/academic-performance2023-2024/?limit=1",
  {
    headers: {
      Authorization: token ? `Token ${token}` : "",
      "Content-Type": "application/json",
    },
  }
)
  .then((response) => {
    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    return response.json();
  })
  .then((data) => {
    console.log("Response data:", data);
  })
  .catch((error) => {
    console.error("Request error:", error);
  });
