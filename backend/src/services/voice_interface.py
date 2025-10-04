"""
Public voice agent interface for direct user access.
This serves the voice agent page that users access via the generated URLs.
"""

from fastapi import HTTPException, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from services.voice_url_service import voice_url_service
from services.appwrite_service import appwrite_service
from core.config import get_settings

# This would be added to main.py or a separate routes file
# For now, including the route definition here

async def voice_agent_interface(
    request: Request,
    session: str = Query(..., description="Voice session ID"),
    token: str = Query(..., description="Access token")
):
    """
    Public interface for accessing voice agents.
    
    This endpoint serves a web page that connects users to their voice agent
    using LiveKit room and the deployed sales agent.
    """
    try:
        settings = get_settings()
        
        # Validate access token
        token_data = voice_url_service.validate_voice_agent_token(token)
        if not token_data or token_data.get("session_id") != session:
            raise HTTPException(
                status_code=403,
                detail="Invalid or expired access token"
            )
        
        # Get session details
        session_doc = await appwrite_service.get_document(
            database_id=settings.appwrite_database_id,
            collection_id=settings.appwrite_voice_collection_id,
            document_id=session
        )
        
        if not session_doc:
            raise HTTPException(
                status_code=404,
                detail="Voice session not found"
            )
        
        # Check session status
        if session_doc.get("status") != "ready":
            return HTMLResponse(
                content=f"""
                <html>
                <head><title>Voice Agent Not Ready</title></head>
                <body>
                    <h1>Voice Agent Not Ready</h1>
                    <p>Session Status: {session_doc.get("status", "unknown")}</p>
                    <p>Please wait for the agent to be ready or contact support.</p>
                </body>
                </html>
                """,
                status_code=503
            )
        
        # Generate LiveKit room connection details
        room_id = session_doc.get("livekit_room_id")
        user_id = token_data.get("user_id")
        
        # Create the voice agent interface HTML
        # This would typically be a more sophisticated React/Vue component
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CLARIQ Voice Agent - {session_doc.get("session_name", "Sales Agent")}</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }}
                .container {{
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    padding: 40px;
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                }}
                .status {{
                    background: #e8f5e8;
                    color: #2d5a2d;
                    padding: 12px 24px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .connect-btn {{
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 20px 10px;
                }}
                .connect-btn:hover {{
                    background: #45a049;
                }}
                .info {{
                    margin: 20px 0;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎤 CLARIQ Voice Agent</h1>
                <h2>{session_doc.get("session_name", "Sales Agent")}</h2>
                
                <div class="status">
                    ✅ Voice Agent Ready
                </div>
                
                <div class="info">
                    <p>Your AI sales agent is ready to talk! Click the button below to start your conversation.</p>
                    <p><strong>Session:</strong> {session}</p>
                    <p><strong>Room:</strong> {room_id}</p>
                </div>
                
                <button class="connect-btn" onclick="connectToAgent()">
                    🎯 Start Conversation
                </button>
                
                <button class="connect-btn" onclick="endSession()" style="background: #f44336;">
                    🚪 End Session
                </button>
                
                <div id="status-message"></div>
                
                <script>
                    function connectToAgent() {{
                        const statusDiv = document.getElementById('status-message');
                        statusDiv.innerHTML = '<div class="status">Connecting to voice agent...</div>';
                        
                        // In a real implementation, this would:
                        // 1. Initialize LiveKit client
                        // 2. Connect to the room with the provided token
                        // 3. Enable microphone and speakers
                        // 4. Start voice conversation with the agent
                        
                        // For now, show a placeholder
                        setTimeout(() => {{
                            statusDiv.innerHTML = `
                                <div class="status">
                                    🎙️ Connected! Start speaking to your sales agent.
                                    <br><small>Room: {room_id}</small>
                                </div>
                            `;
                        }}, 2000);
                    }}
                    
                    function endSession() {{
                        if (confirm('Are you sure you want to end this voice session?')) {{
                            // End the session and redirect
                            window.close();
                        }}
                    }}
                    
                    // Auto-connect when page loads (optional)
                    // connectToAgent();
                </script>
            </div>
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_content)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load voice agent interface: {str(e)}"
        )


# Route definition to add to main.py:
# @app.get("/voice-agent", include_in_schema=False)
# async def voice_agent_page(request: Request, session: str = Query(...), token: str = Query(...)):
#     return await voice_agent_interface(request, session, token)