const USER_API = 'https://68e491038e116898997c170f.mockapi.io/User';

function el(html) {
  const tpl = document.createElement('div'); 
  tpl.innerHTML = html.trim(); 
  return tpl.firstChild;
}

function createAuthModal() {
  const modal = el(`
    <div id="auth-modal" style="position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:2000">
      <!-- inner container transparent: individual forms provide their own styled panels -->
      <div style="background:transparent;padding:0;border-radius:8px;max-width:1000px;width:100%;display:flex;align-items:center;justify-content:center;position:relative">
        <button id="auth-close" style="position:absolute;top:10px;right:10px;border:none;background:transparent;color:#fff;font-size:20px;cursor:pointer">✖</button>
        <h3 id="auth-title" style="display:none">Sign in</h3>
        <div id="auth-error" style="color:crimson;display:none;margin-bottom:8px"></div>
        <form id="auth-form">
          <div id="auth-fields"></div>
          <div style="margin-top:12px;text-align:right">
            <button type="submit" id="auth-submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  return modal;
}

function showAuth(type) {
  // type: 'signup' or 'signin'
  //Đăng nhập
  const modal = document.getElementById('auth-modal') || createAuthModal();
  const title = modal.querySelector('#auth-title');
  const fields = modal.querySelector('#auth-fields');
  const err = modal.querySelector('#auth-error');
  err.style.display = 'none'; err.textContent = '';
  fields.innerHTML = '';
  if (type === 'signup') {
    title.textContent = 'Sign up';
    fields.appendChild(el('<div><label>Username</label><br><input name="username" required></div>'));
    fields.appendChild(el('<div><label>Full name</label><br><input name="name" required></div>'));
    fields.appendChild(el('<div><label>Email</label><br><input name="email" type="email" required></div>'));
    fields.appendChild(el('<div><label>Password</label><br><input name="password" type="password" required></div>'));
  } else {
    title.textContent = 'Sign in';
    // Chèn biểu mẫu đăng nhập có phạm vi (sử dụng name="email" nhưng chấp nhận khớp với 
    // tên đăng nhập hoặc email ở phía server).
    fields.innerHTML = `
      <style id="auth-signin-css"> 
        #auth-modal .login-container{height:100vh;background:transparent;display:flex;align-items:center;justify-content:center}
  #auth-modal .login-inner{background: linear-gradient(135deg, #1e1e2f, #2c2c54); padding:36px 34px;border-radius:16px;width:420px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,0.45);position:relative}
        #auth-modal .login-inner .logo{width:90px;height:90px;border-radius:50%;margin:0 130px 20px;object-fit:cover;border:2px solid #fff}
        #auth-modal .login-inner h2{font-size:22px;margin:6px 0 18px}
        #auth-modal .login-inner input{width:100%;padding:12px;margin-bottom:14px;border:none;border-radius:10px;background:rgba(255,255,255,0.06);color:#fff}
        #auth-modal #auth-submit{width:100%;padding:12px;border:none;border-radius:10px;background:#5e60ce;color:#fff;font-weight:600;cursor:pointer;margin-top:8px}
        #auth-modal .login-inner .extra{margin-top:12px;font-size:13px}
        #auth-modal .login-inner a{color:#4ea8de}
        /* close X styles already set on the outer close button; ensure it sits above */
        #auth-close{z-index:2100}
      </style>
        <div class="login-container">
        <div class="login-inner">
          <!-- inner close button (top-right of the panel) -->
          <button class="auth-inner-close" aria-label="Close" style="position:absolute;top:10px;right:10px;border:none;background:transparent;color:#fff;font-size:18px;cursor:pointer">✖</button>
          <img src="../img/logo_white.png" alt="Logo" class="logo">
          <h2>Đăng Nhập Vào MiniPlayer</h2>
            <input type="text" id="username" name="email" placeholder="Tên đăng nhập hoặc Email" required>
            <input type="password" id="password" name="password" placeholder="Mật khẩu" required>
            <input type="text" id="role" name="role" placeholder="Vai trò" required>
            <div style="margin-top:6px"><button type="submit" id="auth-submit">Đăng nhập</button></div>
          <div class="extra"><p>Bạn chưa có tài khoản? <a href="Sign-up.html">Đăng ký nhanh</a></p></div>
        </div>
      </div>
    `;
  }
  //Đăng ký
  // Đặt văn bản của nút submit tùy thuộc vào loại (type).
  const submitBtn = modal.querySelector('#auth-submit');
  if (submitBtn) submitBtn.textContent = (type === 'signup') ? 'Đăng ký' : 'Đăng nhập';
  modal.style.display = 'flex';
  const close = modal.querySelector('#auth-close');
  close.onclick = () => { modal.style.display = 'none'; };
  // Nút đóng bên trong bảng điều khiển (nếu có).
  const innerClose = modal.querySelector('.auth-inner-close');
  if (innerClose) innerClose.onclick = () => { modal.style.display = 'none'; };

  const form = modal.querySelector('#auth-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    err.style.display = 'none'; err.textContent = '';
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (type === 'signup') {
        // Tạo người dùng thông qua phương thức POST.
        const res = await fetch(USER_API, { 
          method: 'POST', 
          headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify(data) // data là dữ liệu người dùng từ form
        });
        if (!res.ok) throw new Error('Signup failed');//Kiểm tra res.ok là bắt buộc khi dùng:"Nếu server không phản hồi thành công thì báo lỗi đăng ký thất bại."
        //  fetch — giúp bắt lỗi server sớm, tránh crash và UX rõ ràng!
        const user = await res.json();
        localStorage.setItem('currentUser', JSON.stringify(user));// Lưu ở local để sử dụng cho trình duyệt
        modal.style.display = 'none';
        renderAccountState();
      } else {
          // Đăng nhập: kiểm tra user hoặc admin
          const res = await fetch(USER_API);
          if (!res.ok) throw new Error('Failed to fetch users');
          const list = await res.json();

          // Tìm user theo email/username và password
          const found = list.find(u =>
            ((u.email === data.email) || (u.username === data.email)) &&
            (u.password === data.password)
          );

          if (!found) {
            err.style.display = 'block';
            err.textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
            return;
          }

          // Lưu thông tin user đăng nhập
          localStorage.setItem('currentUser', JSON.stringify(found));
          modal.style.display = 'none';
          renderAccountState();

          // Phân quyền:
          if (found.role === 'admin') {
            // Nếu là admin → chuyển đến trang quản lý
            window.location.href = "../code/Homepage_admin.html";
          } else {
            // Nếu là user thường → chuyển đến trang chính
            window.location.href = "../code/Homepage.html";
          }
        }
    } catch (err2) {
      console.error(err2);
      err.style.display='block'; err.textContent = 'An error occurred. See console.';
    }
  };
}
// Kiểm tra người dùng đã đăng nhập hay chưa và cập nhật giao diện
function renderAccountState() {
  const raw = localStorage.getItem('currentUser');
  const headerHome = document.querySelector('.home');
  if (!headerHome) return;
  // Đảm bảo các kiểu dáng cho khu vực tài khoản chỉ được chèn một lần.
  if (!document.getElementById('auth-css')) {
    const s = document.createElement('style'); s.id = 'auth-css';
    s.textContent = `
      #account-area { font-family: Arial, sans-serif; color: #fff; }
      #account-area .acct-avatar { width:28px; height:28px; border-radius:50%; object-fit:cover; }
      #account-area #acct-name { font-weight:600; margin-left:4px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px; display:inline-block; }
      .acct-logout-btn { background:rgb(4, 117, 80); color:#111; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.2); margin-left:6px; }
      .acct-logout-btn:hover { transform:translateY(-1px); box-shadow:0 4px 8px rgba(0,0,0,0.25); }
    `;
    document.head.appendChild(s);
  }
  // Xóa khu vực tài khoản hiện có nếu tồn tại.
  const existing = document.getElementById('account-area'); if (existing) existing.remove();
  const container = document.createElement('div');
  container.id = 'account-area';
  // Hiển thị dưới dạng inline-flex để avatar, tên và nút đăng xuất nằm trên cùng một dòng.
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '8px';
  container.style.marginLeft = '12px';

  if (raw) {
    const user = JSON.parse(raw);
    // Ẩn văn bản đăng nhập/đăng ký và các biểu tượng nhỏ của chúng (các biểu tượng màu trắng)
    document.querySelectorAll('.user.text').forEach(n => {
      if (n.textContent.trim().toLowerCase().includes('sign')) {
        n.style.display = 'none';
        const prev = n.previousElementSibling;
        if (prev && prev.classList && prev.classList.contains('icon-user')) prev.style.display = 'none';
      }
    });

    container.innerHTML = `
      <img src="../img/logo_wedsite.png" alt="account" class="acct-avatar">
      <i class="fa-solid fa-circle-user"></i>
      <span id="acct-name">${user.username || user.name || user.email}</span>
      <button id="acct-logout" class="acct-logout-btn">Logout</button>
    `;
    headerHome.appendChild(container);
    const btn = document.getElementById('acct-logout'); btn.onclick = () => {
      localStorage.removeItem('currentUser');
      renderAccountState()
      window.location.href = "Homepage.html";;
    };
  } else {
    // Hiển thị lại văn bản và biểu tượng của "Sign in"/"Sign up".
    document.querySelectorAll('.user.text').forEach(n => {
      n.style.display = 'inline-block';
      const prev = n.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains('icon-user')) prev.style.display = 'inline-block';
    });
  }
}

// Attach click listeners to any sign-in / sign-up elements
//Gắn sự kiện khi click vào đăng nhập hoặc đăng ký
function attachAuthLinks() {
  document.querySelectorAll('.user.text').forEach(elm => {
    const txt = elm.textContent.trim().toLowerCase();
    if (txt.includes('sign-up') || txt.includes('signup') || txt.includes('sign up')) {
      // Điều hướng đến trang đăng ký riêng nếu có.
      elm.style.cursor='pointer'; elm.onclick = () => { window.location.href = 'Sign-up.html'; };
    }
    if (txt.includes('sign-in') || txt.includes('signin') || txt.includes('sign in')) {
      elm.style.cursor='pointer'; elm.onclick = () => showAuth('signin');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => { attachAuthLinks(); renderAccountState(); });
