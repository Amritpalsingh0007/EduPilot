from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from firebase_admin import auth

class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            raise HTTPException(status_code=401, detail="Authorization token is missing")

        # Extract token and verification (Bearer <token>)
        try:
            token = auth_header.split(" ")[1]
            if token:
                try:
                    decoded_token = auth.verify_id_token(token)
                    request.state.user = decoded_token
                except Exception as e:
                    raise HTTPException(status_code=401, detail=f"Unauthorized token: {str(e)}")
            else:
                raise HTTPException(status_code=401, detail="Authorization token is missing")

        except IndexError:
            raise HTTPException(status_code=401, detail="Invalid Authorization token format")

        

        response = await call_next(request)
        return response