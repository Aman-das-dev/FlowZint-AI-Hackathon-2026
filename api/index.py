import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

error_trace = "No error"
try:
    from backend.main import app as _app
except Exception as e:
    error_trace = traceback.format_exc()

async def app(scope, receive, send):
    assert scope['type'] == 'http'
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [(b'content-type', b'text/plain')]
    })
    await send({
        'type': 'http.response.body',
        'body': (f"Hello from Vercel! Traceback: {error_trace}").encode('utf-8')
    })
