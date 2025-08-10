// Dynamic API / Socket configuration
// Local development: localhost / 127.* / 192.168.*
// Otherwise: staging backend
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];
function isLocalHost(host) {
	return LOCAL_HOSTNAMES.some(h => host.includes(h)) || /^192\.168\./.test(host);
}

const PROD_API = 'https://gym-backend-staging.onrender.com';
const LOCAL_API = 'http://localhost:5000';

export const API_BASE = (typeof window !== 'undefined' && isLocalHost(window.location.hostname)) ? LOCAL_API : PROD_API;
console.log('🔧 CONFIG: API_BASE is set to:', API_BASE);

export const SOCKET_BASE = API_BASE + '/socket.io';
export const WS_BASE = API_BASE.replace(/^http/, 'ws') + '/socket.io/?EIO=4&transport=websocket';
// Helper functions to get auth data (call these when needed, not at module load)
export const getAuthToken = () => localStorage.getItem("token") || "";
export const getUserRole = () => localStorage.getItem("role") || "";
export const getUserEmail = () => localStorage.getItem("email") || "";
export const getUserId = () => localStorage.getItem("userId") || "";
export const getUserName = () => localStorage.getItem("name") || "";
