export const API_BASE = "https://gym-backend-staging.onrender.com"
// export const API_BASE = "http://localhost:5000"; // Uncomment for local development
// export const API_BASE = "https://your-production-api.com"; // Uncomment for production deployment
export const SOCKET_BASE = "https://hard-core.onrender.com/socket.io"; // Socket.io endpoint
// export const SOCKET_BASE = "http://localhost:5000/socket.io"; // Uncomment for local development
// export const SOCKET_BASE = "https://your-production-socket-api.com"; // Uncomment for production deployment
export const WS_BASE = "wss://hard-core.onrender.com/socket.io/?EIO=4&transport=websocket"; // WebSocket endpoint
// export const WS_BASE = "ws://localhost:5000/socket.io/?EIO=4&transport=websocket"; // Uncomment for local development
// export const WS_BASE = "wss://your-production-websocket-api.com/socket.io/?EIO=4&transport=websocket"; // Uncomment for production deployment
export const AUTH_TOKEN = localStorage.getItem("token") || ""; // Get the auth token from local storage
export const USER_ROLE = localStorage.getItem("role") || ""; // Get the user role from local storage
export const USER_EMAIL = localStorage.getItem("email") || ""; // Get the user email from local storage
export const USER_ID = localStorage.getItem("userId") || ""; // Get the user ID from local storage
export const USER_NAME = localStorage.getItem("name") || ""; // Get the user name from local storage
