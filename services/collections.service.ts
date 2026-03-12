import { CollectionList } from "@/types/admin";
import { handleApiError } from "@/utils/api-errors";

export class CollectionsService {
  /**
   * Fetch all collections
   */
  static async getCollections(accessToken: string): Promise<CollectionList[]> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/admin/collections", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to load collections");
    }
  }

  /**
   * Upload a new GeoJSON collection
   */
  static async uploadGeoJSON(
    accessToken: string,
    data: {
      name: string;
      description: string;
      file: File;
    }
  ): Promise<{ message: string; collection: CollectionList }> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.name);
      formData.append("description", data.description);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "Failed to upload GeoJSON file");
    }
  }
}
