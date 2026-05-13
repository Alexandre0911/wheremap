import AsyncStorage from '@react-native-async-storage/async-storage';

const TOP_SPEED_KEY = '@wheremap/top_speed';
const PARTICIPANT_KEY = '@wheremap/participant_id';

export async function getTopSpeed() {
  try {
    const val = await AsyncStorage.getItem(TOP_SPEED_KEY);
    return val ? parseFloat(val) : 0;
  } catch {
    return 0;
  }
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