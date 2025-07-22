"""Merge heads

Revision ID: e3e8888f036f
Revises: 879e1e222e47, add_has_review_column
Create Date: 2025-07-22 17:26:47.924542

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3e8888f036f'
down_revision: Union[str, Sequence[str], None] = ('879e1e222e47', 'add_has_review_column')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
