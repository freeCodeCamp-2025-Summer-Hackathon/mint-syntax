from fastapi import Depends, Request
from fastapi_csrf_protect import CsrfProtect


async def validate_csrf(
    request: Request,
    csrf_protect: CsrfProtect = Depends(),  # noqa: B008
) -> bool:
    """
    CSRF validation dependency
    """

    await csrf_protect.validate_csrf(request)

    return True
