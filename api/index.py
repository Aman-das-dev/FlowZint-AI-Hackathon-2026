import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.main import app
except Exception as e:
    import traceback
    error_trace = traceback.format_exc()
    def app(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [error_trace.encode('utf-8')]
