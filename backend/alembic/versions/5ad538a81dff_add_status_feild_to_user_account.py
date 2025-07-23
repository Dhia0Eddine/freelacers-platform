"""Add status feild to user account

Revision ID: 5ad538a81dff
Revises: 121d6d591574
Create Date: 2025-07-23 17:34:02.811628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '5ad538a81dff'
down_revision: Union[str, Sequence[str], None] = '121d6d591574'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    userstatus_enum = postgresql.ENUM('enabled', 'disabled', name='userstatus')
    userstatus_enum.create(op.get_bind())

    # Now add the column
    op.add_column('users', sa.Column('status', sa.Enum('enabled', 'disabled', name='userstatus'), server_default='enabled', nullable=False))


def downgrade() -> None:
    # Drop column first
    op.drop_column('users', 'status')

    # Then drop Enum
    userstatus_enum = postgresql.ENUM('enabled', 'disabled', name='userstatus')
    userstatus_enum.drop(op.get_bind())