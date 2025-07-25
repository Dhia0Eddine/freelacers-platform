"""Add service_picture to service table

Revision ID: 00df1d75aa83
Revises: 9a187efd6387
Create Date: 2025-07-22 20:57:19.801050

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '00df1d75aa83'
down_revision: Union[str, Sequence[str], None] = '9a187efd6387'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('services', sa.Column('photo', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('services', 'photo')
    # ### end Alembic commands ###
