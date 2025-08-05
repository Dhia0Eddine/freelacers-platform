from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
import logging
from uuid import uuid4
import json

from app.utils.auth import verify_token_ws
from app.sockets.socket_manager import socket_manager
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    token: str = Query(...),
):
    # Generate a unique socket ID
    socket_id = str(uuid4())
    
    # Verify the token
    try:
        user = await verify_token_ws(token)
        if not user:
            await websocket.close(code=1008, reason="Invalid token")
            return
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Accept the connection and add to the socket manager
    try:
        await socket_manager.connect(websocket, socket_id, user.id)
        
        # Keep the connection open and handle messages
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Handle client messages if needed
                if message.get("type") == "heartbeat":
                    await socket_manager.send_personal_message(
                        {"type": "heartbeat_response", "timestamp": message.get("timestamp")},
                        socket_id
                    )
            except json.JSONDecodeError:
                logger.warning(f"Received invalid JSON: {data}")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {socket_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up on disconnect
        await socket_manager.disconnect(socket_id)
