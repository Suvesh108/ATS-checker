import sys
import os

# Ensure backend directory and root are in sys.path for Vercel Serverless Functions
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from main import app

# Vercel serverless function entrypoint
handler = app
