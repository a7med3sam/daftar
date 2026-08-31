import { api } from './api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isSecureContext(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  );
}

/**
 * Registers the current device for Web Push notifications.
 * Safe to call repeatedly — it's a no-op if already subscribed or unsupported.
 */
export async function registerPushSubscription(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  if (!('PushManager' in window)) return;
  if (!isSecureContext()) return;
  if (!navigator.serviceWorker) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const { publicKey } = await api.push.getPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });
    }

    const json = subscription.toJSON();
    const endpoint = json.endpoint || '';
    const keys = json.keys as { auth: string; p256dh: string } | undefined;
    if (!endpoint || !keys?.auth || !keys?.p256dh) return;

    await api.push.subscribe({
      endpoint,
      keysAuth: keys.auth,
      keysP256dh: keys.p256dh,
      userAgent: navigator.userAgent,
    });
  } catch {
    // Silent — notification failures must never break the app.
  }
}

/** Removes the current device's push subscription (used on logout). */
export async function unregisterPushSubscription(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  if (!('PushManager' in window)) return;
  if (!navigator.serviceWorker) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch {
    // ignore
  }
}
