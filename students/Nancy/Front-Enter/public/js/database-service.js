import { getDatabase, ref, get, push, update, remove, onValue, off } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { app, initializeFirebase } from './firebase-core.js';

let database, auth;

// 初始化 Firebase 服務
async function initializeFirebaseServices() {
    try {
        await initializeFirebase();
        if (!app) {
            throw new Error('Firebase app 尚未初始化');
        }
        database = getDatabase(app);
        auth = getAuth(app);
        return true;
    } catch (error) {
        console.error('❌ Firebase 服務初始化失敗:', error);
        return false;
    }
}

// ==================== 用戶相關操作 ====================

/**
 * 獲取當前登入用戶
 */
export function getCurrentUser() {
    return auth?.currentUser || null;
}

/**
 * 監聽用戶認證狀態變化
 * @param {Function} callback - 狀態變化回調函數
 */
export function onAuthStateChanged(callback) {
    if (!auth) {
        console.error('❌ auth 尚未初始化');
        return;
    }
    return auth.onAuthStateChanged(callback);
}

/**
 * 保存用戶資料到 Firebase
 * @param {Object} userData - 用戶資料 {name, phone, email}
 */
export async function saveUserData(userData) {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    const updatedData = {
        name: userData.name,
        phone: userData.phone || "未設定電話",
        email: userData.email
    };

    try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        await update(userRef, updatedData);
        console.log('使用者數據更新成功');
        return true;
    } catch (error) {
        console.error("使用者數據更新失敗:", error);
        throw error;
    }
}

/**
 * 監聽用戶資料變化
 * @param {Function} callback - 資料變化回調函數
 */
export function onUserDataChanged(callback) {
    if (!database || !auth || !auth.currentUser) {
        console.error("Firebase 服務尚未初始化或用戶未登入");
        return;
    }
    
    const userRef = ref(database, `users/${auth.currentUser.uid}`);
    off(userRef); // 先移除舊的監聽
    
    return onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            callback(userData);
        } else {
            // 如果用戶資料不存在，創建初始資料
            const initialData = {
                name: auth.currentUser.displayName || '',
                phone: "未設定電話",
                email: auth.currentUser.email || ''
            };
            callback(initialData);
            saveUserData(initialData);
        }
    });
}

// ==================== 文章相關操作 ====================

/**
 * 獲取所有文章
 */
export async function getAllPosts() {
    if (!database) {
        throw new Error("Firebase 服務尚未初始化");
    }

    try {
        const postsRef = ref(database, 'posts');
        const snapshot = await get(postsRef);
        
        if (!snapshot.exists()) {
            return {};
        }
        
        return snapshot.val();
    } catch (error) {
        console.error('獲取文章失敗:', error);
        throw error;
    }
}

/**
 * 根據 ID 獲取單篇文章
 * @param {string} postId - 文章 ID
 */
export async function getPostById(postId) {
    if (!database) {
        throw new Error("Firebase 服務尚未初始化");
    }

    try {
        const postRef = ref(database, `posts/${postId}`);
        const snapshot = await get(postRef);
        
        if (!snapshot.exists()) {
            return null;
        }
        
        return snapshot.val();
    } catch (error) {
        console.error('獲取文章失敗:', error);
        throw error;
    }
}

/**
 * 監聽文章列表變化
 * @param {Function} callback - 資料變化回調函數
 */
export function onPostsChanged(callback) {
    if (!database) {
        console.error("Firebase 服務尚未初始化");
        return;
    }

    const postsRef = ref(database, 'posts');
    off(postsRef); // 先移除舊的監聽
    
    return onValue(postsRef, (snapshot) => {
        const posts = snapshot.val();
        callback(posts || {});
    });
}

/**
 * 發布新文章
 * @param {Object} postData - 文章資料
 */
export async function createPost(postData) {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    const newPostData = {
        ...postData,
        userId: auth.currentUser.uid,
        createdAt: Date.now()
    };

    try {
        const postsRef = ref(database, 'posts');
        const newPostRef = await push(postsRef, newPostData);
        console.log('文章發布成功');
        return newPostRef.key;
    } catch (error) {
        console.error('發布文章失敗:', error);
        throw error;
    }
}

/**
 * 更新文章
 * @param {string} postId - 文章 ID
 * @param {Object} postData - 更新的文章資料
 */
export async function updatePost(postId, postData) {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    const updatedData = {
        ...postData,
        userId: auth.currentUser.uid,
        updatedAt: Date.now()
    };

    try {
        const postRef = ref(database, `posts/${postId}`);
        await update(postRef, updatedData);
        console.log('文章更新成功');
        return true;
    } catch (error) {
        console.error('更新文章失敗:', error);
        throw error;
    }
}

/**
 * 刪除文章
 * @param {string} postId - 文章 ID
 */
export async function deletePost(postId) {
    if (!database) {
        throw new Error("Firebase 服務尚未初始化");
    }

    try {
        const postRef = ref(database, `posts/${postId}`);
        await remove(postRef);
        console.log('文章刪除成功');
        return true;
    } catch (error) {
        console.error('刪除文章失敗:', error);
        throw error;
    }
}

/**
 * 批量刪除文章
 * @param {Array} postIds - 文章 ID 陣列
 */
export async function deletePosts(postIds) {
    if (!database) {
        throw new Error("Firebase 服務尚未初始化");
    }

    try {
        for (const postId of postIds) {
            const postRef = ref(database, `posts/${postId}`);
            await remove(postRef);
        }
        console.log('批量刪除文章成功');
        return true;
    } catch (error) {
        console.error('批量刪除文章失敗:', error);
        throw error;
    }
}

// ==================== 收藏相關操作 ====================

/**
 * 獲取用戶的收藏列表
 */
export async function getUserCollections() {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    try {
        const collectRef = ref(database, `collects/${auth.currentUser.uid}`);
        const snapshot = await get(collectRef);
        
        if (!snapshot.exists()) {
            return {};
        }
        
        return snapshot.val();
    } catch (error) {
        console.error('獲取收藏列表失敗:', error);
        throw error;
    }
}

/**
 * 獲取用戶收藏的文章詳細資料
 */
export async function getCollectedPosts() {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    try {
        // 獲取用戶收藏列表
        const collections = await getUserCollections();
        
        if (Object.keys(collections).length === 0) {
            return [];
        }

        // 獲取所有文章
        const posts = await getAllPosts();
        const collectedPosts = [];

        // 過濾出收藏的文章
        for (const [postId, post] of Object.entries(posts)) {
            if (collections[postId]) {
                collectedPosts.push({
                    ...post,
                    id: postId,
                    name: post.className || "",
                    rectangleUrl: `./image/room0${Math.floor(Math.random() * 5) + 1}.jpg`
                });
            }
        }

        return collectedPosts;
    } catch (error) {
        console.error('獲取收藏文章失敗:', error);
        throw error;
    }
}

/**
 * 添加文章到收藏
 * @param {string} postId - 文章 ID
 */
export async function addToCollection(postId) {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    try {
        const collectRef = ref(database, `collects/${auth.currentUser.uid}/${postId}`);
        await update(collectRef, { collected: true, timestamp: Date.now() });
        console.log('添加收藏成功');
        return true;
    } catch (error) {
        console.error('添加收藏失敗:', error);
        throw error;
    }
}

/**
 * 從收藏中移除文章
 * @param {string} postId - 文章 ID
 */
export async function removeFromCollection(postId) {
    if (!database || !auth || !auth.currentUser) {
        throw new Error("Firebase 服務尚未初始化或用戶未登入");
    }

    try {
        const collectRef = ref(database, `collects/${auth.currentUser.uid}/${postId}`);
        await remove(collectRef);
        console.log('移除收藏成功');
        return true;
    } catch (error) {
        console.error('移除收藏失敗:', error);
        throw error;
    }
}

/**
 * 檢查文章是否已收藏
 * @param {string} postId - 文章 ID
 */
export async function isPostCollected(postId) {
    if (!database || !auth || !auth.currentUser) {
        return false;
    }

    try {
        const collectRef = ref(database, `collects/${auth.currentUser.uid}/${postId}`);
        const snapshot = await get(collectRef);
        return snapshot.exists();
    } catch (error) {
        console.error('檢查收藏狀態失敗:', error);
        return false;
    }
}

// ==================== 初始化函數 ====================

/**
 * 初始化資料庫服務
 * 這個函數必須在使用其他函數之前調用
 */
export async function initializeDatabaseService() {
    return await initializeFirebaseServices();
}

// ==================== 導出便利函數 ====================

/**
 * 檢查服務是否已初始化
 */
export function isServiceInitialized() {
    return database !== undefined && auth !== undefined;
}

/**
 * 檢查用戶是否已登入
 */
export function isUserLoggedIn() {
    return auth && auth.currentUser !== null;
}
