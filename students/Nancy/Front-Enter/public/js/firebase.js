// Firebase 主控制檔案 - 統一管理 Firebase 服務和 UI 更新
import { initializeFirebase } from './firebase-core.js';
import { setupAuthStateListener } from './auth-service.js';
import { bindUIEvents } from './ui-events.js';

// 重新導出 Firebase 核心實例，方便其他檔案使用
export { auth, initializeFirebase } from './firebase-core.js';

// 自動初始化並設定
(async () => {
    try {
        await initializeFirebase();
        await setupAuthStateListener();
        bindUIEvents();
        console.log('✅ Firebase 主控制檔案初始化完成');
    } catch (error) {
        console.error('❌ Firebase 主控制檔案初始化失敗:', error);
    }
})();