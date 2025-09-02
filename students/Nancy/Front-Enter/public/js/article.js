import { renderCard } from "./cardRenderer.js";
import { initializeDatabaseService, onPostsChanged } from './database-service.js';
import {
  attachSearchEnterKey,
  attachVoiceRecognition,
  getSearchKeyword,
} from "./search.js";

document.addEventListener("DOMContentLoaded", async function () {
  // 初始化資料庫服務
  const servicesInitialized = await initializeDatabaseService();
  if (!servicesInitialized) {
    console.error('❌ 資料庫服務初始化失敗，無法載入文章');
    return;
  }
  
  const buttons = document.querySelectorAll(".nav a");

  // 初始載入文章
  loadArticles();

  // 篩選按鈕事件
  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      buttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      filterCards(this.dataset.type, getSearchKeyword());
    });
  });

  // 搜尋 Enter 鍵綁定
  attachSearchEnterKey((keyword) =>
    filterCards(getActiveFilterType(), keyword)
  );

  // 語音辨識綁定
  attachVoiceRecognition((keyword) =>
    filterCards(getActiveFilterType(), keyword)
  );
});

// 取得當前選取的篩選類型
function getActiveFilterType() {
  const activeButton = document.querySelector(".nav a.active");
  return activeButton ? activeButton.dataset.type : "";
}

// 篩選文章
function filterCards(filterType, keyword) {
  const cards = document.querySelectorAll(".card");
  let hasVisibleCards = false;
  const noResultsMessage = document.getElementById("noResults");

  cards.forEach((card) => {
    const types = card.dataset.type ? card.dataset.type.split(" ") : [];
    const keywords = card.dataset.keywords || "";
    const matchesType = !filterType || types.includes(filterType);
    const matchesKeyword =
      !keyword || keywords.toLowerCase().includes(keyword.toLowerCase());

    if (matchesType && matchesKeyword) {
      card.classList.remove("hidden");
      hasVisibleCards = true;
    } else {
      card.classList.add("hidden");
    }
  });

  noResultsMessage.classList.toggle("hidden", hasVisibleCards);
}

// 載入文章
function loadArticles() {
  const main = document.querySelector("main");
  main.innerHTML = '<div class="loading">載入文章中...</div>';

  onPostsChanged((posts) => {
    main.innerHTML = "";
    
    if (!posts || Object.keys(posts).length === 0) {
      main.innerHTML = '<div class="no-articles">目前沒有文章</div>';
      return;
    }

    Object.entries(posts).forEach(([id, post]) => {
      const truncatedContent =
        (post.content || "").length > 50
          ? post.content.substring(0, 50) + "..."
          : post.content || "";

      const cardData = {
        classType: post.classType || "",
        city: post.city || "",
        name: post.className || "",
        preface: truncatedContent,
        teachingMethod: post.teachWay || "",
        rectangleUrl: getRandomImage(),
        creatTime: id,
        id: id,
      };
      renderCard(cardData, main);
    });
  });
}

// 隨機圖片
function getRandomImage() {
  const roomImages = ["room01", "room02", "room03", "room04", "room05"];
  const randomRoom = roomImages[Math.floor(Math.random() * roomImages.length)];
  return `./image/${randomRoom}.jpg`;
}
