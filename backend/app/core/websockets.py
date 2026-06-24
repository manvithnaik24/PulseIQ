import json
from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps user_id (string representation of UUID) to active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        """Sends a JSON message to all active WebSocket connections of a specific user."""
        if user_id in self.active_connections:
            disconnected_sockets = set()
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception:
                    disconnected_sockets.add(websocket)
            
            for ws in disconnected_sockets:
                self.disconnect(user_id, ws)

    async def broadcast(self, message: dict):
        """Broadcasts a JSON message to all active WebSocket connections across all users."""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()
