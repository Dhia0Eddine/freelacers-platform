"""add has_review column to bookings table

Revision ID: add_has_review_column
Revises: 36855fab27e9
Create Date: 2025-07-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_has_review_column'
down_revision: Union[str, Sequence[str], None] = '36855fab27e9'  # Make sure this matches your latest migration
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add has_review column to bookings table."""
    op.add_column('bookings', sa.Column('has_review', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Remove has_review column from bookings table."""
    op.drop_column('bookings', 'has_review')
