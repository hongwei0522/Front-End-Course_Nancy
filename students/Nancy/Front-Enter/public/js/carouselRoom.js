const RoomImages = document.querySelectorAll(".contentPic");
const carouselImages = document.querySelectorAll(".sliderPic");
const left = document.querySelector(".leftArrow");
const right = document.querySelector(".rightArrow");
const carouselRoom = document.querySelector(".carouselRoom");
const slideRoom = document.querySelector(".slideRoom");
let index = 0;

// 直接操作 DOM 顯示/隱藏圖片
function showImage(index) {    
    // 確保所有圖片都隱藏
    carouselImages.forEach((img, i) => {
        if (i === index) {
            img.style.cssText = "display: block; opacity: 1;";
        } else {
            img.style.cssText = "display: none; opacity: 0;";
        }
    });
}

// 處理左箭頭點擊
left.onclick = function(e) {
    // 如果 left 是 <a href="#">，它的預設行為是跳轉頁面，這行可以防止頁面重新載入。
    // 如果 left 是一個 <button>，則通常不會影響，但仍可保險防止一些預設行為。
    e.preventDefault();
    // 防止點擊事件從 left 按鈕傳播到其他父層元素（例如 carousel 容器）
    e.stopPropagation();
    // 更新索引
    //即使 index 為 0，計算後會回到最後一張圖片，實現環狀輪播。這是因為加上長度後，結果永遠是正的。
    index = (index - 1 + carouselImages.length) % carouselImages.length;
    // 顯示新圖片
    showImage(index);
};
// 處理右箭頭點擊
right.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    // 更新索引
    index = (index + 1) % carouselImages.length;
    // 顯示新圖片
    showImage(index);
};

// 切換輪播器顯示
function toggleCarouselRoom(event) {
    event.stopPropagation();
    carouselRoom.classList.toggle('show');
    // 每次開啟時重置並顯示第一張圖片
    index = 0;
    showImage(index);
}
// 縮圖點擊事件
RoomImages.forEach((image, i) => {
    image.onclick = function(e) {
        e.preventDefault();
        toggleCarouselRoom(e);
        index = i;
        showImage(index);
    };
});
// 點擊外部關閉
document.addEventListener('click', function(e) {
    if (!slideRoom.contains(e.target) && 
        !left.contains(e.target) && 
        !right.contains(e.target)) {
        carouselRoom.classList.remove('show');
    }
});
// 初始化，確保輪播一開始就顯示正確的圖片，並確保 index 變數和畫面同步
document.addEventListener('DOMContentLoaded', function() {
    console.log("初始化輪播圖");
    showImage(index);
});