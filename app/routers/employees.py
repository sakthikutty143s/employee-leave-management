from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api/employees",
    tags=["Employees"]
)


@router.post("/", response_model=schemas.EmployeeResponse)
def create_employee(
    employee: schemas.EmployeeCreate,
    db: Session = Depends(get_db)
):
    existing = (
        db.query(models.Employee)
        .filter(
            models.Employee.employee_code == employee.employee_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employee code already exists"
        )

    new_employee = models.Employee(
        **employee.model_dump()
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


@router.get("/", response_model=list[schemas.EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db)
):
    return db.query(models.Employee).all()


@router.get("/{employee_id}", response_model=schemas.EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee