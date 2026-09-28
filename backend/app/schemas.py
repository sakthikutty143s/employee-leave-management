from datetime import date
from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "EMPLOYEE"


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class EmployeeCreate(BaseModel):
    user_id: int | None = None
    employee_code: str
    first_name: str
    last_name: str | None = None
    department_id: int | None = None
    manager_id: int | None = None
    joining_date: date | None = None
    active: bool = True


class EmployeeResponse(EmployeeCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class LeaveRequestCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    from_date: date
    to_date: date
    reason: str | None = None


class LeaveRequestResponse(LeaveRequestCreate):
    id: int
    status: str
    manager_comment: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LeaveAction(BaseModel):
    manager_comment: str | None = None