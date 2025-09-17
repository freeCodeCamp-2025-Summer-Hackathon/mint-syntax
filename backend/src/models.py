from typing import Annotated

from odmantic import Field, Model, ObjectId
from pydantic import BaseModel, StringConstraints

StrippedString = Annotated[str, StringConstraints(strip_whitespace=True)]
EmptyString = Annotated[StrippedString, StringConstraints(max_length=0)]
NonEmptyString = Annotated[StrippedString, StringConstraints(min_length=1)]
Max255CharsString = Annotated[StrippedString, StringConstraints(max_length=255)]
NonEmptyMax255CharsString = Annotated[NonEmptyString, Max255CharsString]
PasswordString = Annotated[StrippedString, StringConstraints(min_length=8)]


class User(Model):
    username: str = Field(unique=True)
    name: str = Field(max_length=255)
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    upvotes: list[ObjectId] = []
    downvotes: list[ObjectId] = []


class UserMe(BaseModel):
    id: ObjectId
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
    name: str = Field(max_length=255)


class UsersPublic(BaseModel):
    users: list[UserPublic]
    count: int


class UserRegister(BaseModel):
    username: NonEmptyMax255CharsString
    name: NonEmptyMax255CharsString
    password: PasswordString


class UserEditPatchInput(BaseModel):
    name: Max255CharsString | None = None
    old_password: EmptyString | PasswordString | None = None
    new_password: EmptyString | PasswordString | None = None


class UserEditPatch(BaseModel):
    name: Max255CharsString | None = None
    hashed_password: str | None = None


class AdminUserEditFields(BaseModel):
    is_active: bool | None = None
    is_admin: bool | None = None


class AdminUserEditPatchInput(UserEditPatchInput, AdminUserEditFields):
    pass


class AdminUserEditPatch(UserEditPatch, AdminUserEditFields):
    pass


class AdminUserCreate(UserRegister):
    is_admin: bool = False


class Idea(Model):
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId


class IdeaPublic(BaseModel):
    id: ObjectId
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId


class IdeasPublic(BaseModel):
    data: list[IdeaPublic]
    count: int


class AdminUserIdeas(IdeasPublic):
    username: str


class IdeaCreate(BaseModel):
    name: NonEmptyMax255CharsString
    description: NonEmptyString


class IdeaEditPatch(BaseModel):
    name: NonEmptyMax255CharsString | None = Field(max_length=255)
    description: StrippedString | None


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
