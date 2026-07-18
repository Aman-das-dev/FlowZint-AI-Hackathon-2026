import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.main import app
except Exception as e:
    import traceback
    error_trace = traceback.format_exc()
    
    async def app(scope, receive, send):
        assert scope['type'] == 'http'
        await send({
            'type': 'http.response.start',
            'status': 500,
            'headers': [
                (b'content-type', b'text/plain'),
            ]
        })
        await send({
            'type': 'http.response.body',
            'body': error_trace.encode('utf-8'),
        })
