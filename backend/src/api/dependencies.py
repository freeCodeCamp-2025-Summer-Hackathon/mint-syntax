from fastapi import Depends

from src.auth import get_current_active_admin, get_current_active_user

AdminUser = Depends(get_current_active_admin)
LoggedInUser = Depends(get_current_active_user)
