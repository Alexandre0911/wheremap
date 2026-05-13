require('dotenv').config()
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const LobbyManager = require('./lobby');

const ts = () => new Date().toLocaleTimeString();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const lobbyManager = new LobbyManager();

const permanentPin = process.env.PRIVATE_PIN;
if (permanentPin) {
  const permanent = lobbyManager.createPermanentLobby(permanentPin);
  if (permanent) {
    console.log(`[LOBBY] Permanent lobby created with PIN ${permanentPin}`);
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', lobbies: lobbyManager.getActiveLobbyCount() });
});

io.on('connection', (socket) => {
  let currentLobbyId = null;
  const participantId = socket.id;

  socket.on('create_lobby', ({ nickname, color }) => {
    if (currentLobbyId) {
      socket.emit('error', { message: 'Already in a lobby. Leave first.' });
      return;
    }
    if (!nickname || !nickname.trim()) {
      socket.emit('error', { message: 'Nickname is required.' });
      return;
    }

    const { id, pin } = lobbyManager.createLobby();
    currentLobbyId = id;

    const participant = {
      id: participantId,
      nickname: nickname.trim(),
      color: color || '#FF6B6B',
      latitude: 0,
      longitude: 0,
      speed: 0,
      topSpeed: 0,
    };

    lobbyManager.addParticipant(id, participant);
    socket.join(id);

    socket.emit('lobby_created', {
      lobbyId: id,
      pin,
      participants: lobbyManager.getParticipants(id),
    });

    console.log(`[${ts()}] [LOBBY] Created ${id} PIN ${pin} by ${nickname}`);
  });

  socket.on('join_lobby', ({ nickname, color, pin }) => {
    if (currentLobbyId) {
      socket.emit('error', { message: 'Already in a lobby. Leave first.' });
      return;
    }
    if (!nickname || !nickname.trim()) {
      socket.emit('error', { message: 'Nickname is required.' });
      return;
    }
    if (!pin || pin.length !== 4) {
      socket.emit('error', { message: 'Invalid PIN. Must be 4 digits.' });
      return;
    }

    const lobby = lobbyManager.getLobbyByPin(pin);
    if (!lobby) {
      socket.emit('error', { message: 'No lobby found with that PIN.' });
      return;
    }

    currentLobbyId = lobby.id;
    const participant = {
      id: participantId,
      nickname: nickname.trim(),
      color: color || '#FF6B6B',
      latitude: 0,
      longitude: 0,
      speed: 0,
      topSpeed: 0,
    };

    lobbyManager.addParticipant(lobby.id, participant);
    socket.join(lobby.id);

    socket.emit('lobby_joined', {
      lobbyId: lobby.id,
      participants: lobbyManager.getParticipants(lobby.id),
    });

    socket.to(lobby.id).emit('participant_joined', { participant });
    console.log(`[${ts()}] [LOBBY] ${nickname} joined ${lobby.id}`);
  });

  socket.on('leave_lobby', ({ lobbyId } = {}) => {
    if (!currentLobbyId) return;
    const lid = lobbyId || currentLobbyId;
    const lobby = lobbyManager.removeParticipant(lid, participantId);
    if (lobby) {
      socket.to(lid).emit('participant_left', { participantId });
      socket.leave(lid);
    }
    currentLobbyId = null;
    console.log(`[${ts()}] [LOBBY] ${participantId} left ${lid}`);
  });

  socket.on('update_location', ({ lobbyId, latitude, longitude, speed }) => {
    if (!currentLobbyId || currentLobbyId !== lobbyId) return;
    const updated = lobbyManager.updateLocation(
      lobbyId,
      participantId,
      latitude,
      longitude,
      speed
    );
    if (!updated) return;

    socket.to(lobbyId).emit('location_update', {
      participantId,
      latitude,
      longitude,
      speed,
    });

    if (speed > updated.topSpeed - 0.001) {
      io.to(lobbyId).emit('leaderboard_update', {
        participantId,
        nickname: updated.nickname,
        color: updated.color,
        topSpeed: updated.topSpeed,
      });
    }
  });

  socket.on('request_leaderboard', ({ lobbyId } = {}) => {
    const lid = lobbyId || currentLobbyId;
    if (!lid) return;
    const entries = lobbyManager.getLeaderboard(lid);
    socket.emit('leaderboard', { entries });
  });

  socket.on('disconnect', () => {
    if (currentLobbyId) {
      const lobby = lobbyManager.removeParticipant(currentLobbyId, participantId);
      if (lobby) {
        io.to(currentLobbyId).emit('participant_left', { participantId });
      }
    }
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
});
