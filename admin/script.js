const API_BASE_URL = "http://localhost:5000/api";

const loginForm = document.querySelector(".login-form");
const loginMessage = document.querySelector(".login-message");
const loginButton = document.querySelector(".login-btn");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.querySelector("#username").value.trim();
        const password = document.querySelector("#password").value;

        if (!username || !password) {
            showLoginMessage("Please enter username and password.", "error");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing In...";
        loginMessage.className = "login-message";

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid username or password.");
            }

            localStorage.setItem("adminToken", data.token);
            localStorage.setItem(
                "adminUsername",
                data.admin?.username || username
            );

            showLoginMessage("Login successful. Redirecting...", "success");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);
        } catch (error) {
            showLoginMessage(error.message, "error");
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }
    });
}

function showLoginMessage(message, type) {
    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;
    loginMessage.className = `login-message active ${type}`;
}

const dashboardPage = document.querySelector(".dashboard-main");

if (dashboardPage) {
    const token = localStorage.getItem("adminToken");
    const username = localStorage.getItem("adminUsername");

    if (!token) {
        window.location.href = "index.html";
    }

    const adminName = document.querySelector("#adminName");
    const logoutBtn = document.querySelector("#logoutBtn");
    const totalEnquiries = document.querySelector("#totalEnquiries");
    const todayEnquiries = document.querySelector("#todayEnquiries");
    const monthEnquiries = document.querySelector("#monthEnquiries");
    const latestEnquiry = document.querySelector("#latestEnquiry");
    const tableBody = document.querySelector("#enquiriesTableBody");
    const searchInput = document.querySelector("#searchInput");
    const statusFilter = document.querySelector("#statusFilter");
    const emptyState = document.querySelector("#emptyState");

    const enquiryModal = document.querySelector("#enquiryModal");
    const modalClose = document.querySelector("#modalClose");
    const modalOverlay = document.querySelector("#modalOverlay");

    let enquiries = [];

    if (username && adminName) {
        adminName.textContent = username;
    }

    async function loadEnquiries() {
        try {
            const response = await fetch(`${API_BASE_URL}/enquiries`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUsername");
                window.location.href = "index.html";
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch enquiries");
            }

            enquiries = await response.json();

            enquiries = enquiries.map((enquiry) => ({
                ...enquiry,
                status: enquiry.status || "NEW"
            }));

            updateStats(enquiries);
            applyFilters();
        } catch (error) {
            console.error(error);

            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center; padding:30px;">
                            Failed to load enquiries.
                        </td>
                    </tr>
                `;
            }
        }
    }

    function updateStats(data) {
        if (totalEnquiries) {
            totalEnquiries.textContent = data.length;
        }

        const now = new Date();

        const today = data.filter((enquiry) => {
            const date = new Date(enquiry.createdAt);

            return (
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        });

        const thisMonth = data.filter((enquiry) => {
            const date = new Date(enquiry.createdAt);

            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        });

        if (todayEnquiries) {
            todayEnquiries.textContent = today.length;
        }

        if (monthEnquiries) {
            monthEnquiries.textContent = thisMonth.length;
        }

        if (latestEnquiry) {
            if (data.length > 0) {
                const sorted = [...data].sort(
                    (a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                );

                const date = new Date(sorted[0].createdAt);

                latestEnquiry.textContent = date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
            } else {
                latestEnquiry.textContent = "—";
            }
        }
    }

    function applyFilters() {
        const searchTerm = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "ALL";

        const filteredEnquiries = enquiries.filter((enquiry) => {
            const matchesSearch =
                enquiry.name.toLowerCase().includes(searchTerm) ||
                (enquiry.company || "")
                    .toLowerCase()
                    .includes(searchTerm) ||
                enquiry.email.toLowerCase().includes(searchTerm) ||
                (enquiry.phone || "")
                    .toLowerCase()
                    .includes(searchTerm) ||
                enquiry.message.toLowerCase().includes(searchTerm);

            const matchesStatus =
                selectedStatus === "ALL" ||
                enquiry.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        displayEnquiries(filteredEnquiries);
    }

    function displayEnquiries(data) {
        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = "";

        if (data.length === 0) {
            if (emptyState) {
                emptyState.classList.add("active");
            }
            return;
        }

        if (emptyState) {
            emptyState.classList.remove("active");
        }

        data.forEach((enquiry) => {
            const row = document.createElement("tr");

            const date = new Date(enquiry.createdAt);

            row.innerHTML = `
                <td>${escapeHTML(enquiry.name)}</td>
                <td>${escapeHTML(enquiry.company || "—")}</td>
                <td>${escapeHTML(enquiry.email)}</td>
                <td>${escapeHTML(enquiry.phone || "—")}</td>
                <td class="message-cell">${escapeHTML(enquiry.message)}</td>
                <td>
                    <select class="status-select status-${enquiry.status.toLowerCase()}" data-id="${enquiry._id}">
                        <option value="NEW" ${enquiry.status === "NEW" ? "selected" : ""}>New</option>
                        <option value="CONTACTED" ${enquiry.status === "CONTACTED" ? "selected" : ""}>Contacted</option>
                        <option value="COMPLETED" ${enquiry.status === "COMPLETED" ? "selected" : ""}>Completed</option>
                    </select>
                </td>
                <td>${date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })}</td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" data-id="${enquiry._id}">
                            View
                        </button>
                        <button class="delete-btn" data-id="${enquiry._id}">
                            Delete
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        document.querySelectorAll(".view-btn").forEach((button) => {
            button.addEventListener("click", () => {
                viewEnquiry(button.dataset.id);
            });
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", () => {
                deleteEnquiry(button.dataset.id);
            });
        });

        document.querySelectorAll(".status-select").forEach((select) => {
            select.addEventListener("change", () => {
                updateStatus(select.dataset.id, select.value);
            });
        });
    }

    async function updateStatus(id, status) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/enquiries/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update status"
                );
            }

            const enquiry = enquiries.find(
                (item) => item._id === id
            );

            if (enquiry) {
                enquiry.status = status;
            }

            updateStats(enquiries);
            applyFilters();
        } catch (error) {
            alert(error.message);
            await loadEnquiries();
        }
    }

    function viewEnquiry(id) {
        const enquiry = enquiries.find(
            (item) => item._id === id
        );

        if (!enquiry || !enquiryModal) {
            return;
        }

        document.querySelector("#detailName").textContent =
            enquiry.name;

        document.querySelector("#detailCompany").textContent =
            enquiry.company || "—";

        document.querySelector("#detailEmail").textContent =
            enquiry.email;

        document.querySelector("#detailPhone").textContent =
            enquiry.phone || "—";

        document.querySelector("#detailMessage").textContent =
            enquiry.message;

        const detailStatus =
            document.querySelector("#detailStatus");

        if (detailStatus) {
            detailStatus.textContent = enquiry.status;
        }

        const date = new Date(enquiry.createdAt);

        document.querySelector("#detailDate").textContent =
            date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

        enquiryModal.classList.add("active");
    }

    async function deleteEnquiry(id) {
        const confirmed = confirm(
            "Are you sure you want to delete this enquiry?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/enquiries/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete enquiry"
                );
            }

            await loadEnquiries();
        } catch (error) {
            alert(error.message);
        }
    }

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            applyFilters
        );
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUsername");
            window.location.href = "index.html";
        });
    }

    function closeModal() {
        if (enquiryModal) {
            enquiryModal.classList.remove("active");
        }
    }

    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener(
            "click",
            closeModal
        );
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    }

    loadEnquiries();
}