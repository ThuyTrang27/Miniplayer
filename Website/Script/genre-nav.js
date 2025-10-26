document.addEventListener("DOMContentLoaded", () => {
  // 1) Cách trực tiếp: chọn nhiều selector (#id hoặc .class)
  const element1 = document.querySelectorAll(".VietNam, .VN");
  element1.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "V-Pop.html";
      }, 350);
    });
  });

   const element2 = document.querySelectorAll(".HanQuoc, .HQ");
  element2.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "K-Pop.html";
      }, 350);
    });
  });

   const element3 = document.querySelectorAll(".TrungQuoc, .TQ");
  element3.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "C-Pop.html";
      }, 350);
    });
  });

   const element4 = document.querySelectorAll(".USUK, .UK");
  element4.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "US-UK.html";
      }, 350);
    });
  });

  // Nav-page
  const element5 = document.querySelectorAll(".TC, .Trangchu");
  element5.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Homepage.html";
      }, 350);
    });
  });

  const element6 = document.querySelectorAll(".BH, .Baihat");
  element6.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Songs.html";
      }, 350);
    });
  });

  const element7 = document.querySelectorAll(".PL, .Danhsach");
  element7.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Playlist.html";
      }, 350);
    });
  });

  const element8 = document.querySelectorAll(".AB, .Timhieu");
  element8.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "About.html";
      }, 350);
    });
  });

  // chuyển trang cho bên Admin
  const admin = document.querySelectorAll(".change-adminpage");
  admin.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Homepage_admin.html";
      }, 350);
    });
  });

 const element9 = document.querySelectorAll(".change-songpage");
  element9.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Manager_song.html";
      }, 350);
    });
  });

  const element10 = document.querySelectorAll(".change-userpage");
  element10.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Manager_user.html";
      }, 350);
    });
  });

  const element11 = document.querySelectorAll(".change-logout");
  element11.forEach(el => {
    // tránh lỗi nếu el không hợp lệ
    if (!el) return;
    el.addEventListener("click", () => {
      // hiệu ứng fade-out (tùy chọn)
      document.body.style.transition = "opacity 0.35s";
      document.body.style.opacity = 0;
      setTimeout(() => {
        window.location.href = "Homepage.html";
      }, 350);
    });
  });
}); 


