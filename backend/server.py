import os
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

host = "0.0.0.0"
port = int(os.getenv("PORT", 10000))  # Use Render's port if set

logger.info(f"Starting server on {host}:{port}")

uvicorn.run("backend.main:app", host=host, port=port, reload=False)
