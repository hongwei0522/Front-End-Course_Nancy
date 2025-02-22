// 定義一個異步函式 room()，用來處理 JSON 資料的載入與顯示
async function room() {
    // 設定要請求的 JSON 檔案 URL
    const requestURL = "front-enter-export.json";

    // 創建 Request 物件
    const request = new Request(requestURL);

    // 使用 fetch 進行 HTTP 請求，等待回應
    const response = await fetch(request);

    // 解析 JSON 資料，將回應內容轉換成 JavaScript 物件
    const articleDatas = await response.json();

    // 將 JSON 內的 `article` 物件轉換成陣列，以便使用陣列方法（如 find）
    const articles = Object.values(articleDatas.article);
    
    // 取得當前網址的 URL 參數
    const urlParams = new URLSearchParams(window.location.search);

    // 從 URL 參數中取得 `id`（這裡假設 `id` 對應 `creatTime`）
    const contentId = urlParams.get("id");
    
    // 如果網址中沒有 `id` 參數，則顯示錯誤訊息並停止執行
    if (!contentId) {
        console.error("缺少 ID 參數");
        return;
    }

    // 在 `articles` 陣列中尋找 `creatTime` 符合 `contentId` 的資料
    const contentData = articles.find(article => article.creatTime == contentId);

    // 如果找不到對應的資料，則顯示錯誤訊息並停止執行
    if (!contentData) {
        console.error("查無此 ID 的資料");
        return;
    }

    // 選取所有 class 為 `.bInput` 的 HTML 元素，這些元素是用來顯示資料的
    const bInputs = document.querySelectorAll(".bInput");

    // 將 JSON 內的資料對應到一個陣列，確保即使資料缺失也能顯示「無資料」
    const values = [
        contentData.name || "無資料",         // 課程名稱
        contentData.topic || "無資料",        // 課程主題
        contentData.content || "無資料",      // 課程內容
        contentData.city || "無資料",         // 所在城市
        contentData.classType || "無資料",    // 課程類型
        contentData.teachWay || "無資料",     // 教學方式
        contentData.totalDay || "無資料",     // 總天數
        contentData.weekHour || "無資料",     // 每週時數
        contentData.technology || "無資料",   // 主要技術
        contentData.mail || "無資料",         // 聯絡信箱
        contentData.phone || "無資料",        // 聯絡電話
    ];

    // 遍歷所有 `.bInput` 元素，依序填入對應的資料
    bInputs.forEach((input, index) => {
        // 如果是第三個項目（課程內容），使用 innerHTML，以確保能顯示 HTML 格式
        if (index === 2) { 
            input.innerHTML = contentData.content || "無資料"; 
        } else {
            // 其他欄位則使用 textContent，避免 XSS 攻擊
            input.textContent = values[index]; 
        }
    });
}

// 當整個 HTML 文件載入完成後，執行 room() 函式
document.addEventListener("DOMContentLoaded", room);
