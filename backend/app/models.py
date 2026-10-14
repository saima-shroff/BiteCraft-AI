from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    dietary_flags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    pantry_items = relationship("PantryItem", cascade="all, delete-orphan")
    recipes = relationship("Recipe", cascade="all, delete-orphan")
    shopping_items = relationship("ShoppingItem", cascade="all, delete-orphan")


class PantryItem(Base):
    __tablename__ = "pantry_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Float, default=1)
    unit = Column(String, default="pcs")
    expiration_date = Column(Date, nullable=True)
    category = Column(String, default="Other")


class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    prep_time_mins = Column(Integer, default=0)
    instructions = Column(JSON, default=list)
    ingredients_json = Column(JSON, default=list)


class ShoppingItem(Base):
    __tablename__ = "shopping_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Float, default=1)
    unit = Column(String, default="pcs")
    is_purchased = Column(Boolean, default=False)
