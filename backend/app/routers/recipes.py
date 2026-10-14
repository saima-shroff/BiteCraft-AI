from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Recipe, User
from ..schemas import RecipeCreate, RecipeOut
from ..security import get_current_user

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("", response_model=List[RecipeOut])
def list_recipes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Recipe).filter_by(user_id=user.id).order_by(Recipe.id.desc()).all()


@router.post("", response_model=RecipeOut, status_code=201)
def create_recipe(data: RecipeCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipe = Recipe(user_id=user.id, title=data.title, prep_time_mins=data.prep_time_mins,
                    instructions=data.instructions,
                    ingredients_json=[i.model_dump() for i in data.ingredients_json])
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter_by(id=recipe_id, user_id=user.id).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    db.delete(recipe)
    db.commit()
