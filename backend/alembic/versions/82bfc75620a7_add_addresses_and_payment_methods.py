"""add addresses and payment_methods, add cancelled order status

Revision ID: 82bfc75620a7
Revises: 7fca3e3add52
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82bfc75620a7'
down_revision: Union[str, None] = '7fca3e3add52'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'addresses',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('label', sa.String(length=50), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('postal_code', sa.String(length=20), nullable=False),
        sa.Column('country', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=30), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_addresses_user_id'), 'addresses', ['user_id'], unique=False)

    # No card_number / cvv columns exist here, on purpose — see
    # app/models/payment_method.py and tests/test_payment_methods.py.
    op.create_table(
        'payment_methods',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column(
            'brand',
            sa.Enum('VISA', 'MASTERCARD', 'AMEX', 'OTHER', name='cardbrand', native_enum=False, length=20),
            nullable=False,
        ),
        sa.Column('last4', sa.String(length=4), nullable=False),
        sa.Column('exp_month', sa.Integer(), nullable=False),
        sa.Column('exp_year', sa.Integer(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_payment_methods_user_id'), 'payment_methods', ['user_id'], unique=False)

    # OrderStatus is stored as a plain checked string (native_enum=False),
    # not a Postgres native enum, so widening the allowed values is just a
    # Python-side change (see app/models/order.py) — nothing to alter here.


def downgrade() -> None:
    op.drop_index(op.f('ix_payment_methods_user_id'), table_name='payment_methods')
    op.drop_table('payment_methods')
    op.drop_index(op.f('ix_addresses_user_id'), table_name='addresses')
    op.drop_table('addresses')
