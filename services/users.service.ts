import { userList } from "@/types/admin";
import { handleApiError } from "@/utils/api-errors";

export class UsersService {
  /**
   * Fetch all users
   */
  static async getUsers(accessToken: string): Promise<userList[]> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to load users");
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(
    data: {
      username: string;
      email: string;
      password: string;
      role: string;
    },
    accessToken: string
  ): Promise<userList> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to register user");
    }
  }

  /**
   * Deactivate a user
   */
  static async deactivateUser(
    userId: number | string,
    accessToken: string
  ): Promise<userList> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deactivate" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to deactivate user");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to deactivate user");
    }
  }

  /**
   * Activate a user
   */
  static async activateUser(
    userId: number | string,
    accessToken: string
  ): Promise<userList> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "activate" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to activate user");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to activate user");
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(
    userId: number | string,
    accessToken: string
  ): Promise<{ message: string }> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to delete user");
    }
  }
}
