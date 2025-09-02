// 引入渲染收藏文章的函式
import { renderLikePageCard } from './cardRenderer.js';
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
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

// 選擇 DOM 元素
const Profile = document.querySelector(".profile");  // 個人資料按鈕
const PersonPage = document.querySelector(".personPage"); // 個人資料頁面
const Like = document.querySelector(".like");  // 收藏按鈕
const LikePage = document.querySelector(".likePage"); // 收藏頁面

/**
 * 渲染收藏的文章
 * 這是一個非同步函式，因為需要等待 Firebase 來取得文章數據
 */
async function renderLikedArticles() {
    const user = auth.currentUser;
    if (!user) {
        console.log('用戶未登入');
        LikePage.innerHTML = '<p class="no-likes">請先登入</p>';
        return;
    }
    const likePage = document.querySelector(".likePage");
    likePage.innerHTML = ""; // 先清空內容，確保畫面不會堆疊

    try {
        // 獲取用戶的收藏列表
        // get() 函式用來從 Firebase 中取得指定參照的資料，並返回一個 快照（snapshot）。
        // collectRef 是我們剛剛創建的指向用戶收藏資料的參照。
        const collectRef = ref(database, `collects/${user.uid}`);
        // await 使得這個操作變成 異步，程式會在等待資料獲取的同時，暫停執行，直到從 Firebase 獲得資料為止。
        // collectSnapshot 是資料庫回傳的結果，這是一個 DataSnapshot 物件，包含了我們請求的資料。
        const collectSnapshot = await get(collectRef);
        
        if (!collectSnapshot.exists()) {
            likePage.innerHTML = '<p class="no-likes">還沒有收藏的文章</p>';
            return;
        }

        const collectedPosts = collectSnapshot.val();

        // 從 Firebase 獲取所有文章
        const postsRef = ref(database, 'posts');
        const postsSnapshot = await get(postsRef);
        
        if (!postsSnapshot.exists()) {
            likePage.innerHTML = '<p class="no-likes">找不到收藏的文章</p>';
            return;
        }

        const posts = postsSnapshot.val();
        const likedArticles = [];

        // 過濾出收藏的文章
        // Object.entries(posts) 會將 posts 物件轉換為一個包含所有屬性鍵值對的陣列。每個元素的形式是 [key, value]，其中 key 是屬性名稱（在這裡是 id），value 是該屬性的值（在這裡是 post，即每篇文章的資料）
        for (const [id, post] of Object.entries(posts)) {
            if (collectedPosts[id]) {
                likedArticles.push({
                    // 展開運算符 ...post，將 post 中的所有屬性複製到新物件中
                    ...post,
                    id,
                    name: post.className || "",
                    //隨機生成 1 到 5 之間的數字
                    rectangleUrl: `./image/room0${Math.floor(Math.random() * 5) + 1}.jpg`
                });
            }
        }

        if (likedArticles.length === 0) {
            likePage.innerHTML = '<p class="no-likes">還沒有收藏的文章</p>';
        } else {
            // 依序渲染收藏的文章
            likedArticles.forEach(article => {
                const card = renderLikePageCard(article, likePage);
                
                // 加入刪除收藏功能
                const trashIcon = card.querySelector('.fa-trash');
                trashIcon.addEventListener('click', async () => {
                    try {
                        //ref(database, collects/${user.uid}/${article.id}) 用於建立一個指向 Firebase Realtime Database 中具體資料位置的引用（reference）。
                        //collects/${user.uid}/${article.id} 是資料庫的路徑，表示這是某個用戶（user.uid）收藏的某篇文章（article.id）。
                        await remove(ref(database, `collects/${user.uid}/${article.id}`));
                        card.remove();
                        
                        // 檢查是否還有收藏的文章
                        if (likePage.children.length === 0) {
                            likePage.innerHTML = '<p class="no-likes">還沒有收藏的文章</p>';
                        }
                    } catch (error) {
                        console.error('刪除收藏失敗:', error);
                        alert('刪除收藏失敗，請稍後再試');
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        likePage.innerHTML = '<p class="error">載入收藏文章時發生錯誤</p>';
    }
}

// 點擊「收藏」按鈕時顯示收藏頁面，並重新渲染收藏文章
Like.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
        alert('請先登入');
        return;
    }
    PersonPage.classList.add("hidden"); // 隱藏個人資料頁面
    LikePage.classList.remove("hidden"); // 顯示收藏頁面
    renderLikedArticles(); // 更新收藏文章列表
});

// 點擊「個人資料」按鈕時顯示個人資料頁面
Profile.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
        alert('請先登入');
        return;
    }
    LikePage.classList.add("hidden"); // 隱藏收藏頁面
    PersonPage.classList.remove("hidden"); // 顯示個人資料頁面
});

// 當頁面載入時，監聽用戶登入狀態
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化 Firebase 服務
    const servicesInitialized = await initializeFirebaseServices();
    if (!servicesInitialized) {
        console.error('❌ Firebase 服務初始化失敗');
        return;
    }
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (!LikePage.classList.contains('hidden')) {
                renderLikedArticles();
            }
        } else {
            LikePage.innerHTML = '<p class="no-likes">請先登入</p>';
        }
    });
});