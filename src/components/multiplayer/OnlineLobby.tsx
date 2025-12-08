'use client';

import { useState } from 'react';
import type { ConnectionState } from '@/hooks/useOnlineGame';
import { ConnectionStatusBadge } from '@/components/ConnectionStatusBadge';

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
  isWaitingForPlayers?: boolean;
  onConnect: (serverUrl?: string) => void;
  onFindGame: (playerName: string) => void;
  onLeaveRoom: () => void;
  onAddBot?: () => void;
  onBack: () => void;
}

export function OnlineLobby({
  connectionState,
  error,
  roomCode,
  players,
  isHost,
  playerId,
  isWaitingForPlayers,
  onConnect,
  onFindGame,
  onLeaveRoom,
  onAddBot,
  onBack,
}: OnlineLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:3102');
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
                Play Online
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

            <button
              onClick={() => playerName.trim() && onFindGame(playerName.trim())}
              disabled={!playerName.trim()}
              className="w-full py-4 bg-amber-500 text-white rounded-lg font-bold text-lg
                       hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎮 Find a Game
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              You&apos;ll be matched with other players automatically
            </p>
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
          &larr; Leave
        </button>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-teal-800 mb-2 text-center">
            {isWaitingForPlayers ? 'Finding Players...' : 'Game Starting!'}
          </h1>

          {isWaitingForPlayers && (
            <div className="flex justify-center my-6">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Players list */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              Players at Table ({players.length}/10)
            </h2>
            <div className="space-y-2">
              {players.map((player) => {
                // In lobby, isReady=false after disconnect means player is reconnecting
                const isDisconnected = !player.isReady && player.id !== playerId;
                
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      player.id === playerId ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'
                    } ${isDisconnected ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{isDisconnected ? '📴' : '👤'}</span>
                      <span className="font-medium">
                        {player.name || 'Player'}
                        {player.id === playerId && ' (You)'}
                      </span>
                      <ConnectionStatusBadge status={isDisconnected ? 'disconnected' : 'connected'} />
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      isDisconnected
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isDisconnected ? 'Reconnecting...' : 'Ready'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {isWaitingForPlayers && (
            <p className="text-center text-gray-500 text-sm">
              Game starts when 2+ players join
            </p>
          )}

          {/* Add bot button for testing */}
          {onAddBot && players.length < 10 && (
            <button
              onClick={onAddBot}
              className="w-full mt-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                       hover:bg-gray-300 transition-colors text-sm"
            >
              + Add Bot (for testing)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
