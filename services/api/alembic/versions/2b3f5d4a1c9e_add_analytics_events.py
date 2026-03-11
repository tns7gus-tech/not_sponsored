"""Add analytics events

Revision ID: 2b3f5d4a1c9e
Revises: 1da5bdf81416
Create Date: 2026-03-11 16:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2b3f5d4a1c9e"
down_revision: Union[str, Sequence[str], None] = "1da5bdf81416"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("page_path", sa.String(length=500), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("session_id", sa.String(length=120), nullable=True),
        sa.Column("query_text", sa.String(length=500), nullable=True),
        sa.Column("job_id", sa.String(length=36), nullable=True),
        sa.Column("details_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analytics_events_created_at", "analytics_events", ["created_at"], unique=False)
    op.create_index("ix_analytics_events_page", "analytics_events", ["page_path"], unique=False)
    op.create_index("ix_analytics_events_type", "analytics_events", ["event_type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_analytics_events_type", table_name="analytics_events")
    op.drop_index("ix_analytics_events_page", table_name="analytics_events")
    op.drop_index("ix_analytics_events_created_at", table_name="analytics_events")
    op.drop_table("analytics_events")
