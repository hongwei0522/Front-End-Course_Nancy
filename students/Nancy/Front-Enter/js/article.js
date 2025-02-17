// filter
document.addEventListener("DOMContentLoaded", function () {
    // 監聽按鈕點擊事件
    const buttons = document.querySelectorAll(".nav a");

    buttons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // 防止 a 標籤預設跳轉行為
            const filterType = this.dataset.type; // 取得 data-type 屬性值

            // 等待 room() 生成的 card 再執行篩選
            setTimeout(() => {
                const cards = document.querySelectorAll(".card"); // 正確選擇 card
                cards.forEach(card => {
                    const types = card.dataset.type ? card.dataset.type.split(" ") : []; // 取得 data-type

                    if (!filterType || types.includes(filterType)) {
                        card.classList.remove("hidden");
                    } else {
                        card.classList.add("hidden");
                    }
                });
            }, 500); // 等待 500ms，確保 room() 執行完
        });
    });
});

// card渲染
async function room() {
    // 聲明 requestURL 變數以儲存 JSON 檔案的路徑
    const requestURL = "front-enter-export.json";
    // 使用該 URL 初始化一個新的 Request 物件
    const request = new Request(requestURL);
    // 使用 fetch() 進行網路請求，並獲取 JSON 回應
    const response = await fetch(request);
    const articleDatas = await response.json();
    
    // 確保 article 存在
    if (!articleDatas.article) {
        console.error("無法找到 'article' 資料");
        return;
    }

    const articles = Object.values(articleDatas.article); // 轉換為陣列
    roomBody(articles);
}

function roomBody(articles) {
    const main = document.querySelector("main");

    for (const obj of articles) {
        const Article = document.createElement("div");
        Article.classList.add("article");

        const Card = document.createElement("div");
        Card.classList.add("card");
        Card.setAttribute("data-type", obj.classType);

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

        // 將所有元素正確地組合
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

        // 將生成的內容加入 main
        main.appendChild(Article);
    }
}

// 呼叫頂層函數 room()
room();
