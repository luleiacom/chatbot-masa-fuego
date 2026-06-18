from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

class ChatRequest(BaseModel):
    messages: list

@app.post("/chat")
async def chat(req: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": req.messages
            },
            timeout=30
        )
        return res.json()

@app.get("/")
async def root():
    return {"status": "ok"}