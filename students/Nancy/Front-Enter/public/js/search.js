// DOM 節點
const searchBtn = document.querySelector(".navSearch");
const searchModal = document.querySelector(".wrap");
const searchDivModal = document.querySelector(".searchDiv");
const searchInput = document.querySelector(".searchBar");
const voiceBtn = document.querySelector(".voiceBtn");

// 切換搜尋視窗
export function toggleSearchModal(event) {
  event.stopPropagation();
  searchModal.classList.toggle("active");
  searchDivModal.classList.toggle("active");
}

// 關閉搜尋視窗
export function hideSearchModal() {
  searchInput.value = "";
  searchModal.classList.remove("active");
  searchDivModal.classList.remove("active");
}

// 監聽搜尋按鈕切換
searchBtn.addEventListener("click", toggleSearchModal);

// 點擊空白處關閉搜尋視窗
document.addEventListener("click", function (event) {
  if (
    !searchModal.contains(event.target) &&
    !searchBtn.contains(event.target)
  ) {
    hideSearchModal();
  }
});

// 監聽 Enter 鍵事件
export function attachSearchEnterKey(handleSearch) {
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleSearch(searchInput.value.trim());
      hideSearchModal();
    }
  });
}

// 語音辨識功能
export function attachVoiceRecognition(handleSearch) {
  voiceBtn.addEventListener("click", function () {
    if (!("webkitSpeechRecognition" in window)) {
      alert("你的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "zh-TW";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.start();

    recognition.onstart = () => voiceBtn.classList.add("listening");
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      setTimeout(() => handleSearch(transcript), 2000);
      hideSearchModal();
    };
    recognition.onerror = (event) =>
      console.error("語音辨識錯誤:", event.error);
    recognition.onend = () => voiceBtn.classList.remove("listening");
  });
}

// 取得搜尋關鍵字
export function getSearchKeyword() {
  return searchInput.value.trim();
}
