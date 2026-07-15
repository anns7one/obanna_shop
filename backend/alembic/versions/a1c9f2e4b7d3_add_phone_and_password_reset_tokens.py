"""add users.phone and password_reset_tokens

Revision ID: a1c9f2e4b7d3
Revises: 82bfc75620a7
Create Date: 2026-07-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1c9f2e4b7d3'
down_revision: Union[str, None] = '82bfc75620a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Nullable at first so existing rows (if any) don't fail the ADD COLUMN;
    # backfilled with a placeholder derived from each row's own id (already
    # unique), then locked down to NOT NULL + unique. Every new row from here
    # on is required to supply a real phone via the API schema.
    op.add_column('users', sa.Column('phone', sa.String(length=30), nullable=True))
    op.execute("UPDATE users SET phone = '+0000000000-' || substr(id, 1, 8) WHERE phone IS NULL")
    op.alter_column('users', 'phone', nullable=False)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)

    # Stores only a hash of the reset token, never the raw value — see
    # app/models/password_reset_token.py.
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_password_reset_tokens_user_id'), 'password_reset_tokens', ['user_id'], unique=False)
    op.create_index(
        op.f('ix_password_reset_tokens_token_hash'), 'password_reset_tokens', ['token_hash'], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_password_reset_tokens_token_hash'), table_name='password_reset_tokens')
    op.drop_index(op.f('ix_password_reset_tokens_user_id'), table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')

    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_column('users', 'phone')
