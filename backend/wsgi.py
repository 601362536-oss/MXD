import os
import sys

os.environ["SKIP_STATIC"] = "1"

# Ensure the backend package is importable
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

os.chdir(os.path.join(project_root, "backend"))

from a2wsgi import ASGIMiddleware
from app.main import app

application = ASGIMiddleware(app)
