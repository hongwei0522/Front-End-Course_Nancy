const Aside = document.querySelector(".aside"); // 側邊欄按鈕
const TestGoContainer = document.querySelector(".testgoContainer"); // 整個測驗容器
const TestGogo = document.querySelectorAll(".testgogo"); // 每個測驗題目(圖片)
const TestGo = document.querySelector(".testGo"); // 首頁按鈕
const Tbtns = document.querySelectorAll(".Tbtn"); // 每個題目中的按鈕 (前進到下一題)
const testEndBtn = document.querySelector(".testEnd .Tbtn"); // 測驗結束頁面的按鈕
const percent = document.querySelector(".percent"); //百分比數字
let index = 0; // 目前顯示的題目索引
let userAnswers = []; // 儲存使用者選擇的答案 (數字陣列)

// 學校資料 (從您提供的試算表提取)
const schoolsData = [
    { name: "彭彭的課程教學", link: "1539507849063", scores: [5, 5, 5, 3, 4] },
    { name: "飛肯設計學苑", link: "1539507926566", scores: [5, 4, 5, 5, 4] },
    { name: "台大資訊系統訓練班", link: "1539507974337", scores: [5, 4, 4, 4, 4] },
    { name: "赫綵電腦", link: "1538646139879", scores: [2, 5, 3, 4, 5] },
    { name: "AppWorks School", link: "1538646651342", scores: [5, 5, 4, 4, 5] },
    { name: "五倍紅寶石", link: "1539674167504", scores: [5, 4, 3, 4, 4] },
    { name: "Udemy", link: "1539674056446", scores: [2, 4, 4, 3, 5] },
    { name: "UXabc", link: "1539673796376", scores: [5, 5, 4, 4, 4] },
    { name: "六角學院", link: "1538647714633", scores: [3, 5, 4, 3, 4] }
];

// 更新顯示的圖片
function updateImage() {
    // 這是一個條件判斷，i 是當前 forEach 迴圈中的索引值，而 index 是外部變數。
    TestGogo.forEach((img, i) => {
        img.style.display = i === index ? "block" : "none"; // 顯示目前索引的圖片
    });
}

// 計算兩個陣列的相似度 (簡單比較相同位置的元素是否相同)
function calculateSimilarity(arr1, arr2) {
    let similarity = 0;
    for (let i = 0; i < arr1.length; i++) {
        similarity += arr1[i] === arr2[i] ? 1 : 0; // 如果相同，相似度 + 1
    }
    return similarity;
}

// 尋找最適合的學校
function findMostSuitableSchool(userAnswers) {
    let bestSchool = null;
    let maxSimilarity = -1; //確保第一個學校一定會更新最大相似度
    schoolsData.forEach(school => {
        const similarity = calculateSimilarity(userAnswers, school.scores); // 計算相似度
        console.log(userAnswers);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity; // 更新最大相似度
            bestSchool = school; // 更新最適合的學校
        }
    });
    return bestSchool;
}

// 計算適合度百分比 (總分為 120, 但限制在 100%)
function calculateSuitabilityPercentage(userAnswers) {
    console.log(userAnswers);
    const totalPossibleScore = userAnswers.length * 5; // 每個問題最高分是 5
    const userScore = userAnswers.reduce((sum, score) => sum + score, 0); // 使用者總分
    let percentage = (userScore / totalPossibleScore) * 100; // 原始百分比
    percentage = Math.min(percentage, 100); // 限制最高 100%，確保 不超過 100%（防止意外超過最大值）
    return percentage;
}

// 為每個問題的答案按鈕添加事件監聽器
TestGogo.forEach((testGo, questionIndex) => {
    const answerButtons = testGo.querySelectorAll(".Tbtn"); // 選擇答案按鈕
    answerButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // 阻止按鈕或連結的默認行為
            event.stopPropagation(); // 防止影響到 document 監聽
            let answerValue = parseInt(button.dataset.value);  // 將"3"字串轉換為3數字
            if (isNaN(answerValue)) {
                answerValue = 0; // 若 data-value 解析後為 NaN，則視為 0
            }
            userAnswers[questionIndex] = answerValue; // 儲存答案
            index = (index + 1) % TestGogo.length; // 移動到下一題，使用 %（模運算）確保索引不會超過陣列長度。（因為 7 % 7 = 0，回到第一題）
            updateImage(); // 更新圖片

            // 如果是最後一題，計算結果
            if (index === 6) { 
                const bestSchool = findMostSuitableSchool(userAnswers); // 尋找最適合的學校
                if (bestSchool) {
                    const suitabilityPercentage = calculateSuitabilityPercentage(userAnswers); // 計算適合度百分比

                    // Add classes to trigger animations
                    testEndBtn.classList.add('animate-school-name');
                    percent.classList.add('animate-percentage');

                    // Set the final text after the animation is complete
                    setTimeout(() => {
                        testEndBtn.classList.remove('animate-school-name');
                        percent.classList.remove('animate-percentage');
                        testEndBtn.textContent = `${bestSchool.name} `; // 更新按鈕文字
                        percent.textContent = `${suitabilityPercentage.toFixed(0)}%`;// 更新百分比
                    }, 5000); // 5 seconds

                    testEndBtn.addEventListener("click", () => {
                        window.location.href = `content?id=${bestSchool.link}`; // 跳轉到學校連結
                    });
                } else {
                    testEndBtn.textContent = "No suitable school found."; // 如果沒有找到合適的學校
                }
            }
        });
    });    
});

// 監聽 Aside 點擊事件，開啟/關閉 TestGoContainer
if (Aside) {
    Aside.addEventListener("click", function (event) {
        event.stopPropagation(); // 防止冒泡影響到 document 監聽
        toggleTestContainer();
    });
}
if (TestGo) {
    TestGo.addEventListener("click", function (event) {
        event.stopPropagation(); // 防止冒泡影響到 document 監聽
        toggleTestContainer();
    });
}
// 監聽 document 點擊事件，關閉 TestGoContainer
document.addEventListener("click", function (event) {
    if (!TestGoContainer.contains(event.target) && !Aside.contains(event.target)) {
        TestGoContainer.classList.remove('show'); // 隱藏 TestGoContainer
    }
});

// 切換測驗容器顯示狀態的函數
function toggleTestContainer() {
    if (!TestGoContainer.classList.contains('show')) {
        TestGoContainer.classList.add('show');
        updateImage(); // 顯示第一張圖片
        index = 0; // 重置到第一張圖片
        userAnswers = []; // 清空之前的答案
    } else {
        TestGoContainer.classList.remove('show');
    }
}