from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from model import Address
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/addresses", tags=["Addresses"])

ALLOWED_LABELS = {"Home", "Work", "Other"}


class AddressCreate(BaseModel):
    label: str = Field(..., description="Home, Work, or Other")
    custom_label: str | None = None
    address_line1: str
    address_line2: str | None = None
    city: str
    postal_code: str | None = None
    phone: str
    delivery_instructions: str | None = None
    is_default: bool = False


class AddressUpdate(AddressCreate):
    pass


def _validate_label(label: str):
    if label not in ALLOWED_LABELS:
        raise HTTPException(
            status_code=400,
            detail=f"label must be one of {sorted(ALLOWED_LABELS)}",
        )


def _serialize(a: Address) -> dict:
    return {
        "id": a.id,
        "label": a.label,
        "custom_label": a.custom_label,
        "display_label": a.custom_label if a.label == "Other" and a.custom_label else a.label,
        "address_line1": a.address_line1,
        "address_line2": a.address_line2,
        "city": a.city,
        "postal_code": a.postal_code,
        "phone": a.phone,
        "delivery_instructions": a.delivery_instructions,
        "is_default": a.is_default,
        "created_at": a.created_at.isoformat() + "Z" if a.created_at else None,
    }


def _unset_other_defaults(db: Session, user_id: int, except_id: int | None = None):
    query = db.query(Address).filter(Address.user_id == user_id, Address.is_default == True)  # noqa: E712
    if except_id is not None:
        query = query.filter(Address.id != except_id)
    query.update({"is_default": False})


@router.get("")
def get_addresses(
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    addresses = (
        db.query(Address)
        .filter(Address.user_id == user.id)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
        .all()
    )
    return {"addresses": [_serialize(a) for a in addresses]}


@router.post("", status_code=201)
def add_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    _validate_label(payload.label)

    is_first_address = db.query(Address).filter(Address.user_id == user.id).count() == 0
    make_default = payload.is_default or is_first_address  # first saved address is always the default

    address = Address(
        user_id=user.id,
        label=payload.label,
        custom_label=payload.custom_label if payload.label == "Other" else None,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        city=payload.city,
        postal_code=payload.postal_code,
        phone=payload.phone,
        delivery_instructions=payload.delivery_instructions,
        is_default=make_default,
    )
    db.add(address)
    db.flush()

    if make_default:
        _unset_other_defaults(db, user.id, except_id=address.id)

    db.commit()
    db.refresh(address)
    return _serialize(address)


@router.put("/{address_id}")
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    _validate_label(payload.label)

    entry = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Address not found")

    entry.label = payload.label
    entry.custom_label = payload.custom_label if payload.label == "Other" else None
    entry.address_line1 = payload.address_line1
    entry.address_line2 = payload.address_line2
    entry.city = payload.city
    entry.postal_code = payload.postal_code
    entry.phone = payload.phone
    entry.delivery_instructions = payload.delivery_instructions

    if payload.is_default:
        entry.is_default = True
        _unset_other_defaults(db, user.id, except_id=entry.id)

    db.commit()
    db.refresh(entry)
    return _serialize(entry)


@router.patch("/{address_id}/default")
def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user, _ = current
    entry = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Address not found")

    entry.is_default = True
    _unset_other_defaults(db, user.id, except_id=entry.id)
    db.commit()
    db.refresh(entry)
    return _serialize(entry)


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

    was_default = entry.is_default
    db.delete(entry)
    db.flush()

    if was_default:
        # Promote the most recently added remaining address to default so
        # checkout always has one to pre-select.
        replacement = (
            db.query(Address)
            .filter(Address.user_id == user.id)
            .order_by(Address.created_at.desc())
            .first()
        )
        if replacement:
            replacement.is_default = True

    db.commit()
    return {"message": "Address deleted"}
