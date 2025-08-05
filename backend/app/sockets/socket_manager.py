import logging
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
import json

logger = logging.getLogger(__name__)

class SocketManager:
    """
    Manages WebSocket connections and room-based messaging.
    """
    def __init__(self):
        # Map user_id to set of socket IDs
        self.user_connections: Dict[int, Set[str]] = {}
        # Map socket ID to WebSocket instance
        self.active_connections: Dict[str, WebSocket] = {}
        # Map socket ID to user_id
        self.socket_to_user: Dict[str, int] = {}
        
        logger.info("SocketManager initialized")

    async def connect(self, websocket: WebSocket, socket_id: str, user_id: int):
        """Connect a user's WebSocket and add to their room"""
        await websocket.accept()
        
        # Store the connection
        self.active_connections[socket_id] = websocket
        self.socket_to_user[socket_id] = user_id
        
        # Add to user's room
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(socket_id)
        
        logger.info(f"User {user_id} connected with socket {socket_id}")
        logger.debug(f"Active users: {len(self.user_connections)}, Active connections: {len(self.active_connections)}")
        
        # Send confirmation to client
        await self.send_personal_message(
            {"type": "connection_established", "user_id": user_id},
            socket_id
        )

    async def disconnect(self, socket_id: str):
        """Disconnect a socket and clean up references"""
        if socket_id in self.socket_to_user:
            user_id = self.socket_to_user[socket_id]
            
            # Remove from user's room
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(socket_id)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Clean up mappings
            del self.socket_to_user[socket_id]
            
            logger.info(f"User {user_id} disconnected socket {socket_id}")
        
        # Remove the connection
        if socket_id in self.active_connections:
            del self.active_connections[socket_id]
            
        logger.debug(f"Active users: {len(self.user_connections)}, Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, socket_id: str):
        """Send a message to a specific socket"""
        if socket_id in self.active_connections:
            websocket = self.active_connections[socket_id]
            await websocket.send_text(json.dumps(message))

    async def broadcast_to_user(self, user_id: int, message: dict):
        """Send a message to all connections of a user"""
        if user_id in self.user_connections:
            sockets = self.user_connections[user_id]
            logger.info(f"Broadcasting to user {user_id} with {len(sockets)} active connections")
            success_count = 0
            
            for socket_id in sockets:
                try:
                    await self.send_personal_message(message, socket_id)
                    success_count += 1
                except Exception as e:
                    logger.error(f"Failed to send message to socket {socket_id}: {str(e)}")
                    
            logger.info(f"Successfully sent message to {success_count}/{len(sockets)} connections for user {user_id}")
            return success_count > 0
        
        logger.warning(f"No active connections found for user {user_id}")
        return False

# Global socket manager instance
try:
    socket_manager = SocketManager()
    logger.info("Socket manager initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize socket manager: {str(e)}", exc_info=True)
    # Fallback to a dummy socket manager to prevent crashes
    class DummySocketManager:
        async def broadcast_to_user(self, user_id, message):
            logger.warning(f"Using dummy socket manager. Message for user {user_id} not sent.")
            return False
    socket_manager = DummySocketManager()
