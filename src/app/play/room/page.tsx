'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GameTable, CardHand, MultiplayerSentenceBuilder, KoreroButton, VotingOverlay, SoundToggle, MobileGameView } from '@/components';
import ChatPanel from '@/components/ChatPanel';
import VoiceControls from '@/components/VoiceControls';
import { useGameSounds } from '@/hooks/useGameSounds';
import { getSentenceFromSlots } from '@/types/multiplayer.types';
import type { TablePlayer } from '@/components/GameTable';
import type { Card as CardType } from '@/types';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useIsMobile } from '@/hooks/useIsMobile';

type RoomPhase = 'menu' | 'create' | 'join' | 'browse' | 'lobby' | 'spectate' | 'playing';

interface RoomSettings {
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
}

interface ActiveGame {
  code: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'playing';
  spectators: number;
}

// Generate random room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Generate random Māori-themed name
function generatePlayerName(): string {
  const names = [
    'Tama', 'Hine', 'Aroha', 'Kahu', 'Maia', 'Tāne', 'Mere', 'Hemi',
    'Ngaio', 'Wiremu', 'Anahera', 'Nikau', 'Rata', 'Kōwhai', 'Pōhutukawa'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

const AVATARS = ['😎', '🧑', '👩', '👨', '🧔', '👧', '👴', '👵', '🧒', '👱', '🙂', '😊'];

// Demo data for spectate/play views
const DEMO_PLAYERS: TablePlayer[] = [
  { id: 'p1', name: 'Hemi', avatar: '👨', cardsInHand: 5, score: 320, isCurrentTurn: true, isHost: true, status: 'playing' },
  { id: 'p2', name: 'Aroha', avatar: '👩', cardsInHand: 6, score: 280, isCurrentTurn: false, status: 'playing' },
  { id: 'p3', name: 'Tāne', avatar: '🧔', cardsInHand: 4, score: 510, isCurrentTurn: false, status: 'playing' },
  { id: 'p4', name: 'Maia', avatar: '👧', cardsInHand: 8, score: 190, isCurrentTurn: false, status: 'playing' },
];

const DEMO_HAND: CardType[] = [
  { id: '1', maori: 'Ko', english: 'definite', type: 'particle', color: 'purple' },
  { id: '2', maori: 'te', english: 'the', type: 'article', color: 'gray' },
  { id: '3', maori: 'whare', english: 'house', type: 'noun', color: 'blue' },
  { id: '4', maori: 'Kei te', english: 'present', type: 'tense_marker', color: 'yellow' },
  { id: '5', maori: 'harikoa', english: 'happy', type: 'adjective', color: 'lightblue' },
  { id: '6', maori: 'au', english: 'I/me', type: 'pronoun', color: 'red' },
];

export default function RoomPage() {
  const [phase, setPhase] = useState<RoomPhase>('menu');
  const [settings, setSettings] = useState<RoomSettings>({
    name: '',
    maxPlayers: 6,
    isPrivate: true
  });
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState(generatePlayerName());
  const [playerAvatar, setPlayerAvatar] = useState(AVATARS[0]);
  // Read ?ws= query parameter on mount - compute initial value
  const initialWsUrl = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('ws') || sessionStorage.getItem('kaputi_ws_url');
  }, []);
  
  const [serverUrl, setServerUrl] = useState(() => {
    if (typeof window === 'undefined') return 'ws://localhost:3102';
    const params = new URLSearchParams(window.location.search);
    const wsParam = params.get('ws');
    if (wsParam) {
      sessionStorage.setItem('kaputi_ws_url', wsParam);
      return wsParam;
    }
    return sessionStorage.getItem('kaputi_ws_url') || 'ws://localhost:3102';
  });
  const [showServerConfig, setShowServerConfig] = useState(false);
  const wsFromUrl = initialWsUrl;
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(true); // Auto-ready
  const [roomCode, setRoomCode] = useState('');
  const [spectatorCount, setSpectatorCount] = useState(3);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  // For playing state
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [hand, setHand] = useState<CardType[]>(DEMO_HAND);

  // Chat panel state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mobile detection
  const isMobile = useIsMobile();

  // Online game hook
  const online = useOnlineGame();

  // Voice chat hook
  const voice = useVoiceChat({
    playerId: online.playerId,
    playerName: playerName,
    roomCode: online.roomCode,
    sendMessage: online.sendMessage,
  });

  // Game sounds hook
  const sounds = useGameSounds({
    turnTimeRemaining: online.turnTimeRemaining,
    isMyTurn: online.isMyTurn,
    gamePhase: online.game?.phase ?? null,
    chillMode: online.chillMode,
  });

  // Wire up voice event handlers from WebSocket to voice chat hook
  useEffect(() => {
    online.setVoiceHandlers({
      onVoiceSignal: voice.handleVoiceSignal,
      onVoicePeerJoined: voice.handlePeerJoined,
      onVoicePeerLeft: voice.handlePeerLeft,
      onVoiceMuteChanged: voice.handleMuteChanged,
    });
  }, [online.setVoiceHandlers, voice.handleVoiceSignal, voice.handlePeerJoined, voice.handlePeerLeft, voice.handleMuteChanged]);

  // Leave voice when leaving room
  useEffect(() => {
    if (phase === 'menu' && voice.isVoiceEnabled) {
      voice.leaveVoice();
    }
  }, [phase, voice.isVoiceEnabled, voice.leaveVoice]);

  // Connect to WebSocket on initial mount only
  const hasAutoConnected = useRef(false);
  useEffect(() => {
    if (phase === 'menu' && online.connectionState === 'disconnected' && !hasAutoConnected.current) {
      hasAutoConnected.current = true;
      // Use wsFromUrl if available (from query param), else serverUrl
      const urlToUse = wsFromUrl || serverUrl;
      online.connect(urlToUse);
    }
  }, [phase, online.connectionState, online.connect, serverUrl, wsFromUrl]);

  // When game starts (lobbyState becomes 'inGame'), go straight to playing
  // Server assigns positions - no local turn order needed
  useEffect(() => {
    if (online.lobbyState === 'inGame' && online.game && phase === 'lobby') {
      // Go directly to playing - seating is based on server-assigned positions
      setPhase('playing');
    }
  }, [online.lobbyState, online.game, phase]);

  // Sync online players to local state for lobby display
  useEffect(() => {
    if (online.players.length > 0) {
      setPlayers(online.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: AVATARS[Math.abs(p.name.charCodeAt(0)) % AVATARS.length],
        isHost: p.isHost,
        isReady: p.isReady,
      })));
    }
  }, [online.players]);

  // Sync room code from online state
  useEffect(() => {
    if (online.roomCode) {
      setRoomCode(online.roomCode);
    }
  }, [online.roomCode]);

  // Sync isHost from online state
  useEffect(() => {
    setIsHost(online.isHost);
  }, [online.isHost]);

  // Create room
  const handleCreateRoom = useCallback(() => {
    // Use online hook for real WebSocket connection
    online.createRoom(playerName);
    // State will be synced from online via useEffects
    setIsReady(true); // Host starts ready
    setPhase('lobby');
  }, [playerName, online]);

  // Join room
  const handleJoinRoom = useCallback((code: string, asSpectator: boolean = false) => {
    if (asSpectator) {
      setRoomCode(code.toUpperCase());
      setPhase('spectate');
      return;
    }

    // Use online hook for real WebSocket connection
    online.joinRoom(code, playerName);
    // State will be synced from online via useEffects
    setPhase('lobby');
  }, [playerName, online]);

  // Join queue (spectator wants to play next round)
  const handleJoinQueue = useCallback(() => {
    setQueuePosition(spectatorCount + 1);
  }, [spectatorCount]);

  // Add bot player via WebSocket
  const addBotPlayer = useCallback(() => {
    if (players.length >= settings.maxPlayers) return;
    // Call server to add bot - it will broadcast PLAYER_JOINED
    online.addBot();
  }, [players.length, settings.maxPlayers, online]);

  // Toggle ready
  const toggleReady = useCallback(() => {
    const newReady = !isReady;
    online.setReady(newReady);
    setIsReady(newReady);
    // Player list will be synced from online.players
  }, [isReady, online]);

  // Start game - server handles everything
  const startGame = useCallback(() => {
    online.startGame();
    // useEffect will transition to 'playing' when online.lobbyState becomes 'inGame'
  }, [online]);


  // Helper to check if a player is self
  const isSelf = (playerId: string) => playerId === online.playerId;

  const canStart = isHost && players.length >= 2;

  // Spectator view content
  const spectatorCenterContent = (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white text-lg font-semibold">Build: &quot;The house&quot;</p>
      <div className="flex gap-2">
        {['Ko', 'te', '___'].map((slot, i) => (
          <div
            key={i}
            className={`w-24 h-16 rounded-lg border-2 flex items-center justify-center
                       ${slot === '___' ? 'bg-white/10 border-white/30 border-dashed' : 'bg-white border-gray-300 shadow-md'}`}
          >
            {slot !== '___' ? (
              <span className="font-bold text-gray-800">{slot}</span>
            ) : (
              <span className="text-white/50">?</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-teal-200 text-sm">Hemi is thinking...</p>
    </div>
  );

  // Check if we're in a full-screen game phase
  const isGamePhase = ['spectate', 'playing'].includes(phase);

  return (
    <div className={`p-2 safe-area-all no-select ${
      isGamePhase
        ? 'bg-gradient-to-b from-gray-900 to-gray-800 game-viewport'
        : 'min-h-screen bg-gradient-to-b from-teal-50 to-blue-50'
    }`}>
      <div className={isGamePhase ? 'max-w-5xl mx-auto h-full flex flex-col' : 'max-w-md mx-auto'}>

        {/* Header */}
        <header className={`${isGamePhase ? 'mb-2 text-white flex-shrink-0' : 'mb-6'}`}>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setPhase('menu')}
              className={`text-sm ${isGamePhase ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-800'}`}
            >
              ← Back
            </button>
            <h1 className={`font-bold ${isGamePhase ? 'text-lg text-white' : 'text-2xl text-teal-800'}`}>
              {phase === 'spectate' ? '👁 Spectating' :
               phase === 'playing' ? '🎮 Playing' :
               'Online'}
            </h1>
            <div className="flex items-center gap-2">
              {roomCode && (
                <span className={`font-mono text-sm ${isGamePhase ? 'text-gray-400' : 'text-gray-500'}`}>
                  {roomCode}
                </span>
              )}
              <SoundToggle compact />
            </div>
          </div>
        </header>

        {/* Menu */}
        {phase === 'menu' && (
          <div className="space-y-4">
            {/* Connection status */}
            <div className={`flex items-center justify-between px-4 py-2 rounded-lg ${
              online.connectionState === 'connected' ? 'bg-green-100' :
              online.connectionState === 'connecting' ? 'bg-yellow-100' :
              online.connectionState === 'error' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <span className="text-sm text-gray-700">
                {online.connectionState === 'connected' ? '🟢 Connected' :
                 online.connectionState === 'connecting' ? '🟡 Connecting...' :
                 online.connectionState === 'error' ? '🔴 Connection Error' : '⚪ Disconnected'}
              </span>
              <div className="flex gap-2">
                {online.connectionState === 'connected' && serverUrl !== 'ws://localhost:3102' && (
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}${window.location.pathname}?ws=${encodeURIComponent(serverUrl)}`;
                      navigator.clipboard.writeText(shareUrl);
                      alert('Share link copied! Send this to friends.');
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800 underline font-semibold"
                  >
                    Copy Share Link
                  </button>
                )}
                <button
                  onClick={() => setShowServerConfig(!showServerConfig)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  {showServerConfig ? 'Hide' : 'Server Settings'}
                </button>
              </div>
            </div>

            {/* Server configuration (collapsible) */}
            {showServerConfig && (
              <div className="bg-white rounded-xl p-4 shadow-md border-2 border-dashed border-gray-300">
                <h2 className="font-bold text-gray-700 mb-2">Server Connection</h2>
                <p className="text-xs text-gray-500 mb-3">
                  For internet play: use cloudflared tunnel and paste the wss:// URL below
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="wss://your-tunnel-url.trycloudflare.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      online.disconnect();
                      // Small delay to ensure disconnect completes
                      setTimeout(() => {
                        online.connect(serverUrl);
                      }, 150);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                  >
                    Connect
                  </button>
                </div>
                {online.error && (
                  <p className="text-xs text-red-600 mt-2">{online.error}</p>
                )}
              </div>
            )}

            {/* Player setup */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h2 className="font-bold text-gray-700 mb-3">Your Profile</h2>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-blue-100
                                 border-4 border-teal-300 flex items-center justify-center text-3xl">
                    {playerAvatar}
                  </div>
                  <select
                    value={playerAvatar}
                    onChange={(e) => setPlayerAvatar(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    {AVATARS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full
                                 text-white text-xs flex items-center justify-center">✏️</div>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-500">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Main action - Play Online with auto-matchmaking */}
            <button
              onClick={() => {
                online.findGame(playerName);
                setPhase('lobby');
              }}
              disabled={online.connectionState !== 'connected' || !playerName.trim()}
              className="w-full py-5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-bold text-xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎮 Play Online
            </button>
            <p className="text-center text-gray-500 text-sm -mt-2">
              Auto-joins available table or creates new one
            </p>
          </div>
        )}

        {/* Browse Games */}
        {phase === 'browse' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-700">Active Games</h2>
                <button
                  onClick={() => online.listRooms()}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="space-y-3">
                {online.publicRooms.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No games available. Create one!</p>
                ) : (
                  online.publicRooms.map(room => (
                    <div key={room.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{room.hostName}&apos;s Room</p>
                        <p className="text-sm text-gray-500">
                          {room.playerCount}/{room.maxPlayers} players • {room.code}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                      ${room.hasGame ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {room.hasGame ? 'In Progress' : 'Waiting'}
                      </span>
                      <div className="flex gap-2">
                        {!room.hasGame && room.playerCount < room.maxPlayers && (
                          <button
                            onClick={() => handleJoinRoom(room.code, false)}
                            className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-200"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setPhase('menu')}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Create Room */}
        {phase === 'create' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h2 className="font-bold text-gray-700 mb-4">Room Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Room Name (optional)</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
                    placeholder="e.g., Whānau Game Night"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Max Players</label>
                  <div className="flex gap-2 mt-1">
                    {[2, 4, 6, 8, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setSettings(s => ({ ...s, maxPlayers: n }))}
                        className={`flex-1 py-2 rounded-lg font-bold transition-colors
                                  ${settings.maxPlayers === n ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="private"
                    checked={settings.isPrivate}
                    onChange={(e) => setSettings(s => ({ ...s, isPrivate: e.target.checked }))}
                    className="w-5 h-5 text-teal-600 rounded"
                  />
                  <label htmlFor="private" className="text-gray-700">Private (code required)</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPhase('menu')} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">Cancel</button>
              <button onClick={handleCreateRoom} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">Create</button>
            </div>
          </div>
        )}

        {/* Join Room */}
        {phase === 'join' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <h2 className="font-bold text-gray-700 mb-4">Enter Room Code</h2>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="ABCD"
                maxLength={4}
                className="w-40 px-4 py-3 text-3xl font-mono text-center tracking-widest border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-sm text-gray-500 mt-3">Ask the host for the 4-letter code</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPhase('menu')} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
              <button
                onClick={() => handleJoinRoom(joinCode, false)}
                disabled={joinCode.length !== 4}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* Lobby */}
        {phase === 'lobby' && (
          <div className="space-y-4">
            {/* Waiting status */}
            {online.isWaitingForPlayers && (
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 shadow-md text-center">
                <p className="text-white font-bold text-lg">⏳ Waiting for players...</p>
                <p className="text-amber-100 text-sm mt-1">
                  Game will start automatically when another player joins
                </p>
              </div>
            )}

            {!online.isWaitingForPlayers && !online.game && (
              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 shadow-md text-center">
                <p className="text-white font-bold text-lg">🎮 Getting ready...</p>
                <p className="text-green-100 text-sm mt-1">
                  Game starting soon!
                </p>
              </div>
            )}

            {roomCode && (
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <p className="text-gray-500 text-xs">Table Code (for debugging)</p>
                <p className="text-gray-400 font-mono text-sm">{roomCode}</p>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h2 className="font-bold text-gray-700 mb-3">Players at Table ({players.length}/10)</h2>
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className={`flex items-center gap-3 p-2 rounded-lg ${isSelf(player.id) ? 'bg-teal-50' : 'bg-gray-50'}`}>
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xl">{player.avatar}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {player.name}
                        {player.isHost && <span className="ml-1">👑</span>}
                        {isSelf(player.id) && <span className="text-sm text-teal-600 ml-1">(You)</span>}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      Ready ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Controls: Chill Mode Toggle */}
            {isHost && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-700">Chill Mode</h3>
                    <p className="text-sm text-gray-500">No turn timers - take your time!</p>
                  </div>
                  <button
                    onClick={() => online.setChillMode(!online.chillMode)}
                    className={`
                      relative w-14 h-8 rounded-full transition-colors duration-200
                      ${online.chillMode ? 'bg-teal-500' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow
                        transition-transform duration-200
                        ${online.chillMode ? 'translate-x-6' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
                {online.chillMode && (
                  <p className="text-xs text-teal-600 mt-2">
                    Relaxed pace - no pressure!
                  </p>
                )}
              </div>
            )}

            {/* Chill Mode Indicator (for non-hosts) */}
            {!isHost && online.chillMode && (
              <div className="bg-teal-50 rounded-xl p-3 text-center">
                <p className="text-teal-700 font-medium">Chill Mode Active</p>
                <p className="text-teal-600 text-sm">No turn timers - play at your own pace</p>
              </div>
            )}

            {/* Voice Chat Controls */}
            <div className="flex justify-center">
              <VoiceControls
                isVoiceEnabled={voice.isVoiceEnabled}
                isMuted={voice.isMuted}
                participants={voice.participants}
                onJoinVoice={voice.joinVoice}
                onLeaveVoice={voice.leaveVoice}
                onToggleMute={voice.toggleMute}
              />
            </div>

            <button
              onClick={() => {
                online.leaveRoom();
                setPhase('menu');
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
            >
              Leave Table
            </button>

            {/* Chat Panel for lobby */}
            <div className="mt-4">
              <ChatPanel
                messages={online.chatMessages}
                currentPlayerId={online.playerId}
                onSendMessage={online.sendChat}
                onSendReaction={online.sendReaction}
                isCollapsed={!isChatOpen}
                onToggleCollapse={() => setIsChatOpen(!isChatOpen)}
              />
            </div>
          </div>
        )}

        {/* Spectate View */}
        {phase === 'spectate' && (
          <div>
            {/* Spectator bar */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-400">
                <span>👁 {spectatorCount} watching</span>
              </div>
              {queuePosition ? (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                  Queue position: #{queuePosition}
                </span>
              ) : (
                <button
                  onClick={handleJoinQueue}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Join Next Game
                </button>
              )}
            </div>

            {/* Game Table (spectator view) */}
            <GameTable
              players={DEMO_PLAYERS}
              maxPlayers={6}
              centerContent={spectatorCenterContent}
              currentTopic={{ icon: '🏠', name: 'Places', maori: 'Wāhi' }}
            />

            {/* Chat/info for spectators */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Game Info</h3>
              <p className="text-gray-400 text-sm">Round 3 of 5 • Hemi is building...</p>
              <p className="text-gray-400 text-sm">Target: &quot;Ko te whare&quot; (The house)</p>
            </div>
          </div>
        )}

        {/* Playing View */}
        {phase === 'playing' && online.game && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Connection warning */}
            {online.connectionState !== 'connected' && (
              <div className="mb-4 px-4 py-2 bg-amber-500/30 text-amber-300 rounded-lg text-sm flex items-center justify-between">
                <span>
                  {online.connectionState === 'connecting' ? '🔄 Reconnecting...' : '⚠️ Disconnected - game paused'}
                </span>
                <button
                  onClick={() => online.connect(serverUrl)}
                  className="px-3 py-1 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600"
                >
                  Reconnect
                </button>
              </div>
            )}
            {/* Connection error */}
            {online.error && (
              <div className="mb-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm">
                {online.error}
              </div>
            )}

            {/* ===== TOPIC SELECT PHASE ===== */}
            {online.game.phase === 'topicSelect' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
                <h2 className="text-2xl font-bold text-white">He aha te kaupapa?</h2>
                <p className="text-teal-300 text-sm">What&apos;s the topic for this round?</p>

                {/* Who is selecting */}
                {online.game.turnOrderWinner !== undefined && (
                  <p className={`text-lg font-semibold ${
                    online.game.players[online.game.turnOrderWinner]?.id === online.playerId
                      ? 'text-amber-400'
                      : 'text-gray-300'
                  }`}>
                    {online.game.players[online.game.turnOrderWinner]?.id === online.playerId
                      ? '👑 You choose the topic!'
                      : `👑 ${online.game.players[online.game.turnOrderWinner]?.name} is choosing...`
                    }
                  </p>
                )}

                {/* Topic cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
                  {[
                    { id: 'kai', name: 'Food', maori: 'Kai', icon: '🍎' },
                    { id: 'feelings', name: 'Feelings', maori: 'Kare ā-roto', icon: '😊' },
                    { id: 'actions', name: 'Actions', maori: 'Mahi', icon: '🏃' },
                    { id: 'animals', name: 'Animals', maori: 'Kararehe', icon: '🐱' },
                    { id: 'people', name: 'People', maori: 'Tangata', icon: '👨‍👩‍👧‍👦' },
                    { id: 'places', name: 'Places', maori: 'Wāhi', icon: '🏠' },
                  ].map(topic => {
                    const isWinner = online.game?.turnOrderWinner !== undefined &&
                      online.game.players[online.game.turnOrderWinner]?.id === online.playerId;

                    return (
                      <button
                        key={topic.id}
                        onClick={() => {
                          if (isWinner) {
                            online.selectTopic(topic.id);
                            sounds.playTopicSelectSound();
                          }
                        }}
                        disabled={!isWinner}
                        className={`
                          p-4 rounded-xl flex flex-col items-center gap-2
                          transition-all transform
                          ${isWinner
                            ? 'bg-gradient-to-br from-teal-500 to-teal-700 hover:scale-105 cursor-pointer shadow-md hover:shadow-lg'
                            : 'bg-gray-700/50 cursor-not-allowed opacity-60'
                          }
                        `}
                      >
                        <span className="text-4xl">{topic.icon}</span>
                        <span className="text-white font-bold">{topic.name}</span>
                        <span className="text-teal-200 text-sm">{topic.maori}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== PLAYING PHASE (and other phases like verification, turnEnd) ===== */}
            {online.game.phase !== 'topicSelect' && (
              <>
                {/* MOBILE VIEW */}
                {isMobile ? (
                  <MobileGameView
                    game={online.game}
                    players={online.game.players.map((p, idx) => ({
                      id: p.id,
                      name: p.name,
                      avatar: AVATARS[idx % AVATARS.length],
                      cardsInHand: p.hand.length,
                      isCurrentTurn: online.game!.currentPlayerIndex === idx,
                      isSelf: p.id === online.playerId,
                      isActive: p.isActive,
                    }))}
                    playerId={online.playerId || ''}
                    isMyTurn={online.isMyTurn}
                    selectedCard={selectedCard}
                    onSelectCard={setSelectedCard}
                    onPlayCard={(slotId) => {
                      if (selectedCard) {
                        online.playCard(selectedCard.id, slotId);
                      }
                    }}
                    onStackCard={(slotId) => {
                      if (selectedCard) {
                        online.stackCard(selectedCard.id, slotId);
                      }
                    }}
                    onCreateSlot={() => {
                      if (selectedCard) {
                        online.createSlot(selectedCard.id);
                      }
                    }}
                    onPassTurn={() => online.passTurn()}
                    onUndoLastCard={() => online.undoLastCard()}
                    onSubmitTurn={(sentence, translation) => online.submitTurn(sentence, translation)}
                    currentTopic={online.game.currentTopic}
                    turnTimeRemaining={online.turnTimeRemaining}
                    chillMode={online.chillMode}
                    sounds={sounds}
                    voice={{
                      isVoiceEnabled: voice.isVoiceEnabled,
                      isMuted: voice.isMuted,
                      onJoinVoice: voice.joinVoice,
                      onLeaveVoice: voice.leaveVoice,
                      onToggleMute: voice.toggleMute,
                    }}
                    chat={{
                      unreadCount: 0, // Simplified - chat open state handles this
                      onToggleChat: () => setIsChatOpen(!isChatOpen),
                    }}
                  />
                ) : (
                  /* DESKTOP VIEW */
                  <>
                {/* Turn indicator with timer */}
                <div className="mb-2 flex items-center justify-between text-xs flex-shrink-0">
                  <span className="text-teal-400">{online.game.phase}</span>
                  <div className="flex items-center gap-2">
                    <span className={online.isMyTurn ? 'text-amber-400 font-bold' : 'text-gray-500'}>
                      {online.isMyTurn ? '🎯 Your turn!' : `${online.game.players[online.game.currentPlayerIndex]?.name}'s turn`}
                    </span>
                    {/* Turn timer - shows when <= 10 seconds */}
                    {online.turnTimeRemaining !== null && online.turnTimeRemaining <= 10 && online.game.phase === 'playing' && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                        online.turnTimeRemaining <= 5
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {online.turnTimeRemaining}s
                      </span>
                    )}
                  </div>
                </div>

                <GameTable
              players={online.game.players.map((p, idx) => ({
                id: p.id,
                name: p.name,
                avatar: AVATARS[idx % AVATARS.length],
                cardsInHand: p.hand.length,
                score: p.score ?? 0,
                isCurrentTurn: online.game!.currentPlayerIndex === idx,
                isHost: idx === 0,
                isSelf: p.id === online.playerId,
                status: p.isActive ? 'playing' as const : 'waiting' as const
              }))}
              maxPlayers={settings.maxPlayers}
              centerContent={
                <MultiplayerSentenceBuilder
                  tableSlots={online.game.tableSlots}
                  turnState={online.game.turnState}
                  selectedCard={selectedCard}
                  isMyTurn={online.isMyTurn}
                  currentPlayerName={online.game.players[online.game.currentPlayerIndex]?.name || 'Player'}
                  onPlayCard={(slotId) => {
                    if (selectedCard) {
                      online.playCard(selectedCard.id, slotId);
                      sounds.playCardSound();
                      setSelectedCard(null);
                    }
                  }}
                  onStackCard={(slotId) => {
                    if (selectedCard) {
                      online.stackCard(selectedCard.id, slotId);
                      sounds.playCardSound();
                      setSelectedCard(null);
                    }
                  }}
                  onCreateSlot={() => {
                    if (selectedCard) {
                      online.createSlot(selectedCard.id);
                      sounds.playCardSound();
                      setSelectedCard(null);
                    }
                  }}
                />
              }
              currentTopic={online.game.currentTopic}
            />

            {/* Hand - positioned below the table, always visible with sticky positioning */}
            <div className="mt-3 bg-white/95 rounded-xl shadow-lg p-3 relative z-10 flex-shrink-0 mb-20">
              {/* Hand header with actions */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700">
                  Your Hand ({online.currentPlayer?.hand.length || 0})
                </h3>
                {online.isMyTurn && (online.game.phase === 'playing' || online.game.phase === 'turnEnd') && (
                  <div className="flex gap-2 items-center">
                    {online.game.turnState.playedCards.length > 0 && (
                      <button
                        onClick={() => {
                          online.undoLastCard();
                          sounds.playCardPickupSound();
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600"
                      >
                        Undo
                      </button>
                    )}
                    <button
                      onClick={() => online.passTurn()}
                      className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600"
                    >
                      Pass
                    </button>
                    {online.game.turnState.playedCards.length > 0 && (
                      <KoreroButton
                        disabled={false}
                        sentence={getSentenceFromSlots(online.game.tableSlots)}
                        onKorero={(translation) => online.submitTurn(getSentenceFromSlots(online.game!.tableSlots), translation)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Card hand */}
              <CardHand
                cards={online.currentPlayer?.hand || []}
                selectedCardId={selectedCard?.id}
                onSelectCard={(card) => {
                  // Allow card selection for:
                  // 1. Current player's turn (normal play)
                  // 2. During playing phase for stacking (any player can stack same-color cards)
                  if (online.isMyTurn || online.game?.phase === 'playing') {
                    setSelectedCard(selectedCard?.id === card.id ? null : card);
                  }
                }}
              />

              {/* Not your turn indicator - show stack hint when not your turn */}
              {!online.isMyTurn && (
                <div className="mt-2 text-center text-gray-500 text-sm">
                  {selectedCard ? (
                    <span className="text-teal-500">Tap a matching color slot to stack your card</span>
                  ) : (
                    <>Waiting for {online.game.players[online.game.currentPlayerIndex]?.name}... <span className="text-teal-400 text-xs">(select a card to stack)</span></>
                  )}
                </div>
              )}
            </div>
                  </>
                )}
              </>
            )}

            {/* Verification Phase - Voting Overlay */}
            {online.game.phase === 'verification' && (
              <VotingOverlay
                speakerName={online.game.players[online.game.currentPlayerIndex]?.name || 'Player'}
                sentence={getSentenceFromSlots(online.game.tableSlots)}
                translation={online.game.turnState.translation || ''}
                votes={online.game.verificationVotes}
                totalVoters={online.game.players.filter(p => p.isActive && p.id !== online.game!.players[online.game!.currentPlayerIndex].id).length}
                hasVoted={online.game.verificationVotes.some(v => v.playerId === online.playerId)}
                isCurrentPlayer={online.isMyTurn}
                onVote={(approved) => online.vote(approved)}
              />
            )}

            {/* Floating Voice + Chat Controls - DESKTOP only (mobile uses integrated buttons) */}
            {!isMobile && (
              <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
                {/* Voice Controls */}
                <VoiceControls
                  isVoiceEnabled={voice.isVoiceEnabled}
                  isMuted={voice.isMuted}
                  participants={voice.participants}
                  onJoinVoice={voice.joinVoice}
                  onLeaveVoice={voice.leaveVoice}
                  onToggleMute={voice.toggleMute}
                />

                {/* Chat Panel */}
                <ChatPanel
                  messages={online.chatMessages}
                  currentPlayerId={online.playerId}
                  onSendMessage={online.sendChat}
                  onSendReaction={online.sendReaction}
                  isCollapsed={!isChatOpen}
                  onToggleCollapse={() => setIsChatOpen(!isChatOpen)}
                />
              </div>
            )}

            {/* Mobile Chat Panel - slides up when toggled */}
            {isMobile && isChatOpen && (
              <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsChatOpen(false)}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-xl max-h-[60vh] overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <ChatPanel
                    messages={online.chatMessages}
                    currentPlayerId={online.playerId}
                    onSendMessage={online.sendChat}
                    onSendReaction={online.sendReaction}
                    isCollapsed={false}
                    onToggleCollapse={() => setIsChatOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
