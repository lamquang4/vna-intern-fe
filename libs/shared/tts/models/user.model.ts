export type Gender = "MALE" | "FEMALE";

// request
export interface UpdateUserRequest {
  fullname: string;
  birthDate?: string | null;
  gender?: Gender | null;
  position?: string | null;
  roleId: string;
  province?: string | null;
  ward?: string | null;
  address?: string | null;
  isActive: boolean;
  avatar?: File | null;
}

export interface UpdateMeRequest {
  fullname: string;
  birthDate?: string | null;
  gender?: Gender | null;
  position?: string | null;
  roleId: string;
  province?: string | null;
  ward?: string | null;
  address?: string | null;
  avatar?: File | null;
}

export interface CreateUserRequest {
  username: string;
  fullname: string;
  password: string;
  birthDate?: string | null;
  gender?: Gender | null;
  position?: string | null;
  roleId: string;
  email: string;
  province?: string | null;
  ward?: string | null;
  address?: string | null;
  isActive: boolean;
  avatar?: File | null;
}

export interface DeleteUserRequest {
  userIds: string[];
}

// response
export interface UserDetailResponse {
  username: string;
  fullname: string;
  avatarUrl: string | null;
  birthDate: string | null;
  gender: Gender | null;
  position: string | null;
  roleId: string;
  email: string;
  province: string | null;
  ward: string | null;
  address: string | null;
  isActive: boolean;
}

export interface UserResponse {
  userId: string;
  fullname: string;
  username: string;
  email: string;
  roleName: string;
  position: string;
  isActive: boolean;
}
