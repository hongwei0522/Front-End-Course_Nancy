import { renderCard } from './cardRenderer.js';
import { getDatabase, ref, onValue, off } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { app } from './firebase.js';
const database = getDatabase(app);

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
        //filterCards(filterType, keyword)
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
            // event 是由 SpeechRecognitionEvent 提供的 語音辨識結果物件
            // event.results 是一個 類似陣列（類陣列，SpeechRecognitionResultList）的物件，其中包含 所有語音辨識的結果
            // event.results[0] → 第一組語音辨識結果。
            // event.results[0][0] → 這組結果中 最可信的候選文字。
            // event.results[0][0].transcript → 實際的辨識文字內容。
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

    // 初始載入文章
    loadArticles();
});

// 生成隨機圖片路徑
function getRandomImage() {
    const roomImages = ['room01', 'room02', 'room03', 'room04', 'room05'];
    
    // 隨機選擇一張房間圖片
    // Math.random() 產生 0 ~ 1 的隨機小數（不含 1）。
    // Math.random() * roomImages.length 產生 0 ~ 陣列長度 的隨機小數。
    // Math.floor() 無條件捨去小數，確保結果是 0 到 roomImages.length - 1 之間的整數。
    // roomImages[randomIndex] 選擇對應的圖片名稱。
    const randomRoom = roomImages[Math.floor(Math.random() * roomImages.length)];
    return `./image/${randomRoom}.jpg`;
}

// 從 Firebase 載入文章資料
function loadArticles() {
    // 使用 Firebase Realtime Database 的 ref() 函式來建立一個 資料參照 (Reference)，指向 posts 節點。
    // postsRef 變數就代表 posts 資料的位置，之後會透過這個變數來讀取或監聽 posts
    const postsRef = ref(database, 'posts');
    const main = document.querySelector("main");
    
    // 清除現有的監聽器
    // off(postsRef) 先移除 postsRef 的所有監聽器，確保不會有舊的監聽影響新的資料載入
    off(postsRef);
    
    // 添加載入中的提示
    main.innerHTML = '<div class="loading">載入文章中...</div>';

    // 監聽 Firebase 資料變更
    // 當 posts 節點的資料變更時，會自動觸發 callback 函式。
    // snapshot 代表 Firebase 讀取到的資料快照，可以用來取得 posts 節點的值。
    onValue(postsRef, (snapshot) => {
        main.innerHTML = ""; // 清空 main 內容
        
        if (!snapshot.exists()) {
            main.innerHTML = '<div class="no-articles">目前沒有文章</div>';
            return;
        }
        // 將 Firebase 讀取到的 posts 節點資料 轉成 JavaScript 物件
        const posts = snapshot.val();
        // 將 Firebase 資料轉換為卡片格式並渲染
        // Object.entries(posts) 會將 posts 物件轉換成 陣列陣列 (Array of Arrays)。
        // forEach(([id, post]) => {...}) 會遍歷 每篇文章，其中：
            // id：Firebase 資料的 Key（例如 post1, post2）。
            // post：該文章的內容（物件）。
        Object.entries(posts).forEach(([id, post]) => {
            // 限制 content 長度在 50 字以內
            const truncatedContent = (post.content || "").length > 50 
                ? (post.content || "").substring(0, 50) + "..." 
                : post.content || "";

            const cardData = {
                classType: post.classType || "",
                city: post.city || "",
                name: post.className || "",
                preface: truncatedContent, // 限制 content 長度在 50 字以內
                teachingMethod: post.teachWay || "",
                rectangleUrl: getRandomImage(),
                creatTime: id,
                id: id  // 添加 id 屬性以供收藏功能使用
            };
            // 使用 cardData 來 建立 HTML 卡片。
            // main 作為 容器 (Container)，將卡片插入到頁面中。
            renderCard(cardData, main);
        });
    }, (error) => {
        console.error("載入文章時發生錯誤:", error);
        main.innerHTML = '<div class="articlEerror">請先登入</div>';
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
        // 將字串依據「空格」拆分為陣列，這樣就可以檢查該卡片是否屬於 filterType。
        // 如果 card.dataset.type 是 undefined，則回傳 [] (空陣列)，避免錯誤。
        const types = card.dataset.type ? card.dataset.type.split(" ") : [];
        // 從 data-keywords 屬性獲取所有關鍵字
        const keywords = card.dataset.keywords || "";
        // 檢查當前卡片的類型是否符合篩選條件
        // 檢查當前卡片的關鍵字是否包含搜尋關鍵字
        // 檢查 types 陣列是否包含 filterType，即 檢查該卡片是否屬於選擇的類型。
        // 如果 filterType 為 null 或 "" (未選擇篩選條件)，則不做類型篩選 (!filterType 為 true)
        const matchesType = !filterType || types.includes(filterType);
        // toLowerCase()：轉換為小寫，避免大小寫影響搜尋結果。
        // includes()：檢查 keywords 是否包含 keyword。
        // 如果 keyword 為空字串 ("") 或 null，則不篩選關鍵字 (!keyword 為 true)。
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