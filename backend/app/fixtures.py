from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ScenarioSeed:
    scenario_id: str
    version: str
    title: str
    summary: str
    demo_data: dict[str, Any]
    sort_order: int


SCENARIOS = (
    ScenarioSeed(
        scenario_id="hospital",
        version="1.0",
        title="医院挂号",
        summary="练习查找医院、科室和就诊时间。",
        demo_data={"hospital": "演示医院 A", "department": "演示内科", "slot": "演示时段 A"},
        sort_order=1,
    ),
    ScenarioSeed(
        scenario_id="bus",
        version="1.0",
        title="公交乘车码",
        summary="练习找到公交乘车码并完成模拟扫码。",
        demo_data={"service": "演示公交服务", "code": "无效演示图形"},
        sort_order=2,
    ),
    ScenarioSeed(
        scenario_id="payment",
        version="1.0",
        title="扫码支付",
        summary="练习核对演示商户与金额。",
        demo_data={"merchant": "演示商户 A", "amount_fen": 1250},
        sort_order=3,
    ),
)
