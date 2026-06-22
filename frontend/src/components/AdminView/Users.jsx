import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import authApi from "../../services/api";
import "../../styles/Users.css";

function Users({ view = "all" }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    async function getUsers() {
        try {
            let url = "/auth/users";
            const params = new URLSearchParams();
            if (view === "free") {
                params.append("plan", "free");
            }
            if (view === "pro") {
                params.append("plan", "pro");
            }
            if (search.trim()) {
                params.append("search", search.trim());
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            const token = localStorage.getItem("token");

            const res = await authApi.get(url);

            console.log("USERS API RESPONSE:", res.data);

            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log(err);

            if (err.response?.status === 401) {
                toast.error("You are not logged in. Please login again.");
            } else if (err.response?.status === 403) {
                toast.error("Admin access only.");
            } else {
                toast.error("Could not fetch users");
            }

            setUsers([]);
        }
    }

    useEffect(() => {
        const delay=setTimeout(()=>{
            getUsers();
        },400);
        return ()=>clearTimeout(delay);
    }, [view,search]);

    const freeUsers = users.filter((user) => user.plan === "free");
    const paidUsers = users.filter((user) => user.plan === "pro");
    async function toggleBlock(id) {
        try {
            const response = await authApi.patch(`/auth/users/${id}/block`);
            toast.success(response.data.message);
            getUsers();
        } catch (err) {
            console.log(err);
            toast.error("Could not block user");
        }
    }
    function formatDate(dateValue) {
        if (!dateValue) return "Not used yet";

        return new Date(dateValue).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }
    function getPageTitle() {
        if (view === "free") return "Free Users";
        if (view === "pro") return "Paid Users";
        return "Users";
    }
    function exportToCSV(exportUsers, filename) {
        const headings = [
            "Id",
            "Name",
            "Email",
            "Phone",
            "Email Status",
            "Plan",
            "Free Uses Left",
            "Pro Uses Left",
            "Total Uses",
            "Registered At",
            "Last Used At",
            "Status",
        ];

        const rows = exportUsers.map((user) => [
            user.id,
            user.name,
            user.email,
            user.phone || "Not provided",
            user.emailStatus || "Not verified",
            user.plan,
            user.freeUsesLeft ?? 0,
            user.proUsesLeft ?? 0,
            user.totalUses ?? 0,
            formatDate(user.registeredAt),
            formatDate(user.lastUsedAt),
            user.isBlocked ? "Blocked" : "Active",
        ]);

        const csvContent = [
            headings.join(","),
            ...rows.map((row) =>
                row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }
    function renderFreeUsersTable() {
        return (
            <>
                <div className="table-title-row">
                    <h2>Free Users</h2>
                    <button className="export-btn" onClick={() => exportToCSV(freeUsers, "free-users.csv")}>
                        Export Free Users
                    </button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Email Status</th>
                                <th>Free Uses Left</th>
                                <th>Total Uses</th>
                                <th>Registered At</th>
                                <th>Last Used At</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freeUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="empty-cell">
                                        No free users found
                                    </td>
                                </tr>
                            ) : (
                                freeUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || "Not provided"}</td>
                                        <td>{user.emailStatus || "Not verified"}</td>
                                        <td>{user.freeUsesLeft ?? 0}</td>
                                        <td>{user.totalUses ?? 0}</td>
                                        <td>{formatDate(user.registeredAt)}</td>
                                        <td>{formatDate(user.lastUsedAt)}</td>
                                        <td className="status-cell">
                                            <span
                                                style={{ cursor: "pointer" }}
                                                className={user.isBlocked ? "badge blocked" : "badge active"}
                                                onClick={() => toggleBlock(user.id)}
                                            >
                                                {user.isBlocked ? "Blocked" : "Active"}
                                            </span>

                                            <span className="status-tooltip">
                                                {user.isBlocked
                                                    ? "Click to unblock this user"
                                                    : "Click to block this user"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        )
    }

    function renderPaidUsersTable() {
        return (
            <>
                <div className="table-title-row">
                    <h2>Paid Users</h2>

                    <button
                        className="export-btn"
                        onClick={() => exportToCSV(paidUsers, "paid-users.csv")}
                    >
                        Export Paid Users
                    </button>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Email Status</th>
                                <th>Plan</th>
                                <th>Pro Uses Left</th>
                                <th>Total Uses</th>
                                <th>Registered At</th>
                                <th>Last Used At</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paidUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="empty-cell">
                                        No paid users found
                                    </td>
                                </tr>
                            ) : (
                                paidUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || "Not provided"}</td>
                                        <td>{user.emailStatus || "Not verified"}</td>
                                        <td>{user.plan}</td>
                                        <td>{user.proUsesLeft ?? 0}</td>
                                        <td>{user.totalUses ?? 0}</td>
                                        <td>{formatDate(user.registeredAt)}</td>
                                        <td>{formatDate(user.lastUsedAt)}</td>
                                        <td className="status-cell">
                                            <span
                                                style={{ cursor: "pointer" }}
                                                className={user.isBlocked ? "badge blocked" : "badge active"}
                                                onClick={() => toggleBlock(user.id)}
                                            >
                                                {user.isBlocked ? "Blocked" : "Active"}
                                            </span>

                                            <span className="status-tooltip">
                                                {user.isBlocked
                                                    ? "Click to unblock this user"
                                                    : "Click to block this user"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }
    return (
    <section className="user-section">
      <div className="user-header">
        <div>
          <h1>{getPageTitle()}</h1>
        </div>
      </div>

      <div className="user-search-box">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          onClick={() => {
            setSearch("");
          }}
        >
          Clear
        </button>
      </div>

      {view === "all" && (
        <div className="user-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{users.length - 1}</p>
          </div>

          <div className="stat-card">
            <h3>Free Users</h3>
            <p>{freeUsers.length}</p>
          </div>

          <div className="stat-card">
            <h3>Paid Users</h3>
            <p>{paidUsers.length}</p>
          </div>

          <div className="stat-card">
            <h3>Blocked Users</h3>
            <p>{users.filter((user) => user.isBlocked).length}</p>
          </div>
        </div>
      )}

      <div className="user-body">
        {view === "all" && (
          <>
            {renderFreeUsersTable()}
            {renderPaidUsersTable()}
          </>
        )}

        {view === "free" && renderFreeUsersTable()}

        {view === "pro" && renderPaidUsersTable()}
      </div>
    </section>
  );
}
export default Users;