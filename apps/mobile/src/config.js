// Central config — reads from .env (EXPO_PUBLIC_ prefix required by Expo SDK)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';

// Derive WebSocket URL from HTTP URL
export const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/ws';
export const HTTP_URL = BASE_URL;

export default { WS_URL, HTTP_URL };
