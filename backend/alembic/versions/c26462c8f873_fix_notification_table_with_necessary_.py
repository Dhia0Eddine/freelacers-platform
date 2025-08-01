"""fix: notification table with necessary relations

Revision ID: c26462c8f873
Revises: c77899b17d1c
Create Date: 2025-08-02 12:58:43.527590

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c26462c8f873'
down_revision: Union[str, Sequence[str], None] = 'c77899b17d1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('notifications', sa.Column('type', sa.String(), nullable=False))
    op.drop_column('notifications', 'notification_type')
    op.drop_column('notifications', 'updated_at')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('notifications', sa.Column('updated_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.add_column('notifications', sa.Column('notification_type', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.drop_column('notifications', 'type')
    # ### end Alembic commands ###
