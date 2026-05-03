import { httpClient } from "./client";

export interface UserProfile {
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

class UserService {
  async getProfile(): Promise<UserProfile> {
    const response = await httpClient.get("/users/profile");
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await httpClient.put("/users/profile", data);
  }

  async updateAddress(data: UpdateAddressRequest): Promise<void> {
    await httpClient.put("/users/profile/address", data);
  }

  async updateAvatar(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    await httpClient.post("/users/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export const userService = new UserService();
