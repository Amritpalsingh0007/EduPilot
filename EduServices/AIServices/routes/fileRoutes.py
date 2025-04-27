import os
import shutil
import uuid
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from firebase_admin import  auth, firestore

fileRouter = APIRouter()
db = firestore.client()

@fileRouter.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    try:
        # Step 1: Get Firebase auth token from headers
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        id_token = auth_header.split(" ")[1]

        # Step 2: Verify Firebase token
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        print(f"Authenticated Firebase user: {user_id}")

        if not file.file:
            raise HTTPException(status_code=400, detail="No file uploaded or file is empty")
        print(f"Incoming file: {file.filename}, content_type: {file.content_type}")
        # Step 3: Save uploaded file temporarily
        temp_filename = f"../temp/{uuid.uuid4()}_{file.filename}"
        os.makedirs(os.path.dirname(temp_filename), exist_ok=True)  # Ensure temp directory exists
        # Save the file to a temporary location
        with open(temp_filename, "wb") as buffer:
            print(f"Saving file to {temp_filename}")
            shutil.copyfileobj(file.file, buffer)

        # Step 4: Process the PDF file (text extraction + chunking)
        extracted_text = extract_text_from_pdf(temp_filename)
        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")

        # 🔄 NEW: Split into chunks
        chunks = split_text_recursively(extracted_text)
        if not chunks:
            raise HTTPException(status_code=400, detail="PDF text could not be split into chunks")

        # Step 5: Store metadata + chunks in Firestore
        doc_ref = db.collection("pdf_files").document()
        doc_data = {
            "user_id": user_id,
            "file_name": file.filename,
            "lessons_completed":0,
            "text_chunks": chunks,  
            "strength": [],
            "weakness": [],
            "mcq_scores": [],
            "lessons": [],
            "uploaded_at": firestore.SERVER_TIMESTAMP
        }
        doc_ref.set(doc_data)

        # Optional: Add file ref to user's profile
        user_doc_ref = db.collection("users").document(user_id)
        user_doc_ref.set({
            "files": firestore.ArrayUnion([doc_ref.id]),
            "file_titles": firestore.ArrayUnion([file.filename])
        }, merge=True)

        return {
            "message": "File uploaded and processed successfully",
            "file_id": doc_ref.id,
            "file_name": file.filename
        }

    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@fileRouter.get("/")
async def get_user_files(request: Request):
    try:
        # Get Firebase auth token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        id_token = auth_header.split(" ")[1]
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']
        print(f"Authenticated Firebase user: {user_id}")

        # Fetch user doc
        user_doc_ref = db.collection("users").document(user_id)
        user_doc = user_doc_ref.get()

        if not user_doc.exists:
            return {"files": []}

        user_data = user_doc.to_dict()
        file_ids = user_data.get("files", [])
        file_titles = user_data.get("file_titles", [])

        # Combine into a list of dicts
        combined = [
            {"id": file_id, "title": title}
            for file_id, title in zip(file_ids, file_titles)
        ]

        return {"files": combined}

    except Exception as e:
        print(f"Error fetching user files: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@fileRouter.get("/lessons/{file_id}")
async def get_lessons_for_file(file_id: str, request: Request):
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
        doc_ref = db.collection("pdf_files").document(file_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="File not found")

        doc_data = doc.to_dict()

        # Optional: Check if the user owns the file
        if doc_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this file")

        # Step 3: Return the lessons array
        lessons = doc_data.get("lessons", [])
        lessons_completed = doc_data.get("lessons_completed", 0)
        print(f"Lessons: {lessons}, Completed: {lessons_completed}")
        combined = [
            {"id": file_id, "title": title}
            for file_id, title in zip(lessons, range(1,len(lessons) + 1))
        ]
        print(f"Combined lessons: {combined}")

        for i in range(len(combined)):
            if i == lessons_completed - 1:
                combined[i]["isCompleted"] = True
            else:
                combined[i]["isCompleted"] = False

        print("Debug: ", combined)
        return { "lessons": combined}

    except Exception as e:
        print(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@fileRouter.get("/lessons/content/{file_id}")
async def get_lessons_for_file(file_id: str, request: Request):
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
        doc_ref = db.collection("lessons").document(file_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="File not found")

        doc_data = doc.to_dict()

        # Optional: Check if the user owns the file
        if doc_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this file")

        # Step 3: Return the lessons array
        lesson = doc_data.get("text", "")       

        return { "lesson": lesson}

    except Exception as e:
        print(f"Error fetching lessons: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@fileRouter.post("/{file_id}")
async def updateStrengthWeakness(file_id: str, request: Request):
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
        doc_ref = db.collection("pdf_files").document(file_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="File not found")

        doc_data = doc.to_dict()

        # Optional: Check if the user owns the file
        if doc_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this file")

        # Step 3: Update strength and weakness fields
        body = await request.json();
        strength = body.get("strength", [])
        weakness = body.get("weakness", [])
        mcq_score = body.get("mcq_score", 0)
        
        current_strength = doc_data.get("strength", [])
        current_weakness = doc_data.get("weakness", [])
        mcq_scores = doc_data.get("mcq_scores", [])

        strength = current_strength[((len(current_strength) + len(strength)) - 20 if (len(current_strength) + len(strength)) > 20  else 0):] + strength
        weakness = current_weakness[((len(current_weakness) + len(weakness)) - 20 if (len(current_weakness) + len(weakness)) > 20  else 0):] + weakness
        mcq_scores = mcq_scores[(1 if len(mcq_scores) == 10 else 0):] + [mcq_score]

        strength = list(set(strength))
        weakness = list(set(weakness))

        # Update Firestore document
        doc_ref.update({
            "strength": strength,
            "weakness": weakness,
            "lessons_completed": max(doc_data.get("lessons_completed", 0), len(doc_data.get("lessons", []))),
            "mcq_scores": mcq_scores
        })

        return {"message": "Strength and weakness updated successfully"}

    except Exception as e:
        print(f"Error updating strength and weakness: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using PyPDF2."""
    print(f"Extracting text from PDF: {pdf_path}")
    
    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    text = ""
    try:
        # Open the PDF file with explicit file handler to prevent closure issues
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            
            # Check if the PDF is encrypted
            if pdf_reader.is_encrypted:
                try:
                    pdf_reader.decrypt('')  # Try empty password
                    print("Successfully decrypted the PDF")
                except:
                    print("The PDF is encrypted and could not be decrypted")
                    return ""
            
            # Count pages for information
            num_pages = len(pdf_reader.pages)
            print(f"PDF has {num_pages} pages")
            
            # Extract text from each page
            for page_num in range(num_pages):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    text += page_text + "\n"
                    # Print progress for every 10 pages
                    if (page_num + 1) % 10 == 0:
                        print(f"Processed {page_num + 1}/{num_pages} pages")
                except Exception as e:
                    print(f"Error extracting text from page {page_num + 1}: {e}")
                    continue
            
        print(f"Successfully extracted text from {num_pages} pages")
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        raise

def split_text_recursively(text, chunk_size=1000, chunk_overlap=200):
    """Split text using LangChain's RecursiveCharacterTextSplitter."""
    print(f"Splitting text into chunks of size {chunk_size} with overlap {chunk_overlap}")
    
    if not text or len(text.strip()) == 0:
        print("Warning: No text to split. Returning empty list.")
        return []
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_text(text)
    print(f"Text split into {len(chunks)} chunks")
    
    return chunks

def save_chunks_to_file(chunks, output_path):
    """Save the text chunks to a file."""
    if not chunks:
        print("No chunks to save. Skipping file creation.")
        return
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for i, chunk in enumerate(chunks):
            f.write(f"--- Chunk {i+1} ---\n")
            f.write(chunk)
            f.write("\n\n")
    
    print(f"Chunks saved to {output_path}")

def process_pdf(pdf_path, output_path='output_chunks.txt', chunk_size=1000, chunk_overlap=200):
    try:
        # Check if file exists
        if not os.path.exists(pdf_path):
            print(f"Error: File {pdf_path} does not exist")
            return []
        
        # Get the full path
        pdf_path = os.path.abspath(pdf_path)
        print(f"Processing PDF at path: {pdf_path}")
        
        # Extract text from PDF using PyPDF2
        extracted_text = extract_text_from_pdf(pdf_path)
        
        if not extracted_text:
            print("No text was extracted from the PDF. Please check the file.")
            return []
            
        print(f"Extracted text length: {len(extracted_text)} characters")
        
        # Split text using LangChain's RecursiveCharacterTextSplitter
        chunks = split_text_recursively(
            extracted_text, 
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap
        )
        
        # Save chunks to file
        save_chunks_to_file(chunks, output_path)
        
        print("Process completed successfully!")
        return chunks
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        return []