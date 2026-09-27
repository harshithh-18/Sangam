"""Field-photo ingestion: upload -> EXIF -> validate -> classify stub (§5, §6D)."""
from __future__ import annotations

import hashlib
import os
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from ...config import settings
from ...db import get_db
from ...demo import BOUNDARY
from ...geo.exif import extract_exif
from ...geo.validate import validate_photo_point
from ...schemas import PhotoIngestOut

router = APIRouter(prefix="/photos", tags=["photos"])


@router.post("/ingest", response_model=PhotoIngestOut)
async def ingest_photo(
    file: UploadFile = File(...),
    lat: float | None = Form(None),
    lng: float | None = Form(None),
    captured_at: str | None = Form(None),
    watershed_id: str | None = Form(None),
    db: Session = Depends(get_db),
):
    """Ingest one field photo. EXIF is extracted independently and validated;
    the original is stored immutably. A classifier stub returns a placeholder
    label until the trained model is wired (next phase)."""
    os.makedirs(settings.storage_dir, exist_ok=True)
    pid = f"IV-{uuid.uuid4().hex[:8]}"
    data = await file.read()
    checksum = hashlib.sha256(data).hexdigest()
    path = os.path.join(settings.storage_dir, f"{pid}_{file.filename}")
    with open(path, "wb") as fh:
        fh.write(data)

    exif = extract_exif(path)
    # Prefer explicit form coords; else EXIF GPS.
    use_lat = lat if lat is not None else exif.get("lat")
    use_lng = lng if lng is not None else exif.get("lng")
    use_time = captured_at or exif.get("captured_at")

    reasons: list[str] = []
    status = "review"
    if use_lat is not None and use_lng is not None:
        vr = validate_photo_point(
            use_lng, use_lat, boundary_ring=BOUNDARY, captured_at=use_time,
        )
        status = "valid" if vr.ok else vr.status
        reasons = vr.reasons
    else:
        reasons = ["missing_coordinates"]
        status = "flagged"

    # --- classifier stub: TODO(next-phase) load trained ResNet-50/EfficientNet ---
    inference = {
        "label": "other", "confidence": 0.0,
        "model_version": "photo-cls-stub v0.0",
        "note": "Placeholder — trained classifier not yet wired.",
    }

    return PhotoIngestOut(
        id=pid, review_status=status, review_reasons=reasons,
        exif=exif, inference=inference,
    )
