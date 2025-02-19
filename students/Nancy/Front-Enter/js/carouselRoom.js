const RoomImages = document.querySelectorAll(".contentPic");
const carouselImages = document.querySelectorAll(".sliderPic");
const left = document.querySelector(".leftArrow");
const right = document.querySelector(".rightArrow");
const carouselRoom = document.querySelector(".carouselRoom");
const slideRoom = document.querySelector(".slideRoom")
let index = 0;

// 初始化顯示第一張圖片
function updateImage() {
    if (!carouselImages[index]) return; // 確保 index 不會超出範圍
    carouselImages.forEach((img, i) => {
        img.style.display = i === index ? "block" : "none";
    });
}

// 左箭頭點擊事件
left.addEventListener("click", function () {
    index = (index - 1 + carouselImages.length) % carouselImages.length; // 確保不會變成負數
    updateImage();
});

// 右箭頭點擊事件
right.addEventListener("click", function () {
    index = (index + 1) % carouselImages.length;
    updateImage();
});

// 初始化圖片顯示
updateImage();

function toggleCarouselRoom(event) {
    event.stopPropagation(); // 防止事件冒泡
    carouselRoom.classList.toggle('show');
}

// 點擊搜尋按鈕時，切換搜尋視窗
RoomImages.forEach(image => {
    image.addEventListener('click', toggleCarouselRoom);
});

// 點擊其他地方時，關閉搜尋視窗
document.addEventListener('click', function (event) {
    if (!slideRoom.contains(event.target)&& !left.contains(event.target)&& !right.contains(event.target)) {
        carouselRoom.classList.remove('show');
    }
});