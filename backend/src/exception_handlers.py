from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi_csrf_protect.exceptions import CsrfProtectError


async def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
    response = JSONResponse(
        status_code=403,  # Always return 403 for CSRF failures
        content={
            "type": "Missing CSRF Token in header",
            "title": "Forbidden",
            "detail": str(exc),
            "instance": request.url.path,
            "method": request.method,
            "status": 403,
        },
    )

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    return response
