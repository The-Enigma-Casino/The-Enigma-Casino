export interface UpdateUserPayload {
  nickName: string;
  fullName: string;
  email: string;
  address: string;
  country: string;
}

export interface UpdatePasswordPayload {
  password: string;
  confirmPassword: string;
}
