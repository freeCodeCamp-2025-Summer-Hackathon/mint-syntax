from fastapi import Depends, Request
from fastapi_csrf_protect import CsrfProtect

_csrf_protect_dependency = CsrfProtect()


async def validate_csrf(request: Request) -> bool:
    # CSRF validation dependency returns True if valid, raises if invalid

    csrf_protect = await Depends(_csrf_protect_dependency)
    await csrf_protect.validate_csrf(request)
    return True
