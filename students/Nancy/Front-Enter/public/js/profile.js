// 引入渲染收藏文章的函式
import { renderLikePageCard } from './cardRenderer.js';
import { 
    initializeDatabaseService,
    getCurrentUser,
    onAuthStateChanged,
    saveUserData,
    onUserDataChanged,
    getCollectedPosts,
    removeFromCollection
} from './database-service.js';
import { logout } from './auth-service.js';

// 選擇 DOM 元素
const Profile = document.querySelector(".profile");  // 個人資料按鈕
const PersonPage = document.querySelector(".personPage"); // 個人資料頁面
const Like = document.querySelector(".like");  // 收藏按鈕
const LikePage = document.querySelector(".likePage"); // 收藏頁面
const LogoutBtn = document.querySelector(".loginOut"); // 登出按鈕

// 用戶資料編輯相關的 DOM 元素
let Edit, EditIng, Ensure, Cancel, TInputs, nameInput, phoneInput, mailInput;

// 初始化用戶資料編輯相關的 DOM 元素
function initializeUserEditElements() {
    Edit = document.querySelector(".edit");
    EditIng = document.querySelector(".editBtns");
    Ensure = document.querySelector(".ensure");
    Cancel = document.querySelector(".cancel");
    TInputs = document.querySelectorAll(".tInput");
    nameInput = document.querySelector(".tName");
    phoneInput = document.querySelector(".tPhone");
    mailInput = document.querySelector(".tMail");

    // 只有在所有必要元素都存在時才添加事件監聽器
    if (Edit && Cancel && Ensure) {
        Edit.addEventListener("click", handleEditClick);
        Cancel.addEventListener("click", handleCancelClick);
        Ensure.addEventListener("click", handleEnsureClick);
    }
}

// 處理編輯按鈕點擊
function handleEditClick() {
    if (!Edit || !EditIng || !TInputs) return;
    // 編輯狀態中
    Edit.classList.toggle('hidden');
    EditIng.classList.remove('hidden');
    
    TInputs.forEach(input => {
        input.readOnly = false; // 可編輯
        input.style.border = "1px solid #ccc";
    });
}

// 處理取消按鈕點擊
function handleCancelClick() {
    if (!Edit || !EditIng || !TInputs) return;
    // 非編輯狀態中
    Edit.classList.remove('hidden');
    EditIng.classList.add('hidden');
    
    TInputs.forEach(input => {
        input.readOnly = true; // 不可編輯
        input.style.border = "0px solid black";
    });
    // 重新載入用戶數據
    loadUserData();
}

// 處理確認按鈕點擊
function handleEnsureClick() {
    if (!Edit || !EditIng || !TInputs) return;
    // 使用者點擊確認後
    handleSaveUserData();
    
    Edit.classList.remove('hidden');
    EditIng.classList.add('hidden');
    
    TInputs.forEach(input => {
        input.readOnly = true; // 不可編輯
        input.style.border = "0px solid black";
    });
}

// 保存用戶數據
async function handleSaveUserData() {
    if (!nameInput || !phoneInput || !mailInput) {
        console.error("找不到必要的輸入欄位");
        return;
    }

    const userData = {
        name: nameInput.value,
        phone: phoneInput.value || "未設定電話",
        email: mailInput.value
    };

    try {
        await saveUserData(userData);
        console.log('使用者數據更新成功');
    } catch (error) {
        console.error("使用者數據更新失敗:", error);
        alert('保存失敗，請稍後再試');
    }
}

// 載入用戶數據
function loadUserData() {
    if (!nameInput || !phoneInput || !mailInput) {
        console.error("找不到必要的輸入欄位");
        return;
    }

    onUserDataChanged((userData) => {
        nameInput.value = userData.name || '';
        phoneInput.value = userData.phone || "未設定電話";
        mailInput.value = userData.email || '';
    });
}

/**
 * 渲染收藏的文章
 */
async function renderLikedArticles() {
    const user = getCurrentUser();
    if (!user) {
        console.log('用戶未登入');
        LikePage.innerHTML = '<p class="no-likes">請先登入</p>';
        return;
    }
    
    const likePage = document.querySelector(".likePage");
    likePage.innerHTML = ""; // 先清空內容

    try {
        const likedArticles = await getCollectedPosts();

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
                        await removeFromCollection(article.id);
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
    const user = getCurrentUser();
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
    const user = getCurrentUser();
    if (!user) {
        alert('請先登入');
        return;
    }
    LikePage.classList.add("hidden"); // 隱藏收藏頁面
    PersonPage.classList.remove("hidden"); // 顯示個人資料頁面
    // 載入用戶資料
    if (nameInput && phoneInput && mailInput) {
        loadUserData();
    }
});

// 點擊「登出」按鈕時登出用戶
LogoutBtn.addEventListener("click", async () => {
    const user = getCurrentUser();
    if (!user) {
        alert('您尚未登入');
        return;
    }
    
    // 詢問使用者是否確認登出
    if (confirm('確定要登出嗎？')) {
        try {
            await logout();
            console.log('登出成功');
        } catch (error) {
            console.error('登出失敗:', error);
            alert('登出失敗，請稍後再試');
        }
    }
});

// 當頁面載入時，監聽用戶登入狀態
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化資料庫服務
    const servicesInitialized = await initializeDatabaseService();
    if (!servicesInitialized) {
        console.error('❌ 資料庫服務初始化失敗');
        return;
    }
    
    // 初始化用戶資料編輯相關元素
    initializeUserEditElements();
    
    // 設定輸入欄位初始狀態
    if (TInputs) {
        TInputs.forEach(input => {
            input.readOnly = true;
            input.style.border = "0px solid black";
        });
    }
    
    onAuthStateChanged((user) => {
        if (user) {
            if (!LikePage.classList.contains('hidden')) {
                renderLikedArticles();
            }
            // 如果個人資料頁面是顯示的，載入用戶資料
            if (!PersonPage.classList.contains('hidden') && nameInput && phoneInput && mailInput) {
                loadUserData();
            }
        } else {
            LikePage.innerHTML = '<p class="no-likes">請先登入</p>';
            // 清空用戶資料欄位
            if (nameInput && phoneInput && mailInput) {
                nameInput.value = '';
                phoneInput.value = '';
                mailInput.value = '';
            }
        }
    });
});