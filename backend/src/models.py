from odmantic import Field, Model, ObjectId
from pydantic import BaseModel


class User(Model):
    name: str = Field(max_length=255)
    is_active: bool = True
    upvotes: list[ObjectId] = []
    downvotes: list[ObjectId] = []


class UserPublic(BaseModel):
    id: ObjectId
    name: str = Field(max_length=255)


class UserRegister(BaseModel):
    name: str = Field(max_length=255)


class UserEditPatch(BaseModel):
    name: str | None = Field(max_length=255)


class Idea(Model):
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId


class IdeaPublic(BaseModel):
    name: str
    description: str
    upvoted_by: list[ObjectId] = []
    downvoted_by: list[ObjectId] = []
    creator_id: ObjectId


class IdeasPublic(BaseModel):
    data: list[Idea]
    count: int


class IdeaCreate(BaseModel):
    name: str = Field(max_length=255)
    description: str | None
    creator_id: ObjectId


class IdeaEditPatch(BaseModel):
    name: str | None = Field(max_length=255)
    description: str | None


class IdeaUpvote(BaseModel):
    idea_id: ObjectId
    user_id: ObjectId


class IdeaDownvote(BaseModel):
    idea_id: ObjectId
    user_id: ObjectId


class Message(BaseModel):
    message: str
