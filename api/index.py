import sys
import os

# Add parent directory to sys.path so backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.main import app
except Exception as e:
    import traceback
    from fastapi import FastAPI
    app = FastAPI()
    error_msg = traceback.format_exc()
    @app.get("/{path:path}")
    def catch_all(path: str):
        return {"error": "Failed to import backend.main", "traceback": error_msg}
