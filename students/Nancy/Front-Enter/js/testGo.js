const Aside = document.querySelector(".aside"); 
const TestGoContainer = document.querySelector(".testgoContainer"); 
const TestGogo = document.querySelectorAll(".testgogo"); 
const TestGo = document.querySelector(".testGo"); 
const Tbtns = document.querySelectorAll(".Tbtn"); 
const testEndBtn = document.querySelector(".testEnd .Tbtn"); 
const percent = document.querySelector(".percent"); 
let index = 0; // 目前顯示的題目索引
let userAnswers = []; // 儲存使用者選擇的答案 (數字陣列)

// 修改 schoolsData，使用 uid 作為 link
const schoolsData = [
    { name: "彭彭的課程教學", link: "-LNiP-cd31m_XrDZJxdl", scores: [5, 5, 5, 3, 4] },
    { name: "飛肯設計學苑", link: "-LNyOk-FQnejK4pZYqAi", scores: [5, 4, 5, 5, 4] },
    { name: "台大資訊系統訓練班", link: "-LNyPzKvn1h2QX_CDwET", scores: [5, 4, 4, 4, 4] },
    { name: "赫綵電腦", link: "-LNySD7c2UOilxjkW14U", scores: [2, 5, 3, 4, 5] },
    { name: "AppWorks School", link: "-LNyUA-GLYQyCACdkDjg", scores: [5, 5, 4, 4, 5] },
    { name: "五倍紅寶石", link: "-LNy_jj1Fj-HF0XbbRtb", scores: [5, 4, 3, 4, 4] },
    { name: "Udemy", link: "-LO17F-h-LN77A7uHJcV", scores: [2, 4, 4, 3, 5] },
    { name: "UXabc", link: "-LOvaej1H569KD4eXNZG", scores: [5, 5, 4, 4, 4] },
    { name: "六角學院", link: "-LNyYDaCeasm6O-nP8FE", scores: [3, 5, 4, 3, 4] }
];

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
        similarity += arr1[i] === arr2[i] ? 1 : 0;
    }
    return similarity;
}
// 尋找最適合的學校
function findMostSuitableSchool(userAnswers) {
    let bestSchool = null;
    let maxSimilarity = -1;
    schoolsData.forEach(school => {
        // 計算相似度
        const similarity = calculateSimilarity(userAnswers, school.scores);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestSchool = school;
        }
    });
    return bestSchool;
}
// 計算適合度百分比 (總分為 120, 但限制在 100%)
function calculateSuitabilityPercentage(userAnswers) {
    const totalPossibleScore = userAnswers.length * 5;// 每個問題最高分是 5
    const userScore = userAnswers.reduce((sum, score) => sum + score, 0);// 使用者總分
    let percentage = (userScore / totalPossibleScore) * 100;// 原始百分比
    percentage = Math.min(percentage, 100);// 限制最高 100%，確保 不超過 100%（防止意外超過最大值）
    return percentage;
}
// 為每個問題的答案按鈕添加事件監聽器
TestGogo.forEach((testGo, questionIndex) => {
    const answerButtons = testGo.querySelectorAll(".Tbtn");
    answerButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();// 阻止按鈕或連結的默認行為
            event.stopPropagation();// 防止影響到父層監聽
            let answerValue = parseInt(button.dataset.value);  // 將"3"字串轉換為3數字
            if (isNaN(answerValue)) {
                answerValue = 0;// 若 data-value 解析後為 NaN，則視為 0
            }
            userAnswers[questionIndex] = answerValue;// 儲存答案
            index = (index + 1) % TestGogo.length;// 移動到下一題，使用 %（模運算）確保索引不會超過陣列長度。（因為 7 % 7 = 0，回到第一題）
            updateImage();// 更新圖片

            // 如果是最後一題，計算結果
            if (index === 6) {
                // 尋找最適合的學校
                const bestSchool = findMostSuitableSchool(userAnswers);
                if (bestSchool) {
                    const suitabilityPercentage = calculateSuitabilityPercentage(userAnswers);// 計算適合度百分比

                    testEndBtn.classList.add('animate-school-name');
                    percent.classList.add('animate-percentage');

                    setTimeout(() => {
                        testEndBtn.classList.remove('animate-school-name');
                        percent.classList.remove('animate-percentage');
                        testEndBtn.textContent = `${bestSchool.name} `;
                        percent.textContent = `${suitabilityPercentage.toFixed(0)}%`;
                    }, 5000);

                    testEndBtn.addEventListener("click", () => {
                        window.location.href = `content?id=${bestSchool.link}&source=test`; // 保持 source=test 參數
                    });
                } else {
                    testEndBtn.textContent = "No suitable school found.";
                }
            }
        });
    });    
});

if (Aside) {
    Aside.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleTestContainer();
    });
}

if (TestGo) {
    TestGo.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleTestContainer();
    });
}

document.addEventListener("click", function (event) {
    if (!TestGoContainer.contains(event.target) && !Aside.contains(event.target)) {
        TestGoContainer.classList.remove('show');
    }
});

function toggleTestContainer() {
    if (!TestGoContainer.classList.contains('show')) {
        TestGoContainer.classList.add('show');
        updateImage();// 顯示第一張圖片
        index = 0;// 重置到第一張圖片
        userAnswers = [];// 清空之前的答案
    } else {
        TestGoContainer.classList.remove('show');
    }
}
