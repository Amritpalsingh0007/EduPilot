from aiResponse import getResponse
from model.ChatRequest import ChatRequest
from fastapi import HTTPException, APIRouter, Request
from AIModel.gemini import generate, summary, generate_mcqs
from firebase_admin import  auth, firestore

llmRouter = APIRouter()
db = firestore.client()

@llmRouter.post("/chat")
def chat(request: ChatRequest):
    try:
        response = getResponse(request.prompt)
        print(response)
        return {"response": response}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@llmRouter.get("/lesson/create/{file_id}")
def lesson_generator(file_id: str,request: Request):
    try:
        system = """You are an EduPilot AI tutor specializing in adaptive learning. Your task is to generate a personalized lesson and quiz based on the user’s learning history, strengths, weaknesses, and quiz performance. Prioritize clarity, engagement, and gradual difficulty scaling."""
        instructions = """Generate a lesson that:
1. Starts with a brief recap linking past lessons to the current topic.
2. Adjusts complexity based on the user's quiz score and weaknesses.
3. Includes examples tailored to their strengths to build confidence.
4. make sure that you have to generate atleast 4k token length"""
       
        

        
        # Step 1: Validate Firebase token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        id_token = auth_header.split(" ")[1]
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
        print(f"Authenticated Firebase user: {user_id}")

        # Step 2: Fetch the PDF file document
        doc_ref = db.collection("pdf_files").document(file_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="File not found")

        doc_data = doc.to_dict()

        # Optional: Check if the user owns the file
        if doc_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this file")
        # Step 3: Return the lessons array
        previous_lessons_text = ""
        last_lesson = doc_data.get("last_lesson", 0)
        if last_lesson == 0:
            previous_lessons_text = ""
            current_lesson = doc_data.get("text_chunks", [])[0]
            previous_lessons_mcq_score = []
            user_strengths = """"""
            user_weaknesses = """"""
        else:
            previous_lessons = doc_data.get("lessons", [])[-4:]
            current_lesson = doc_data.get("text_chunks", [])[last_lesson]
            previous_lessons_mcq_score = doc_data.get("previous_lessons_mcq_score", [])
            user_strengths = doc_data.get("user_strengths", [])[-20:]
            user_weaknesses = doc_data.get("user_weaknesses", [])[-20:]
            
            for i in previous_lessons:
                doc_lesson_ref = db.collection("lessons").document(i)
                doc_lesson = doc_lesson_ref.get()
                if not doc_lesson.exists:
                    raise HTTPException(status_code=404, detail="File not found")
                doc_data = doc.to_dict()
                previous_lessons_text += doc_data.get("text", "")

                

        previous_lessons = summary(previous_lessons_text)
        
        prompt = f""""
        [System]
        {system}
        [Instructions]
        {instructions}
        [Previous Lessons]
        {previous_lessons}
        [Current Lesson]
        {current_lesson}    
        [User Data]
        user data :
        strength: {user_strengths}
        weakness: {user_weaknesses}
        previous lesson mcq scores: {previous_lessons_mcq_score}
        """
        response = generate(prompt)
        doc_lesson_ref = db.collection("lessons").document()
        doc_lesson_ref.set({
            "title":"Lesson " + str(last_lesson + 1),
            "text": response,
            "user_id": user_id,
            "file_id": file_id,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        doc_ref.update({"lessons": firestore.ArrayUnion([doc_lesson_ref.id]),
                        "last_lesson": last_lesson + 1
                        })
        return { "response": "Successfully generated", "lesson_id": doc_lesson_ref.id, "status" : 0 }

    except Exception as e:
        print(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    


@llmRouter.get("/lesson/quiz/{lesson_id}")
def quiz_generator(lesson_id: str,request: Request):
    try:
        
        # Step 1: Validate Firebase token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        id_token = auth_header.split(" ")[1]
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
        print(f"Authenticated Firebase user: {user_id}")

        # Step 2: Fetch the PDF file document
        doc_ref = db.collection("lessons").document(lesson_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="File not found")

        doc_data = doc.to_dict()

        # Optional: Check if the user owns the file
        if doc_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this file")
        # Step 3: Return the lessons array
        text = doc_data.get("text", "")
        if not text:
            raise HTTPException(status_code=404, detail="File not found")
        response = generate_mcqs(text)
        return { "quiz": response }

    except Exception as e:
        print(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    

