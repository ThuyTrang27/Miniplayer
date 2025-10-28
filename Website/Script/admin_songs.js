document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://68e491038e116898997c170f.mockapi.io/Song";

    // --- Lấy các phần tử cần thiết ---
    const btnAdd = document.querySelector(".btn-add");
    const modalOverlay = document.getElementById("modal-overlay");
    const addForm = document.getElementById("add-song-form");
    const btnCancel = document.querySelector(".btn-cancel");
    const songForm = document.getElementById("songForm");
    const songTable = document.querySelector(".song-table tbody");
    const btnSubmit = songForm.querySelector("button[type='submit']");
    const hiddenId = document.getElementById("songId"); // input hidden chứa id bài hát khi sửa

    // --- Mở / Đóng Form ---
    btnAdd.addEventListener("click", () => openForm());
    btnCancel.addEventListener("click", closeForm);
    modalOverlay.addEventListener("click", closeForm);

    function openForm(song = null) {
        modalOverlay.style.display = "block";
        addForm.style.display = "block";

        if (song) {
            // 👉 Chế độ sửa
            hiddenId.value = song.id;
            document.getElementById("songName").value = song.Name || "";
            document.getElementById("songArtist").value = song.Artist || "";
            document.getElementById("songUrl").value = song.Url || "";
            document.getElementById("songImg").value = song.Img || "";
            document.getElementById("songTimes").value = song.Times || "";
            document.getElementById("songGenre").value = song.Genre || "";
            document.getElementById("songLikes").value = song.Likes || 0;
            document.getElementById("songYear").value = song.Year || "";
            document.getElementById("songCount").value = song.Count || 0;
            document.getElementById("songDate").value = song.Date || "";

            btnSubmit.textContent = "Update Song";
            addForm.querySelector("h3").textContent = "Edit Song";
        } else {
            // 👉 Thêm mới
            hiddenId.value = "";
            songForm.reset();
            btnSubmit.textContent = "Add Song";
            addForm.querySelector("h3").textContent = "Add New Song";
        }
    }

    function closeForm() {
        modalOverlay.style.display = "none";
        addForm.style.display = "none";
        songForm.reset();
        hiddenId.value = "";
        btnSubmit.textContent = "Add Song";
    }

    // --- Hàm load danh sách từ API ---
    async function loadSongs() {
        songTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;
        try {
            const res = await fetch(API_URL);
            const data = await res.json();

            songTable.innerHTML = "";
            data.forEach(song => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${song.id}</td>
                    <td>${song.Name}</td>
                    <td>${song.Artist}</td>
                    <td>${song.Genre}</td>
                    <td>
                        <button class="btn-edit" data-id="${song.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" data-id="${song.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                songTable.appendChild(tr);
            });

            attachEvents(); // Gắn sự kiện sau khi render
        } catch (err) {
            console.error("Error loading songs:", err);
            songTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error loading songs!</td></tr>`;
        }
    }

    // --- Gắn sự kiện cho các nút Edit / Delete ---
    function attachEvents() {
        // XÓA
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm("Are you sure to delete this song?")) {
                    try {
                        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                        loadSongs();
                    } catch (err) {
                        console.error("Error deleting song:", err);
                        alert("Failed to delete song!");
                    }
                }
            });
        });

        // SỬA
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                try {
                    const res = await fetch(`${API_URL}/${id}`);
                    const song = await res.json();
                    openForm(song);
                } catch (err) {
                    console.error("Error loading song:", err);
                    alert("Failed to load song for editing!");
                }
            });
        });
    }

    // --- Thêm / Cập nhật bài hát ---
    songForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = hiddenId.value;
        const songData = {
            Name: document.getElementById("songName").value.trim(),
            Artist: document.getElementById("songArtist").value.trim(),
            Url: document.getElementById("songUrl").value.trim(),
            Img: document.getElementById("songImg").value.trim(),
            Times: document.getElementById("songTimes").value.trim(),
            Genre: document.getElementById("songGenre").value.trim(),
            Likes: parseInt(document.getElementById("songLikes").value) || 0,
            Year: parseInt(document.getElementById("songYear").value) || 2025,
            Count: parseInt(document.getElementById("songCount").value) || 0,
            Date: document.getElementById("songDate").value.trim()
        };

        try {
            if (id) {
                //  CẬP NHẬT
                await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(songData)
                });
                alert("✅  Song updated successfully!");
            } else {
                // THÊM MỚI
                await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(songData)
                });
                alert("✅ Song added successfully!");
            }

            closeForm();
            loadSongs();
        } catch (err) {
            console.error("Error saving song:", err);
            alert("❌ Failed to save song!");
        }
    });

    // --- Gọi khi load trang ---
    loadSongs();
});