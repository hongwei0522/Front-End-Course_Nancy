/**
 * 初始化收藏功能，遍歷所有卡片，並為收藏/取消收藏按鈕綁定事件。
 */
function initializeCollectionHandlers() {
    // 取得所有文章卡片
    const cards = document.querySelectorAll('.card');
    
    // 遍歷每張卡片，設定收藏按鈕事件
    cards.forEach(card => {
        const collected = card.querySelector('.collected'); // 收藏按鈕（實心愛心）
        const uncollect = card.querySelector('.uncollect'); // 取消收藏按鈕（空心愛心）
        const cardId = card.querySelector('a').href.split('id=')[1]; // 取得文章 ID
        
        // 讀取 localStorage 中的收藏清單
        // 將存儲的 字串 JSON 轉換成陣列，若 getItem() 回傳 null，則 || '[]' 讓程式回傳 []，避免 JSON.parse(null) 出錯
        const collectedIds = JSON.parse(localStorage.getItem('collectedCards') || '[]');

        // 根據收藏狀態來決定按鈕顯示
        if (collectedIds.includes(cardId)) {
            collected.classList.remove('hidden'); // 顯示「已收藏」按鈕
            uncollect.classList.add('hidden');   // 隱藏「未收藏」按鈕
        }
        
        // ✅ 監聽收藏（實心愛心）按鈕的點擊事件 -> 取消收藏
        collected.addEventListener('click', () => {
            const collectedIds = JSON.parse(localStorage.getItem('collectedCards') || '[]');
            const index = collectedIds.indexOf(cardId);
            
            // 若文章 ID 存在於收藏列表中，則移除它
            // 查找該文章 ID 在陣列中的索引
            // 如果 cardId 存在，則 index 會是 該文章在陣列中的位置
            // 當 index > -1，代表該文章已收藏，則需要移除
            if (index > -1) {
                //splice() 用來刪除陣列中指定索引的項目
                // 範例
                // let collectedIds = ["1708761200", "1708761400"];
                // let index = collectedIds.indexOf("1708761200"); // index = 0
                // collectedIds.splice(index, 1); // 移除第一個元素
                // console.log(collectedIds); // ➜ ["1708761400"]
                collectedIds.splice(index, 1);
                localStorage.setItem('collectedCards', JSON.stringify(collectedIds)); // 更新 localStorage
            }
            
            // UI 更新：隱藏實心愛心，顯示空心愛心
            collected.classList.add('hidden');
            uncollect.classList.remove('hidden');
        });

        // ✅ 監聽未收藏（空心愛心）按鈕的點擊事件 -> 加入收藏
        uncollect.addEventListener('click', () => {
            const collectedIds = JSON.parse(localStorage.getItem('collectedCards') || '[]');
            
            // 若該文章 ID 尚未收藏，則加入收藏列表
            if (!collectedIds.includes(cardId)) {
                collectedIds.push(cardId);
                localStorage.setItem('collectedCards', JSON.stringify(collectedIds)); // 更新 localStorage
            }
            
            // UI 更新：隱藏空心愛心，顯示實心愛心
            uncollect.classList.add('hidden');
            collected.classList.remove('hidden');
        });
    });
}

/**
 * 監聽 DOM 變化，確保動態新增的卡片也能支援收藏功能。
 */
// MutationObserver
// 監聽 DOM 結構變化（新增或刪除的節點）。
// 適用於 SPA（單頁應用）或 AJAX 載入的動態內容。
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // 如果 mutation 內包含新節點，代表 main 裡有新的 .card 被加入。
        if (mutation.addedNodes.length) {
            // 當有新 .card 加入時，重新執行 initializeCollectionHandlers()，確保新文章的收藏按鈕也能正確運作
            initializeCollectionHandlers(); // 重新初始化收藏功能
        }
    });
});

/**
 * 當網頁載入完成時，初始化收藏功能並開始監聽 DOM 變化。
 */
// 這段程式碼會在 DOM 完全載入後執行，確保所有 .card 的收藏功能可以被初始化
// 這個事件會在 HTML 完全載入並解析完畢 後執行（不等待圖片、CSS 等資源）。
// 確保收藏功能在頁面載入時正確執行。
document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main'); // 取得主要內容區域
    if (main) {
        // childList: true：監聽 main 內部直接新增的子元素。
        // subtree: true：監聽 main 內所有層級的變化（包含內部元素的變化）。
        // 確保即使有新 .card 被 AJAX 動態載入，仍可正確處理收藏功能。
        observer.observe(main, { childList: true, subtree: true });
        // 初始化所有現有的 .card 收藏按鈕狀態與事件監聽
        initializeCollectionHandlers();
    }
});
// 1. 監聽 DOMContentLoaded 事件
//    ├──> 取得 main 區塊，開始監聽 DOM 變化
//    ├──> 初始化所有已存在的卡片收藏狀態

// 2. 若有新卡片被動態加入（MutationObserver 監測到變化）
//    ├──> 重新執行 initializeCollectionHandlers()，讓新卡片也具備收藏功能

// 3. 使用者點擊空心愛心（未收藏）
//    ├──> 檢查 localStorage
//    ├──> 若該文章 ID 尚未收藏，則加入收藏陣列
//    ├──> 更新 localStorage
//    ├──> UI 更新（顯示實心愛心，隱藏空心愛心）

// 4. 使用者點擊實心愛心（已收藏）
//    ├──> 檢查 localStorage
//    ├──> 若該文章 ID 存在，則移除收藏陣列中的該 ID
//    ├──> 更新 localStorage
//    ├──> UI 更新（顯示空心愛心，隱藏實心愛心）
