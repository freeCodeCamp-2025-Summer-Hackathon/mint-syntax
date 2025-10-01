from datetime import UTC, datetime
from typing import Annotated

from odmantic import Field, Model, ObjectId
from pydantic import (
    AfterValidator,
    BaseModel,
    StringConstraints,
    computed_field,
)

from src.util import datetime_now

StrippedString = Annotated[str, StringConstraints(strip_whitespace=True)]
EmptyString = Annotated[str, StringConstraints(max_length=0, strip_whitespace=True)]
NonEmptyString = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]
Max255CharsString = Annotated[
    str, StringConstraints(max_length=255, strip_whitespace=True)
]
NonEmptyMax255CharsString = Annotated[
    str, StringConstraints(max_length=255, min_length=1, strip_whitespace=True)
]
PasswordString = Annotated[str, StringConstraints(min_length=8, strip_whitespace=True)]


def to_utc(input: datetime) -> datetime:
    if input.tzinfo is None:
        return input.replace(tzinfo=UTC)
    elif input.tzinfo is not UTC:
        return input.astimezone(UTC)
    return input


DateTimeUTC = Annotated[
    datetime,
    AfterValidator(to_utc),
]


class WithModifiedAtAutoUpdate(BaseModel):
    @computed_field  # type: ignore[prop-decorator]
    @property
    def modified_at(self) -> datetime:
        return datetime_now()


class User(Model):
    created_at: DateTimeUTC = Field(default_factory=datetime_now)
    modified_at: DateTimeUTC = Field(default_factory=datetime_now)
    username: str = Field(unique=True)
    name: str = Field(max_length=255)
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    upvotes: list[ObjectId] = []
    downvotes: list[ObjectId] = []


class UserMe(BaseModel):
    id: ObjectId
    created_at: DateTimeUTC
    modified_at: DateTimeUTC
    username: str
    name: str
    is_active: bool
    is_admin: bool
    upvotes: list[ObjectId]
    downvotes: list[ObjectId]


class UsersAdmin(BaseModel):
    users: list[UserMe]
    count: int


class UserPublic(BaseModel):
    id: ObjectId
    name: str


class UsersPublic(BaseModel):
    users: list[UserPublic]
    count: int


class UserRegister(BaseModel):
    username: NonEmptyMax255CharsString
    name: NonEmptyMax255CharsString
    password: PasswordString


class UserEditPatchInput(BaseModel):
    name: NonEmptyMax255CharsString | None = None
    old_password: EmptyString | PasswordString | None = None
    new_password: EmptyString | PasswordString | None = None


class UserEditPatch(WithModifiedAtAutoUpdate):
    name: NonEmptyMax255CharsString | None
    hashed_password: str | None = None


class AdminUserEditInputFields(BaseModel):
    is_active: bool | None = None
    is_admin: bool | None = None


class AdminUserEditPatchFields(BaseModel):
    is_active: bool | None
    is_admin: bool | None


class AdminUserEditPatchInput(UserEditPatchInput, AdminUserEditInputFields):
    pass


class AdminUserEditPatch(UserEditPatch, AdminUserEditPatchFields):
    pass


class AdminUserCreate(UserRegister):
    is_admin: bool = False


class Idea(Model):
    created_at: DateTimeUTC = Field(default_factory=datetime_now, index=True)
    modified_at: DateTimeUTC = Field(default_factory=datetime_now, index=True)
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId


class IdeaPublic(BaseModel):
    id: ObjectId
    created_at: DateTimeUTC
    name: str
    description: str
    upvoted_by: list[ObjectId]
    downvoted_by: list[ObjectId]
    creator_id: ObjectId


class IdeasPublic(BaseModel):
    data: list[IdeaPublic]
    count: int


class AdminUserIdeas(IdeasPublic):
    username: str


class IdeaCreate(BaseModel):
    name: NonEmptyMax255CharsString
    description: NonEmptyString


class IdeaEditPatch(WithModifiedAtAutoUpdate):
    name: NonEmptyMax255CharsString | None = None
    description: NonEmptyString | None = None


class IdeaUpvote(BaseModel):
    idea_id: ObjectId


class IdeaDownvote(BaseModel):
    idea_id: ObjectId


class Message(BaseModel):
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str


class RefreshToken(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    id: ObjectId | None = None


class LoginData(BaseModel):
    user_data: UserMe
    token: Token
