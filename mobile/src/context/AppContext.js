import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import { requestLocationPermissions, startWatchingLocation, stopWatchingLocation } from '../services/location';
import { saveTopSpeed } from '../services/storage';

const AppContext = createContext(null);

const initialState = {
  user: { nickname: '', color: '#FF6B6B' },
  socketId: null,
  lobby: null,
  participants: [],
  connected: false,
  isHost: false,
  leaderboard: [],
  myLocation: null,
  hasLocationPermission: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_SOCKET_ID':
      return { ...state, socketId: action.payload };
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    case 'SET_MY_LOCATION':
      return { ...state, myLocation: action.payload };
    case 'SET_LOCATION_PERMISSION':
      return { ...state, hasLocationPermission: action.payload };
    case 'LOBBY_CREATED':
      return {
        ...state,
        lobby: { id: action.payload.lobbyId, pin: action.payload.pin },
        participants: action.payload.participants,
        isHost: true,
      };
    case 'LOBBY_JOINED':
      return {
        ...state,
        lobby: { id: action.payload.lobbyId, pin: null },
        participants: action.payload.participants,
        isHost: false,
      };
    case 'PARTICIPANT_JOINED':
      return {
        ...state,
        participants: [...state.participants, action.payload.participant],
      };
    case 'PARTICIPANT_LEFT':
      return {
        ...state,
        participants: state.participants.filter(
          (p) => p.id !== action.payload.participantId
        ),
      };
    case 'LOCATION_UPDATE':
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.payload.participantId
            ? {
                ...p,
                latitude: action.payload.latitude,
                longitude: action.payload.longitude,
                speed: action.payload.speed,
              }
            : p
        ),
      };
    case 'LEADERBOARD_UPDATE':
      return {
        ...state,
        leaderboard: action.payload.entries || state.leaderboard,
        participants: state.participants.map((p) =>
          p.id === action.payload.participantId
            ? { ...p, topSpeed: action.payload.topSpeed }
            : p
        ),
      };
    case 'LEAVE_LOBBY':
      return {
        ...state,
        lobby: null,
        participants: [],
        isHost: false,
        leaderboard: [],
      };
    default:
      return state;
  }
}

export function AppProvider({ children, serverUrl }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hasBeenConnected = useRef(false);
  const rejoinKeyRef = useRef(null);

  const connect = useCallback(() => {
    const socket = connectSocket(serverUrl);

    socket.off('connect');
    socket.off('disconnect');
    socket.off('lobby_created');
    socket.off('lobby_joined');
    socket.off('participant_joined');
    socket.off('participant_left');
    socket.off('location_update');
    socket.off('leaderboard');
    socket.off('leaderboard_update');
    socket.off('error');

    socket.on('connect', () => {
      dispatch({ type: 'SET_SOCKET_ID', payload: socket.id });
      dispatch({ type: 'SET_CONNECTED', payload: true });
      if (hasBeenConnected.current) {
        const key = rejoinKeyRef.current;
        if (key && key.pin) {
          socket.emit('join_lobby', { pin: key.pin, nickname: key.nickname, color: key.color });
        }
      }
      hasBeenConnected.current = true;
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_SOCKET_ID', payload: null });
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('lobby_created', (data) => {
      const key = rejoinKeyRef.current;
      if (key) rejoinKeyRef.current = { ...key, pin: data.pin };
      dispatch({ type: 'LOBBY_CREATED', payload: data });
    });

    socket.on('lobby_joined', (data) => dispatch({ type: 'LOBBY_JOINED', payload: data }));
    socket.on('participant_joined', (data) => dispatch({ type: 'PARTICIPANT_JOINED', payload: data }));
    socket.on('participant_left', (data) => dispatch({ type: 'PARTICIPANT_LEFT', payload: data }));
    socket.on('location_update', (data) => dispatch({ type: 'LOCATION_UPDATE', payload: data }));
    socket.on('leaderboard', (data) => dispatch({ type: 'LEADERBOARD_UPDATE', payload: { entries: data.entries } }));
    socket.on('leaderboard_update', (data) => dispatch({ type: 'LEADERBOARD_UPDATE', payload: data }));
    socket.on('error', ({ message }) => Alert.alert('Error', message));

    return socket;
  }, [serverUrl]);

  const createLobby = useCallback((nickname, color) => {
    const socket = getSocket();
    if (!socket) return;
    rejoinKeyRef.current = { pin: null, nickname, color };
    socket.emit('create_lobby', { nickname, color });
  }, []);

  const joinLobby = useCallback((pin, nickname, color) => {
    const socket = getSocket();
    if (!socket) return;
    rejoinKeyRef.current = { pin, nickname, color };
    socket.emit('join_lobby', { nickname, color, pin });
  }, []);

  const updateLocation = useCallback((location) => {
    const socket = getSocket();
    if (!socket || !state.lobby) return;
    socket.emit('update_location', { lobbyId: state.lobby.id, ...location });
  }, [state.lobby]);

  const requestLeaderboard = useCallback(() => {
    const socket = getSocket();
    if (!socket || !state.lobby) return;
    socket.emit('request_leaderboard', { lobbyId: state.lobby.id });
  }, [state.lobby]);

  const leaveLobby = useCallback(() => {
    const socket = getSocket();
    if (socket && state.lobby) socket.emit('leave_lobby', { lobbyId: state.lobby.id });
    rejoinKeyRef.current = null;
    dispatch({ type: 'LEAVE_LOBBY' });
  }, [state.lobby]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    rejoinKeyRef.current = null;
    dispatch({ type: 'LEAVE_LOBBY' });
  }, []);

  // Start/stop GPS when lobby changes
  useEffect(() => {
    if (!state.lobby) {
      stopWatchingLocation();
      return;
    }
    let mounted = true;
    (async () => {
      const granted = await requestLocationPermissions();
      if (!mounted) return;
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: granted });
      if (granted) {
        await startWatchingLocation((loc) => {
          if (!mounted) return;
          dispatch({ type: 'SET_MY_LOCATION', payload: loc });
          updateLocation(loc);
          saveTopSpeed(loc.speed);
        });
      }
    })();
    return () => { mounted = false; stopWatchingLocation(); };
  }, [state.lobby, updateLocation]);

  const value = {
    ...state,
    dispatch,
    connect,
    createLobby,
    joinLobby,
    updateLocation,
    requestLeaderboard,
    leaveLobby,
    disconnect,
  };

  return React.createElement(AppContext.Provider, { value }, children);
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}