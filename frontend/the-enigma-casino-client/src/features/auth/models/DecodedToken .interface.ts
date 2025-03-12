export interface DecodedToken {
  id: number;
  name: string;
  image: string;
  role: string;
  exp?: number;
  iat?: number;
}
