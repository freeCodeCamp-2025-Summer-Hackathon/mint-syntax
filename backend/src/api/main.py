from fastapi import APIRouter

from src.api.csrf_security import csrf_routes
from src.api.routes import auth, ideas, users

api_router = APIRouter()
api_router.include_router(ideas.router)
api_router.include_router(users.router)
api_router.include_router(csrf_routes.router, tags=["CSRF"])
api_router.include_router(auth.router)
