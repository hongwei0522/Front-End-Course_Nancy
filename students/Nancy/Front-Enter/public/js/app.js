import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { initializeFirebase, auth, app } from './firebase-core.js';
import { handleGoogleLogin, loginEmailPassword, createAccount, logout } from './auth-service.js';
import { updateNavigation } from './navigation.js';
import { updateUserProfile } from './user-profile.js';

// 初始化應用程式（異步）
const initializeApp = async () => {
    try {
        // 等待 Firebase 初始化完成
        const firebaseInitialized = await initializeFirebase();
        if (!firebaseInitialized) {
            console.error("❌ Firebase 初始化失敗，無法繼續");
            return;
        }

        // 設置認證狀態監聽器
        onAuthStateChanged(auth, async (user) => {
            updateNavigation(user);

            if (window.location.pathname.includes('profile.html') && user) {
                await updateUserProfile(user);
            }
        });


        console.log("✅ 應用程式初始化完成");
    } catch (error) {
        console.error("❌ 應用程式初始化失敗:", error);
    }
};



// 當 DOM 載入完成後初始化應用程式
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// 導出 app（如果需要的話）
export { app };