import sys
import os

# Add backend directory to python path for app imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

# Export app for Vercel WSGI/ASGI handler
__all__ = ["app"]
