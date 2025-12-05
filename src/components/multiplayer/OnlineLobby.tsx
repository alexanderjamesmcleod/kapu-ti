'use client';

import { useState } from 'react';
import type { ConnectionState } from '@/hooks/useOnlineGame';

interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

interface OnlineLobbyProps {
  connectionState: ConnectionState;
  error: string | null;
  roomCode: string | null;
  players: RoomPlayer[];
  isHost: boolean;
  playerId: string | null;
  onConnect: (serverUrl?: string) => void;
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onLeaveRoom: () => void;
  onSetReady: (ready: boolean) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export function OnlineLobby({
  connectionState,
  error,
  roomCode,
  players,
  isHost,
  playerId,
  onConnect,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onSetReady,
  onStartGame,
  onBack,
}: OnlineLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:3002');
  const [showServerConfig, setShowServerConfig] = useState(false);

  const myPlayer = players.find(p => p.id === playerId);
  const allReady = players.length >= 2 && players.every(p => p.isReady);

  // Not connected yet
  if (connectionState === 'disconnected' || connectionState === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-teal-800 mb-2 text-center">
              Online Multiplayer
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Play with friends over the internet!
            </p>

            {connectionState === 'connecting' ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Connecting to server...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => setShowServerConfig(!showServerConfig)}
                  className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                  {showServerConfig ? 'Hide' : 'Show'} server settings
                </button>

                {showServerConfig && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">
                      Server URL
                    </label>
                    <input
                      type="text"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="ws://localhost:3001"
                    />
                  </div>
                )}

                <button
                  onClick={() => onConnect(serverUrl)}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold
                           hover:bg-teal-700 transition-colors"
                >
                  Connect to Server
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Connection error
  if (connectionState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-4">Connection Error</div>
            <p className="text-gray-600 mb-4">
              Could not connect to the game server.
            </p>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <button
              onClick={() => onConnect(serverUrl)}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg
                       hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected but not in a room
  if (!roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-teal-800">
                Online Play
              </h1>
              <span className="text-sm text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Connected
              </span>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={() => playerName.trim() && onCreateRoom(playerName.trim())}
                disabled={!playerName.trim()}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold
                         hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create New Room
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join with Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border rounded-lg uppercase tracking-widest text-center font-mono
                             focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="ABCD"
                    maxLength={4}
                  />
                  <button
                    onClick={() => playerName.trim() && joinCode.length === 4 && onJoinRoom(joinCode, playerName.trim())}
                    disabled={!playerName.trim() || joinCode.length !== 4}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg font-bold
                             hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In a room, waiting for game to start
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onLeaveRoom}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          &larr; Leave Room
        </button>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-teal-800 mb-2 text-center">
            Game Lobby
          </h1>

          {/* Room code */}
          <div className="bg-teal-100 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-teal-700 mb-1">Room Code</p>
            <p className="text-3xl font-mono font-bold text-teal-800 tracking-widest">
              {roomCode}
            </p>
            <p className="text-xs text-teal-600 mt-2">
              Share this code with friends to join!
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Players list */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              Players ({players.length}/4)
            </h2>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === playerId ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {player.isHost ? '👑' : '👤'}
                    </span>
                    <span className="font-medium">
                      {player.name || 'Player'}
                      {player.id === playerId && ' (You)'}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    player.isReady
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ready / Start button */}
          <div className="space-y-3">
            {!isHost && (
              <button
                onClick={() => onSetReady(!myPlayer?.isReady)}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  myPlayer?.isReady
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {myPlayer?.isReady ? 'Cancel Ready' : "I'm Ready!"}
              </button>
            )}

            {isHost && (
              <button
                onClick={onStartGame}
                disabled={!allReady}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold
                         hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allReady ? 'Start Game' : `Waiting for players (${players.filter(p => p.isReady).length}/${players.length})`}
              </button>
            )}
          </div>

          {isHost && players.length < 2 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Need at least 2 players to start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
