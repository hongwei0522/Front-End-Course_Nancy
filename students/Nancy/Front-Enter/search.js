const searchBtn = document.querySelector('.navSearch');
const searchModal = document.querySelector('.wrap');

// 點擊搜尋按鈕時，切換視窗顯示/隱藏
function toggleSearchModal(event) {
    event.stopPropagation(); // 防止事件冒泡
    searchModal.classList.toggle('active');
}

// 點擊搜尋按鈕時，切換搜尋視窗
searchBtn.addEventListener('click', toggleSearchModal);

// 點擊其他地方時，關閉搜尋視窗
document.addEventListener('click', function (event) {
    if (!searchModal.contains(event.target) && !searchBtn.contains(event.target)) {
        searchModal.classList.remove('active');
    }
});