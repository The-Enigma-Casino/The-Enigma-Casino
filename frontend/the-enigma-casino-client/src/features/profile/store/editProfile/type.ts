export interface UpdateUserPayload {
  nickName: string;
  fullname: string;
  email: string;
  address: string;
  country: string;
}

export interface UpdatePasswordPayload {
  password: string;
  confirmPassword: string;
}
