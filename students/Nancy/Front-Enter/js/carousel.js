document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".carousel img");
    let index = 0;

    if (images.length === 0) return; // 防止 images 陣列為空時執行錯誤

    images.forEach((img, i) => {
        img.style.display = i === 0 ? "block" : "none"; // 只顯示第一張圖片
    });

    function showNextImage() {
        if (!images[index]) return; // 避免 undefined 錯誤
        
        images[index].classList.remove("active"); // 隱藏當前圖片
        setTimeout(() => {
            images[index].style.display = "none"; // 完全隱藏舊圖片
            index = (index + 1) % images.length; // 切換到下一張圖片
            images[index].style.display = "block"; // 顯示新圖片
            images[index].classList.add("active"); // 淡入新圖片
        }, 500); // 0.5 秒黑色背景
    }

    setInterval(showNextImage, 5500); // 5 秒圖片顯示 + 0.5 秒空白
});
