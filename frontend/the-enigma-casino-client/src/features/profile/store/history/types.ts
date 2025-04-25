export interface OtherUserProfile {
  nickname: string;
  country: string;
  image: string;
  relation: "friend" | "stranger";
}

export interface GameDto {
  id: number;
  joinedAt: string;
  gameType: number;
  chipResult: number;
}

export interface HistoryResponse {
  gamesDtos: GameDto[];
  totalPages: number;
  page: number;
}
