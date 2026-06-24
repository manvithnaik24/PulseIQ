from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "patient"
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    blood_group: Optional[str] = None

class UserCreate(UserBase):
    clerk_id: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    blood_group: Optional[str] = None

class UserResponse(UserBase):
    id: str
    clerk_id: str

    class Config:
        from_attributes = True
class UserProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    blood_group: Optional[str] = None

    class Config:
        from_attributes = True
