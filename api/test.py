from http.server import BaseHTTPRequestHandler
import sys
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
        self.wfile.write(f'Test successful. Python {sys.version}'.encode('utf-8'))
        return
