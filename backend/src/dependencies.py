from typing import Annotated

from fastapi import Depends
from odmantic.session import AIOSession

from src.database import get_db

Db = Annotated[AIOSession, Depends(get_db)]
