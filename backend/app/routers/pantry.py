from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PantryItem, User
from ..schemas import PantryCreate, PantryOut
from ..security import get_current_user

router = APIRouter(prefix="/api/pantry", tags=["pantry"])


def _get(db: Session, user: User, item_id: int) -> PantryItem:
    item = db.query(PantryItem).filter_by(id=item_id, user_id=user.id).first()
    if not item:
        raise HTTPException(404, "Pantry item not found")
    return item


@router.get("", response_model=List[PantryOut])
def list_items(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (db.query(PantryItem).filter_by(user_id=user.id)
            .order_by(PantryItem.expiration_date.is_(None), PantryItem.expiration_date).all())


@router.post("", response_model=PantryOut, status_code=201)
def create_item(data: PantryCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = PantryItem(user_id=user.id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=PantryOut)
def update_item(item_id: int, data: PantryCreate, user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    item = _get(db, user, item_id)
    for k, v in data.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(_get(db, user, item_id))
    db.commit()
