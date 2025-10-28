document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://68e491038e116898997c170f.mockapi.io/User";

    // Các phần tử chính trong giao diện
    const btnAdd = document.querySelector(".btn-add");
    const modalOverlay = document.getElementById("modal-overlay");
    const addForm = document.getElementById("add-user-form");
    const form = document.getElementById("userForm");
    const btnCancel = document.querySelector(".btn-cancel");
    const userTable = document.querySelector(".user-table tbody");
    const btnSubmit = form.querySelector(".btn-save");
    let editingId = null; // lưu id đang sửa

    // Mở form (thêm hoặc sửa)
    btnAdd.addEventListener("click", () => openForm());
    btnCancel.addEventListener("click", closeForm);
    modalOverlay.addEventListener("click", closeForm);

    function openForm(user = null) {
        modalOverlay.style.display = "block";
        addForm.style.display = "block";

        if (user) {
            // --- chế độ sửa ---
            editingId = user.id;
            document.getElementById("Name").value = user.Name || "";
            document.getElementById("userName").value = user.username || "";
            document.getElementById("userPassword").value = user.password || "";
            document.getElementById("userEmail").value = user.email || "";
            document.getElementById("userPhone").value = user.phone || "";
            btnSubmit.textContent = "Update User";
        } else {
            // --- chế độ thêm ---
            editingId = null;
            form.reset();
            btnSubmit.textContent = "Save User";
        }
    }

    function closeForm() {
        modalOverlay.style.display = "none";
        addForm.style.display = "none";
        form.reset();
        editingId = null;
        btnSubmit.textContent = "Save User";
    }

    // --- Load danh sách user ---
    async function loadUsers() {
        userTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;
        try {
            const res = await fetch(API_URL);
            const users = await res.json();
            userTable.innerHTML = "";
            users.forEach(user => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username || "(No username)"}</td>
                    <td>${user.email || ""}</td>
                    <td>${user.phone || ""}</td>
                    <td>
                        <button class="btn-edit" data-id="${user.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" data-id="${user.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                userTable.appendChild(tr);
            });

            attachEvents();
        } catch (err) {
            console.error("Error loading users:", err);
            userTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error loading users!</td></tr>`;
        }
    }

    // --- Gắn sự kiện Edit / Delete ---
    function attachEvents() {
        // Xóa user
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm("Are you sure to delete this user?")) {
                    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                    loadUsers();
                }
            });
        });

        // Sửa user
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                try {
                    const res = await fetch(`${API_URL}/${id}`);
                    const user = await res.json();
                    openForm(user);
                } catch (err) {
                    console.error("Error loading user for edit:", err);
                    alert("Unable to load user data!");
                }
            });
        });
    }

    // --- Lưu user (thêm hoặc cập nhật) ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userData = {
            name: document.getElementById("Name").value.trim(),
            username: document.getElementById("userName").value.trim(),
            password: document.getElementById("userPassword").value.trim(),
            email: document.getElementById("userEmail").value.trim(),
            phone: document.getElementById("userPhone").value.trim(),
            role: document.getElementById("userRole").value.trim()
        };

        try {
            if (editingId) {
                // --- cập nhật ---
                await fetch(`${API_URL}/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            } else {
                // --- thêm mới ---
                await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            }

            closeForm();
            loadUsers();
        } catch (err) {
            console.error("Error saving user:", err);
            alert("Error saving user!");
        }
    });

    // --- Chạy lần đầu ---
    loadUsers();
});
