"""Aggregate v1 router."""
from fastapi import APIRouter

from . import analysis, interventions, photos, watersheds

api_router = APIRouter()
api_router.include_router(watersheds.router)
api_router.include_router(interventions.router)
api_router.include_router(analysis.router)
api_router.include_router(photos.router)
