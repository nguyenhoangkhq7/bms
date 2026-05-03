import { httpClient } from "./client";

export interface UserProfileDetail {
  id: number;
  username: string;
  email: string;
  fullName: string;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  ward: string | null;
  district: string | null;
  cityProvince: string | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  dateOfBirth: string | null;
}

export interface UpdateAddressRequest {
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  cityProvince: string;
}

export const userApi = {
  getProfile: async (): Promise<UserProfileDetail> => {
    const response = await httpClient.get<UserProfileDetail>("/users/profile");
    return response.data;
  },

  updateProfile: async (
    payload: UpdateProfileRequest,
  ): Promise<UserProfileDetail> => {
    const response = await httpClient.put<UserProfileDetail>(
      "/users/profile",
      payload,
    );
    return response.data;
  },

  updateAddress: async (
    payload: UpdateAddressRequest,
  ): Promise<UserProfileDetail> => {
    const response = await httpClient.put<UserProfileDetail>(
      "/users/profile/address",
      payload,
    );
    return response.data;
  },

  updateAvatar: async (fileUri: string): Promise<UserProfileDetail> => {
    const filename = fileUri.split("/").pop() || `avatar_${Date.now()}.jpg`;
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await httpClient.post<UserProfileDetail>(
      "/users/profile/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  removeAvatar: async (): Promise<UserProfileDetail> => {
    const response = await httpClient.delete<UserProfileDetail>(
      "/users/profile/avatar",
    );
    return response.data;
  },
};
