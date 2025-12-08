'use client';

import type { PlayerConnectionStatus } from '@/types/multiplayer.types';

interface ConnectionStatusBadgeProps {
  status?: PlayerConnectionStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Visual indicator for player connection status
 * - Connected: Green dot
 * - Disconnected: Red dot with pulse animation
 * - Away: Orange dot
 */
export function ConnectionStatusBadge({
  status = 'connected',
  showLabel = false,
  size = 'sm',
}: ConnectionStatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      pulse: false,
      label: 'Online',
    },
    disconnected: {
      color: 'bg-red-500',
      pulse: true,
      label: 'Disconnected',
    },
    away: {
      color: 'bg-orange-400',
      pulse: false,
      label: 'Away',
    },
  };

  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-1">
      <span className="relative inline-flex">
        <span
          className={`${sizeClasses} rounded-full ${config.color}`}
          title={config.label}
        />
        {config.pulse && (
          <span
            className={`absolute inset-0 ${sizeClasses} rounded-full ${config.color} animate-ping opacity-75`}
          />
        )}
      </span>
      {showLabel && (
        <span className={`text-xs ${status === 'disconnected' ? 'text-red-600' : status === 'away' ? 'text-orange-600' : 'text-gray-500'}`}>
          {config.label}
        </span>
      )}
    </span>
  );
}
