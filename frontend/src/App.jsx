import { useState } from "react";

import "./App.css";



const API = "";



function App() {

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");



  const [loggedIn, setLoggedIn] = useState(false);

  const [role, setRole] = useState("");



  const [profile, setProfile] = useState(null);

  const [showProfile, setShowProfile] = useState(false);



  const [leaveBalances, setLeaveBalances] = useState([]);

  const [showBalance, setShowBalance] = useState(false);

  const [loadingBalance, setLoadingBalance] = useState(false);



  const [showApplyLeave, setShowApplyLeave] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [reason, setReason] = useState("");

  const [submittingLeave, setSubmittingLeave] = useState(false);



  const [showMyLeaves, setShowMyLeaves] = useState(false);

  const [myLeaves, setMyLeaves] = useState([]);

  const [loadingLeaves, setLoadingLeaves] = useState(false);



  const [showDocuments, setShowDocuments] = useState(false);

  const [documents, setDocuments] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [uploadingDocument, setUploadingDocument] = useState(false);



  const [showSummary, setShowSummary] = useState(false);

  const [summaryData, setSummaryData] = useState(null);

  const [loadingSummary, setLoadingSummary] = useState(false);



  // =========================

  // MANAGER STATES

  // =========================



  const [managerLeaves, setManagerLeaves] = useState([]);

  const [loadingManagerLeaves, setLoadingManagerLeaves] = useState(false);

  const [showManagerLeaves, setShowManagerLeaves] = useState(false);

  const [managerComment, setManagerComment] = useState("");



  // =========================

  // AUTH HEADER

  // =========================



  const getAuthHeaders = () => {

    const token = localStorage.getItem("access_token");



    if (!token) {

      return {};

    }



    return {

      Authorization: `Bearer ${token}`,

    };

  };



  const getJsonAuthHeaders = () => {

    return {

      ...getAuthHeaders(),

      "Content-Type": "application/json",

    };

  };



  // =========================

  // LOGIN

  // =========================



  const handleLogin = async (e) => {

    e.preventDefault();



    try {

      const response = await fetch(`${API}/api/auth/login`, {

        method: "POST",

        headers: {

          "Content-Type": "application/x-www-form-urlencoded",

        },

        body: new URLSearchParams({

          username,

          password,

        }),

      });



      const data = await response.json();



      if (!response.ok) {

        alert(data.detail || "Login failed");

        return;

      }



      localStorage.setItem("access_token", data.access_token);



      // Decode JWT role

      const tokenParts = data.access_token.split(".");



      let userRole = "EMPLOYEE";



      if (tokenParts.length === 3) {

        try {

          const payload = JSON.parse(

            atob(

              tokenParts[1]

                .replace(/-/g, "+")

                .replace(/\_/g, "/")

            )

          );



          userRole = payload.role || "EMPLOYEE";

        } catch (error) {

          console.error("Could not read token role", error);

        }

      }



      setRole(userRole.toUpperCase());

      setLoggedIn(true);

    } catch (error) {

      console.error(error);

      alert("Backend server is not running");

    }

  };



  // =========================

  // EMPLOYEE PROFILE

  // =========================



  const loadProfile = async () => {

    try {

      const response = await fetch(

        `${API}/api/employees/1`,

        {

          headers: getAuthHeaders(),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(data.detail || "Unable to load profile");

        return;

      }



      setProfile(data);



      setShowProfile(true);

      setShowBalance(false);

      setShowApplyLeave(false);

      setShowMyLeaves(false);

      setShowDocuments(false);

      setShowSummary(false);

    } catch (error) {

      console.error(error);

      alert("Unable to connect to backend");

    }

  };



  // =========================

  // LEAVE BALANCE

  // =========================



  const loadLeaveBalance = async () => {

    setLoadingBalance(true);



    try {

      const response = await fetch(

        `${API}/api/leaves/balance/1`,

        {

          headers: getAuthHeaders(),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail || "Unable to load leave balance"

        );

        return;

      }



      setLeaveBalances(data);



      setShowBalance(true);

      setShowProfile(false);

      setShowApplyLeave(false);

      setShowMyLeaves(false);

      setShowDocuments(false);

      setShowSummary(false);

    } catch (error) {

      console.error(error);

      alert("Unable to connect to backend");

    } finally {

      setLoadingBalance(false);

    }

  };



  // =========================

  // APPLY LEAVE

  // =========================



  const openApplyLeave = () => {

    setShowApplyLeave(true);



    setShowProfile(false);

    setShowBalance(false);

    setShowMyLeaves(false);

    setShowDocuments(false);

    setShowSummary(false);

  };



  const submitLeave = async (e) => {

    e.preventDefault();



    if (!leaveTypeId || !fromDate || !toDate) {

      alert("Please fill all required fields");

      return;

    }



    if (toDate < fromDate) {

      alert("To Date cannot be before From Date");

      return;

    }



    setSubmittingLeave(true);



    try {

      const response = await fetch(

        `${API}/api/leaves/`,

        {

          method: "POST",

          headers: getJsonAuthHeaders(),

          body: JSON.stringify({

            employee_id: 1,

            leave_type_id: Number(leaveTypeId),

            from_date: fromDate,

            to_date: toDate,

            reason: reason,

          }),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail || "Leave request failed"

        );

        return;

      }



      alert(

        "Leave request submitted successfully! ✅"

      );



      setLeaveTypeId("");

      setFromDate("");

      setToDate("");

      setReason("");



      setShowApplyLeave(false);

    } catch (error) {

      console.error(error);

      alert("Unable to connect to backend");

    } finally {

      setSubmittingLeave(false);

    }

  };



  // =========================

  // MY LEAVES

  // =========================



  const loadMyLeaves = async () => {

    setLoadingLeaves(true);



    try {

      const response = await fetch(

        `${API}/api/leaves/`,

        {

          headers: getAuthHeaders(),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail || "Unable to load leaves"

        );

        return;

      }



      const employeeLeaves = data.filter(

        (leave) => leave.employee_id === 1

      );



      setMyLeaves(employeeLeaves);



      setShowMyLeaves(true);

      setShowProfile(false);

      setShowBalance(false);

      setShowApplyLeave(false);

      setShowDocuments(false);

      setShowSummary(false);

    } catch (error) {

      console.error(error);

      alert("Unable to connect to backend");

    } finally {

      setLoadingLeaves(false);

    }

  };



  // =========================

  // DOCUMENTS

  // =========================



  const loadDocuments = async () => {

    setLoadingDocuments(true);



    try {

      const response = await fetch(

        `${API}/api/documents/1`,

        {

          headers: getAuthHeaders(),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail || "Unable to load documents"

        );

        return;

      }



      setDocuments(data);



      setShowDocuments(true);

      setShowProfile(false);

      setShowBalance(false);

      setShowApplyLeave(false);

      setShowMyLeaves(false);

      setShowSummary(false);

    } catch (error) {

      console.error(error);

      alert("Unable to connect to backend");

    } finally {

      setLoadingDocuments(false);

    }

  };



  const handleFileChange = (e) => {

    const file = e.target.files[0];



    if (!file) {

      setSelectedFile(null);

      return;

    }



    setSelectedFile(file);

  };



  const uploadDocument = async () => {

    if (!selectedFile) {

      alert("Please select a file first");

      return;

    }



    setUploadingDocument(true);



    try {

      const formData = new FormData();



      formData.append("employee_id", "1");

      formData.append("file", selectedFile);



      const response = await fetch(

        `${API}/api/documents/upload`,

        {

          method: "POST",

          headers: getAuthHeaders(),

          body: formData,

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail || "Document upload failed"

        );

        return;

      }



      alert(

        "Document uploaded successfully! ☁️"

      );



      setSelectedFile(null);



      const fileInput =

        document.getElementById("document-file");



      if (fileInput) {

        fileInput.value = "";

      }



      loadDocuments();

    } catch (error) {

      console.error(error);

      alert("Unable to upload document");

    } finally {

      setUploadingDocument(false);

    }

  };



  const downloadDocument = async (documentId) => {

    try {

      const response = await fetch(

        `${API}/api/documents/download/${documentId}`,

        {

          headers: getAuthHeaders(),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail ||

          "Unable to generate download link"

        );

        return;

      }



      window.open(

        data.download_url,

        "\_blank"

      );

    } catch (error) {

      console.error(error);

      alert("Unable to download document");

    }

  };



  // =========================

  // EMPLOYEE SUMMARY

  // =========================



  const loadSummary = async () => {

    setLoadingSummary(true);



    try {

      const authHeaders = getAuthHeaders();



      const [

        profileResponse,

        balanceResponse,

        leavesResponse,

        documentsResponse,

      ] = await Promise.all([

        fetch(`${API}/api/employees/1`, {

          headers: authHeaders,

        }),



        fetch(`${API}/api/leaves/balance/1`, {

          headers: authHeaders,

        }),



        fetch(`${API}/api/leaves/`, {

          headers: authHeaders,

        }),



        fetch(`${API}/api/documents/1`, {

          headers: authHeaders,

        }),

      ]);



      const profileData =

        await profileResponse.json();



      const balanceData =

        await balanceResponse.json();



      const leavesData =

        await leavesResponse.json();



      const documentsData =

        await documentsResponse.json();



      if (

        !profileResponse.ok ||

        !balanceResponse.ok ||

        !leavesResponse.ok ||

        !documentsResponse.ok

      ) {

        alert(

          "Unable to load dashboard summary"

        );

        return;

      }



      const employeeLeaves =

        leavesData.filter(

          (leave) =>

            leave.employee_id === 1

        );



      const approvedCount =

        employeeLeaves.filter(

          (leave) =>

            leave.status === "APPROVED"

        ).length;



      const pendingCount =

        employeeLeaves.filter(

          (leave) =>

            leave.status === "PENDING"

        ).length;



      const rejectedCount =

        employeeLeaves.filter(

          (leave) =>

            leave.status === "REJECTED"

        ).length;



      const totalAvailableDays =

        balanceData.reduce(

          (total, leave) =>

            total + leave.available_days,

          0

        );



      setSummaryData({

        profile: profileData,

        totalAvailableDays,

        approvedCount,

        pendingCount,

        rejectedCount,

        documentCount:

          documentsData.length,

        totalLeaveRequests:

          employeeLeaves.length,

      });



      setShowSummary(true);



      setShowProfile(false);

      setShowBalance(false);

      setShowApplyLeave(false);

      setShowMyLeaves(false);

      setShowDocuments(false);

    } catch (error) {

      console.error(error);

      alert(

        "Unable to connect to backend"

      );

    } finally {

      setLoadingSummary(false);

    }

  };



  // =========================

  // MANAGER - ALL LEAVES

  // =========================



  const loadManagerLeaves = async () => {

    setLoadingManagerLeaves(true);



    try {

      const response = await fetch(

        `${API}/api/leaves/`,

        {

          headers: getAuthHeaders(),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail ||

          "Unable to load leave requests"

        );

        return;

      }



      setManagerLeaves(data);



      setShowManagerLeaves(true);



      setShowProfile(false);

      setShowBalance(false);

      setShowApplyLeave(false);

      setShowMyLeaves(false);

      setShowDocuments(false);

      setShowSummary(false);

    } catch (error) {

      console.error(error);

      alert(

        "Unable to connect to backend"

      );

    } finally {

      setLoadingManagerLeaves(false);

    }

  };



  // =========================

  // MANAGER - APPROVE

  // =========================



  const approveLeave = async (leaveId) => {

    try {

      const response = await fetch(

        `${API}/api/leaves/${leaveId}/approve`,

        {

          method: "PUT",

          headers: getJsonAuthHeaders(),

          body: JSON.stringify({

            manager_comment:

              managerComment ||

              "Approved by manager",

          }),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail ||

          "Unable to approve leave"

        );

        return;

      }



      alert(

        "Leave approved successfully! 🟢"

      );



      setManagerComment("");



      loadManagerLeaves();

    } catch (error) {

      console.error(error);

      alert(

        "Unable to connect to backend"

      );

    }

  };



  // =========================

  // MANAGER - REJECT

  // =========================



  const rejectLeave = async (leaveId) => {

    try {

      const response = await fetch(

        `${API}/api/leaves/${leaveId}/reject`,

        {

          method: "PUT",

          headers: getJsonAuthHeaders(),

          body: JSON.stringify({

            manager_comment:

              managerComment ||

              "Rejected by manager",

          }),

        }

      );



      const data = await response.json();



      if (!response.ok) {

        alert(

          data.detail ||

          "Unable to reject leave"

        );

        return;

      }



      alert(

        "Leave rejected successfully! 🔴"

      );



      setManagerComment("");



      loadManagerLeaves();

    } catch (error) {

      console.error(error);

      alert(

        "Unable to connect to backend"

      );

    }

  };



  // =========================

  // LOGOUT

  // =========================



  const handleLogout = () => {

    localStorage.removeItem("access_token");



    setLoggedIn(false);

    setUsername("");

    setPassword("");

    setRole("");



    setProfile(null);



    setShowProfile(false);

    setShowBalance(false);

    setShowApplyLeave(false);

    setShowMyLeaves(false);

    setShowDocuments(false);

    setShowSummary(false);

    setShowManagerLeaves(false);

  };



  // =========================

  // STATUS CLASS

  // =========================



  const getStatusClass = (status) => {

    if (status === "APPROVED") {

      return "status-approved";

    }



    if (status === "REJECTED") {

      return "status-rejected";

    }



    return "status-pending";

  };



  // =========================

  // MANAGER DASHBOARD

  // =========================



  if (

    loggedIn &&

    role === "MANAGER"

  ) {

    return (

      <div className="dashboard-page">



        <header className="dashboard-header">

          <div>

            <h1>

              👨‍💼 Manager Dashboard

            </h1>



            <p>

              Welcome, {username}

            </p>

          </div>



          <button

            className="logout-btn"

            onClick={handleLogout}

          >

            Logout

          </button>

        </header>



        <main className="dashboard-content">



          {showManagerLeaves ? (



            <>

              <div className="welcome-card">

                <h2>

                  📋 Leave Requests

                </h2>



                <p>

                  Review and manage employee

                  leave requests.

                </p>

              </div>



              {loadingManagerLeaves ? (



                <p>

                  Loading leave requests...

                </p>



              ) : managerLeaves.length === 0 ? (



                <div className="profile-card">

                  <h3>

                    No Leave Requests

                  </h3>



                  <p>

                    There are no leave requests

                    available.

                  </p>

                </div>



              ) : (



                <div className="dashboard-grid">



                  {managerLeaves.map(

                    (leave) => (



                      <div

                        className="dashboard-card"

                        key={leave.id}

                      >



                        <div className="card-icon">

                          📋

                        </div>



                        <h3>

                          Leave Request #

                          {leave.id}

                        </h3>



                        <p>

                          <strong>

                            Employee ID:

                          </strong>{" "}

                          {leave.employee_id}

                        </p>



                        <p>

                          <strong>

                            Leave Type ID:

                          </strong>{" "}

                          {leave.leave_type_id}

                        </p>



                        <p>

                          <strong>

                            From:

                          </strong>{" "}

                          {leave.from_date}

                        </p>



                        <p>

                          <strong>

                            To:

                          </strong>{" "}

                          {leave.to_date}

                        </p>



                        <p>

                          <strong>

                            Reason:

                          </strong>{" "}

                          {leave.reason ||

                            "No reason provided"}

                        </p>



                        <p>

                          <strong>

                            Status:

                          </strong>{" "}



                          <span

                            className={getStatusClass(

                              leave.status

                            )}

                          >

                            {leave.status}

                          </span>

                        </p>



                        {leave.status ===

                          "PENDING" && (



                          <>

                            <label>

                              Manager Comment

                            </label>



                            <textarea

                              rows="3"

                              placeholder="Enter comment..."

                              value={

                                managerComment

                              }

                              onChange={(e) =>

                                setManagerComment(

                                  e.target.value

                                )

                              }

                            />



                            <button

                              onClick={() =>

                                approveLeave(

                                  leave.id

                                )

                              }

                            >

                              🟢 Approve

                            </button>



                            <br />

                            <br />



                            <button

                              onClick={() =>

                                rejectLeave(

                                  leave.id

                                )

                              }

                            >

                              🔴 Reject

                            </button>

                          </>

                        )}



                        {leave.manager_comment && (

                          <p>

                            <strong>

                              Manager Comment:

                            </strong>{" "}

                            {leave.manager_comment}

                          </p>

                        )}



                      </div>

                    )

                  )}



                </div>

              )}



              <button

                onClick={() =>

                  setShowManagerLeaves(false)

                }

              >

                ← Back to Manager Dashboard

              </button>

            </>



          ) : (



            <>

              <div className="welcome-card">

                <h2>

                  Welcome Manager 👋

                </h2>



                <p>

                  Manage employee leave

                  requests from here.

                </p>

              </div>



              <div className="dashboard-grid">



                <div className="dashboard-card">



                  <div className="card-icon">

                    📋

                  </div>



                  <h3>

                    Leave Requests

                  </h3>



                  <p>

                    View and manage all employee

                    leave requests.

                  </p>



                  <button

                    onClick={

                      loadManagerLeaves

                    }

                  >

                    View Requests

                  </button>



                </div>



                <div className="dashboard-card">



                  <div className="card-icon">

                    🟢

                  </div>



                  <h3>

                    Approve / Reject

                  </h3>



                  <p>

                    Review pending requests and

                    update their status.

                  </p>



                  <button

                    onClick={

                      loadManagerLeaves

                    }

                  >

                    Manage Leaves

                  </button>



                </div>



              </div>

            </>

          )}



        </main>

      </div>

    );

  }



  // =========================

  // EMPLOYEE DASHBOARD

  // =========================



  if (loggedIn) {

    return (

      <div className="dashboard-page">



        <header className="dashboard-header">



          <div>

            <h1>

              🏢 Employee Leave Management

            </h1>



            <p>

              Welcome, {username}

            </p>

          </div>



          <button

            className="logout-btn"

            onClick={handleLogout}

          >

            Logout

          </button>



        </header>



        <main className="dashboard-content">



          {showProfile ? (



            <>

              <div className="welcome-card">

                <h2>

                  👤 My Profile

                </h2>



                <p>

                  Your employee information

                </p>

              </div>



              {profile && (

                <div className="profile-card">



                  <div className="profile-avatar">

                    👤

                  </div>



                  <h2>

                    {profile.first_name}{" "}

                    {profile.last_name || ""}

                  </h2>



                  <div className="profile-details">



                    <div className="profile-row">

                      <strong>

                        Employee ID

                      </strong>



                      <span>

                        {profile.id}

                      </span>

                    </div>



                    <div className="profile-row">

                      <strong>

                        Employee Code

                      </strong>



                      <span>

                        {profile.employee_code}

                      </span>

                    </div>



                    <div className="profile-row">

                      <strong>

                        User ID

                      </strong>



                      <span>

                        {profile.user_id}

                      </span>

                    </div>



                    <div className="profile-row">

                      <strong>

                        Department ID

                      </strong>



                      <span>

                        {profile.department_id}

                      </span>

                    </div>



                    <div className="profile-row">

                      <strong>

                        Joining Date

                      </strong>



                      <span>

                        {profile.joining_date}

                      </span>

                    </div>



                    <div className="profile-row">

                      <strong>

                        Status

                      </strong>



                      <span>

                        {profile.active

                          ? "Active"

                          : "Inactive"}

                      </span>

                    </div>



                  </div>



                  <button

                    onClick={() =>

                      setShowProfile(false)

                    }

                  >

                    ← Back to Dashboard

                  </button>



                </div>

              )}



            </>



          ) : showBalance ? (



            <>

              <div className="welcome-card">

                <h2>

                  📅 Leave Balance

                </h2>



                <p>

                  Your available leave days

                </p>

              </div>



              {loadingBalance ? (



                <p>

                  Loading leave balance...

                </p>



              ) : (



                <div className="dashboard-grid">



                  {leaveBalances.map(

                    (leave) => (



                      <div

                        className="dashboard-card"

                        key={

                          leave.leave_type_id

                        }

                      >



                        <div className="card-icon">

                          📅

                        </div>



                        <h3>

                          {leave.leave_type}

                        </h3>



                        <p>

                          Total Days:{" "}

                          <strong>

                            {leave.total_days}

                          </strong>

                        </p>



                        <p>

                          Used Days:{" "}

                          <strong>

                            {leave.used_days}

                          </strong>

                        </p>



                        <p>

                          Available Days:{" "}

                          <strong>

                            {leave.available_days}

                          </strong>

                        </p>



                      </div>

                    )

                  )}



                </div>

              )}



              <button

                onClick={() =>

                  setShowBalance(false)

                }

              >

                ← Back to Dashboard

              </button>

            </>



          ) : showApplyLeave ? (



            <>

              <div className="welcome-card">

                <h2>

                  📝 Apply Leave

                </h2>



                <p>

                  Submit a new leave request

                </p>

              </div>



              <div className="profile-card">



                <form onSubmit={submitLeave}>



                  <label>

                    Leave Type

                  </label>



                  <select

                    value={leaveTypeId}

                    onChange={(e) =>

                      setLeaveTypeId(

                        e.target.value

                      )

                    }

                    required

                  >



                    <option value="">

                      Select Leave Type

                    </option>



                    <option value="1">

                      Casual Leave

                    </option>



                    <option value="2">

                      Sick Leave

                    </option>



                    <option value="3">

                      Earned Leave

                    </option>



                  </select>



                  <label>

                    From Date

                  </label>



                  <input

                    type="date"

                    value={fromDate}

                    onChange={(e) =>

                      setFromDate(

                        e.target.value

                      )

                    }

                    required

                  />



                  <label>

                    To Date

                  </label>



                  <input

                    type="date"

                    value={toDate}

                    onChange={(e) =>

                      setToDate(

                        e.target.value

                      )

                    }

                    required

                  />



                  <label>

                    Reason

                  </label>



                  <textarea

                    placeholder="Enter reason for leave"

                    value={reason}

                    onChange={(e) =>

                      setReason(

                        e.target.value

                      )

                    }

                    rows="5"

                  />



                  <button

                    type="submit"

                    disabled={

                      submittingLeave

                    }

                  >

                    {submittingLeave

                      ? "Submitting..."

                      : "Submit Leave Request"}

                  </button>



                </form>



                <br />



                <button

                  onClick={() =>

                    setShowApplyLeave(

                      false

                    )

                  }

                >

                  ← Back to Dashboard

                </button>



              </div>

            </>



          ) : showMyLeaves ? (



            <>

              <div className="welcome-card">

                <h2>

                  📋 My Leaves

                </h2>



                <p>

                  View your leave request

                  history

                </p>

              </div>



              {loadingLeaves ? (



                <p>

                  Loading your leaves...

                </p>



              ) : myLeaves.length === 0 ? (



                <div className="profile-card">



                  <h3>

                    No Leave Requests Found

                  </h3>



                  <p>

                    You have not submitted any

                    leave requests yet.

                  </p>



                </div>



              ) : (



                <div className="dashboard-grid">



                  {myLeaves.map(

                    (leave) => (



                      <div

                        className="dashboard-card"

                        key={leave.id}

                      >



                        <div className="card-icon">

                          📋

                        </div>



                        <h3>

                          Leave Request #

                          {leave.id}

                        </h3>



                        <p>

                          <strong>

                            Leave Type ID:

                          </strong>{" "}

                          {leave.leave_type_id}

                        </p>



                        <p>

                          <strong>

                            From:

                          </strong>{" "}

                          {leave.from_date}

                        </p>



                        <p>

                          <strong>

                            To:

                          </strong>{" "}

                          {leave.to_date}

                        </p>



                        <p>

                          <strong>

                            Reason:

                          </strong>{" "}

                          {leave.reason ||

                            "No reason provided"}

                        </p>



                        <p>

                          <strong>

                            Status:

                          </strong>{" "}



                          <span

                            className={getStatusClass(

                              leave.status

                            )}

                          >

                            {leave.status}

                          </span>



                        </p>



                        <p>

                          <strong>

                            Manager Comment:

                          </strong>{" "}



                          {leave.manager_comment ||

                            "No comment yet"}



                        </p>



                      </div>

                    )

                  )}



                </div>

              )}



              <button

                onClick={() =>

                  setShowMyLeaves(false)

                }

              >

                ← Back to Dashboard

              </button>



            </>



          ) : showDocuments ? (



            <>

              <div className="welcome-card">

                <h2>

                  📄 Documents

                </h2>



                <p>

                  Upload and manage your

                  documents

                </p>

              </div>



              <div className="profile-card">



                <h3>

                  📤 Upload Document

                </h3>



                <input

                  id="document-file"

                  type="file"

                  onChange={

                    handleFileChange

                  }

                />



                {selectedFile && (

                  <p>

                    Selected file:{" "}

                    <strong>

                      {selectedFile.name}

                    </strong>

                  </p>

                )}



                <button

                  onClick={

                    uploadDocument

                  }

                  disabled={

                    uploadingDocument

                  }

                >

                  {uploadingDocument

                    ? "Uploading..."

                    : "☁️ Upload Document"}

                </button>



              </div>



              <div className="welcome-card">

                <h2>

                  📋 Uploaded Documents

                </h2>

              </div>



              {loadingDocuments ? (



                <p>

                  Loading documents...

                </p>



              ) : documents.length === 0 ? (



                <div className="profile-card">



                  <h3>

                    No Documents Found

                  </h3>



                  <p>

                    Upload your first document.

                  </p>



                </div>



              ) : (



                <div className="dashboard-grid">



                  {documents.map(

                    (document) => (



                      <div

                        className="dashboard-card"

                        key={

                          document.id

                        }

                      >



                        <div className="card-icon">

                          📄

                        </div>



                        <h3>

                          {document.file_name}

                        </h3>



                        <p>

                          <strong>

                            Document ID:

                          </strong>{" "}

                          {document.id}

                        </p>



                        <button

                          onClick={() =>

                            downloadDocument(

                              document.id

                            )

                          }

                        >

                          🔗 Download

                        </button>



                      </div>

                    )

                  )}



                </div>

              )}



              <button

                onClick={() =>

                  setShowDocuments(false)

                }

              >

                ← Back to Dashboard

              </button>



            </>



          ) : showSummary ? (



            <>

              <div className="welcome-card">

                <h2>

                  📊 Dashboard Summary

                </h2>



                <p>

                  Your employee leave

                  management overview

                </p>

              </div>



              {loadingSummary ? (



                <p>

                  Loading summary...

                </p>



              ) : summaryData ? (



                <>

                  <div className="dashboard-grid">



                    <div className="dashboard-card">



                      <div className="card-icon">

                        👤

                      </div>



                      <h3>

                        Employee

                      </h3>



                      <p>

                        <strong>

                          Name:

                        </strong>{" "}

                        {

                          summaryData.profile

                            .first_name

                        }{" "}

                        {

                          summaryData.profile

                            .last_name || ""

                        }

                      </p>



                      <p>

                        <strong>

                          Code:

                        </strong>{" "}

                        {

                          summaryData.profile

                            .employee_code

                        }

                      </p>



                      <p>

                        <strong>

                          Status:

                        </strong>{" "}

                        {

                          summaryData.profile

                            .active

                            ? "Active"

                            : "Inactive"

                        }

                      </p>



                    </div>



                    <div className="dashboard-card">



                      <div className="card-icon">

                        📅

                      </div>



                      <h3>

                        Available Leave

                      </h3>



                      <p>

                        Total available days

                      </p>



                      <h2>

                        {

                          summaryData

                            .totalAvailableDays

                        }

                      </h2>



                      <p>

                        Days remaining

                      </p>



                    </div>



                    <div className="dashboard-card">



                      <div className="card-icon">

                        🟢

                      </div>



                      <h3>

                        Approved Leaves

                      </h3>



                      <h2>

                        {

                          summaryData

                            .approvedCount

                        }

                      </h2>



                      <p>

                        Approved requests

                      </p>



                    </div>



                    <div className="dashboard-card">



                      <div className="card-icon">

                        🟡

                      </div>



                      <h3>

                        Pending Leaves

                      </h3>



                      <h2>

                        {

                          summaryData

                            .pendingCount

                        }

                      </h2>



                      <p>

                        Waiting for approval

                      </p>



                    </div>



                    <div className="dashboard-card">



                      <div className="card-icon">

                        🔴

                      </div>



                      <h3>

                        Rejected Leaves

                      </h3>



                      <h2>

                        {

                          summaryData

                            .rejectedCount

                        }

                      </h2>



                      <p>

                        Rejected requests

                      </p>



                    </div>



                    <div className="dashboard-card">



                      <div className="card-icon">

                        📄

                      </div>



                      <h3>

                        Documents

                      </h3>



                      <h2>

                        {

                          summaryData

                            .documentCount

                        }

                      </h2>



                      <p>

                        Uploaded documents

                      </p>



                    </div>



                  </div>



                  <div className="profile-card">



                    <h3>

                      📋 Leave Request

                      Overview

                    </h3>



                    <p>

                      Total Leave Requests:{" "}

                      <strong>

                        {

                          summaryData

                            .totalLeaveRequests

                        }

                      </strong>

                    </p>



                    <p>

                      🟢 Approved:{" "}

                      <strong>

                        {

                          summaryData

                            .approvedCount

                        }

                      </strong>

                    </p>



                    <p>

                      🟡 Pending:{" "}

                      <strong>

                        {

                          summaryData

                            .pendingCount

                        }

                      </strong>

                    </p>



                    <p>

                      🔴 Rejected:{" "}

                      <strong>

                        {

                          summaryData

                            .rejectedCount

                        }

                      </strong>

                    </p>



                  </div>

                </>



              ) : null}



              <button

                onClick={() =>

                  setShowSummary(false)

                }

              >

                ← Back to Dashboard

              </button>



            </>



          ) : (



            <>

              <div className="welcome-card">



                <h2>

                  Welcome to Dashboard 👋

                </h2>



                <p>

                  Manage your employee

                  profile, leaves and

                  documents from one place.

                </p>



              </div>



              <div className="dashboard-grid">



                <div className="dashboard-card">



                  <div className="card-icon">

                    👤

                  </div>



                  <h3>

                    My Profile

                  </h3>



                  <p>

                    View your employee

                    information.

                  </p>



                  <button

                    onClick={

                      loadProfile

                    }

                  >

                    View Profile

                  </button>



                </div>



                <div className="dashboard-card">



                  <div className="card-icon">

                    📅

                  </div>



                  <h3>

                    Leave Balance

                  </h3>



                  <p>

                    Check your available

                    leave days.

                  </p>



                  <button

                    onClick={

                      loadLeaveBalance

                    }

                  >

                    View Balance

                  </button>



                </div>



                <div className="dashboard-card">



                  <div className="card-icon">

                    📝

                  </div>



                  <h3>

                    Apply Leave

                  </h3>



                  <p>

                    Submit a new leave

                    request.

                  </p>



                  <button

                    onClick={

                      openApplyLeave

                    }

                  >

                    Apply Leave

                  </button>



                </div>



                <div className="dashboard-card">



                  <div className="card-icon">

                    📋

                  </div>



                  <h3>

                    My Leaves

                  </h3>



                  <p>

                    View your leave request

                    status.

                  </p>



                  <button

                    onClick={

                      loadMyLeaves

                    }

                  >

                    View Leaves

                  </button>



                </div>



                <div className="dashboard-card">



                  <div className="card-icon">

                    📄

                  </div>



                  <h3>

                    Documents

                  </h3>



                  <p>

                    Upload and manage

                    documents.

                  </p>



                  <button

                    onClick={

                      loadDocuments

                    }

                  >

                    Documents

                  </button>



                </div>



                <div className="dashboard-card">



                  <div className="card-icon">

                    📊

                  </div>



                  <h3>

                    Dashboard

                  </h3>



                  <p>

                    View your leave

                    management summary.

                  </p>



                  <button

                    onClick={

                      loadSummary

                    }

                  >

                    View Summary

                  </button>



                </div>



              </div>

            </>

          )}



        </main>

      </div>

    );

  }



  // =========================

  // LOGIN PAGE

  // =========================



  return (

    <div className="login-page">



      <div className="login-card">



        <div className="logo">

          🏢

        </div>



        <h1>

          Employee Leave Management

        </h1>



        <p className="subtitle">

          Sign in to your account

        </p>



        <form

          onSubmit={handleLogin}

        >



          <label>

            Username

          </label>



          <input

            type="text"

            placeholder="Enter your username"

            value={username}

            onChange={(e) =>

              setUsername(

                e.target.value

              )

            }

            required

          />



          <label>

            Password

          </label>



          <input

            type="password"

            placeholder="Enter your password"

            value={password}

            onChange={(e) =>

              setPassword(

                e.target.value

              )

            }

            required

          />



          <button type="submit">

            Login

          </button>



        </form>



        <p className="footer-text">

          Employee Leave Management

          System

        </p>



      </div>



    </div>

  );

}



export default App;


