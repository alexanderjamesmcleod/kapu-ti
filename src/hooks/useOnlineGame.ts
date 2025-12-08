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

// Public room info for browsing
export interface PublicRoomInfo {
  code: string;
  playerCount: number;
  maxPlayers: number;
  hasGame: boolean;
  hostName: string;
}

type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; players: RoomPlayer[] }
  | { type: 'GAME_FOUND'; roomCode: string; playerId: string; players: RoomPlayer[]; game: MultiplayerGame | null; waiting: boolean }
  | { type: 'ROOM_LIST'; rooms: PublicRoomInfo[] }
  | { type: 'PLAYER_JOINED'; player: RoomPlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'PLAYER_READY'; playerId: string; ready: boolean }
  | { type: 'CHILL_MODE_CHANGED'; enabled: boolean }
  | { type: 'GAME_STARTED'; game: MultiplayerGame; yourPlayerId: string }
  | { type: 'GAME_STATE'; game: MultiplayerGame }
  | { type: 'CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'ERROR'; message: string }
  | { type: 'PONG' }
  // Turn timer and reconnection
  | { type: 'TURN_TIMER_UPDATE'; playerId: string; timeRemaining: number }
  | { type: 'TURN_TIMEOUT'; playerId: string; autoSkipped: boolean }
  | { type: 'PLAYER_DISCONNECTED'; playerId: string; playerName: string }
  | { type: 'PLAYER_RECONNECTED'; playerId: string; playerName: string }
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
  isWaitingForPlayers: boolean;  // Waiting for more players to auto-start
  chillMode: boolean;  // When true, no turn timers

  // Turn timer state
  turnTimeRemaining: number | null;  // Seconds left, null when not active
  currentTurnPlayerId: string | null;  // Who the timer is counting for

  // Game state
  game: MultiplayerGame | null;
  currentPlayer: Player | null;
  currentSentence: string;
  isMyTurn: boolean;

  // Chat state
  chatMessages: ChatMessage[];

  // Public rooms for browsing
  publicRooms: PublicRoomInfo[];

  // Lobby actions
  connect: (serverUrl?: string) => void;
  disconnect: () => void;
  findGame: (playerName: string) => void;  // Auto-matchmaking
  listRooms: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  setChillMode: (enabled: boolean) => void;  // Host only - toggle turn timers
  addBot: (botName?: string) => void;
  startGame: () => void;

  // Game actions
  revealTurnOrderCard: () => void;
  selectTopic: (topicId: string) => void;
  playCard: (cardId: string, slotId: string) => void;
  stackCard: (cardId: string, slotId: string) => void;  // Stack on occupied slot (any player)
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

// Get the default WebSocket server URL with smart detection
function getDefaultServerUrl(): string {
  // 1. Check env var first (set in .env.local or at build time)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  // 2. Auto-detect based on current window location (for cloudflared/ngrok/etc)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Check if there's a WS URL in sessionStorage (set by user)
    const savedUrl = sessionStorage.getItem('kaputi_ws_url');
    if (savedUrl) {
      return savedUrl;
    }
    // User needs to enter the WS tunnel URL manually via server config
  }

  // 3. Default for local development
  return 'ws://localhost:3102';
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
  const [isWaitingForPlayers, setIsWaitingForPlayers] = useState(false);
  const [chillMode, setChillModeState] = useState(false);

  // Game state
  const [game, setGame] = useState<MultiplayerGame | null>(null);

  // Turn timer state
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number | null>(null);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);

  // Chat state (keep last 50 messages)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Public rooms for browsing
  const [publicRooms, setPublicRooms] = useState<PublicRoomInfo[]>([]);

  // Computed values
  const isHost = useMemo(() => {
    if (!playerId || players.length === 0) return false;
    return players.find(p => p.id === playerId)?.isHost ?? false;
  }, [playerId, players]);

  const currentPlayer = useMemo(() => {
    if (!game || !playerId) {
      // Only log if playerId exists but game doesn't (indicates potential issue)
      if (playerId && !game) {
        console.warn('[Kapu Ti] Player has ID but no game state - may need reconnect');
      }
      return null;
    }
    const found = game.players.find(p => p.id === playerId);
    if (!found) {
      console.error('[Kapu Ti] Player not found in game!', {
        playerId,
        gamePlayerIds: game.players.map(p => p.id)
      });
    }
    return found ?? null;
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
          setIsWaitingForPlayers(false);
          setError(null);
          break;

        case 'GAME_FOUND':
          // Auto-matchmaking response
          setRoomCode(message.roomCode);
          setPlayerId(message.playerId);
          setPlayers(message.players);
          setIsWaitingForPlayers(message.waiting);
          if (message.game) {
            // Joined mid-game
            setGame(deserializeGame(message.game));
            setLobbyState('inGame');
          } else {
            setLobbyState('inRoom');
          }
          setError(null);
          console.log(`[Kapu Ti] Game found: ${message.roomCode}, waiting: ${message.waiting}`);
          break;

        case 'ROOM_LIST':
          setPublicRooms(message.rooms);
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

        case 'CHILL_MODE_CHANGED':
          setChillModeState(message.enabled);
          console.log(`[Kapu Ti] Chill mode ${message.enabled ? 'enabled' : 'disabled'}`);
          break;

        case 'GAME_STARTED':
          console.log('[Kapu Ti] Game started!', {
            phase: message.game?.phase,
            players: message.game?.players?.length
          });
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

        // Turn timer messages
        case 'TURN_TIMER_UPDATE':
          setTurnTimeRemaining(message.timeRemaining);
          setCurrentTurnPlayerId(message.playerId);
          break;

        case 'TURN_TIMEOUT':
          console.log('[Kapu Ti] Turn timeout:', message.playerId, 'auto-skipped:', message.autoSkipped);
          // Timer will be reset by next GAME_STATE
          setTurnTimeRemaining(null);
          break;

        // Reconnection messages
        case 'PLAYER_DISCONNECTED':
          console.log('[Kapu Ti] Player disconnected:', message.playerName);
          // Update player list to show disconnected state
          setPlayers(prev => prev.map(p =>
            p.id === message.playerId ? { ...p, isReady: false } : p
          ));
          break;

        case 'PLAYER_RECONNECTED':
          console.log('[Kapu Ti] Player reconnected:', message.playerName);
          setPlayers(prev => prev.map(p =>
            p.id === message.playerId ? { ...p, isReady: true } : p
          ));
          break;
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  }, []);

  // Connect to server
  const connect = useCallback((serverUrl?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const url = serverUrl || getDefaultServerUrl();

    // Save custom URL to sessionStorage for reconnection
    if (serverUrl && typeof window !== 'undefined') {
      sessionStorage.setItem('kaputi_ws_url', serverUrl);
    }

    setConnectionState('connecting');
    setError(null);

    const ws = new WebSocket(url);
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
      // DON'T wipe game state on disconnect - allows reconnect to same game
      // Only wipe lobby state so user knows they're disconnected
      // setLobbyState('idle');  // Keep lobbyState to preserve game view
      // setRoomCode(null);      // Keep roomCode for potential reconnect
      // setPlayerId(null);      // Keep playerId for potential reconnect
      // setPlayers([]);         // Keep players for display
      // setGame(null);          // Keep game so UI doesn't blank out
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
  const listRooms = useCallback(() => {
    send({ type: 'LIST_ROOMS' });
  }, [send]);

  const findGame = useCallback((playerName: string) => {
    send({ type: 'FIND_GAME', playerName });
  }, [send]);

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

  const setChillMode = useCallback((enabled: boolean) => {
    send({ type: 'SET_CHILL_MODE', enabled });
  }, [send]);

  const addBot = useCallback((botName?: string) => {
    send({ type: 'ADD_BOT', botName });
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: 'START_GAME' });
  }, [send]);

  // Game actions
  const revealTurnOrderCard = useCallback(() => {
    send({ type: 'REVEAL_TURN_ORDER_CARD' });
  }, [send]);

  const selectTopic = useCallback((topicId: string) => {
    send({ type: 'SELECT_TOPIC', topicId });
  }, [send]);

  const playCard = useCallback((cardId: string, slotId: string) => {
    send({ type: 'PLAY_CARD', cardId, slotId });
  }, [send]);

  const stackCard = useCallback((cardId: string, slotId: string) => {
    send({ type: 'STACK_CARD', cardId, slotId });
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
    isWaitingForPlayers,
    chillMode,

    // Turn timer state
    turnTimeRemaining,
    currentTurnPlayerId,

    // Game state
    game,
    currentPlayer,
    currentSentence,
    isMyTurn,

    // Public rooms
    publicRooms,

    // Lobby actions
    connect,
    disconnect,
    findGame,
    listRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    setChillMode,
    addBot,
    startGame,

    // Game actions
    revealTurnOrderCard,
    selectTopic,
    playCard,
    stackCard,
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
