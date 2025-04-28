from dotenv import load_dotenv
import os
import json
from firebase_admin import credentials, initialize_app

load_dotenv()

firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_credentials:
    raise ValueError("FIREBASE_CREDENTIALS environment variable not set")
print("Firebase credentials loaded successfully.")
# Replace the escape sequence '\\n' with actual newlines
firebase_credentials = firebase_credentials.replace('\\\\n', '\\n')

# Now load the credentials
cred = credentials.Certificate(json.loads(firebase_credentials))
initialize_app(cred)
