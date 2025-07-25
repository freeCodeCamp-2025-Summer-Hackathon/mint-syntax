from fastapi import APIRouter

from src.api.routes import auth, csrf, ideas, me, users

api_router = APIRouter()
api_router.include_router(ideas.router)
api_router.include_router(users.router)
api_router.include_router(csrf.router, tags=["CSRF"])
api_router.include_router(auth.router)
api_router.include_router(me.router)
