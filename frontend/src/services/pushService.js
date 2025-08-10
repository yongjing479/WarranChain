// Minimal OneSignal Web SDK integration without extra dependencies

const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';

function loadOneSignalScript() {
  return new Promise((resolve, reject) => {
    if (window.OneSignal) return resolve();
    const script = document.createElement('script');
    script.src = ONE_SIGNAL_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load OneSignal SDK'));
    document.head.appendChild(script);
  });
}

export async function initPushAndGetToken() {
  const appId = process.env.REACT_APP_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('REACT_APP_ONESIGNAL_APP_ID not set; skipping push init');
    return null;
  }

  await loadOneSignalScript();
  const OneSignal = window.OneSignal || [];

  await OneSignal.push(async () => {
    await OneSignal.init({ appId });
  });

  try {
    await OneSignal.Slidedown.promptPush();
  } catch (_) {
    // ignore
  }

  try {
    const isEnabled = await OneSignal.isPushNotificationsEnabled();
    if (!isEnabled) return null;
    const id = await OneSignal.getUserId(); // player_id
    return id || null;
  } catch (err) {
    console.error('OneSignal get token failed:', err);
    return null;
  }
}


