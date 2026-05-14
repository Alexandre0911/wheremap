import AsyncStorage from '@react-native-async-storage/async-storage';

const TOP_SPEED_KEY = '@wheremap/top_speed';
const PARTICIPANT_KEY = '@wheremap/participant_id';
const DISPLAY_ID_KEY = '@wheremap/display_id';
const NICKNAME_KEY = '@wheremap/nickname';
const COLOR_KEY = '@wheremap/color';

export async function getTopSpeed() {
  try {
    const val = await AsyncStorage.getItem(TOP_SPEED_KEY);
    return val ? parseFloat(val) : 0;
  } catch {
    return 0;
  }
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export async function getDisplayId() {
  try {
    const id = await AsyncStorage.getItem(DISPLAY_ID_KEY);
    return id || null;
  } catch {
    return null;
  }
}

export async function saveDisplayId(id) {
  try {
    await AsyncStorage.setItem(DISPLAY_ID_KEY, id);
  } catch {}
}

export async function getSavedNickname() {
  try {
    return await AsyncStorage.getItem(NICKNAME_KEY) || '';
  } catch {
    return '';
  }
}

export async function saveNickname(name) {
  try {
    await AsyncStorage.setItem(NICKNAME_KEY, name);
  } catch {}
}

export async function getSavedColor() {
  try {
    return await AsyncStorage.getItem(COLOR_KEY) || '#FF6B6B';
  } catch {
    return '#FF6B6B';
  }
}

export async function saveColor(color) {
  try {
    await AsyncStorage.setItem(COLOR_KEY, color);
  } catch {}
}

export async function saveTopSpeed(speed) {
  try {
    const current = await getTopSpeed();
    if (speed > current) {
      await AsyncStorage.setItem(TOP_SPEED_KEY, String(speed));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function getParticipantId() {
  try {
    let id = await AsyncStorage.getItem(PARTICIPANT_KEY);
    if (!id) {
      id = 'p_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      await AsyncStorage.setItem(PARTICIPANT_KEY, id);
    }
    return id;
  } catch {
    return 'p_' + Date.now();
  }
}