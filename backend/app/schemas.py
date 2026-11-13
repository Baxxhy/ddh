from pydantic import BaseModel


class ScenarioSummary(BaseModel):
    id: str
    title: str
    summary: str
    goal: str
    version: str


class ScenarioDetail(ScenarioSummary):
    simulation_notice: str
