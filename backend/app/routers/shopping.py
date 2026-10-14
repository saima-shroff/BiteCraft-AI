from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PantryItem, ShoppingItem, User
from ..schemas import ShoppingCreate, ShoppingOut, ShoppingUpdate, ShoppingUpdateResult
from ..security import get_current_user

router = APIRouter(prefix="/api/shopping-list", tags=["shopping"])


def _get(db: Session, user: User, item_id: int) -> ShoppingItem:
    item = db.query(ShoppingItem).filter_by(id=item_id, user_id=user.id).first()
    if not item:
        raise HTTPException(404, "Shopping item not found")
    return item


@router.get("", response_model=List[ShoppingOut])
def list_items(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ShoppingItem).filter_by(user_id=user.id).order_by(ShoppingItem.id).all()


@router.post("", response_model=ShoppingOut, status_code=201)
def create_item(data: ShoppingCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = ShoppingItem(user_id=user.id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ShoppingUpdateResult)
def update_item(item_id: int, data: ShoppingUpdate, user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    """Marking an item purchased moves it into the pantry (merging quantity if it already exists)."""
    item = _get(db, user, item_id)
    changes = data.model_dump(exclude_unset=True)
    if changes.get("is_purchased"):
        unit = changes.get("unit") or item.unit
        qty = changes.get("quantity", item.quantity)
        existing = db.query(PantryItem).filter(
            PantryItem.user_id == user.id,
            func.lower(PantryItem.name) == item.name.lower(),
            PantryItem.unit == unit,
        ).first()
        if existing:
            existing.quantity = (existing.quantity or 0) + qty
            pantry = existing
        else:
            pantry = PantryItem(user_id=user.id, name=item.name, quantity=qty, unit=unit)
            db.add(pantry)
        db.delete(item)
        db.commit()
        db.refresh(pantry)
        return ShoppingUpdateResult(moved_to_pantry=pantry)
    for k, v in changes.items():
        if v is not None:
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return ShoppingUpdateResult(item=item)


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(_get(db, user, item_id))
    db.commit()
