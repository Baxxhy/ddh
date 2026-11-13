from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ScenarioSeed:
    scenario_id: str
    version: str
    title: str
    summary: str
    goal: str
    simulation_notice: str
    demo_data: dict[str, Any]
    sort_order: int


SCENARIOS = (
    ScenarioSeed(
        scenario_id="hospital",
        version="1.0",
        title="医院挂号",
        summary="学习如何使用手机预约门诊。",
        goal="找到演示医院和科室，选择就诊时间并核对预约信息。",
        simulation_notice="这是模拟挂号，不会产生真实预约。",
        demo_data={"hospital": "演示医院 A", "department": "演示内科", "slot": "演示时段 A"},
        sort_order=1,
    ),
    ScenarioSeed(
        scenario_id="bus",
        version="1.0",
        title="公交乘车码",
        summary="学习如何找到并使用公交乘车码。",
        goal="找到公交乘车码，了解如何在乘车时出示。",
        simulation_notice="这是模拟乘车码，不能用于真实乘车。",
        demo_data={"service": "演示公交服务", "code": "无效演示图形"},
        sort_order=2,
    ),
    ScenarioSeed(
        scenario_id="payment",
        version="1.0",
        title="扫码支付",
        summary="学习如何扫码付款并核对金额。",
        goal="查看演示收款方和金额，练习付款前核对信息。",
        simulation_notice="这是模拟支付，不会发生真实扣款。",
        demo_data={"merchant": "演示商户 A", "amount_fen": 1250},
        sort_order=3,
    ),
)
