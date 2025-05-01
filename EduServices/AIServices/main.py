import Firebase.firebaseConfig
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.middleware import FirebaseAuthMiddleware
from routes.requestLLMRoutes import llmRouter
from routes.fileRoutes import fileRouter

app = FastAPI()

app.add_middleware(FirebaseAuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://edu-pilot-phi.vercel.app", "http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(llmRouter, prefix="/api/v1")
app.include_router(fileRouter, prefix="/api/v1/file")



if (__name__ == "__main__"):
    import uvicorn    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
