# backend/server.py
import os
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    logger.info(f"Starting server on {host}:{port}")
    # Use module path to app (adjust if you use different package/imports)
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
