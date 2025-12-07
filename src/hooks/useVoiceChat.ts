'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

// Peer connection with associated player info
interface PeerConnection {
  peerId: string;      // Target player ID
  peerName: string;    // Target player name
  peer: Peer.Instance;
  stream?: MediaStream;
  isMuted: boolean;
}

// Voice participant info (for UI)
export interface VoiceParticipant {
  playerId: string;
  playerName: string;
  isMuted: boolean;
  isSpeaking: boolean;
  stream?: MediaStream;
}

interface UseVoiceChatOptions {
  playerId: string | null;
  playerName: string;
  roomCode: string | null;
  sendMessage: (message: object) => void;
}

interface UseVoiceChatReturn {
  isVoiceEnabled: boolean;
  isMuted: boolean;
  participants: VoiceParticipant[];
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
  handleVoiceSignal: (fromPlayerId: string, signal: unknown) => void;
  handlePeerJoined: (playerId: string, playerName: string) => void;
  handlePeerLeft: (playerId: string) => void;
  handleMuteChanged: (playerId: string, isMuted: boolean) => void;
}

export function useVoiceChat({
  playerId,
  playerName,
  roomCode,
  sendMessage,
}: UseVoiceChatOptions): UseVoiceChatReturn {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);

  // Refs for persistent state
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const pendingSignalsRef = useRef<Map<string, unknown[]>>(new Map());

  // Get user's microphone
  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false, // Audio only!
    });

    localStreamRef.current = stream;
    return stream;
  }, []);

  // Create a peer connection to another player
  const createPeer = useCallback((
    targetPlayerId: string,
    targetPlayerName: string,
    initiator: boolean,
    stream: MediaStream
  ): Peer.Instance => {
    console.log(`[Voice] Creating peer to ${targetPlayerName} (initiator: ${initiator})`);

    const peer = new Peer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (signal) => {
      console.log(`[Voice] Sending signal to ${targetPlayerName}`);
      sendMessage({
        type: 'VOICE_SIGNAL',
        toPlayerId: targetPlayerId,
        signal,
      });
    });

    peer.on('stream', (remoteStream) => {
      console.log(`[Voice] Received stream from ${targetPlayerName}`);

      // Update peer connection with stream
      const conn = peersRef.current.get(targetPlayerId);
      if (conn) {
        conn.stream = remoteStream;
      }

      // Update participants list
      setParticipants(prev => prev.map(p =>
        p.playerId === targetPlayerId
          ? { ...p, stream: remoteStream }
          : p
      ));

      // Auto-play the audio
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.play().catch(console.error);
    });

    peer.on('connect', () => {
      console.log(`[Voice] Connected to ${targetPlayerName}`);
    });

    peer.on('error', (err) => {
      console.error(`[Voice] Peer error with ${targetPlayerName}:`, err);
    });

    peer.on('close', () => {
      console.log(`[Voice] Peer closed: ${targetPlayerName}`);
      peersRef.current.delete(targetPlayerId);
      setParticipants(prev => prev.filter(p => p.playerId !== targetPlayerId));
    });

    // Store the connection
    peersRef.current.set(targetPlayerId, {
      peerId: targetPlayerId,
      peerName: targetPlayerName,
      peer,
      isMuted: false,
    });

    // Add to participants
    setParticipants(prev => {
      if (prev.find(p => p.playerId === targetPlayerId)) {
        return prev;
      }
      return [...prev, {
        playerId: targetPlayerId,
        playerName: targetPlayerName,
        isMuted: false,
        isSpeaking: false,
      }];
    });

    // Process any pending signals
    const pending = pendingSignalsRef.current.get(targetPlayerId);
    if (pending && pending.length > 0) {
      console.log(`[Voice] Processing ${pending.length} pending signals from ${targetPlayerName}`);
      pending.forEach(signal => peer.signal(signal as Peer.SignalData));
      pendingSignalsRef.current.delete(targetPlayerId);
    }

    return peer;
  }, [sendMessage]);

  // Join voice chat
  const joinVoice = useCallback(async () => {
    if (!playerId || !roomCode) {
      console.error('[Voice] Cannot join: no playerId or roomCode');
      return;
    }

    try {
      console.log('[Voice] Joining voice chat...');
      const stream = await getLocalStream();

      setIsVoiceEnabled(true);

      // Tell server we're joining voice
      sendMessage({ type: 'VOICE_JOIN' });

      console.log('[Voice] Joined successfully, waiting for peers');
    } catch (err) {
      console.error('[Voice] Failed to get microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [playerId, roomCode, getLocalStream, sendMessage]);

  // Leave voice chat
  const leaveVoice = useCallback(() => {
    console.log('[Voice] Leaving voice chat...');

    // Close all peer connections
    peersRef.current.forEach((conn) => {
      conn.peer.destroy();
    });
    peersRef.current.clear();

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear pending signals
    pendingSignalsRef.current.clear();

    setIsVoiceEnabled(false);
    setIsMuted(false);
    setParticipants([]);

    // Tell server we're leaving
    sendMessage({ type: 'VOICE_LEAVE' });
  }, [sendMessage]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const newMuted = !isMuted;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !newMuted;
    });

    setIsMuted(newMuted);
    sendMessage({ type: 'VOICE_MUTE', isMuted: newMuted });
  }, [isMuted, sendMessage]);

  // Handle incoming voice signal from another peer
  const handleVoiceSignal = useCallback((fromPlayerId: string, signal: unknown) => {
    const signalData = signal as Peer.SignalData;
    console.log(`[Voice] Received signal from ${fromPlayerId}, type: ${signalData.type || 'candidate'}`);

    const existingPeer = peersRef.current.get(fromPlayerId);

    if (existingPeer) {
      // Check if this is an answer to our offer - if we're already stable, ignore it
      // This handles the "glare" case where both sides try to connect simultaneously
      try {
        const peerConnection = (existingPeer.peer as unknown as { _pc?: RTCPeerConnection })._pc;
        if (peerConnection && signalData.type === 'answer' && peerConnection.signalingState === 'stable') {
          console.log(`[Voice] Ignoring answer from ${fromPlayerId} - already stable (glare resolved)`);
          return;
        }
      } catch {
        // If we can't check state, just try to signal anyway
      }

      // We have a peer, pass the signal
      existingPeer.peer.signal(signalData);
    } else {
      // No peer yet - queue the signal
      console.log(`[Voice] Queuing signal from ${fromPlayerId} (no peer yet)`);
      const pending = pendingSignalsRef.current.get(fromPlayerId) || [];
      pending.push(signal);
      pendingSignalsRef.current.set(fromPlayerId, pending);
    }
  }, []);

  // Handle when another player joins voice
  const handlePeerJoined = useCallback(async (peerId: string, peerName: string) => {
    if (peerId === playerId) return; // Ignore self
    if (!isVoiceEnabled) return; // We're not in voice
    if (peersRef.current.has(peerId)) return; // Already connected

    console.log(`[Voice] Peer joined: ${peerName}`);

    // Deterministic initiator: lower ID always initiates to prevent "glare"
    // This ensures only one side creates an offer, avoiding the race condition
    const shouldInitiate = playerId! < peerId;
    console.log(`[Voice] Should initiate to ${peerName}: ${shouldInitiate} (my ID: ${playerId?.slice(0,4)}, their ID: ${peerId.slice(0,4)})`);

    try {
      const stream = await getLocalStream();
      createPeer(peerId, peerName, shouldInitiate, stream);
    } catch (err) {
      console.error('[Voice] Failed to create peer for new joiner:', err);
    }
  }, [playerId, isVoiceEnabled, getLocalStream, createPeer]);

  // Handle when another player leaves voice
  const handlePeerLeft = useCallback((peerId: string) => {
    console.log(`[Voice] Peer left: ${peerId}`);

    const conn = peersRef.current.get(peerId);
    if (conn) {
      conn.peer.destroy();
      peersRef.current.delete(peerId);
    }

    pendingSignalsRef.current.delete(peerId);
    setParticipants(prev => prev.filter(p => p.playerId !== peerId));
  }, []);

  // Handle mute state change from another player
  const handleMuteChanged = useCallback((peerId: string, peerIsMuted: boolean) => {
    setParticipants(prev => prev.map(p =>
      p.playerId === peerId ? { ...p, isMuted: peerIsMuted } : p
    ));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't call leaveVoice directly as it uses sendMessage which may be stale
      peersRef.current.forEach((conn) => {
        conn.peer.destroy();
      });
      peersRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  // Auto-respond to signals when we have a stream but no peer (they initiated)
  useEffect(() => {
    if (!isVoiceEnabled || !localStreamRef.current) return;

    // Check for pending signals where we need to create a peer (they initiated)
    pendingSignalsRef.current.forEach(async (signals, peerId) => {
      if (!peersRef.current.has(peerId) && signals.length > 0) {
        console.log(`[Voice] Creating peer for pending signals from ${peerId}`);
        try {
          const stream = await getLocalStream();
          // They initiated, so we're not the initiator
          const peer = createPeer(peerId, `Player ${peerId.slice(0, 4)}`, false, stream);
          // Signals will be processed in createPeer
        } catch (err) {
          console.error('[Voice] Failed to create peer for pending signals:', err);
        }
      }
    });
  }, [isVoiceEnabled, getLocalStream, createPeer]);

  return {
    isVoiceEnabled,
    isMuted,
    participants,
    joinVoice,
    leaveVoice,
    toggleMute,
    handleVoiceSignal,
    handlePeerJoined,
    handlePeerLeft,
    handleMuteChanged,
  };
}
