from fastapi import APIRouter, Response
from fastapi_csrf_protect import CsrfProtect

router = APIRouter(prefix="/csrf")


_csrf_protect = CsrfProtect()


@router.get("/get-token")
async def get_csrf_token(response: Response):
    csrf_token, signed_token = _csrf_protect.generate_csrf_tokens()
    _csrf_protect.set_csrf_cookie(signed_token, response)
    return {"csrf_token": csrf_token}
