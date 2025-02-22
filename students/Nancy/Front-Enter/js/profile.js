// 引入渲染收藏文章的函式
import { renderLikePageCard } from './cardRenderer.js';

// 選擇 DOM 元素
const Profile = document.querySelector(".profile");  // 個人資料按鈕
const PersonPage = document.querySelector(".personPage"); // 個人資料頁面
const Like = document.querySelector(".like");  // 收藏按鈕
const LikePage = document.querySelector(".likePage"); // 收藏頁面

/**
 * 渲染收藏的文章
 * 這是一個非同步函式，因為需要等待 fetch 來取得文章數據
 */
async function renderLikedArticles() {
    const likePage = document.querySelector(".likePage");
    likePage.innerHTML = ""; // 先清空內容，確保畫面不會堆疊

    // 取得本地儲存的收藏文章 ID 陣列
    // localStorage 只能存 字串，因此取出後需要用 JSON.parse() 轉換成 JavaScript 陣列（Array）。
    // 如果 localStorage 沒有這個鍵（使用者從未收藏過文章），則 getItem('collectedCards') 會返回 null，這時 || '[]' 讓程式使用空陣列 ([]) 來避免 JSON.parse(null) 產生錯誤。
    const collectedIds = JSON.parse(localStorage.getItem('collectedCards') || '[]');

    // 如果沒有收藏的文章，則顯示提示文字
    if (collectedIds.length === 0) {
        likePage.innerHTML = '<p class="no-likes">還沒有收藏的文章</p>';
        return;
    }

    try {
        // 非同步請求文章數據
        const response = await fetch("front-enter-export.json"); // 從 JSON 文件取得文章數據
        const articleDatas = await response.json(); // 解析 JSON 資料
        const articles = Object.values(articleDatas.article); // 轉換成陣列格式
        
        // 過濾出收藏的文章（根據 creatTime 來匹配）
        const likedArticles = articles.filter(article => 
            // article.creatTime 是數字，例如 1708761200。
            // collectedIds 陣列中的值是字串，因此需要用 .toString() 轉換。
            // includes() 會檢查 collectedIds 是否包含該文章的 creatTime
            collectedIds.includes(article.creatTime.toString())
        );

        // 如果沒有找到對應的文章，也顯示提示
        if (likedArticles.length === 0) {
            likePage.innerHTML = '<p class="no-likes">還沒有收藏的文章</p>';
        } else {
            // 依序渲染收藏的文章
            likedArticles.forEach(article => {
                renderLikePageCard(article, likePage);
            });
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        likePage.innerHTML = '<p class="error">載入收藏文章時發生錯誤</p>';
    }
}

// 點擊「收藏」按鈕時顯示收藏頁面，並重新渲染收藏文章
Like.addEventListener("click", () => {
    PersonPage.classList.add("hidden"); // 隱藏個人資料頁面
    LikePage.classList.remove("hidden"); // 顯示收藏頁面
    renderLikedArticles(); // 更新收藏文章列表
});

// 點擊「個人資料」按鈕時顯示個人資料頁面
Profile.addEventListener("click", () => {
    LikePage.classList.add("hidden"); // 隱藏收藏頁面
    PersonPage.classList.remove("hidden"); // 顯示個人資料頁面
});

// 當頁面載入時，如果收藏頁面是顯示狀態，則初始化收藏文章
document.addEventListener('DOMContentLoaded', () => {
    if (!LikePage.classList.contains('hidden')) {
        renderLikedArticles();
    }
});