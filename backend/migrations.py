"""
Tiny startup migration for SQLite.

Base.metadata.create_all() (called in main.py) only creates tables that don't
exist yet — it will NOT add new columns to a table that's already there. Since
the `addresses` table is being restructured (Home/Work/Other label, structured
address lines, default flag, delivery instructions), anyone with an existing
local bitebuddy.db would otherwise hit "no such column" errors.

This runs once at startup, after create_all(), and just ADDs any missing
columns (safe no-op if they already exist / table is brand new).
"""

from sqlalchemy import text


def _existing_columns(engine, table_name: str) -> set[str]:
    with engine.connect() as conn:
        rows = conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
    return {row[1] for row in rows}  # row[1] = column name


def run_migrations(engine):
    cols = _existing_columns(engine, "addresses")
    if not cols:
        # Table doesn't exist yet (fresh DB) — create_all already handled it.
        return

    statements = []
    if "address_line1" not in cols:
        statements.append("ALTER TABLE addresses ADD COLUMN address_line1 VARCHAR(255)")
    if "address_line2" not in cols:
        statements.append("ALTER TABLE addresses ADD COLUMN address_line2 VARCHAR(255)")
    if "postal_code" not in cols:
        statements.append("ALTER TABLE addresses ADD COLUMN postal_code VARCHAR(20)")
    if "custom_label" not in cols:
        statements.append("ALTER TABLE addresses ADD COLUMN custom_label VARCHAR(50)")
    if "delivery_instructions" not in cols:
        statements.append("ALTER TABLE addresses ADD COLUMN delivery_instructions VARCHAR(500)")
    if "is_default" not in cols:
        statements.append("ALTER TABLE addresses ADD COLUMN is_default BOOLEAN DEFAULT 0")

    if not statements:
        return

    with engine.connect() as conn:
        for stmt in statements:
            conn.execute(text(stmt))

        # Backfill address_line1 from the old free-text address_line column so
        # existing saved addresses don't just go blank.
        if "address_line" in cols and "address_line1" not in cols:
            conn.execute(text(
                "UPDATE addresses SET address_line1 = address_line "
                "WHERE address_line1 IS NULL"
            ))

        conn.commit()

    print(f"[migrations] addresses table updated: {len(statements)} column(s) added.")
