// 為 article 頁面專門的渲染函數
export function renderCard(obj, container) {
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

    const Text = document.createElement("a");
    Text.classList.add("text");
    Text.setAttribute("href", `/content.html?id=${obj.creatTime}`);
    Text.textContent = obj.preface;
        
    const ReadMore = document.createElement("a");
    ReadMore.classList.add("readMore");
    ReadMore.setAttribute("href", `/content.html?id=${obj.creatTime}`);
        
    const Read = document.createElement("p");
    Read.classList.add("read");
    Read.textContent = "read more";
        
    const Img1 = document.createElement("img");
    Img1.setAttribute("src", "./image/arrow-right-one.png");

    const Collected = document.createElement("div");
    Collected.classList.add("collected","hidden");
    const UnCollect = document.createElement("div");
    UnCollect.classList.add("uncollect");
    const SrHeart = document.createElement("i");
    SrHeart.classList.add("fa-solid","fa-heart");
    const SbHeart = document.createElement("i");
    SbHeart.classList.add("fa-regular","fa-heart");
    
    Article.appendChild(Card);
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
    Card.appendChild(Collected);
    Card.appendChild(UnCollect);
    Collected.appendChild(SrHeart);
    UnCollect.appendChild(SbHeart);
    
    container.appendChild(Article);
    return Card;
}
// 為 profile 頁面專門的渲染函數
export function renderLikePageCard(obj, container) {
    const Card = document.createElement("div");
    Card.classList.add("card");
    
    const RoomPicImg = document.createElement("img");
    RoomPicImg.classList.add("roomPic");
    RoomPicImg.setAttribute("src", obj.rectangleUrl);
    
    const Title = document.createElement("a");
    Title.classList.add("title");
    Title.setAttribute("href", `/content.html?id=${obj.creatTime}`);
    Title.textContent = obj.name;

    const TrashIcon = document.createElement("i");
    TrashIcon.classList.add("fa-solid", "fa-trash");
    
    // 添加刪除功能
    TrashIcon.addEventListener('click', async () => {
        // localStorage.getItem('collectedCards')：這會從 localStorage 取得 key 為 'collectedCards' 的值 (通常是 JSON 格式的字串)。
        // || '[]'：如果 localStorage 裡沒有 'collectedCards'，則回傳 '[]'，確保 JSON.parse 不會出錯。
        // JSON.parse(...)：把字串轉回 JavaScript 陣列，這樣就能操作陣列。
        const collectedIds = JSON.parse(localStorage.getItem('collectedCards') || '[]');
        //如果 index 為 -1，表示沒有找到該文章的 creatTime，則不會執行刪除。
        const index = collectedIds.indexOf(obj.creatTime.toString());
        if (index > -1) {
            // splice(index, 1)：表示從 index 開始刪除 1 個元素。
            collectedIds.splice(index, 1);
            localStorage.setItem('collectedCards', JSON.stringify(collectedIds));
            // 從畫面中移除
            Card.remove();
            // 如果沒有收藏的文章了，顯示提示訊息
            if (collectedIds.length === 0) {
                container.innerHTML = '<p class="no-likes">還沒有收藏的文章</p>';
            }
        }
    });
    
    Card.appendChild(RoomPicImg);
    Card.appendChild(Title);
    Card.appendChild(TrashIcon);
    
    container.appendChild(Card);
    return Card;
}