const crypto = require('crypto');

const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

class LobbyManager {
  constructor() {
    this.lobbies = new Map();
    this.pinIndex = new Map();
    this.claimedIds = new Set();
    this.permanentNames = new Map();
  }

  generateDisplayId() {
    let id;
    do {
      let code = '';
      for (let i = 0; i < 6; i++) code += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
      id = 'WM-' + code;
    } while (this.claimedIds.has(id));
    this.claimedIds.add(id);
    return id;
  }

  generatePin() {
    let pin;
    do {
      pin = String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');
    } while (this.pinIndex.has(pin));
    return pin;
  }

  createLobby() {
    const id = crypto.randomUUID();
    const pin = this.generatePin();
    const lobby = {
      id,
      pin,
      permanent: false,
      participants: new Map(),
      createdAt: Date.now(),
    };
    this.lobbies.set(id, lobby);
    this.pinIndex.set(pin, id);
    return { id, pin };
  }

  createPermanentLobby(pin) {
    const id = `permanent-${pin}`;
    if (this.pinIndex.has(pin)) return null;
    const lobby = {
      id,
      pin,
      permanent: true,
      participants: new Map(),
      createdAt: Date.now(),
    };
    this.lobbies.set(id, lobby);
    this.pinIndex.set(pin, id);
    return { id, pin };
  }

  getLobbyByPin(pin) {
    const id = this.pinIndex.get(pin);
    if (!id) return null;
    return this.lobbies.get(id) || null;
  }

  getLobby(id) {
    return this.lobbies.get(id) || null;
  }

  addParticipant(lobbyId, participant) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;
    lobby.participants.set(participant.id, participant);
    return lobby;
  }

  removeParticipant(lobbyId, participantId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;
    lobby.participants.delete(participantId);
    if (lobby.participants.size === 0 && !lobby.permanent) {
      this.lobbies.delete(lobbyId);
      this.pinIndex.delete(lobby.pin);
    }
    return lobby;
  }

  getParticipants(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return [];
    return Array.from(lobby.participants.values());
  }

  updateLocation(lobbyId, participantId, lat, lng, speed) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;
    const p = lobby.participants.get(participantId);
    if (!p) return null;
    p.latitude = lat;
    p.longitude = lng;
    p.speed = speed;
    if (speed > p.topSpeed) {
      p.topSpeed = speed;
    }
    return p;
  }

  getLeaderboard(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return [];
    return Array.from(lobby.participants.values())
      .filter((p) => p.topSpeed > 0)
      .sort((a, b) => b.topSpeed - a.topSpeed)
      .map((p, i) => ({
        rank: i + 1,
        nickname: p.nickname,
        color: p.color,
        topSpeed: p.topSpeed,
      }));
  }

  getActiveLobbyCount() {
    return this.lobbies.size;
  }

  isNameTaken(name) {
    return this.permanentNames.has(name.toLowerCase().trim());
  }

  claimName(name) {
    const key = name.toLowerCase().trim();
    if (this.permanentNames.has(key)) return false;
    this.permanentNames.set(key, true);
    return true;
  }
}

module.exports = LobbyManager;