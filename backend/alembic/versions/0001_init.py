"""initial schema — enable PostGIS + create all tables from metadata

Revision ID: 0001
Revises:
Create Date: 2026-09-27
"""
from alembic import op

from app.db import Base
import app.models  # noqa: F401

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    # GeoAlchemy2 geometry columns + GiST spatial indexes are created from the
    # ORM metadata (spatial_index defaults to True on Geometry columns).
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
