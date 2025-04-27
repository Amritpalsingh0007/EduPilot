from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    prompt: str
    sessionID : Optional[str] =None