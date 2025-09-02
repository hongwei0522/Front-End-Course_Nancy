import { 
    initializeDatabaseService,
    getCurrentUser,
    addToCollection,
    removeFromCollection,
    isPostCollected
} from './database-service.js';

// 等待資料庫服務初始化
initializeDatabaseService();

// article的渲染函數
export function renderCard(obj, container) {
    try {
        const user = getCurrentUser();
        if (!user) {
            alert('請先登入');
            return;
        }

        // 將文章加入收藏;
        const Article = document.createElement("div");
        Article.classList.add("article");
        
        const Card = document.createElement("div");
        Card.classList.add("card");
        Card.setAttribute("data-type", obj.classType);
        Card.setAttribute("data-keywords", `${obj.city} ${obj.name} ${obj.preface} ${obj.teachingMethod}`.toLowerCase());
        Card.setAttribute("data-id", obj.id); // 添加 data-id 屬性存儲文章ID

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
        RoomPic.setAttribute("href", `/content.html?id=${obj.id}`);
        
        const RoomPicImg = document.createElement("img");
        RoomPicImg.classList.add("roomPic");
        RoomPicImg.setAttribute("src", obj.rectangleUrl);
        RoomPic.appendChild(RoomPicImg);
        
        const Title = document.createElement("a");
        Title.classList.add("title");
        Title.setAttribute("href", `/content.html?id=${obj.id}`);
        Title.textContent = obj.name;

        const Text = document.createElement("a");
        Text.classList.add("text");
        Text.setAttribute("href", `/content.html?id=${obj.id}`);
        Text.textContent = obj.preface;
            
        const ReadMore = document.createElement("a");
        ReadMore.classList.add("readMore");
        ReadMore.setAttribute("href", `/content.html?id=${obj.id}`);
            
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
        
        UnCollect.addEventListener('click', async () => {
            const user = getCurrentUser();
            if (!user) {
                alert('請先登入');
                return;
            }

            try {
                await addToCollection(obj.id);
                UnCollect.classList.add('hidden');
                Collected.classList.remove('hidden');
            } catch (error) {
                console.error('收藏失敗:', error);
                alert('收藏失敗，請稍後再試');
            }
        });

        // 修改取消收藏按鈕的事件處理
        Collected.addEventListener('click', async () => {
            const user = getCurrentUser();
            if (!user) {
                alert('請先登入');
                return;
            }

            try {
                await removeFromCollection(obj.id);
                Collected.classList.add('hidden');
                UnCollect.classList.remove('hidden');
            } catch (error) {
                console.error('取消收藏失敗:', error);
                alert('取消收藏失敗，請稍後再試');
            }
        });

        // 檢查文章是否已被收藏
        async function checkIfCollected() {
            const user = getCurrentUser();
            if (!user) return;

            try {
                const isCollected = await isPostCollected(obj.id);
                if (isCollected) {
                    UnCollect.classList.add('hidden');
                    Collected.classList.remove('hidden');
                }
            } catch (error) {
                console.error('檢查收藏狀態失敗:', error);
            }
        }

        // 在卡片渲染完成後檢查收藏狀態
        checkIfCollected();

        container.appendChild(Article);
        return Card;
    } catch (error) {
        console.error('渲染卡片失敗:', error);
        alert('渲染卡片失敗，請稍後再試');
    }
}

// profile的渲染函數
export function renderLikePageCard(obj, container) {
    const Card = document.createElement("div");
    Card.classList.add("card");
    
    const RoomPicImg = document.createElement("img");
    RoomPicImg.classList.add("roomPic");
    RoomPicImg.setAttribute("src", obj.rectangleUrl);
    
    const Title = document.createElement("a");
    Title.classList.add("title");
    Title.setAttribute("href", `/content.html?id=${obj.id}`);
    Title.textContent = obj.name;

    const TrashIcon = document.createElement("i");
    TrashIcon.classList.add("fa-solid", "fa-trash");
    
    // 添加刪除功能
    TrashIcon.addEventListener('click', async () => {
        // localStorage.getItem('collectedCards')：這會從 localStorage 取得 key 為 'collectedCards' 的值 (通常是 JSON 格式的字串)。
        // || '[]'：如果 localStorage 裡沒有 'collectedCards'，則回傳 '[]'，確保 JSON.parse 不會出錯。
        // JSON.parse(...)：把字串轉回 JavaScript 陣列，這樣就能操作陣列。
        const collectedIds = JSON.parse(localStorage.getItem('collectedCards') || '[]');
        //如果 index 為 -1，表示沒有找到該文章的 ID，則不會執行刪除。
        const index = collectedIds.indexOf(obj.id);
        if (index > -1) {
            // splice(index, 1)：表示從 index 開始刪除 1 個元素。
            collectedIds.splice(index, 1);
            // 從 localStorage 使用setItem取得 key 為 "collectedCards" 的值
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