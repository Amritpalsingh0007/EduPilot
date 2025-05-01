import os
from dotenv import load_dotenv
import firebase_admin
import firebase_admin.firestore
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from google.cloud import firestore
from langchain_google_firestore import FirestoreChatMessageHistory

load_dotenv()

PROJECT_ID = os.getenv('PROJECT_ID')
COLLECTION_ID = 'chat_history'

client = firebase_admin.firestore.client()
model = ChatGoogleGenerativeAI(model = "gemini-1.5-pro")

def generateMessage(humanMessage, systemMessage="you are a tutor. You must explain everything step by step or in simple but detail enough way for student's complete understanding"):

    return [
        SystemMessage(content =systemMessage),
        HumanMessage(content= humanMessage)
    ]

def getResponse(humanMessage, sessionID=None):
    if(not sessionID):
        sessionID = client.collection(COLLECTION_ID).document().id

    chat_history = FirestoreChatMessageHistory(
        session_id=sessionID,
        collection= COLLECTION_ID,
        client= client
    )

    if not chat_history.messages:
        chat_history.messages.append(SystemMessage(content="you are a tutor. You must explain everything step by step or in simple but detail enough way for student's complete understanding"))
    
    chat_history.add_user_message(humanMessage)
    ai_response = model.invoke(chat_history.messages[-7:])
    chat_history.add_ai_message(ai_response.content)

    return ai_response, sessionID

if __name__=="__main__":
    getResponse("what is LLM")