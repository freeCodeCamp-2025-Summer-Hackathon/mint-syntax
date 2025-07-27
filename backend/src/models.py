from odmantic import Field, Model, ObjectId
from pydantic import BaseModel


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
    username: str = Field(unique=True)
    name: str = Field(max_length=255)
    password: str


class UserEditPatch(BaseModel):
    name: str | None = Field(max_length=255)
    password: str | None = None
    hashed_password: str | None = None


class AdminUserEditPatch(UserEditPatch):
    is_active: bool | None = None
    is_admin: bool | None = None


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


class IdeaCreate(BaseModel):
    name: str = Field(max_length=255)
    description: str | None


class IdeaEditPatch(BaseModel):
    name: str | None = Field(max_length=255)
    description: str | None


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
