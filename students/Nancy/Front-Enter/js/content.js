async function room() {
    const requestURL = "front-enter-export.json";
    const request = new Request(requestURL);
    const response = await fetch(request);
    const articleDatas = await response.json();
    const articles = Object.values(articleDatas.article);
    
    // 取得 URL 參數中的 id (此處假設 id 即是 creatTime)
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get("id");
    
    if (!contentId) {
        console.error("缺少 ID 參數");
        return;
    }

    // 根據 creatTime 找到對應的資料
    const contentData = articles.find(article => article.creatTime == contentId);

    if (!contentData) {
        console.error("查無此 ID 的資料");
        return;
    }

    // 將資料填入對應的 `.bInput` 容器
    const bInputs = document.querySelectorAll(".bInput");
    const values = [
        contentData.name || "無資料",
        contentData.topic || "無資料",
        contentData.content || "無資料",
        contentData.city || "無資料",
        contentData.classType || "無資料",
        contentData.teachWay || "無資料",
        contentData.totalDay || "無資料",
        contentData.weekHour || "無資料",
        contentData.technology || "無資料",
        contentData.mail || "無資料",
        contentData.phone || "無資料",
    ];

    bInputs.forEach((input, index) => {
        if (index === 2) { 
            input.innerHTML = contentData.content || "無資料"; // 使用 innerHTML 顯示 HTML
        } else {
            input.textContent = values[index]; 
        }
    });
}

document.addEventListener("DOMContentLoaded", room);
