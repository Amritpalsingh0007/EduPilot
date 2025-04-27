from firebase_admin import credentials, initialize_app

# Load service account JSON key
cred = credentials.Certificate("Firebase/serviceAccountKey.json")

initialize_app(cred)
