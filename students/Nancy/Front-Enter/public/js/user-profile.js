import { updateProfile } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// 更新使用者資料函式
async function updateUserProfile(user) {
  if (!user) {
    console.error("❌ 沒有用戶資料");
    return false;
  }

  try {
    // 如果用戶沒有顯示名稱，則使用 email 的前綴作為名稱
    if (!user.displayName) {
      console.log("⚠️ 用戶沒有顯示名稱，準備更新");
      await updateProfile(user, {
        displayName: user.email.split("@")[0],
      });
      console.log("✅ 名稱更新成功");
    }

    // 查找並記錄所有相關元素
    const elements = {
      name: document.querySelector(".tName"),
      phone: document.querySelector(".tPhone"),
      mail: document.querySelector(".tMail"),
      pic: document.querySelector(".personPic"),
      picNav: document.querySelector(".profileitem"),
    };

    // 更新輸入框的值
    if (elements.name) {
      elements.name.value = user.displayName || user.email.split("@")[0];
      elements.name.setAttribute("readonly", "true");
    }
    if (elements.phone) {
      elements.phone.value = user.phoneNumber || "未設定電話";
      elements.phone.setAttribute("readonly", "true");
    }
    if (elements.mail) {
      elements.mail.value = user.email;
      elements.mail.setAttribute("readonly", "true");
    }

    // 更新頭像
    updateUserAvatar(user, elements);

    return true;
  } catch (error) {
    console.error("❌ 更新過程發生錯誤:", error);
    return false;
  }
}

// 更新用戶頭像
function updateUserAvatar(user, elements) {
  const picStyle = {
    backgroundImage: user.providerData.some(
      (provider) => provider.providerId === "password"
    )
      ? `url("./image/default.jpg")`
      : `url(${user.photoURL || "./default-avatar.png"})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "50%",
  };

  if (elements.pic) {
    Object.assign(elements.pic.style, picStyle, {
      width: "100px",
      height: "100px",
    });
  }

  if (elements.picNav) {
    Object.assign(elements.picNav.style, picStyle, {
      width: "50px",
      height: "50px",
    });
  }
}

export { updateUserProfile };
