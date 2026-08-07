from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from model import Address
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/addresses", tags=["Addresses"])


class AddressCreate(BaseModel):
    label: str
    address_line: str
    city: str
    phone: str


class AddressUpdate(BaseModel):
    label: str
    address_line: str
    city: str
    phone: str


@router.get("")
def get_addresses(
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    addresses = db.query(Address).filter(Address.user_id == user.id).all()
    return {
        "addresses": [
            {"id": a.id, "label": a.label, "address_line": a.address_line, "city": a.city, "phone": a.phone}
            for a in addresses
        ]
    }


@router.post("", status_code=201)
def add_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    address = Address(
        user_id=user.id,
        label=payload.label,
        address_line=payload.address_line,
        city=payload.city,
        phone=payload.phone,
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return {"id": address.id, "label": address.label, "address_line": address.address_line, "city": address.city, "phone": address.phone}


@router.put("/{address_id}")
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    entry = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Address not found")
    entry.label = payload.label
    entry.address_line = payload.address_line
    entry.city = payload.city
    entry.phone = payload.phone
    db.commit()
    return {"id": entry.id, "label": entry.label, "address_line": entry.address_line, "city": entry.city, "phone": entry.phone}


@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    entry = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(entry)
    db.commit()
    return {"message": "Address deleted"}