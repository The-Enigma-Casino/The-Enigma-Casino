export interface Player {
  name: string;
  avatar?: string;
  userId?: number;
}

  
  export interface GameTable {
    id: number;
    name: string;
    maxPlayer: number;
    players: (Player | null)[];
    state: string;
  }
  