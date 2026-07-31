from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/addresses", tags=["Addresses"])

# user_id -> list of address dicts
ADDRESSES_DB: dict[int, list[dict]] = {}


class AddressCreate(BaseModel):
    user_id: int
    label: str          # e.g. "Home", "Work"
    address_line: str
    city: str
    phone: str


class AddressUpdate(BaseModel):
    label: str
    address_line: str
    city: str
    phone: str


@router.get("/{user_id}")
def get_addresses(user_id: int):
    return {"addresses": ADDRESSES_DB.get(user_id, [])}


@router.post("", status_code=201)
def add_address(payload: AddressCreate):
    user_addresses = ADDRESSES_DB.setdefault(payload.user_id, [])
    new_id = (max([a["id"] for a in user_addresses], default=0)) + 1

    address = {
        "id": new_id,
        "label": payload.label,
        "address_line": payload.address_line,
        "city": payload.city,
        "phone": payload.phone,
    }
    user_addresses.append(address)
    return address


@router.put("/{user_id}/{address_id}")
def update_address(user_id: int, address_id: int, payload: AddressUpdate):
    user_addresses = ADDRESSES_DB.get(user_id, [])
    entry = next((a for a in user_addresses if a["id"] == address_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Address not found")

    entry.update(payload.dict())
    return entry


@router.delete("/{user_id}/{address_id}")
def delete_address(user_id: int, address_id: int):
    user_addresses = ADDRESSES_DB.get(user_id, [])
    entry = next((a for a in user_addresses if a["id"] == address_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Address not found")

    user_addresses.remove(entry)
    return {"message": "Address deleted"}
