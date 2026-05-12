import * as Location from 'expo-location';

let locationSubscription = null;

export async function requestLocationPermissions() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function startWatchingLocation(onUpdate) {
  if (locationSubscription) return;
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 3000,
      distanceInterval: 5,
    },
    (loc) => {
      const { latitude, longitude, speed: speedMps } = loc.coords;
      const speed = speedMps > 0 ? parseFloat((speedMps * 3.6).toFixed(1)) : 0;
      onUpdate({ latitude, longitude, speed });
    }
  );
}

export function stopWatchingLocation() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}
