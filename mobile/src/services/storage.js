import AsyncStorage from '@react-native-async-storage/async-storage';

const TOP_SPEED_KEY = '@wheremap/top_speed';

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