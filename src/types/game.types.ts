// Multiplayer game types
export interface MultiplayerGame {
  id: string;
  gameCode: string;
  gameType: 'realtime' | 'turn_based' | 'co_op';
  difficulty: string;
  creatorId: string;
  playerIds: string[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  currentTurnUserId?: string;
  gameState: any;
  winnerId?: string;
  scores: Record<string, number>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  turnsTaken: number;
}

export interface GameMove {
  gameId: string;
  userId: string;
  cardId: string;
  position: number;
  timestamp: Date;
}

export interface GameResult {
  gameId: string;
  winnerId: string;
  scores: Record<string, number>;
  duration: number;
}
