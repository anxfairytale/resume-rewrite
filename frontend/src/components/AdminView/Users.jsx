import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "../../styles/Users.css";

function Users() {
    const [users, setUsers] = useState([]);

    async function getUsers() {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get("http://localhost:5000/auth/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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
        getUsers();
    }, []);

    const freeUsers = users.filter((user) => user.plan === "free");
    const paidUsers = users.filter((user) => user.plan === "pro");
    async function toggleBlock(id) {
        try {
            const response=await axios.patch(`http://localhost:5000/auth/users/${id}/block`);
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

    return (
        <section className="user-section">
            <div className="user-header">
                <div>
                    <h1>Admin Users</h1>
                    <p>Manage free users, paid users, usage, and blocked accounts.</p>
                </div>
            </div>

            <div className="user-stats">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p>{users.length}</p>
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

            <div className="user-body">
                <h2>Free Users</h2>

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
                                        <td>
                                            <span style={{ cursor: "pointer" }} className={user.isBlocked ? "badge blocked" : "badge active"} onClick={() => toggleBlock(user.id)}>
                                                {user.isBlocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <h2>Paid Users</h2>

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
                                        <td>
                                            <span className={user.isBlocked ? "badge blocked" : "badge active"}>
                                                {user.isBlocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default Users;