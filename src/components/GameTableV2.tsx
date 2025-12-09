'use client';

// Player position around the table
export interface TablePlayer {
  id: string;
  name: string;
  avatar?: string;
  isVideoEnabled?: boolean;
  videoStream?: MediaStream;
  cardsInHand: number;
  score: number;
  isCurrentTurn: boolean;
  isHost?: boolean;
  isSelf?: boolean;
  status: 'waiting' | 'ready' | 'playing' | 'disconnected';
  sentenceStreak?: number;
}

interface GameTableV2Props {
  players: TablePlayer[];
  maxPlayers?: number;
  centerContent?: React.ReactNode;
  currentTopic?: { icon: string; name: string; maori: string };
  onSeatClick?: (seatIndex: number) => void;
  onToggleVideo?: (playerId: string) => void;
}

// Calculate position around oval table using ellipse math
function getOvalPosition(index: number, totalOthers: number): { x: number; y: number; angle: number } {
  if (totalOthers === 0) {
    return { x: 50, y: 0, angle: 90 };
  }

  const startAngle = 160;
  const endAngle = 20;
  const angleRange = startAngle - endAngle;

  let angle: number;
  if (totalOthers === 1) {
    angle = 90;
  } else {
    angle = startAngle - (index * angleRange / (totalOthers - 1));
  }

  const rad = (angle * Math.PI) / 180;
  const a = 48;
  const b = 42;

  const x = 50 + a * Math.cos(rad);
  const y = 50 - b * Math.sin(rad);

  return { x, y, angle };
}

// Compact player seat component
function PlayerSeatCompact({
  player,
  onToggleVideo
}: {
  player: TablePlayer;
  onToggleVideo?: (playerId: string) => void;
}) {
  const statusColors = {
    waiting: 'bg-gray-400',
    ready: 'bg-green-400',
    playing: 'bg-blue-400',
    disconnected: 'bg-red-400'
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-200 ${
      player.isCurrentTurn ? 'scale-110' : ''
    }`}>
      <div className={`
        relative w-12 h-12 rounded-full overflow-hidden
        border-3 ${player.isCurrentTurn ? 'border-amber-400 shadow-lg shadow-amber-400/50' : 'border-gray-600'}
        ${player.isSelf ? 'border-teal-400' : ''}
        bg-gradient-to-br from-teal-100 to-blue-100
      `}>
        {player.isVideoEnabled && player.videoStream ? (
          <video
            autoPlay
            muted={player.isSelf}
            playsInline
            className="w-full h-full object-cover"
            ref={(el) => {
              if (el && player.videoStream) {
                el.srcObject = player.videoStream;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {player.avatar || '👤'}
          </div>
        )}

        {player.isCurrentTurn && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full
                         flex items-center justify-center animate-pulse">
            <span className="text-[10px]">🎯</span>
          </div>
        )}

        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white
                        ${statusColors[player.status]}`} />
      </div>

      <p className={`text-xs font-medium text-center mt-1 max-w-[60px] truncate
                    ${player.isCurrentTurn ? 'text-amber-400' : 'text-gray-300'}
                    ${player.isSelf ? 'text-teal-400' : ''}`}>
        {player.name}
        {player.isHost && ' 👑'}
      </p>

      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
        <span>🃏 {player.cardsInHand}</span>
        <span>⭐ {player.score}</span>
        {player.sentenceStreak && player.sentenceStreak > 0 && (
          <span className="text-amber-400">
            {'🔥'.repeat(Math.min(player.sentenceStreak, 5))}
          </span>
        )}
      </div>
    </div>
  );
}

export function GameTableV2({
  players,
  maxPlayers = 8,
  centerContent,
  currentTopic,
  onSeatClick,
  onToggleVideo
}: GameTableV2Props) {
  const selfPlayer = players.find(p => p.isSelf);
  const otherPlayers = players.filter(p => !p.isSelf);
  const filledSeats = players.length;
  const emptySeats = Math.max(0, maxPlayers - filledSeats);

  return (
    <>
      {/* MAIN CONTAINER: Fixed dimensions prevent layout recalculation */}
      <div 
        className="relative h-[400px] mx-auto flex-shrink-0"
        style={{ width: 'min(900px, calc(100vw - 32px))' }}
      >

        {/* LAYER 1: Oval Background (z-0) - pure decoration */}
        <div
          className="absolute inset-[5%] rounded-[50%] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom right, #0f766e, #134e4a)',
            border: '8px solid #78350f',
            boxShadow: `
              inset 0 0 60px rgba(0,0,0,0.3),
              0 8px 32px rgba(0,0,0,0.4),
              0 0 0 4px #5c3d2e,
              0 0 0 8px #3d2517
            `
          }}
        >
          {/* Inner felt surface */}
          <div
            className="absolute inset-3 rounded-[50%]"
            style={{
              background: 'linear-gradient(to bottom right, #0d9488, #0f766e, #115e59)',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
            }}
          >
            {/* Felt texture overlay */}
            <div
              className="absolute inset-0 rounded-[50%] opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`
              }}
            />
          </div>
        </div>

        {/* LAYER 2: Content Grid (z-10) - fixed row heights */}
        <div className="absolute inset-0 z-10 grid grid-rows-[40px_1fr_40px] p-8">
          {/* Row 1: Topic indicator */}
          <div className="flex items-center justify-center">
            {currentTopic && (
              <div className="px-3 py-1.5 bg-white/95 rounded-full shadow-lg text-sm">
                <span className="text-lg">{currentTopic.icon}</span>
                <span className="ml-2 font-bold text-teal-800">{currentTopic.name}</span>
                <span className="ml-2 text-xs text-teal-600">({currentTopic.maori})</span>
              </div>
            )}
          </div>

          {/* Row 2: Sentence builder (centerContent) */}
          <div className="flex items-center justify-center overflow-hidden">
            <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm w-full max-w-[95%]">
              {centerContent || (
                <p className="text-white/60 text-center text-sm">
                  Waiting for game to start...
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Empty spacer */}
          <div className="flex items-center justify-center">
            {/* Reserved for turn indicator */}
          </div>
        </div>

        {/* LAYER 3: Players (z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {otherPlayers.map((player, index) => {
            const pos = getOvalPosition(index, otherPlayers.length);
            return (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <PlayerSeatCompact player={player} />
              </div>
            );
          })}

          {/* Empty seats for lobby */}
          {onSeatClick && Array.from({ length: Math.min(emptySeats, 3) }).map((_, index) => {
            const pos = getOvalPosition(otherPlayers.length + index, otherPlayers.length + emptySeats);
            return (
              <div
                key={`empty-${index}`}
                onClick={() => onSeatClick(otherPlayers.length + index)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto
                           w-12 h-12 rounded-full border-2 border-dashed border-gray-400
                           bg-gray-700/50 flex items-center justify-center cursor-pointer
                           hover:border-white hover:bg-gray-600/50 transition-all"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <span className="text-xl text-gray-400">+</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self player - OUTSIDE the fixed container */}
      {selfPlayer && (
        <div className="flex justify-center mt-2 relative z-20">
          <div className="bg-teal-900/80 px-4 py-2 rounded-xl border-2 border-teal-600">
            <PlayerSeatCompact
              player={selfPlayer}
              onToggleVideo={onToggleVideo}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default GameTableV2;
