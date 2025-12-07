'use client';

import type { VoiceParticipant } from '@/hooks/useVoiceChat';

interface VoiceControlsProps {
  isVoiceEnabled: boolean;
  isMuted: boolean;
  participants: VoiceParticipant[];
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  onToggleMute: () => void;
}

export function VoiceControls({
  isVoiceEnabled,
  isMuted,
  participants,
  onJoinVoice,
  onLeaveVoice,
  onToggleMute,
}: VoiceControlsProps) {
  if (!isVoiceEnabled) {
    // Not in voice - show join button
    return (
      <button
        onClick={onJoinVoice}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700
                   text-white rounded-full transition-colors shadow-lg"
      >
        <span className="text-lg">🎤</span>
        <span className="text-sm font-medium">Join Voice</span>
      </button>
    );
  }

  // In voice - show controls
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-full shadow-lg">
      {/* Mute/Unmute button */}
      <button
        onClick={onToggleMute}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
          ${isMuted
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-green-500 hover:bg-green-600'
          }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <span className="text-xl">{isMuted ? '🔇' : '🎤'}</span>
      </button>

      {/* Participants indicator */}
      <div className="flex items-center gap-1 px-2">
        <span className="text-green-400 text-sm">●</span>
        <span className="text-white text-sm">
          {participants.length + 1} in voice
        </span>
      </div>

      {/* Participant avatars */}
      <div className="flex -space-x-2">
        {participants.slice(0, 4).map((p) => (
          <div
            key={p.playerId}
            className={`w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800
                       flex items-center justify-center text-xs text-white
                       ${p.isMuted ? 'opacity-50' : ''}`}
            title={`${p.playerName}${p.isMuted ? ' (muted)' : ''}`}
          >
            {p.playerName.charAt(0).toUpperCase()}
            {p.isMuted && (
              <span className="absolute -bottom-1 -right-1 text-[8px]">🔇</span>
            )}
          </div>
        ))}
        {participants.length > 4 && (
          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800
                         flex items-center justify-center text-xs text-white">
            +{participants.length - 4}
          </div>
        )}
      </div>

      {/* Leave voice button */}
      <button
        onClick={onLeaveVoice}
        className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700
                   flex items-center justify-center transition-colors"
        title="Leave Voice"
      >
        <span className="text-lg">📴</span>
      </button>
    </div>
  );
}

export default VoiceControls;
