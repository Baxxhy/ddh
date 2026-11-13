from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class CreateRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    scenarioId: str = Field(min_length=1, max_length=32)


class RevisionRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    revision: int = Field(ge=0, strict=True)


class ActionRequest(RevisionRequest):
    actionId: str = Field(min_length=1, max_length=64)
    value: str | None = Field(default=None, max_length=128)


class Option(BaseModel):
    id: str
    label: str


class Action(BaseModel):
    id: str
    label: str
    options: list[Option]
    input: bool


class Feedback(BaseModel):
    kind: Literal['info','error','success']
    message: str


class Step(BaseModel):
    current: int
    total: int


class Result(BaseModel):
    message: str
    selections: dict[str, str | int]


class PracticeState(BaseModel):
    scenarioId: str
    scenarioVersion: str
    nodeId: str
    title: str
    task: str
    step: Step
    selections: dict[str, str | int]
    selectedSummary: dict[str, str]
    returnStack: list[dict[str, str]]
    revision: int
    actions: list[Action]
    feedback: Feedback | None
    result: Result | None
    canGoBack: bool
    isComplete: bool
    simulationNotice: str


class Created(BaseModel):
    sessionToken: str
    state: PracticeState
