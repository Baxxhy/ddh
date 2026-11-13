"""Explicit current version and closed practice sessions."""
from alembic import op
import sqlalchemy as sa
import re
revision = '0002_practice_current'
down_revision = '0001_project_foundation'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('practice_sessions', sa.Column('closed_at', sa.DateTime(), nullable=True))
    op.create_index('ix_practice_expires', 'practice_sessions', ['expires_at'])
    op.create_table('scenario_current', sa.Column('scenario_id', sa.String(32), primary_key=True), sa.Column('version', sa.String(16), nullable=False))
    bind = op.get_bind()
    rows = bind.execute(sa.text('SELECT scenario_id, version FROM scenario_versions WHERE active=1')).all()
    chosen = {}
    for scene, version in rows:
        if not re.fullmatch(r'\d+(?:\.\d+)*', version): continue
        key = tuple(map(int, version.split('.')))
        if scene not in chosen or key > chosen[scene][0]: chosen[scene] = (key, version)
    for scene, (_, version) in chosen.items():
        bind.execute(sa.text('INSERT INTO scenario_current (scenario_id,version) VALUES (:id,:version)'), {'id':scene,'version':version})


def downgrade() -> None:
    op.drop_table('scenario_current')
    op.drop_index('ix_practice_expires', 'practice_sessions')
    op.drop_column('practice_sessions', 'closed_at')
