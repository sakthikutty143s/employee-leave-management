from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user, require_manager


router = APIRouter(
    prefix="/api/leaves",
    tags=["Leaves"]
)


# =========================================================
# CREATE LEAVE
# Employee → Can create only for themselves
# Manager  → Can create for any employee
# =========================================================

@router.post(
    "/",
    response_model=schemas.LeaveRequestResponse
)
def create_leave(
    leave: schemas.LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check employee
    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.id == leave.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Employee can create leave only for themselves
    if current_user["role"] != "MANAGER":
        if employee.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You can only create leave for yourself"
            )

    # Check leave type
    leave_type = (
        db.query(models.LeaveType)
        .filter(
            models.LeaveType.id == leave.leave_type_id
        )
        .first()
    )

    if not leave_type:
        raise HTTPException(
            status_code=404,
            detail="Leave type not found"
        )

    # =====================================================
    # DATE VALIDATION
    # =====================================================

    if not leave.from_date:
        raise HTTPException(
            status_code=400,
            detail="From date is required"
        )

    if not leave.to_date:
        raise HTTPException(
            status_code=400,
            detail="To date is required"
        )

    if leave.from_date > leave.to_date:
        raise HTTPException(
            status_code=400,
            detail="From date cannot be after to date"
        )

    # Create leave
    new_leave = models.LeaveRequest(
        employee_id=leave.employee_id,
        leave_type_id=leave.leave_type_id,
        from_date=leave.from_date,
        to_date=leave.to_date,
        reason=leave.reason
    )

    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)

    return new_leave


# =========================================================
# GET LEAVES
# Employee → Own leaves only
# Manager  → All leaves
# =========================================================

@router.get(
    "/",
    response_model=list[schemas.LeaveRequestResponse]
)
def get_leaves(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Manager can view all leaves
    if current_user["role"] == "MANAGER":
        return (
            db.query(models.LeaveRequest)
            .all()
        )

    # Find logged-in employee
    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.user_id
            == current_user["user_id"]
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    # Employee can view only their own leaves
    return (
        db.query(models.LeaveRequest)
        .filter(
            models.LeaveRequest.employee_id
            == employee.id
        )
        .all()
    )


# =========================================================
# GET SINGLE LEAVE
# Employee → Own leave only
# Manager  → Any leave
# =========================================================

@router.get(
    "/{leave_id}",
    response_model=schemas.LeaveRequestResponse
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    leave = (
        db.query(models.LeaveRequest)
        .filter(
            models.LeaveRequest.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    # Manager can view any leave
    if current_user["role"] == "MANAGER":
        return leave

    # Find logged-in employee
    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.user_id
            == current_user["user_id"]
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee profile not found"
        )

    # Employee can view only their own leave
    if leave.employee_id != employee.id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own leave requests"
        )

    return leave


# =========================================================
# APPROVE LEAVE
# Manager only
# =========================================================

@router.put(
    "/{leave_id}/approve"
)
def approve_leave(
    leave_id: int,
    action: schemas.LeaveAction,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):
    leave = (
        db.query(models.LeaveRequest)
        .filter(
            models.LeaveRequest.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending leave requests can be approved"
        )

    leave.status = "APPROVED"
    leave.manager_comment = action.manager_comment

    db.commit()
    db.refresh(leave)

    return {
        "message": "Leave request approved",
        "leave_id": leave.id
    }


# =========================================================
# REJECT LEAVE
# Manager only
# =========================================================

@router.put(
    "/{leave_id}/reject"
)
def reject_leave(
    leave_id: int,
    action: schemas.LeaveAction,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manager)
):
    leave = (
        db.query(models.LeaveRequest)
        .filter(
            models.LeaveRequest.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    if leave.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending leave requests can be rejected"
        )

    leave.status = "REJECTED"
    leave.manager_comment = action.manager_comment

    db.commit()
    db.refresh(leave)

    return {
        "message": "Leave request rejected",
        "leave_id": leave.id
    }


# =========================================================
# GET LEAVE BALANCE
# Employee → Own balance only
# Manager  → Any employee balance
# =========================================================

@router.get(
    "/balance/{employee_id}"
)
def get_leave_balance(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Employee can view only their own balance
    if current_user["role"] != "MANAGER":

        employee = (
            db.query(models.Employee)
            .filter(
                models.Employee.user_id
                == current_user["user_id"]
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee profile not found"
            )

        if employee.id != employee_id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own leave balance"
            )

    # Check employee
    employee = (
        db.query(models.Employee)
        .filter(
            models.Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Get balances
    balances = (
        db.query(models.LeaveBalance)
        .filter(
            models.LeaveBalance.employee_id
            == employee_id
        )
        .all()
    )

    result = []

    for balance in balances:
        result.append({
            "leave_type_id": balance.leave_type_id,
            "leave_type": balance.leave_type.name,
            "total_days": balance.total_days,
            "used_days": balance.used_days,
            "available_days": (
                balance.total_days
                - balance.used_days
            )
        })

    return result