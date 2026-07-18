import sys
import os

# Add parent directory to sys.path so backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
