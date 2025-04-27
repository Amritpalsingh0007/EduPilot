from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import initialize_app
from middleware.middleware import FirebaseAuthMiddleware
from Firebase.firebaseConfig import cred
from routes.requestLLMRoutes import llmRouter
from routes.fileRoutes import fileRouter

app = FastAPI()

app.add_middleware(FirebaseAuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(llmRouter, prefix="/api/v1")
app.include_router(fileRouter, prefix="/api/v1/file")




