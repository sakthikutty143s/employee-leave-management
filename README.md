# 🏢 Employee Leave Management System

A full-stack **Employee Leave Management System** built using **React, FastAPI, PostgreSQL, and AWS**.

This application provides a complete leave management workflow where employees can manage their profiles, check leave balances, apply for leave, upload documents, and track leave status. Managers can review, approve, and reject employee leave requests through a dedicated dashboard.

The application is deployed on AWS with cloud storage, secure networking, monitoring, and email alerting.

---

## 🚀 Live Application

🔗 **Live Application:**  
https://dr363qgupncp7.cloudfront.net

🔗 **GitHub Repository:**  
https://github.com/sakthikutty143s/employee-leave-management

---

## ✨ Features

### 👤 Employee Features

- Employee login and authentication
- View employee profile
- View leave balance
- Apply for leave
- View leave request history
- Track leave request status
- Upload documents
- View uploaded documents
- Manage employee documents
- View dashboard summary

### 👨‍💼 Manager Features

- Manager login
- View employee leave requests
- Review pending leave requests
- Approve leave requests
- Reject leave requests
- Add manager comments
- Monitor leave request status

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Uvicorn

### Database

- PostgreSQL
- Amazon RDS for PostgreSQL

### AWS Services

- Amazon VPC
- Amazon EC2
- Application Load Balancer
- Amazon RDS
- Amazon S3
- Amazon CloudFront
- AWS IAM
- AWS Secrets Manager
- Amazon CloudWatch
- Amazon SNS
- NAT Gateway
- Security Groups

---

## 🏗️ Application Architecture

```text
                         👤 Users
                            |
                            v
                    Amazon CloudFront
                            |
                            v
                     React Frontend
                       (Amazon S3)
                            |
                            |
                API Requests from Frontend
                            |
                            v
                  Application Load Balancer
                            |
                            v
                      EC2 Backend
                     FastAPI Application
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
        Amazon RDS      Amazon S3    Secrets Manager
        PostgreSQL      Documents      Application
        Database                       Secrets
              |
              v
       Application Data


                EC2 Monitoring
                      |
                      v
                 CloudWatch
                      |
                      v
              CloudWatch Alarm
                  CPU ≥ 60%
                      |
                      v
                    SNS
                      |
                      v
               📧 Email Alert
```

---

## ☁️ AWS Architecture

The application uses a multi-service AWS architecture.

### 🌐 Networking

- Custom Amazon VPC
- Public and private subnets
- Route tables
- Internet Gateway
- NAT Gateway
- Security Groups

### 🖥️ Application Layer

- React frontend deployed to Amazon S3
- Amazon CloudFront used for frontend delivery
- FastAPI backend deployed on Amazon EC2
- Application Load Balancer used for backend traffic

### 🗄️ Database Layer

- PostgreSQL hosted on Amazon RDS
- Database deployed in the private network
- Backend connects securely to the PostgreSQL database

### 📄 Storage

- Amazon S3 used for employee document storage
- Application supports document upload and document retrieval

### 🔐 Security

- JWT-based authentication
- IAM role attached to EC2
- AWS Secrets Manager for sensitive configuration
- Security Groups for controlled network access
- Private database access

### 📊 Monitoring and Alerting

- CloudWatch Agent installed on EC2
- CPU metrics collected
- Memory metrics collected
- Disk metrics collected
- CloudWatch CPU alarm configured
- SNS email notification configured

---

## 🔐 Authentication

The application uses **JWT-based authentication** to protect user-specific resources.

### User Roles

| Role | Access |
|---|---|
| Employee | Profile, leave, documents, dashboard |
| Manager | Leave request management |

---

## 📋 Leave Management Workflow

```text
Employee
   |
   v
Apply Leave
   |
   v
PENDING
   |
   +------------------+
   |                  |
   v                  v
APPROVED            REJECTED
   |                  |
   +------------------+
            |
            v
     Employee Views Status
```

### Leave Request States

- `PENDING`
- `APPROVED`
- `REJECTED`

---

## 📄 Document Management

Employees can manage documents through the application.

### Supported Operations

- Upload documents
- Store documents in Amazon S3
- List uploaded documents
- Download documents

### Document Flow

```text
Employee
   |
   v
Upload Document
   |
   v
FastAPI Backend
   |
   v
Amazon S3
   |
   v
Document Stored Securely
```

---

## 📊 Monitoring with Amazon CloudWatch

The EC2 backend is monitored using the Amazon CloudWatch Agent.

### Metrics Collected

- CPU utilization
- Memory utilization
- Disk utilization

### CloudWatch Agent

The CloudWatch Agent collects host-level metrics every **60 seconds**.

### Memory Metric

```text
Metric:
mem_used_percent

Namespace:
CWAgent
```

### CPU Alarm

```text
Alarm Name:
employee-leave-ec2-cpu-high

Metric:
AWS/EC2 → CPUUtilization

Threshold:
60%

Period:
5 minutes

Evaluation Periods:
2
```

### Alert Flow

```text
EC2
 |
 v
CloudWatch
 |
 v
CPU Alarm
 |
 v
SNS
 |
 v
Email Notification
```

---

## 📧 SNS Email Alerting

Amazon SNS is configured to send email notifications when the CloudWatch CPU alarm is triggered.

### Notification Flow

```text
CPU Utilization ≥ 60%
          |
          v
CloudWatch Alarm
          |
          v
SNS Topic
          |
          v
Email Notification
```

---

## 💻 Local Development

### Prerequisites

Make sure the following tools are installed:

- Python
- Node.js
- npm
- PostgreSQL
- Git
- VS Code
- AWS CLI

---

## 🔧 Backend Setup

Open PowerShell or terminal:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI application:

```bash
uvicorn app.main:app --reload
```

FastAPI server:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The Vite development server will provide the local frontend URL in the terminal.

---

## 📁 Project Structure

```text
employee-leave-management/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── employees.py
│   │   │   └── leaves.py
│   │   │
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔑 Backend API Modules

### Authentication

```text
/auth
```

Used for:

- User registration
- User login
- Authentication

### Employees

```text
/employees
```

Used for:

- Employee information
- Employee profile management

### Leaves

```text
/leaves
```

Used for:

- Leave application
- Leave listing
- Leave approval
- Leave rejection

### Documents

```text
/documents
```

Used for:

- Document upload
- Document listing
- Document retrieval

---

## 🧪 Testing Completed

The application has been tested across the main employee and manager workflows.

### Employee Testing

- Employee login ✅
- Employee dashboard ✅
- Employee profile ✅
- Leave balance ✅
- Apply leave ✅
- View leave history ✅
- Upload documents ✅
- View documents ✅
- View dashboard summary ✅

### Manager Testing

- Manager login ✅
- Manager dashboard ✅
- View leave requests ✅
- Approve leave request ✅
- Reject leave request ✅
- Manager comments ✅

### Application Workflow Testing

```text
Employee Login
      ↓
Apply Leave
      ↓
PENDING
      ↓
Manager Review
      ↓
   +--------+
   |        |
   ↓        ↓
APPROVED  REJECTED
   |        |
   +--------+
      ↓
Employee Views Final Status
```

### AWS Testing

- S3 document upload ✅
- S3 document listing ✅
- CloudFront deployment ✅
- CloudWatch Agent ✅
- CloudWatch memory metrics ✅
- CloudWatch CPU metrics ✅
- CPU alarm at 60% ✅
- SNS email subscription ✅
- SNS alarm notification configuration ✅

---

## 🌐 Deployment Overview

### Frontend Deployment

```text
React Application
       |
       v
npm run build
       |
       v
dist/
       |
       v
Amazon S3
       |
       v
Amazon CloudFront
       |
       v
Live Application
```

### Backend Deployment

```text
FastAPI Application
       |
       v
Application Deployment
       |
       v
Amazon EC2
       |
       v
Application Load Balancer
       |
       v
Frontend API Requests
```

### Database

```text
FastAPI Backend
       |
       v
Private Network
       |
       v
Amazon RDS for PostgreSQL
```

---

## 🔒 Security Considerations

The application follows basic cloud security practices:

- Secrets are not committed to GitHub
- Sensitive values are stored using environment configuration / AWS Secrets Manager
- IAM roles are used for AWS access
- EC2 uses `AmazonSSMManagedInstanceCore`
- EC2 uses `CloudWatchAgentServerPolicy`
- Database access is controlled through Security Groups
- Private database connectivity is used
- JWT authentication protects application endpoints

---

## 📈 Future Improvements

The following improvements can be added in future versions:

- Automatic employee email notifications
- Advanced admin dashboard
- Leave balance automation
- Attendance integration
- Multiple manager roles
- Audit logging
- Advanced CloudWatch alarms
- Auto Scaling for backend instances
- CI/CD pipeline using GitHub Actions
- Infrastructure as Code using Terraform

---

## 🎯 Project Objective

The main objective of this project is to build and deploy a practical employee leave management platform using modern full-stack technologies and AWS cloud services.

The project demonstrates:

- Full-stack application development
- REST API development
- Authentication and authorization
- PostgreSQL database integration
- Cloud storage
- AWS networking
- Application deployment
- Monitoring and alerting
- Secure cloud architecture

---

## 📸 Screenshots

### 👤 Employee Dashboard

_Add employee dashboard screenshot here._

### 👨‍💼 Manager Dashboard

_Add manager dashboard screenshot here._

### 📋 Leave Requests

_Add leave request screenshot here._

### ✅ Leave Approval

_Add leave approval screenshot here._

### 🔴 Leave Rejection

_Add leave rejection screenshot here._

### 📄 Document Management

_Add document management screenshot here._

### 📊 CloudWatch Monitoring

_Add CloudWatch monitoring screenshot here._

---

## ⭐ Project Highlights

- Full-stack React + FastAPI application
- PostgreSQL database
- JWT authentication
- Employee and Manager roles
- Leave approval workflow
- Leave rejection workflow
- S3 document management
- AWS EC2 backend deployment
- Amazon RDS PostgreSQL
- Application Load Balancer
- CloudFront frontend delivery
- CloudWatch monitoring
- SNS email alerts
- AWS IAM security
- AWS Secrets Manager
- Secure AWS networking

---

## 👨‍💻 Author

**Sakthivel**

GitHub:

https://github.com/sakthikutty143s

---

## 🔗 Project Links

### Live Application

https://dr363qgupncp7.cloudfront.net

### GitHub Repository

https://github.com/sakthikutty143s/employee-leave-management

---

## 📌 Project Status

**Status: Deployed and Functional ✅**

The core Employee Leave Management System has been developed, tested, deployed on AWS, integrated with cloud storage and database services, and configured with CloudWatch monitoring and SNS email alerting.
