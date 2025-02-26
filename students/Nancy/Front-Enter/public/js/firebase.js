import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {  
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    updateProfile, 
    signOut, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,  
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirebaseConfig } from './config.js';


const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
auth.languageCode = 'en';

// Google 登入提供者設置
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    //避免 Google 自動選擇當前已登入的帳號
    'prompt': 'select_account'  // 強制用戶選擇帳號
});

// 添加必要的 scope
provider.addScope('email');
provider.addScope('profile');



// 更新使用者資料函式
async function updateUserProfile(user) {

    if (!user) {
        console.error("❌ 沒有用戶資料");
        return;
    }

    try {
        // 如果用戶沒有顯示名稱，則使用 email 的前綴作為名稱
        // 等待 Firebase 更新使用者的顯示名稱
        if (!user.displayName) {
            console.log("⚠️ 用戶沒有顯示名稱，準備更新");
            // updateProfile()是一個回傳 Promise 的函式。
            // await會暫停此函式的執行，直到updateProfile()完成，然後繼續執行console.log("✅ 名稱更新成功");。
            // 如果沒有await，程式會直接執行下一行，而不會等到 Firebase 更新完成。
            await updateProfile(user, {
                displayName: user.email.split('@')[0]
            });
            console.log("✅ 名稱更新成功");
        }

        // 查找並記錄所有相關元素
        const elements = {
            name: document.querySelector(".tName"),
            phone: document.querySelector(".tPhone"),
            mail: document.querySelector(".tMail"),
            pic: document.querySelector(".personPic"),
            picNav: document.querySelector(".profileitem")
        };


        // 更新輸入框的值
        if (elements.name) {
            // 這行程式碼的目的是從 使用者的 Email 地址 中 提取名稱部分（@ 符號前面的部分）
            elements.name.value = user.displayName || user.email.split('@')[0];
            elements.name.setAttribute('readonly', 'true');  // 預設設為唯讀
        }
        if (elements.phone) {
            elements.phone.value = user.phoneNumber || "未設定電話";
            elements.phone.setAttribute('readonly', 'true');  // 預設設為唯讀
        }
        if (elements.mail) {
            elements.mail.value = user.email;
            elements.mail.setAttribute('readonly', 'true');  // 預設設為唯讀
        }

        // 更新頭像
        const picStyle = {
            // 使用some，尋找條件符合的data，只要有任一個符合條件，回傳true
            backgroundImage: user.providerData.some(provider => provider.providerId === "password")
            ? `url("./image/default.jpg")` // 一般登入使用新的預設頭像
            : `url(${user.photoURL || "./default-avatar.png"})`, // Google 登入使用 Google 頭像
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "50%"
        };

        if (elements.pic) {
            Object.assign(elements.pic.style, picStyle, {
                width: "100px",
                height: "100px"
            });
        }

        if (elements.picNav) {
            Object.assign(elements.picNav.style, picStyle, {
                width: "50px",
                height: "50px"
            });
        }

        return true; // 表示更新成功
    } catch (error) {
        console.error("❌ 更新過程發生錯誤:", error);
        return false; // 表示更新失敗
    }
}
// Google 登入按鈕處理
const googleLogin = document.getElementById("googleLoginBtn");
// Google 登入按鈕修正
if (googleLogin) {
    googleLogin.addEventListener("click", async function () {
        try {
            // 使用 Google 登入，等待 Firebase 回應
            //signInWithPopup() 是Firebase 的非同步 API，它會開啟 Google 登入視窗，等待用戶登入後回傳 result。
            const result = await signInWithPopup(auth, provider);
            
            // 等 Firebase 回應成功後，再更新用戶資料
            const updated = await updateUserProfile(result.user);
            if (updated) {
                window.location.href = "./profile.html";
            }
        } catch (error) {
            console.error("❌ Google 登入失敗:", error);
        }
    });
}

// 表單驗證函式
function validateForm(email, password) {
    const errors = [];
    
    // Email 驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errors.push("請輸入電子郵件");
    } else if (!emailRegex.test(email)) {
        errors.push("請輸入有效的電子郵件格式");
    }
    
    // 密碼驗證
    if (!password) {
        errors.push("請輸入密碼");
    } else {
        // 密碼強度檢查
        if (password.length < 8) {
            errors.push("密碼長度至少需要8個字元");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("密碼需要包含至少一個大寫字母");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("密碼需要包含至少一個小寫字母");
        }
        if (!/[0-9]/.test(password)) {
            errors.push("密碼需要包含至少一個數字");
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push("密碼需要包含至少一個特殊字元 (!@#$%^&*)");
        }
    }
    
    return errors;
}

// 顯示錯誤訊息函式
function showErrors(errors) {
    // 移除現有的錯誤訊息
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (errors.length > 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        errorDiv.innerHTML = errors.join('<br>');
        
        // 插入錯誤訊息到表單後面
        const form = document.querySelector('.loginContainer') || document.body;
        form.appendChild(errorDiv);
        return false;
    }
    return true;
}

// Email 登入
const loginEmailPassword = async () => {
    const txtPassword = document.querySelector('.inputPassword');
    const txtEmail = document.querySelector('.inputEmail');
    
    if (!txtEmail || !txtPassword) {
        console.error("❌ 找不到登入表單元素");
        return;
    }

    const errors = validateForm(txtEmail.value, txtPassword.value);
    if (!showErrors(errors)) {
        return;
    }

    try {
        console.log("🔍 開始 Email 登入流程");
        const userCredential = await signInWithEmailAndPassword(
            auth,
            txtEmail.value,
            txtPassword.value
        );
        
        // 清除密碼欄位
        txtPassword.value = '';
        
        // 先更新用戶資料
        const updated = await updateUserProfile(userCredential.user);
        if (updated) {
            window.location.href = "./profile.html";
        }
    } catch (error) {
        console.error("❌ Email 登入失敗:", error);
        let errorMessage = "登入失敗";
        
        // 處理特定錯誤碼
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = "找不到該用戶";
                break;
            case 'auth/wrong-password':
                errorMessage = "密碼錯誤";
                break;
            case 'auth/invalid-email':
                errorMessage = "無效的電子郵件格式";
                break;
            case 'auth/too-many-requests':
                errorMessage = "登入嘗試次數過多，請稍後再試";
                break;
        }
        
        showErrors([errorMessage]);
    }
};
// onAuthStateChanged()是Firebase內建的監聽函式，當用戶登入或登出時，它會自動執行
onAuthStateChanged(auth, async (user) => {
    updateNavigation(user);

    // 確認當前頁面是否是 profile.html（用戶個人頁面）
    // 如果用戶已登入，則更新 UI 中的使用者資料
    if (window.location.pathname.includes('profile.html') && user) {
        await updateUserProfile(user);
    }
});

// 更新導覽列函式
function updateNavigation(user) {
    const profileItem = document.querySelector(".profileitem");
    const loginContainer = document.querySelector('.loginContainer');
    
    if (!profileItem) return;

    // 基本樣式設定 - 所有狀態都會有的樣式
    // Object.assign() 用來 合併/修改 物件的屬性，如果有同樣屬性會被覆蓋
    Object.assign(profileItem.style, {
        cursor: 'pointer'
    });

    // 點擊處理函式
    const handleProfileClick = (event) => {
        if (!user && loginContainer) {
            event.preventDefault();
            event.stopPropagation();
            loginContainer.classList.toggle('active');
        }
    };

    // 點擊其他地方關閉登入視窗
    if (loginContainer) {
        document.addEventListener('click', function(event) {
            if (!loginContainer.contains(event.target) && !profileItem.contains(event.target)) {
                loginContainer.classList.remove('active');
            }
        });
    }

    if (user) {
        // some用來檢查陣列中是否「至少有一個」元素符合條件
        // 取出 providerData 陣列中的 每個 provider 物件，檢查這個 providerId 是否是 "password"
        if (user.providerData.some(provider => provider.providerId === "password")) {
            // 一般登入（Email/密碼）
            profileItem.innerHTML = "";
            profileItem.href = "profile.html";
            Object.assign(profileItem.style, {
                backgroundImage: `url("./image/default.jpg")`, // 使用新的預設頭像
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "inline-block"
            });
        } else if (user.providerData.some(provider => provider.providerId === "google.com")) {
            // Google 登入
            profileItem.innerHTML = "";
            profileItem.href = "profile.html";
            Object.assign(profileItem.style, {
                backgroundImage: `url(${user.photoURL || "./default-avatar.png"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "inline-block"
            });
        }
    } else {
        // 用戶未登入
        Object.assign(profileItem.style, {
            backgroundImage: "none",
            width: "auto",    // 移除固定寬度
            height: "auto"    // 移除固定高度
        });
        profileItem.innerHTML = "登入";
        profileItem.removeAttribute("href");
    }

    // 移除舊的事件監聽器並添加新的
    // 這行代碼複製 profileItem 節點，並且 true 代表深度複製，也就是說不僅複製該節點，還會複製它的所有子節點。
    // newProfileItem 現在是一個與 profileItem 內容相同的新元素，但它與 profileItem 是兩個獨立的 DOM 節點。
    const newProfileItem = profileItem.cloneNode(true);
    // profileItem.parentNode 取得 profileItem 的父節點。
    // 這行代碼用 newProfileItem 替換 profileItem。
    // 這樣，新的 newProfileItem 就會出現在原來 profileItem 的位置，而舊的 profileItem 被移除。
    profileItem.parentNode.replaceChild(newProfileItem, profileItem);
    newProfileItem.addEventListener('click', handleProfileClick);
}

// 註冊新帳號
const createAccount = async () => {
    const txtPassword = document.querySelector('.inputPassword');
    const txtEmail = document.querySelector('.inputEmail');
    
    if (!txtEmail || !txtPassword) {
        console.error("❌ 找不到註冊表單元素");
        return;
    }

    const errors = validateForm(txtEmail.value, txtPassword.value);
    if (!showErrors(errors)) {
        return;
    }

    try {
        // 建立 Firebase 用戶
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            txtEmail.value,
            txtPassword.value
        );
        
        // 清除密碼欄位
        txtPassword.value = '';
        
        // 顯示成功訊息
        showErrors(["註冊成功！"]);
        
        // 可選：自動登入
        // 取得剛剛註冊成功的 userCredential.user
        // 更新 用戶的個人資訊（通常是設定 displayName）
        await updateUserProfile(userCredential.user);
        window.location.href = "./profile.html";
    } catch (error) {
        console.error("❌ 註冊失敗:", error);
        let errorMessage = "註冊失敗";
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "此電子郵件已被使用";
                break;
            case 'auth/invalid-email':
                errorMessage = "無效的電子郵件格式";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "此註冊方式目前不可用";
                break;
            case 'auth/weak-password':
                errorMessage = "密碼強度不足";
                break;
        }
        
        showErrors([errorMessage]);
    }
};

// 綁定登入和註冊按鈕
const btnLogin = document.querySelector('.loginIn');
const btnSignup = document.querySelector('.registerIn');

if (btnLogin) {
    btnLogin.addEventListener("click", loginEmailPassword);
} else {
    console.log("ℹ️ .loginIn 按鈕不存在於當前頁面");
}

if (btnSignup) {
    btnSignup.addEventListener("click", createAccount);
} else {
    console.log("ℹ️ .registerIn 按鈕不存在於當前頁面");
}

// 登出函式
const logout = async () => {
    try {
        //signOut() 會執行非同步登出，登出後 Firebase 會觸發 onAuthStateChanged()
        //await 讓函式等待登出完成後，才執行 console.log() 和 window.location.href = "./"
        //await signOut(auth) 確保用戶確實登出後才執行後續動作
        await signOut(auth);
        window.location.href = "./";
    } catch (error) {
        console.error("❌ 登出失敗:", error);
    }
};
// 登出按鈕處理
const btnLogout = document.querySelector(".loginOut");
if (btnLogout) {
    btnLogout.addEventListener("click", logout);
} else {
    console.log("ℹ️ .loginOut 按鈕不存在於當前頁面");
}
export { app };