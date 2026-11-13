"""Create scenario data and reserved practice and knowledge tables.

The first scaffold created scenario_versions before Alembic was introduced.
This revision also upgrades that existing table without discarding its rows.
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_project_foundation"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    tables = set(sa.inspect(connection).get_table_names())

    if "scenario_versions" not in tables:
        op.create_table(
            "scenario_versions",
            sa.Column("scenario_id", sa.String(32), primary_key=True),
            sa.Column("version", sa.String(16), primary_key=True),
            sa.Column("title", sa.String(40), nullable=False),
            sa.Column("summary", sa.Text(), nullable=False),
            sa.Column("goal", sa.Text(), nullable=False),
            sa.Column("simulation_notice", sa.Text(), nullable=False),
            sa.Column("demo_data", sa.JSON(), nullable=False),
            sa.Column("sort_order", sa.Integer(), nullable=False),
            sa.Column("active", sa.Boolean(), nullable=False),
        )
    else:
        columns = {column["name"] for column in sa.inspect(connection).get_columns("scenario_versions")}
        if "goal" not in columns:
            op.add_column("scenario_versions", sa.Column("goal", sa.Text(), nullable=True))
        if "simulation_notice" not in columns:
            op.add_column("scenario_versions", sa.Column("simulation_notice", sa.Text(), nullable=True))

        connection.execute(sa.text("UPDATE scenario_versions SET goal=summary WHERE goal IS NULL"))
        connection.execute(sa.text("UPDATE scenario_versions SET simulation_notice='这是模拟练习，不会产生真实记录。' WHERE simulation_notice IS NULL"))
        op.alter_column("scenario_versions", "goal", existing_type=sa.Text(), nullable=False)
        op.alter_column("scenario_versions", "simulation_notice", existing_type=sa.Text(), nullable=False)

        descriptions = {
            "hospital": ("学习如何使用手机预约门诊。", "找到演示医院和科室，选择就诊时间并核对预约信息。", "这是模拟挂号，不会产生真实预约。"),
            "bus": ("学习如何找到并使用公交乘车码。", "找到公交乘车码，了解如何在乘车时出示。", "这是模拟乘车码，不能用于真实乘车。"),
            "payment": ("学习如何扫码付款并核对金额。", "查看演示收款方和金额，练习付款前核对信息。", "这是模拟支付，不会发生真实扣款。"),
        }
        for scenario_id, (summary, goal, notice) in descriptions.items():
            connection.execute(
                sa.text("UPDATE scenario_versions SET summary=:summary, goal=:goal, simulation_notice=:notice WHERE scenario_id=:scenario_id AND version='1.0'"),
                {"summary": summary, "goal": goal, "notice": notice, "scenario_id": scenario_id},
            )

    if "practice_sessions" not in tables:
        op.create_table(
            "practice_sessions",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
            sa.Column("scenario_id", sa.String(32), nullable=False),
            sa.Column("scenario_version", sa.String(16), nullable=False),
            sa.Column("node_id", sa.String(16), nullable=False),
            sa.Column("selections_json", sa.JSON(), nullable=False),
            sa.Column("return_stack_json", sa.JSON(), nullable=False),
            sa.Column("revision", sa.Integer(), nullable=False),
            sa.Column("result_json", sa.JSON(), nullable=True),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )

    if "knowledge_chunks" not in tables:
        op.create_table(
            "knowledge_chunks",
            sa.Column("id", sa.String(80), primary_key=True),
            sa.Column("scenario_id", sa.String(32), nullable=False),
            sa.Column("node_id", sa.String(16), nullable=True),
            sa.Column("title", sa.String(100), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("keywords_json", sa.JSON(), nullable=False),
            sa.Column("version", sa.String(16), nullable=False),
            sa.Column("active", sa.Boolean(), nullable=False),
        )


def downgrade() -> None:
    raise RuntimeError("初始迁移包含已有场景数据，不提供自动删除表的降级操作。")
