import json
from pydantic import BaseModel, ValidationError
from typing import List
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
# Define your JSON schema using Pydantic
class QuestionModel(BaseModel):
    question: str  # Updated to match the response
    options: List[str]
    correct_answer: str  # Updated to match the response
    concept: str  # Updated to match the response
    explanation: str  # Updated to match the response

class QuestionsListModel(BaseModel):
    questions: List[QuestionModel]

# Configure the Gemini API
genai.configure(api_key= os.getenv("GOOGLE_API_KEY"))  # Replace with your actual API key
model = genai.GenerativeModel("gemini-2.0-flash")  # Replace with your actual model name

# Function to generate multiple-choice questions
def generate(prompt):
    response = model.generate_content(prompt)
    return response.text

def summary(previous_lessons):
    prompt = f"Generate a comprehensive summary for the following lesson such that key details lessons tought can be preserved but summary length must not exceed 1K token : {previous_lessons} "

    # Generate MCQs and handle potential errors
    try:
        response = generate(prompt)
        return response
    except Exception as e:
        print("An unexpected error occurred:", e)

def generate_mcqs(text):
    example = """
    Example for JSON object format:
    { question: "What is the capital of india?",
    options:["Mumbai", "delhi", "Bangalor","Chandigarh"],
    correct_answer: "delhi",
    concept: "Geography",
    explanation: "The capital of India is Delhi."
    }
    """
    prompt = f"""Generate 10 multiple-choice questions about {text} in JSON format.
    {example}
    Dont use mcq in text directly. Increase the difficulty level of questions gradually.
    Make sure that the questions are not too easy or too hard.
"""
    # Generate MCQs and handle potential errors
    try:
        mcq_response = generate(prompt)

        # Log the raw response for debugging
        print("Raw response from model:", mcq_response)

        # Check if the response is empty
        if not mcq_response.strip():
            raise ValueError("Received an empty response from the model.")

        mcq_response = mcq_response.removeprefix("```json").strip()

        # Clean the response if it includes code block formatting
        mcq_response = "{ \"questions\" :" + mcq_response.removesuffix("```").strip() + "}"
        # mcq_response = mcq_response.removesuffix("```").strip()

        # Attempt to parse the JSON data
        json_data = json.loads(mcq_response)

        # Validate the JSON data directly from the parsed response
        validated_data = QuestionsListModel(**json_data)  # No need to wrap in another dict

        # Output the validated JSON
        return validated_data.model_dump()

    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
    except ValidationError as e:
        print("Validation error:", e)
    except Exception as e:
        print("An unexpected error occurred:", e)