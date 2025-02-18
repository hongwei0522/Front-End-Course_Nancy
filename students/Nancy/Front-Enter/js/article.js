document.addEventListener("DOMContentLoaded", function () {
    // 獲取DOM節點
    const buttons = document.querySelectorAll(".nav a");
    const searchInput = document.querySelector(".searchBar");
    const searchBtn = document.querySelector(".searchBtn");
    const wrap = document.querySelector(".wrap");
    const overlay = document.querySelector(".searchDiv");
    const micBtn = document.querySelector(".voiceBtn");
    // 在使用者輸入搜尋內容，並按下ENTER或按鈕時，會觸發關閉搜尋視窗及黑色遮幕
    function hideSearchBox() {
        searchInput.value = "";
        overlay.classList.remove('active');
        wrap.classList.remove('active');   
    }
    // 讓main依照JSON的classType渲染出特定data-type的文章
    buttons.forEach(button => {
        button.addEventListener("click", function (event) {
            //防止點擊 `<a>` 時頁面跳轉
            event.preventDefault();
            // 取得按鈕的data-type值
            const filterType = this.dataset.type;
            // 延遲 500 毫秒執行，這樣可以讓篩選的動畫效果更流暢，避免按鈕點擊時畫面閃爍。
            setTimeout(() => {
                filterCards(filterType, searchInput.value.trim());
            }, 500);
        });
    });
    // 在使用者按下ENTER或按鈕時觸發
    function handleSearch() {
        filterCards(getActiveFilterType(), searchInput.value.trim());
        hideSearchBox();
    }
    // 搜尋按鈕監聽：只要使用者按下按鈕，就觸發handleSearch
    searchBtn.addEventListener("click", handleSearch);
    // 搜尋框監聽：只要使用者按下ENTER，就觸發handleSearch
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
            console.log("語音辨識開始...");
            micBtn.classList.add("listening");
        };
        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript; // 設定搜尋框的值
            console.log("辨識結果: ", transcript);
            // 延遲 2 秒後執行搜尋
            setTimeout(() => {
                handleSearch(); // 直接執行搜尋
            }, 2000);
        };
        recognition.onerror = function (event) {
            console.error("語音辨識錯誤: ", event.error);
        };
        recognition.onend = function () {
            console.log("語音辨識結束");
            micBtn.classList.remove("listening");
        };
    }
    // 語音按鈕監聽：只要使用者按下按鈕，就觸發startSpeechRecognition語音辨識功能
    micBtn.addEventListener("click", startSpeechRecognition);
    
});
// 透過非同步async/await串接JSON
async function room() {
    const requestURL = "front-enter-export.json";
    const request = new Request(requestURL);
    const response = await fetch(request);
    const articleDatas = await response.json();
    const articles = Object.values(articleDatas.article);
    roomBody(articles);
}
// 串接JSON並渲染出九個文章
function roomBody(articles) {
    const main = document.querySelector("main");
    main.innerHTML = ""; 
    
    for (const obj of articles) {
        const Article = document.createElement("div");
        Article.classList.add("article");
        
        const Card = document.createElement("div");
        Card.classList.add("card");
        Card.setAttribute("data-type", obj.classType);
        Card.setAttribute("data-keywords", `${obj.city} ${obj.name} ${obj.preface} ${obj.teachingMethod}`.toLowerCase());

        const Id = document.createElement("div");
        Id.id = obj.uid;
        
        const Site = document.createElement("div");
        Site.classList.add("site");
        
        const SitePic = document.createElement("img");
        SitePic.classList.add("sitePic");
        SitePic.setAttribute("src", "./image/location_icon_one.png");
        
        const P1 = document.createElement("p");
        P1.textContent = obj.city;
        
        const Pic = document.createElement("div");
        Pic.classList.add("pic");
        
        const RoomPic = document.createElement("img");
        RoomPic.classList.add("roomPic");
        RoomPic.setAttribute("src", obj.rectangleUrl);
        
        const Title = document.createElement("p");
        Title.classList.add("title");
        Title.textContent = obj.name;
        
        const Text = document.createElement("p");
        Text.classList.add("text");
        Text.textContent = obj.preface;
        
        const ReadMore = document.createElement("div");
        ReadMore.classList.add("readMore");
        
        const Read = document.createElement("p");
        Read.classList.add("read");
        Read.textContent = "read more";
        
        const Img1 = document.createElement("img");
        Img1.setAttribute("src", "./image/arrow-right-one.png");
        
        Article.appendChild(Card);
        Card.appendChild(Id);
        Card.appendChild(Site);
        Site.appendChild(SitePic);
        Site.appendChild(P1);
        Card.appendChild(Pic);
        Pic.appendChild(RoomPic);
        Card.appendChild(Title);
        Card.appendChild(Text);
        Card.appendChild(ReadMore);
        ReadMore.appendChild(Read);
        ReadMore.appendChild(Img1);
        
        main.appendChild(Article);
    }
}
function filterCards(filterType, keyword) {
    const cards = document.querySelectorAll(".card");
    
    cards.forEach(card => {
        // 每個 .card 都有可能具有多個 data-type 屬性，split(" ") 把多個類別拆分成陣列 ["小班制", "放養制"]，方便比對
        const types = card.dataset.type ? card.dataset.type.split(" ") : [];
        // data-keywords 屬性存放文章的關鍵字，這樣可以讓搜尋框輸入 "台北" 時，也能找到這篇文章。
        const keywords = card.dataset.keywords || "";
        // 條件 1： 如果 filterType 為空 ("")，代表沒有篩選類別，則 matchesType = true。
        // 條件 2： 如果 filterType 有值，則判斷 types 陣列是否包含這個類別。
        const matchesType = !filterType || types.includes(filterType);
        // 條件 1： 如果 keyword 為空 ("")，代表沒有輸入搜尋內容，則 matchesKeyword = true。
        // 條件 2： 如果 keyword 有值，則檢查該關鍵字是否存在於 data-keywords 屬性內。
        const matchesKeyword = !keyword || keywords.includes(keyword.toLowerCase());
        if (matchesType && matchesKeyword) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });
}
function getActiveFilterType() {
    const activeButton = document.querySelector(".nav a.active");
    return activeButton ? activeButton.dataset.type : "";
}
room();
