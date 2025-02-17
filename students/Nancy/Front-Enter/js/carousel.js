const images = document.querySelectorAll(".carousel img");
let index = 0;

function showNextImage() {
    images[index].classList.remove("active"); // 隱藏當前圖片
    setTimeout(() => {
        images[index].style.display = "none"; // 完全隱藏舊圖片，避免佔據空間
        index = (index + 1) % images.length; // 切換到下一張圖片
        images[index].style.display = "block"; // 確保新的圖片顯示
        images[index].classList.add("active"); // 讓新的圖片淡入
    }, 500); // 0.5 秒黑色背景
}

setInterval(showNextImage, 5500); // 5 秒圖片顯示 + 0.5 秒空白