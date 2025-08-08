# backend/server.py
from main import app
import os

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))  # required by Render
    uvicorn.run(app, host="0.0.0.0", port=port)

from routes import signaling_routes
app.include_router(signaling_routes.router)
