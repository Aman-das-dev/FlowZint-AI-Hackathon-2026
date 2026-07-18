import sys
import os
from fastapi import FastAPI

app = FastAPI()

@app.get("/api")
@app.get("/api/{path:path}")
def dummy():
    return {"message": "Dummy endpoint works! The issue is with backend imports."}
