from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    dietary_flags: List[str] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORM):
    id: int
    email: EmailStr
    dietary_flags: List[str]
    created_at: datetime


class UserUpdate(BaseModel):
    dietary_flags: List[str]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PantryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: float = Field(default=1, ge=0)
    unit: str = Field(default="pcs", max_length=20)
    expiration_date: Optional[date] = None
    category: str = Field(default="Other", max_length=50)


class PantryCreate(PantryBase):
    pass


class PantryOut(PantryBase, ORM):
    id: int


class IngredientLine(BaseModel):
    name: str
    quantity: float = 1
    unit: str = ""
    in_pantry: bool = True


class RecipeBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    prep_time_mins: int = Field(default=0, ge=0)
    instructions: List[str] = []
    ingredients_json: List[IngredientLine] = []


class RecipeCreate(RecipeBase):
    pass


class RecipeOut(RecipeBase, ORM):
    id: int


class ShoppingBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    quantity: float = Field(default=1, ge=0)
    unit: str = Field(default="pcs", max_length=20)
    is_purchased: bool = False


class ShoppingCreate(ShoppingBase):
    pass


class ShoppingOut(ShoppingBase, ORM):
    id: int


class ShoppingUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    is_purchased: Optional[bool] = None


class ShoppingUpdateResult(BaseModel):
    item: Optional[ShoppingOut] = None
    moved_to_pantry: Optional[PantryOut] = None


class GenerateRequest(BaseModel):
    ingredient_ids: List[int] = Field(min_length=1)
    extra_notes: str = Field(default="", max_length=300)
