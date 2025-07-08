export const API_BASE = "https://gym-backend-staging.onrender.com";
// export const API_BASE = "http://localhost:5000"; // Local backend for testing
console.log('🔧 CONFIG: API_BASE is set to:', API_BASE);
// export const API_BASE = "https://your-production-api.com"; // Uncomment for production deployment
export const SOCKET_BASE = "https://gym-backend-staging.onrender.com/socket.io"; // Socket.io endpoint
// export const SOCKET_BASE = "http://localhost:5000/socket.io"; // Uncomment for local development
// export const SOCKET_BASE = "https://your-production-socket-api.com"; // Uncomment for production deployment
export const WS_BASE = "wss://gym-backend-staging.onrender.com/socket.io/?EIO=4&transport=websocket"; // WebSocket endpoint
// export const WS_BASE = "ws://localhost:5000/socket.io/?EIO=4&transport=websocket"; // Uncomment for local development
// export const WS_BASE = "wss://your-production-websocket-api.com/socket.io/?EIO=4&transport=websocket"; // Uncomment for production deployment
// Helper functions to get auth data (call these when needed, not at module load)
export const getAuthToken = () => localStorage.getItem("token") || "";
export const getUserRole = () => localStorage.getItem("role") || "";
export const getUserEmail = () => localStorage.getItem("email") || "";
export const getUserId = () => localStorage.getItem("userId") || "";
export const getUserName = () => localStorage.getItem("name") || "";
