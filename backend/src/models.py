from datetime import datetime

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


class Idea(Model):
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId
    creation_time: datetime
    last_edit_time: datetime


class IdeaPublic(BaseModel):
    id: ObjectId
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId
    creation_time: datetime
    last_edit_time: datetime


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
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    id: ObjectId | None = None
