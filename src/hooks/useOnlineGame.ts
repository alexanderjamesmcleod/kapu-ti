'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { MultiplayerGame, Player, TableSlot } from '@/types/multiplayer.types';
import { getSentenceFromSlots } from '@/types/multiplayer.types';

// Deserialize game state from wire format (convert Array back to Set)
function deserializeGame(wireGame: unknown): MultiplayerGame {
  const game = wireGame as MultiplayerGame & {
    turnState: { colorsPlayedThisTurn: string[] | Set<string> }
  };
  return {
    ...game,
    turnState: {
      ...game.turnState,
      colorsPlayedThisTurn: Array.isArray(game.turnState.colorsPlayedThisTurn)
        ? new Set(game.turnState.colorsPlayedThisTurn)
        : game.turnState.colorsPlayedThisTurn,
    },
  };
}

// Types for server messages
interface RoomPlayer {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  isReady: boolean;
}

// Chat message type (matches server)
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  isReaction: boolean;
  timestamp: number;
}

type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; players: RoomPlayer[] }
  | { type: 'PLAYER_JOINED'; player: RoomPlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'PLAYER_READY'; playerId: string; ready: boolean }
  | { type: 'GAME_STARTED'; game: MultiplayerGame; yourPlayerId: string }
  | { type: 'GAME_STATE'; game: MultiplayerGame }
  | { type: 'CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'ERROR'; message: string }
  | { type: 'PONG' }
  // Voice chat messages
  | { type: 'VOICE_SIGNAL'; fromPlayerId: string; signal: unknown }
  | { type: 'VOICE_PEER_JOINED'; playerId: string; playerName: string }
  | { type: 'VOICE_PEER_LEFT'; playerId: string }
  | { type: 'VOICE_MUTE_CHANGED'; playerId: string; isMuted: boolean };

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type LobbyState = 'idle' | 'inRoom' | 'inGame';

// Voice event handlers type
export interface VoiceEventHandlers {
  onVoiceSignal?: (fromPlayerId: string, signal: unknown) => void;
  onVoicePeerJoined?: (playerId: string, playerName: string) => void;
  onVoicePeerLeft?: (playerId: string) => void;
  onVoiceMuteChanged?: (playerId: string, isMuted: boolean) => void;
}

interface UseOnlineGameReturn {
  // Connection state
  connectionState: ConnectionState;
  error: string | null;

  // Lobby state
  lobbyState: LobbyState;
  roomCode: string | null;
  playerId: string | null;
  players: RoomPlayer[];
  isHost: boolean;

  // Game state
  game: MultiplayerGame | null;
  currentPlayer: Player | null;
  currentSentence: string;
  isMyTurn: boolean;

  // Chat state
  chatMessages: ChatMessage[];

  // Lobby actions
  connect: (serverUrl?: string) => void;
  disconnect: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  addBot: (botName?: string) => void;
  startGame: () => void;

  // Game actions
  playCard: (cardId: string, slotId: string) => void;
  createSlot: (cardId: string) => void;
  submitTurn: (spoken: string, translation: string) => void;
  vote: (approved: boolean) => void;
  passTurn: () => void;
  undoLastCard: () => void;
  confirmTurnEnd: () => void;

  // Chat actions
  sendChat: (content: string) => void;
  sendReaction: (emoji: string) => void;

  // Voice chat support
  sendMessage: (message: object) => void;
  setVoiceHandlers: (handlers: VoiceEventHandlers) => void;
}

export function useOnlineGame(): UseOnlineGameReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const voiceHandlersRef = useRef<VoiceEventHandlers>({});

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Lobby state
  const [lobbyState, setLobbyState] = useState<LobbyState>('idle');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);

  // Game state
  const [game, setGame] = useState<MultiplayerGame | null>(null);

  // Chat state (keep last 50 messages)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Computed values
  const isHost = useMemo(() => {
    if (!playerId || players.length === 0) return false;
    return players.find(p => p.id === playerId)?.isHost ?? false;
  }, [playerId, players]);

  const currentPlayer = useMemo(() => {
    if (!game || !playerId) return null;
    return game.players.find(p => p.id === playerId) ?? null;
  }, [game, playerId]);

  const currentSentence = useMemo(() => {
    if (!game) return '';
    return getSentenceFromSlots(game.tableSlots);
  }, [game]);

  const isMyTurn = useMemo(() => {
    if (!game || !playerId) return false;
    return game.players[game.currentPlayerIndex]?.id === playerId;
  }, [game, playerId]);

  // Send message to server
  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: ServerMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'ROOM_CREATED':
          setRoomCode(message.roomCode);
          setPlayerId(message.playerId);
          setPlayers([{
            id: message.playerId,
            name: '',
            socketId: '',
            isHost: true,
            isReady: true,
          }]);
          setLobbyState('inRoom');
          setError(null);
          break;

        case 'ROOM_JOINED':
          setRoomCode(message.roomCode);
          setPlayerId(message.playerId);
          setPlayers(message.players);
          setLobbyState('inRoom');
          setError(null);
          break;

        case 'PLAYER_JOINED':
          setPlayers(prev => [...prev, message.player]);
          break;

        case 'PLAYER_LEFT':
          setPlayers(prev => prev.filter(p => p.id !== message.playerId));
          break;

        case 'PLAYER_READY':
          setPlayers(prev => prev.map(p =>
            p.id === message.playerId ? { ...p, isReady: message.ready } : p
          ));
          break;

        case 'GAME_STARTED':
          setGame(deserializeGame(message.game));
          setPlayerId(message.yourPlayerId);
          setLobbyState('inGame');
          break;

        case 'GAME_STATE':
          setGame(deserializeGame(message.game));
          break;

        case 'CHAT_MESSAGE':
          setChatMessages(prev => [...prev.slice(-49), message.message]);
          break;

        case 'ERROR':
          setError(message.message);
          break;

        case 'PONG':
          // Heartbeat response - connection is alive
          break;

        // Voice chat messages
        case 'VOICE_SIGNAL':
          voiceHandlersRef.current.onVoiceSignal?.(message.fromPlayerId, message.signal);
          break;

        case 'VOICE_PEER_JOINED':
          voiceHandlersRef.current.onVoicePeerJoined?.(message.playerId, message.playerName);
          break;

        case 'VOICE_PEER_LEFT':
          voiceHandlersRef.current.onVoicePeerLeft?.(message.playerId);
          break;

        case 'VOICE_MUTE_CHANGED':
          voiceHandlersRef.current.onVoiceMuteChanged?.(message.playerId, message.isMuted);
          break;
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  }, []);

  // Connect to server
  const connect = useCallback((serverUrl: string = 'ws://localhost:3002') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    setError(null);

    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connected');
      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        send({ type: 'PING' });
      }, 30000);
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      setConnectionState('error');
      setError('Connection error');
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      setLobbyState('idle');
      setRoomCode(null);
      setPlayerId(null);
      setPlayers([]);
      setGame(null);
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [handleMessage, send]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Lobby actions
  const createRoom = useCallback((playerName: string) => {
    send({ type: 'CREATE_ROOM', playerName });
  }, [send]);

  const joinRoom = useCallback((code: string, playerName: string) => {
    send({ type: 'JOIN_ROOM', roomCode: code.toUpperCase(), playerName });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: 'LEAVE_ROOM' });
    setLobbyState('idle');
    setRoomCode(null);
    setPlayerId(null);
    setPlayers([]);
    setGame(null);
    setChatMessages([]);
  }, [send]);

  const setReady = useCallback((ready: boolean) => {
    send({ type: 'SET_READY', ready });
  }, [send]);

  const addBot = useCallback((botName?: string) => {
    send({ type: 'ADD_BOT', botName });
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: 'START_GAME' });
  }, [send]);

  // Game actions
  const playCard = useCallback((cardId: string, slotId: string) => {
    send({ type: 'PLAY_CARD', cardId, slotId });
  }, [send]);

  const createSlot = useCallback((cardId: string) => {
    send({ type: 'CREATE_SLOT', cardId });
  }, [send]);

  const submitTurn = useCallback((spoken: string, translation: string) => {
    send({ type: 'SUBMIT_TURN', spoken, translation });
  }, [send]);

  const vote = useCallback((approved: boolean) => {
    send({ type: 'VOTE', approved });
  }, [send]);

  const passTurn = useCallback(() => {
    send({ type: 'PASS_TURN' });
  }, [send]);

  const undoLastCard = useCallback(() => {
    send({ type: 'UNDO' });
  }, [send]);

  const confirmTurnEnd = useCallback(() => {
    send({ type: 'CONFIRM_TURN_END' });
  }, [send]);

  // Chat actions
  const sendChat = useCallback((content: string) => {
    if (content.trim()) {
      send({ type: 'CHAT', content: content.trim() });
    }
  }, [send]);

  const sendReaction = useCallback((emoji: string) => {
    send({ type: 'REACTION', emoji });
  }, [send]);

  // Voice chat support
  const setVoiceHandlers = useCallback((handlers: VoiceEventHandlers) => {
    voiceHandlersRef.current = handlers;
  }, []);

  return {
    // Connection state
    connectionState,
    error,

    // Lobby state
    lobbyState,
    roomCode,
    playerId,
    players,
    isHost,

    // Game state
    game,
    currentPlayer,
    currentSentence,
    isMyTurn,

    // Lobby actions
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    addBot,
    startGame,

    // Game actions
    playCard,
    createSlot,
    submitTurn,
    vote,
    passTurn,
    undoLastCard,
    confirmTurnEnd,

    // Chat
    chatMessages,
    sendChat,
    sendReaction,

    // Voice chat support
    sendMessage: send,
    setVoiceHandlers,
  };
}
