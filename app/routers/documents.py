import os
import uuid

import boto3
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION
)


# ============================================================
# Upload Document
# ============================================================

@router.post("/upload")
def upload_document(
    employee_id: int = Form(...),
    file: UploadFile = File(...),
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

    if not S3_BUCKET_NAME:
        raise HTTPException(
            status_code=500,
            detail="S3 bucket is not configured"
        )

    file_extension = os.path.splitext(file.filename)[1]

    s3_key = (
        f"employee-documents/"
        f"{employee_id}/"
        f"{uuid.uuid4()}"
        f"{file_extension}"
    )

    try:
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"S3 upload failed: {str(e)}"
        )

    document = models.Document(
        employee_id=employee_id,
        file_name=file.filename,
        s3_key=s3_key
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "employee_id": employee_id,
        "file_name": file.filename,
        "s3_key": s3_key
    }


# ============================================================
# Generate Download URL
# ============================================================

@router.get("/download/{document_id}")
def get_document_url(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    if not S3_BUCKET_NAME:
        raise HTTPException(
            status_code=500,
            detail="S3 bucket is not configured"
        )

    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET_NAME,
                "Key": document.s3_key
            },
            ExpiresIn=3600
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate download URL: {str(e)}"
        )

    return {
        "document_id": document.id,
        "file_name": document.file_name,
        "download_url": url
    }


# ============================================================
# Get Employee Documents
# ============================================================

@router.get("/{employee_id}")
def get_employee_documents(
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

    documents = (
        db.query(models.Document)
        .filter(models.Document.employee_id == employee_id)
        .order_by(models.Document.uploaded_at.desc())
        .all()
    )

    return [
        {
            "id": document.id,
            "file_name": document.file_name,
            "s3_key": document.s3_key,
            "uploaded_at": document.uploaded_at
        }
        for document in documents
    ]