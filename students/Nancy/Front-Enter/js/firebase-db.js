import { getDatabase, ref, onValue, update, off } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { app } from './firebase.js';

const database = getDatabase(app);
const auth = getAuth(app);

// DOM 元素
let Edit, EditIng, Ensure, Cancel, TInputs, nameInput, phoneInput, mailInput;

// 初始化 DOM 元素
function initializeElements() {
    Edit = document.querySelector(".edit");
    EditIng = document.querySelector(".editBtns");
    Ensure = document.querySelector(".ensure");
    Cancel = document.querySelector(".cancel");
    TInputs = document.querySelectorAll(".tInput");
    nameInput = document.querySelector(".tName");
    phoneInput = document.querySelector(".tPhone");
    mailInput = document.querySelector(".tMail");

    // 只有在所有必要元素都存在時才添加事件監聽器
    if (Edit && Cancel && Ensure) {
        Edit.addEventListener("click", handleEditClick);
        Cancel.addEventListener("click", handleCancelClick);
        Ensure.addEventListener("click", handleEnsureClick);
    }
}

// 處理編輯按鈕點擊
function handleEditClick() {
    if (!Edit || !EditIng || !TInputs) return;
    //編輯狀態中
    Edit.classList.toggle('hidden');
    EditIng.classList.remove('hidden');
    
    TInputs.forEach(input => {
        input.readOnly = false;
        input.style.border = "1px solid #ccc";
    });
}

// 處理取消按鈕點擊
function handleCancelClick() {
    if (!Edit || !EditIng || !TInputs) return;
    //非編輯狀態中
    Edit.classList.remove('hidden');
    EditIng.classList.add('hidden');
    
    TInputs.forEach(input => {
        input.readOnly = true;
        input.style.border = "0px solid black";
    });
    //獲取用戶數據
    loadUserData();
}

// 處理確認按鈕點擊
function handleEnsureClick() {
    if (!Edit || !EditIng || !TInputs) return;
    //使用者點擊確認後
    saveUserData();
    
    Edit.classList.remove('hidden');
    EditIng.classList.add('hidden');
    
    TInputs.forEach(input => {
        input.readOnly = true;
        input.style.border = "0px solid black";
    });
}

// 保存用戶數據到 Firebase
async function saveUserData() {
    if (!auth.currentUser || !nameInput || !phoneInput || !mailInput) {
        console.error("沒有登入的用戶或找不到必要的輸入欄位");
        return;
    }

    const updatedData = {
        name: nameInput.value,
        phone: phoneInput.value || "未設定電話",
        email: mailInput.value
    };

    try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        // update() 是 Firebase Realtime Database 提供的 API，用來更新資料庫中特定路徑的值。
        // update() 會回傳一個 Promise，所以 await 讓程式碼暫停執行，直到更新完成。
        // 若沒有 await，程式碼會直接執行 loadUserData();，但此時資料庫可能尚未完成更新，導致讀取的仍是舊資料。
        await update(userRef, updatedData);
        console.log('使用者數據更新成功');
        
        loadUserData();
    } catch (error) {
        console.error("使用者數據更新失敗:", error);
    }
}

// 從 Firebase 獲取用戶數據
function loadUserData() {
    if (!auth.currentUser || !nameInput || !phoneInput || !mailInput) {
        console.error("沒有登入的用戶或找不到必要的輸入欄位");
        return;
    }
    const userRef = ref(database, `users/${auth.currentUser.uid}`);
    off(userRef); // 先移除舊的監聽，這樣可以確保每次登入時，不會產生多個 onValue() 監聽，避免記憶體洩漏或效能問題
    // 會監聽 userRef 這個資料庫位置，當資料發生變更時，自動觸發回調函式
    onValue(userRef, (snapshot) => {
        //快照 (snapshot.val()) 取得當前資料
        // snapshot.val() 會返回當前資料庫存儲的物件。
        // 若資料存在，則將 nameInput.value、phoneInput.value 和 mailInput.value 設為資料庫中的值。
        const userData = snapshot.val();
        if (userData) {
            nameInput.value = userData.name || auth.currentUser.displayName || '';
            phoneInput.value = userData.phone || "";
            mailInput.value = userData.email || auth.currentUser.email || '';
        } else {
            nameInput.value = auth.currentUser.displayName || '';
            phoneInput.value = "未設定電話";
            mailInput.value = auth.currentUser.email || '';
            //將這些初始資料寫入 Firebase
            saveUserData();
        }
    });
}

//監聽登入/登出狀態，當使用者登入或登出時，會自動觸發這個回調函式
auth.onAuthStateChanged((user) => {
    if (!nameInput || !phoneInput || !mailInput) return;
    
    if (user) {
        // 若 user 存在（代表使用者登入），則執行 loadUserData(); 來載入該使用者的資料
        loadUserData();
    } else {
        // 若 user 為 null（代表使用者登出），則清空 nameInput、phoneInput 和 mailInput，避免顯示錯誤資訊
        nameInput.value = '';
        phoneInput.value = '';
        mailInput.value = '';
    }
});

// 當 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    
    if (TInputs) {
        TInputs.forEach(input => {
            input.readOnly = true;
            input.style.border = "0px solid black";
        });
    }
    
    if (auth.currentUser) {
        loadUserData();
    }
});