document.addEventListener("DOMContentLoaded", function () {
    // 獲取 DOM 節點
    const buttons = document.querySelectorAll(".nav a"); // 篩選文章的導覽按鈕
    const searchInput = document.querySelector(".searchBar"); // 搜尋輸入框
    const searchBtn = document.querySelector(".searchBtn"); // 搜尋按鈕
    const wrap = document.querySelector(".wrap"); // 搜尋畫面外部容器
    const overlay = document.querySelector(".searchDiv"); // 搜尋遮罩層
    const micBtn = document.querySelector(".voiceBtn"); // 語音輸入按鈕

    // 在使用者輸入搜尋內容後，按下 ENTER 或搜尋按鈕時，關閉搜尋視窗與遮罩
    function hideSearchBox() {
        searchInput.value = ""; // 清空輸入框內容
        overlay.classList.remove('active'); // 隱藏遮罩層
        wrap.classList.remove('active'); // 隱藏搜尋框
    }

    // 讓 main 依照 JSON 的 classType 渲染出特定 data-type 的文章
    buttons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // 防止點擊 <a> 時頁面跳轉
            const filterType = this.dataset.type; // 取得按鈕的 data-type
            setTimeout(() => {
                filterCards(filterType, searchInput.value.trim()); // 延遲 500ms 避免畫面閃爍
            }, 500);
        });
    });

    // 處理搜尋功能
    function handleSearch() {
        filterCards(getActiveFilterType(), searchInput.value.trim()); // 根據輸入內容篩選文章
        hideSearchBox(); // 搜尋後關閉搜尋框
    }

    // 監聽搜尋按鈕點擊事件
    searchBtn.addEventListener("click", handleSearch);

    // 監聽搜尋框的 Enter 鍵事件
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    // 語音辨識功能
    function startSpeechRecognition() {
        if (!("webkitSpeechRecognition" in window)) {
            alert("你的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge.");
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.lang = "zh-TW"; // 設定語言為繁體中文
        recognition.continuous = false; // 單次偵測
        recognition.interimResults = false; // 只返回最終結果
        recognition.start();
    
        recognition.onstart = function () {
            micBtn.classList.add("listening"); // 標記麥克風正在接收語音輸入
        };
        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript; // 將語音轉換的文字填入搜尋框
            setTimeout(() => {
                handleSearch(); // 延遲 2 秒後執行搜尋
            }, 2000);
        };
        recognition.onerror = function (event) {
            console.error("語音辨識錯誤: ", event.error);
        };
        recognition.onend = function () {
            micBtn.classList.remove("listening"); // 移除語音辨識標記
        };
    }

    // 監聽語音按鈕點擊事件
    micBtn.addEventListener("click", startSpeechRecognition);
});

// 透過非同步函式載入 JSON 檔案
async function room() {
    const requestURL = "front-enter-export.json";
    const response = await fetch(requestURL);
    const articleDatas = await response.json();
    const articles = Object.values(articleDatas.article);
    roomBody(articles); // 渲染文章內容
}

// 渲染文章內容
function roomBody(articles) {
    const main = document.querySelector("main");
    main.innerHTML = ""; // 清空 main 內容
    
    articles.forEach(obj => {
        const Article = document.createElement("div");
        Article.classList.add("article");
        
        const Card = document.createElement("div");
        Card.classList.add("card");
        Card.setAttribute("data-type", obj.classType);
        Card.setAttribute("data-keywords", `${obj.city} ${obj.name} ${obj.preface} ${obj.teachingMethod}`.toLowerCase());

        const Site = document.createElement("div");
        Site.classList.add("site");
        
        const SitePic = document.createElement("img");
        SitePic.classList.add("sitePic");
        SitePic.setAttribute("src", "./image/location_icon_one.png");
        
        const P1 = document.createElement("p");
        P1.textContent = obj.city;

        const Pic = document.createElement("div");
        Pic.classList.add("pic");

        const RoomPic = document.createElement("a");
        RoomPic.setAttribute("href", `/content.html?id=${obj.creatTime}`);
        
        const RoomPicImg = document.createElement("img");
        RoomPicImg.classList.add("roomPic");
        RoomPicImg.setAttribute("src", obj.rectangleUrl);
        RoomPic.appendChild(RoomPicImg);
        
        const Title = document.createElement("a");
        Title.classList.add("title");
        Title.setAttribute("href", `/content.html?id=${obj.creatTime}`);
        Title.textContent = obj.name;
        
        Article.appendChild(Card);
        Card.appendChild(Site);
        Site.appendChild(SitePic);
        Site.appendChild(P1);
        Card.appendChild(Pic);
        Pic.appendChild(RoomPic);
        Card.appendChild(Title);
        main.appendChild(Article);
    });
}

// 篩選文章內容
function filterCards(filterType, keyword) {
    const cards = document.querySelectorAll(".card");
     // 設定一個變數來檢查是否有符合條件的卡片
    let hasVisibleCards = false;
    const noResultsMessage = document.getElementById("noResults");

    cards.forEach(card => {
        // 從 data-type 屬性獲取類型，可能包含多個類型（字串）
        const types = card.dataset.type ? card.dataset.type.split(" ") : [];
        // 從 data-keywords 屬性獲取所有關鍵字
        const keywords = card.dataset.keywords || "";
        // 檢查當前卡片的類型是否符合篩選條件
        const matchesType = !filterType || types.includes(filterType);
        // 檢查當前卡片的關鍵字是否包含搜尋關鍵字
        const matchesKeyword = !keyword || keywords.toLowerCase().includes(keyword.toLowerCase());

        if (matchesType && matchesKeyword) {
            card.classList.remove("hidden");
            hasVisibleCards = true;
        } else {
            card.classList.add("hidden");
        }
    });
    
    noResultsMessage.classList.toggle("hidden", hasVisibleCards);
}

// 取得當前選取的篩選類型
function getActiveFilterType() {
    const activeButton = document.querySelector(".nav a.active");
    return activeButton ? activeButton.dataset.type : "";
}

// 載入文章
room();
