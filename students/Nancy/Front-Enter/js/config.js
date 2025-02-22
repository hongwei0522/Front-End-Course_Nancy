// config.js
const firebaseConfig = {
    apiKey: "AIzaSyBrKVRHuO8aystgilHTqp4KsUkiI9MzGP8",
    authDomain: "front-enter-43dc3.firebaseapp.com",
    projectId: "front-enter-43dc3",
    storageBucket: "front-enter-43dc3.firebasestorage.app",
    messagingSenderId: "768100372381",
    appId: "1:768100372381:web:71d63d45a2aa861230e974",
    measurementId: "G-CN67LPZ0GW"
};

// 添加額外的安全檢查
const validateConfig = () => {
    const requiredFields = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId',
        'measurementId'
    ];

    for (const field of requiredFields) {
        if (!firebaseConfig[field]) {
            console.error(`Missing required firebase config field: ${field}`);
            throw new Error(`Firebase configuration error: ${field} is required`);
        }
    }

    return firebaseConfig;
};

// 檢查當前環境是否安全
const isSecureEnvironment = () => {
    return window.isSecureContext;
};

// 導出配置和相關函數
export const getFirebaseConfig = () => {
    if (!isSecureEnvironment()) {
        console.warn('Warning: Application is not running in a secure context (HTTPS)');
    }
    return validateConfig();
};