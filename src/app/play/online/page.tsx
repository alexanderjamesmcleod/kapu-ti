'use client';

import { useRouter } from 'next/navigation';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { OnlineLobby } from '@/components/multiplayer/OnlineLobby';
import { OnlineGame } from '@/components/multiplayer/OnlineGame';

export default function OnlinePlayPage() {
  const router = useRouter();
  const {
    // Connection state
    connectionState,
    error,

    // Lobby state
    lobbyState,
    roomCode,
    playerId,
    players,
    isHost,

    // Turn timer
    turnTimeRemaining,
    currentTurnPlayerId,

    // Game state
    game,
    currentSentence,
    isMyTurn,

    // Lobby actions
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,

    // Game actions
    playCard,
    createSlot,
    submitTurn,
    vote,
    passTurn,
    undoLastCard,
    confirmTurnEnd,
  } = useOnlineGame();

  // Handle back navigation
  const handleBack = () => {
    router.push('/play');
  };

  // Handle exit from game
  const handleExit = () => {
    leaveRoom();
  };

  // Show lobby if not in game
  if (lobbyState !== 'inGame' || !game || !playerId) {
    return (
      <OnlineLobby
        connectionState={connectionState}
        error={error}
        roomCode={roomCode}
        players={players}
        isHost={isHost}
        playerId={playerId}
        onConnect={connect}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeaveRoom={leaveRoom}
        onSetReady={setReady}
        onStartGame={startGame}
        onBack={handleBack}
      />
    );
  }

  // Show game
  return (
    <OnlineGame
      game={game}
      playerId={playerId}
      currentSentence={currentSentence}
      isMyTurn={isMyTurn}
      turnTimeRemaining={turnTimeRemaining}
      currentTurnPlayerId={currentTurnPlayerId}
      onPlayCard={playCard}
      onCreateSlot={createSlot}
      onSubmitTurn={submitTurn}
      onVote={vote}
      onPassTurn={passTurn}
      onUndo={undoLastCard}
      onConfirmTurnEnd={confirmTurnEnd}
      onExit={handleExit}
    />
  );
}
