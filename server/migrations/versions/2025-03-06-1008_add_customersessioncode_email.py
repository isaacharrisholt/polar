"""Add CustomerSessionCode.email

Revision ID: 00fc15c4d5f4
Revises: 09f81a375c7f
Create Date: 2025-03-06 10:08:59.134384

"""

import sqlalchemy as sa
from alembic import op

# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "00fc15c4d5f4"
down_revision = "09f81a375c7f"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "customer_session_codes",
        sa.Column("email", sa.String(length=320), nullable=True),
    )
    op.execute("UPDATE customer_session_codes SET email = ''")
    op.alter_column("customer_session_codes", "email", nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("customer_session_codes", "email")
    # ### end Alembic commands ###
