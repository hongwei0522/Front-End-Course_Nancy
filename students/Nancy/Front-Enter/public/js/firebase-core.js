// Firebase 主控制檔案 - 統一管理所有 Firebase 服務
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { loadFirebaseConfig } from "./config.js";

let app, auth, provider;

// 初始化 Firebase App（異步）
const initializeFirebase = async () => {
  try {
    // 異步獲取 Firebase 配置
    const config = await loadFirebaseConfig();
    app = initializeApp(config);
    auth = getAuth(app);
    auth.languageCode = "en";

    // Google 登入提供者設置
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account", // 強制用戶選擇帳號
    });

    // 添加必要的 scope
    provider.addScope("email");
    provider.addScope("profile");

    console.log("✅ Firebase 初始化成功");
    return true;
  } catch (error) {
    console.error("❌ Firebase 初始化失敗:", error);
    return false;
  }
};

// 自動初始化並啟動應用程式
(async () => {
  try {
    // 動態導入其他模組以避免循環依賴
    await initializeFirebase();
    
    const { setupAuthStateListener } = await import('./auth-service.js');
    const { handleGoogleLogin, loginEmailPassword, createAccount, logout } = await import('./auth-service.js');
    
    await setupAuthStateListener();
  
    
    console.log('✅ Firebase 應用程式初始化完成');
  } catch (error) {
    console.error('❌ Firebase 應用程式初始化失敗:', error);
  }
})();



// 導出 Firebase 實例和初始化函式
export { app, auth, provider, initializeFirebase };
