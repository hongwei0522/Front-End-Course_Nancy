import {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { auth, provider, initializeFirebase } from "./firebase-core.js";
import { validateForm, showErrors, showSuccess } from "./form-validator.js";
import { updateUserProfile } from "./user-profile.js";
import { updateNavigation } from "./navigation.js";

// Google 登入函式
const handleGoogleLogin = async () => {
  try {
    if (!auth || !provider) {
      throw new Error("Firebase 尚未初始化");
    }

    console.log("🔍 開始 Google 登入流程");
    const result = await signInWithPopup(auth, provider);

    const updated = await updateUserProfile(result.user);
    if (updated) {
      window.location.href = "./profile.html";
    }
  } catch (error) {
    console.error("❌ Google 登入失敗:", error);
    showErrors(["Google 登入失敗，請稍後再試"]);
  }
};

// Email 登入函式
const loginEmailPassword = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase 尚未初始化");
    }

    const txtPassword = document.querySelector(".inputPassword");
    const txtEmail = document.querySelector(".inputEmail");

    if (!txtEmail || !txtPassword) {
      console.error("❌ 找不到登入表單元素");
      return;
    }

    const errors = validateForm(txtEmail.value, txtPassword.value);
    if (!showErrors(errors)) {
      return;
    }

    console.log("🔍 開始 Email 登入流程");
    const userCredential = await signInWithEmailAndPassword(
      auth,
      txtEmail.value,
      txtPassword.value
    );

    txtPassword.value = "";

    const updated = await updateUserProfile(userCredential.user);
    if (updated) {
      window.location.href = "./profile.html";
    }
  } catch (error) {
    console.error("❌ Email 登入失敗:", error);
    let errorMessage = "登入失敗";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "找不到該用戶";
        break;
      case "auth/wrong-password":
        errorMessage = "密碼錯誤";
        break;
      case "auth/invalid-email":
        errorMessage = "無效的電子郵件格式";
        break;
      case "auth/too-many-requests":
        errorMessage = "登入嘗試次數過多，請稍後再試";
        break;
    }

    showErrors([errorMessage]);
  }
};

// 註冊新帳號函式
const createAccount = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase 尚未初始化");
    }

    const txtPassword = document.querySelector(".inputPassword");
    const txtEmail = document.querySelector(".inputEmail");

    if (!txtEmail || !txtPassword) {
      console.error("❌ 找不到註冊表單元素");
      return;
    }

    const errors = validateForm(txtEmail.value, txtPassword.value);
    if (!showErrors(errors)) {
      return;
    }

    console.log("🔍 開始註冊流程");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      txtEmail.value,
      txtPassword.value
    );

    txtPassword.value = "";
    showSuccess("註冊成功！");

    const updated = await updateUserProfile(userCredential.user);
    if (updated) {
      window.location.href = "./profile.html";
    }
  } catch (error) {
    console.error("❌ 註冊失敗:", error);
    let errorMessage = "註冊失敗";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "此電子郵件已被使用";
        break;
      case "auth/invalid-email":
        errorMessage = "無效的電子郵件格式";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "此註冊方式目前不可用";
        break;
      case "auth/weak-password":
        errorMessage = "密碼強度不足";
        break;
    }

    showErrors([errorMessage]);
  }
};

// 登出函式
const logout = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase 尚未初始化");
    }

    await signOut(auth);
    console.log("✅ 登出成功");
    window.location.href = "./";
  } catch (error) {
    console.error("❌ 登出失敗:", error);
  }
};

// 設定認證狀態監聽器
async function setupAuthStateListener() {
  // 確保 Firebase 已初始化
  await initializeFirebase();
  
  if (!auth) {
    console.error('❌ auth 尚未初始化');
    return;
  }
  
  // 監聽認證狀態變化
  onAuthStateChanged(auth, async (user) => {
    updateNavigation(user);

    // 如果在 profile.html 且用戶已登入，更新使用者資料
    if (window.location.pathname.includes('profile.html') && user) {
      await updateUserProfile(user);
    }
  });
}

export { handleGoogleLogin, loginEmailPassword, createAccount, logout, setupAuthStateListener };
