import { useEffect } from 'react';
import { initPushAndGetToken } from '../services/pushService';
import { useEnoki } from './EnokiContext';

export default function PushTokenRegistrar() {
  const { address } = useEnoki();

  useEffect(() => {
    async function run() {
      if (!address) return;
      try {
        const token = await initPushAndGetToken();
        if (!token) return;
        await fetch('http://localhost:5000/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: address, push_token: token, provider: 'onesignal' })
        });
      } catch (e) {
        console.error('Failed to register push token:', e);
      }
    }
    run();
  }, [address]);

  return null;
}


