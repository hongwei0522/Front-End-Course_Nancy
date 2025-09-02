// 更新導覽列函式
function updateNavigation(user) {
  const profileItem = document.querySelector(".profileitem");
  const loginContainer = document.querySelector(".loginContainer");

  if (!profileItem) return;

  Object.assign(profileItem.style, {
    cursor: "pointer",
  });

  const handleProfileClick = (event) => {
    if (!user && loginContainer) {
      event.preventDefault();
      event.stopPropagation();
      loginContainer.classList.toggle("active");
    }
  };

  // 設置登入視窗的點擊外部關閉功能
  setupLoginContainerClickOutside(loginContainer, profileItem);

  if (user) {
    updateLoggedInNavigation(user, profileItem);
  } else {
    updateLoggedOutNavigation(profileItem);
  }

  // 重新綁定點擊事件
  rebindProfileItemEvent(profileItem, handleProfileClick);
}

// 設置登入視窗點擊外部關閉
function setupLoginContainerClickOutside(loginContainer, profileItem) {
  if (loginContainer) {
    document.addEventListener("click", function (event) {
      if (
        !loginContainer.contains(event.target) &&
        !profileItem.contains(event.target)
      ) {
        loginContainer.classList.remove("active");
      }
    });
  }
}

// 更新已登入狀態的導航
function updateLoggedInNavigation(user, profileItem) {
  if (
    user.providerData.some((provider) => provider.providerId === "password")
  ) {
    // 一般登入（Email/密碼）
    setProfileItemStyle(profileItem, "./image/default.jpg");
  } else if (
    user.providerData.some((provider) => provider.providerId === "google.com")
  ) {
    // Google 登入
    setProfileItemStyle(profileItem, user.photoURL || "./default-avatar.png");
  }
}

// 更新未登入狀態的導航
function updateLoggedOutNavigation(profileItem) {
  Object.assign(profileItem.style, {
    backgroundImage: "none",
    width: "auto",
    height: "auto",
  });
  profileItem.innerHTML = "登入";
  profileItem.removeAttribute("href");
}

// 設置頭像樣式
function setProfileItemStyle(profileItem, imageUrl) {
  profileItem.innerHTML = "";
  profileItem.href = "profile.html";
  Object.assign(profileItem.style, {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "inline-block",
  });
}

// 重新綁定頭像點擊事件
function rebindProfileItemEvent(profileItem, handleProfileClick) {
  const newProfileItem = profileItem.cloneNode(true);
  profileItem.parentNode.replaceChild(newProfileItem, profileItem);
  newProfileItem.addEventListener("click", handleProfileClick);
}

export { updateNavigation };
