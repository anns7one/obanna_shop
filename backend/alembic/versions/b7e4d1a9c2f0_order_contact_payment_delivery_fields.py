"""add order_number, contact fields, payment/delivery snapshot to orders

Revision ID: b7e4d1a9c2f0
Revises: a1c9f2e4b7d3
Create Date: 2026-07-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7e4d1a9c2f0'
down_revision: Union[str, None] = 'a1c9f2e4b7d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres backfills a GENERATED ... AS IDENTITY column added to an
    # existing table with sequential values automatically, so any orders
    # already placed (e.g. during local testing) get real order numbers too.
    op.add_column('orders', sa.Column('order_number', sa.Integer(), sa.Identity(start=1000), nullable=False))
    op.create_index(op.f('ix_orders_order_number'), 'orders', ['order_number'], unique=True)

    op.add_column('orders', sa.Column('contact_full_name', sa.String(length=255), nullable=True))
    op.add_column('orders', sa.Column('contact_phone', sa.String(length=30), nullable=True))
    op.add_column('orders', sa.Column('contact_email', sa.String(length=255), nullable=True))
    op.add_column('orders', sa.Column('order_comment', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('payment_method_label', sa.String(length=100), nullable=True))
    op.add_column('orders', sa.Column('delivery_method_label', sa.String(length=100), nullable=True))
    op.add_column('orders', sa.Column('delivery_cost', sa.Numeric(10, 2), nullable=True))

    # Backfill any pre-existing orders (from local testing) from their own
    # shipping snapshot, then lock the required columns down to NOT NULL —
    # every order created from here on goes through create_order(), which
    # always supplies these.
    op.execute(
        """
        UPDATE orders SET
            contact_full_name = COALESCE(shipping->>'full_name', 'Unknown'),
            contact_phone = COALESCE(shipping->>'phone', '+00000000000'),
            payment_method_label = 'Cash on delivery',
            delivery_method_label = 'Standard shipping',
            delivery_cost = 0
        WHERE contact_full_name IS NULL
        """
    )
    op.alter_column('orders', 'contact_full_name', nullable=False)
    op.alter_column('orders', 'contact_phone', nullable=False)
    op.alter_column('orders', 'payment_method_label', nullable=False)
    op.alter_column('orders', 'delivery_method_label', nullable=False)
    op.alter_column('orders', 'delivery_cost', nullable=False)


def downgrade() -> None:
    op.drop_column('orders', 'delivery_cost')
    op.drop_column('orders', 'delivery_method_label')
    op.drop_column('orders', 'payment_method_label')
    op.drop_column('orders', 'order_comment')
    op.drop_column('orders', 'contact_email')
    op.drop_column('orders', 'contact_phone')
    op.drop_column('orders', 'contact_full_name')
    op.drop_index(op.f('ix_orders_order_number'), table_name='orders')
    op.drop_column('orders', 'order_number')
