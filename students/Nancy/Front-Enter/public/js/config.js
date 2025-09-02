let firebaseConfig = null;

// 讀取 config.json 並取得 firebase 設定
export async function loadFirebaseConfig() {
  if (firebaseConfig) return firebaseConfig;
  try {
    const response = await fetch('/config.json');
    const configData = await response.json();
    firebaseConfig = configData.firebase;
    return validateConfig(firebaseConfig);
  } catch (err) {
    console.error('Failed to load config.json:', err);
    throw err;
  }
}

// 添加額外的安全檢查
function validateConfig(config) {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
    "measurementId",
  ];
  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`Missing required firebase config field: ${field}`);
      throw new Error(`Firebase configuration error: ${field} is required`);
    }
  }
  return config;
}

// 檢查當前環境是否安全
function isSecureEnvironment() {
  return window.isSecureContext;
}

// 提供同步取得 config（若已載入）
export function getFirebaseConfigSync() {
  if (!firebaseConfig) {
    throw new Error('Config not loaded yet. Please use loadFirebaseConfig().');
  }
  if (!isSecureEnvironment()) {
    console.warn(
      "Warning: Application is not running in a secure context (HTTPS)"
    );
  }
  return firebaseConfig;
}
