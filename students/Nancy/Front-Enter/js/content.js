import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { app } from './firebase.js';

const database = getDatabase(app);

async function room() {
    // 取得當前網址的 URL 參數
    // window.location.search 會取得當前網址的查詢字串（如 ?id=123&source=test）。
    // new URLSearchParams(...) 讓我們能夠輕鬆解析這些參數，get("id") 會取得 id 的值，get("source") 會取得 source 的值。
    const urlParams = new URLSearchParams(window.location.search);
    // id 代表要讀取的文章 ID，而 source 用來判斷資料來源是 本地 JSON 檔案 還是 Firebase。
    const contentId = urlParams.get("id");
    const source = urlParams.get("source");
    
    if (!contentId) {
        console.error("缺少 ID 參數");
        return;
    }

    try {
        let contentData;
        // 根據 source 參數決定資料來源
        // testGo文章來源使用本地JSON檔案
        if (source === 'test') {
            // 從本地 JSON 檔案獲取資料
            const requestURL = "front-enter-export.json";
            const request = new Request(requestURL);
            const response = await fetch(request);
            const articleDatas = await response.json();
            
            // 從 article 物件中找到對應 uid 的文章
            // Object.values(...).find(...) 會遍歷所有文章，找出 uid 符合 contentId 的那一篇文章。
            const article = Object.values(articleDatas.article).find(
                article => article.uid === contentId
            );
            
            if (!article) {
                console.error("在本地資料中找不到此 ID");
                return;
            }
            
            contentData = article;
        } else {
            // 從 Firebase 獲取資料
            // 使用ref取得 Firebase 資料庫中 posts 節點下對應 contentId 的參考位置。
            const articleRef = ref(database, `posts/${contentId}`);
            const snapshot = await get(articleRef);
            // snapshot.exists() 檢查該 id 是否有資料。
            if (!snapshot.exists()) {
                console.error("在 Firebase 中找不到此 ID");
                return;
            }
            // snapshot.val() 取得該筆文章的資料。
            contentData = snapshot.val();
        }

        const bInputs = document.querySelectorAll(".bInput");

        const values = [
            contentData.name || contentData.className || "無資料",
            contentData.topic || "無資料",
            contentData.content || "無資料",
            contentData.city || "無資料",
            contentData.classType || "無資料",
            contentData.teachWay || "無資料",
            contentData.totalDay || "無資料",
            contentData.weekHour || "無資料",
            contentData.technology || "無資料",
            contentData.mail || "無資料",
            contentData.phone || "無資料"
        ];

        bInputs.forEach((input, index) => {
            if (index === 2) {
                input.innerHTML = contentData.content || "無資料";
            } else {
                input.textContent = values[index];
            }
        });
    } catch (error) {
        console.error('載入文章資料時發生錯誤:', error);
    }
}
// 當整個 HTML 文件載入完成後，執行 room() 函式
// DOMContentLoaded 事件會在 HTML 解析完畢且 DOM 樹建立完成時觸發（不需要等待圖片、CSS 載入）。
// 這確保 room() 在 DOM 準備好後執行。
document.addEventListener("DOMContentLoaded", room);