import { getDatabase, ref, push, onValue, off, remove, update } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { app } from './firebase.js';

const database = getDatabase(app);
const auth = getAuth(app);

// DOM 元素
const className = document.getElementById("className");
const topic = document.getElementById("topic");
const content = document.getElementById("content");
const city = document.getElementById("city");
const classType = document.getElementById("classType");
const teachWay = document.getElementById("teachWay");
const totalDay = document.getElementById("totalDay");
const weekHour = document.getElementById("weekHour");
const technology = document.getElementById("technology");
const mail = document.getElementById("mail");
const phone = document.getElementById("phone");
const publishBtn = document.getElementById("publishBtn");
const cancelBtn = document.getElementById("cancelPostBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const ensureDeleteBtn = document.getElementById("ensureDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const list = document.getElementById("list");

// 區塊顯示控制
const postSection = document.querySelector('.postSection');
const readSection = document.querySelector('.ReadSection');
const havePost = document.querySelector('.havePost');
const newPostBtn = document.querySelector('.newPost');
const deletePost = document.querySelector('.deletePost');

// 刪除模式狀態
let isDeleteMode = false;

// 初始化頁面顯示
function initializePage() {
    if (postSection && readSection) {
        postSection.style.display = 'none';
        readSection.style.display = 'block';
    }
    // 初始隱藏所有操作按鈕
    if (saveEditBtn) saveEditBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
    if (ensureDeleteBtn) ensureDeleteBtn.style.display = 'none';
    if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
}

// 處理發布貼文按鈕點擊
if (newPostBtn) {
    newPostBtn.addEventListener('click', () => {
        if (postSection && readSection) {
            postSection.style.display = 'block';
            readSection.style.display = 'none';
            if (publishBtn) publishBtn.style.display = 'block';
            if (cancelBtn) cancelBtn.style.display = 'block';
            if (saveEditBtn) saveEditBtn.style.display = 'none';
            if (cancelEditBtn) cancelEditBtn.style.display = 'none';
            if (ensureDeleteBtn) ensureDeleteBtn.style.display = 'none';
            if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
        }
    });
}

// 處理查看貼文按鈕點擊
if (havePost) {
    havePost.addEventListener('click', () => {
        if (postSection && readSection) {
            postSection.style.display = 'none';
            readSection.style.display = 'block';
            exitDeleteMode();
        }
    });
}

// 處理取消發文按鈕點擊
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        if (postSection && readSection) {
            postSection.style.display = 'none';
            readSection.style.display = 'block';
            clearInputs();
        }
    });
}

// 進入刪除模式
function enterDeleteMode() {
    isDeleteMode = true;
    loadPosts(true);
    if (ensureDeleteBtn) ensureDeleteBtn.style.display = 'block';
    if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'block';
    if (publishBtn) publishBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (saveEditBtn) saveEditBtn.style.display = 'none';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
}

// 退出刪除模式
function exitDeleteMode() {
    isDeleteMode = false;
    loadPosts(false);
    if (ensureDeleteBtn) ensureDeleteBtn.style.display = 'none';
    if (cancelDeleteBtn) cancelDeleteBtn.style.display = 'none';
}

// 清空所有輸入欄位
function clearInputs() {
    const inputs = [className, topic, content, city, classType, teachWay, 
                   totalDay, weekHour, technology, mail, phone];
    inputs.forEach(input => {
        if (input) 
            input.value = '';
    });
}

// 檢查用戶登入狀態
function checkAuthState() {
    const user = auth.currentUser;
    if (!user) {
        console.log('用戶未登入');
        if (list) {
            list.innerHTML = '<p>請先登入，文章才會出現:)</p>';
        }
        return false;
    }
    return true;
}

// 在每個文章中添加編輯按鈕
function loadPosts(deleteMode = false) {
    //ref(database, 'posts')：從 Firebase Realtime Database 取得 posts 節點的參照 (Reference)。
    // off(postsRef)：關閉對 postsRef 的監聽，以確保不會重複綁定監聽器。
    const postsRef = ref(database, 'posts');
    off(postsRef);

    // 添加載入中的提示訊息
    if (list) {
        list.innerHTML = '<div class="loading-message">文章正在路上...</div>';
    }
    // onValue(postsRef, callback)：監聽 postsRef 節點的變化，當資料更新時執行回調函式。
    // snapshot.val() 取得 posts 節點的所有資料。
    onValue(postsRef, (snapshot) => {
        if (!list) return;
        
        const posts = snapshot.val();
        
        while (list.firstChild) {
            //每次載入文章前，先移除 list 裡所有子元素，以確保列表不會累積舊的資料。
            list.removeChild(list.firstChild);
        }
        
        if (posts) {
            // Object.entries(posts)：將 posts 物件轉換為 [id, post] 陣列。
            Object.entries(posts)
                // .sort(([, a], [, b]) => b.createdAt - a.createdAt)：按照 createdAt（建立時間）由新到舊排序。
                .sort(([, a], [, b]) => b.createdAt - a.createdAt)
                .forEach(([id, post]) => {
                    const container = document.createElement('div');
                    container.className = 'post-container';

                    if (deleteMode) {
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'delete-checkbox';
                        checkbox.dataset.postId = id;
                        container.appendChild(checkbox);
                    }

                    const details = document.createElement('details');
                    details.className = 'accordion-item';

                    const summary = document.createElement('summary');
                    summary.className = 'accordion-header';
                    summary.textContent = post.className;

                    const body = document.createElement('div');
                    body.className = 'accordion-body';
                    
                    // 添加編輯按鈕容器
                    const editButtonContainer = document.createElement('div');
                    editButtonContainer.className = 'edit-button-container';
                    editButtonContainer.style.display = 'none'; // 初始隱藏
                    
                    const editButton = document.createElement('button');
                    editButton.className = 'profileBtn edit-btn';
                    editButton.textContent = '編輯貼文';
                    editButton.dataset.postId = id;
                    editButton.addEventListener('click', () => {
                        // 填充表單數據
                        className.value = post.className;
                        topic.value = post.topic;
                        content.value = post.content;
                        city.value = post.city;
                        classType.value = post.classType;
                        teachWay.value = post.teachWay;
                        totalDay.value = post.totalDay;
                        weekHour.value = post.weekHour;
                        technology.value = post.technology;
                        mail.value = post.mail;
                        phone.value = post.phone;

                        // 切換到編輯模式
                        postSection.style.display = 'block';
                        readSection.style.display = 'none';
                        publishBtn.style.display = 'none';
                        cancelBtn.style.display = 'none';
                        saveEditBtn.style.display = 'block';
                        cancelEditBtn.style.display = 'block';
                        
                        // 儲存當前編輯的文章ID
                        saveEditBtn.dataset.editingPostId = id;
                    });
                    
                    editButtonContainer.appendChild(editButton);

                    body.innerHTML = `
                        <div><strong>主題:</strong> ${post.topic}</div>
                        <div><strong>內容:</strong> ${post.content}</div>
                        <div><strong>城市:</strong> ${post.city}</div>
                        <div><strong>班制:</strong> ${post.classType}</div>
                        <div><strong>教法:</strong> ${post.teachWay}</div>
                        <div><strong>天數:</strong> ${post.totalDay}</div>
                        <div><strong>週時:</strong> ${post.weekHour}</div>
                        <div><strong>技術:</strong> ${post.technology}</div>
                        <div><strong>信箱:</strong> ${post.mail}</div>
                        <div><strong>電話:</strong> ${post.phone}</div>
                    `;
                    
                    body.appendChild(editButtonContainer);
                    details.appendChild(summary);
                    details.appendChild(body);
                    container.appendChild(details);
                    list.appendChild(container);

                    // 監聽摺疊展開事件
                    details.addEventListener('toggle', function() {
                        //this 指向綁定事件的元素，也就是這個 details
                        const buttonContainer = this.querySelector('.edit-button-container');
                        if (this.open) {
                            // 確保畫面中最多只會有一個 <details> 是展開的，並且只顯示對應的編輯按鈕
                            document.querySelectorAll('.accordion-item[open]').forEach(item => {
                                if (item !== this) {
                                    item.removeAttribute('open');
                                    const otherButtonContainer = item.querySelector('.edit-button-container');
                                    if (otherButtonContainer) {
                                        otherButtonContainer.style.display = 'none';
                                    }
                                }
                            });
                            // 顯示當前展開項目的編輯按鈕
                            if (buttonContainer) {
                                buttonContainer.style.display = 'block';
                            }
                        } else {
                            // 隱藏已關閉項目的編輯按鈕
                            if (buttonContainer) {
                                buttonContainer.style.display = 'none';
                            }
                        }
                    });
                });
        }
    });
}

// 添加更新文章的功能
async function updatePost(postId) {
    if (!checkAuthState()) {
        alert('請先登入再編輯文章');
        return;
    }

    const postData = {
        className: className.value,
        topic: topic.value,
        content: content.value,
        city: city.value,
        classType: classType.value,
        teachWay: teachWay.value,
        totalDay: totalDay.value,
        weekHour: weekHour.value,
        technology: technology.value,
        mail: mail.value,
        phone: phone.value,
        userId: auth.currentUser.uid,
        updatedAt: Date.now()
    };

    try {
        // ref(database, 'posts/${postId}') 會返回一個指向 posts 節點中具體文章（由 postId 指定）的參照。
        const postRef = ref(database, `posts/${postId}`);
        // await 等待 update(postRef, postData) 完成，即資料被更新到 Firebase
        await update(postRef, postData);
        alert('文章更新成功！');
        clearInputs();
        
        // 返回列表頁面
        postSection.style.display = 'none';
        readSection.style.display = 'block';
        loadPosts();
    } catch (error) {
        console.error('更新文章失敗:', error);
        alert('更新文章失敗: ' + error.message);
    }
}

// 監聽儲存編輯按鈕
if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
        // editingPostId是儲存當前編輯的文章ID
        const postId = saveEditBtn.dataset.editingPostId;
        if (postId) {
            updatePost(postId);
        }
    });
}

// 監聽取消編輯按鈕
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        clearInputs();
        postSection.style.display = 'none';
        readSection.style.display = 'block';
    });
}

// 儲存文章到 Firebase
async function savePost() {
    if (!checkAuthState()) {
        alert('請先登入再發布文章');
        return;
    }

    const postData = {
        className: className.value,
        topic: topic.value,
        content: content.value,
        city: city.value,
        classType: classType.value,
        teachWay: teachWay.value,
        totalDay: totalDay.value,
        weekHour: weekHour.value,
        technology: technology.value,
        mail: mail.value,
        phone: phone.value,
        userId: auth.currentUser.uid,
        createdAt: Date.now()
    };

    try {
        const postsRef = ref(database, 'posts');
        await push(postsRef, postData);
        alert('文章發布成功！');
        clearInputs();
        
        // 返回列表頁面
        if (postSection && readSection) {
            postSection.style.display = 'none';
            readSection.style.display = 'block';
        }
        loadPosts();
    } catch (error) {
        console.error('發布文章失敗:', error);
        alert('發布文章失敗: ' + error.message);
    }
}

// 刪除選中的文章
async function deleteSelectedPosts() {
    const selectedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('請選擇要刪除的文章');
        return;
    }

    const confirmDelete = confirm('確定要刪除選中的文章嗎？');
    if (!confirmDelete) {
        return;
    }

    try {
        for (const checkbox of selectedCheckboxes) {
            const postId = checkbox.dataset.postId;
            const postRef = ref(database, `posts/${postId}`);
            await remove(postRef);
        }
        
        alert('文章刪除成功！');
        exitDeleteMode();
    } catch (error) {
        console.error('刪除文章失敗:', error);
        alert('刪除文章失敗: ' + error.message);
    }
}

// 監聽發布按鈕點擊事件
if (publishBtn) {
    publishBtn.addEventListener("click", savePost);
}

// 監聽刪除相關按鈕
if (deletePost) {
    deletePost.addEventListener('click', () => {
        if (postSection && readSection) {
            postSection.style.display = 'none';
            readSection.style.display = 'block';
            enterDeleteMode();
        }
    });
}

if (ensureDeleteBtn) {
    ensureDeleteBtn.addEventListener('click', deleteSelectedPosts);
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', exitDeleteMode);
}

// 當網頁載入時執行初始化
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    
    // 監聽用戶登入狀態
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('用戶已登入:', user.email);
            loadPosts();
        } else {
            console.log('用戶未登入');
            if (list) {
                list.innerHTML = '<p>請登入以查看文章</p>';
            }
        }
    });
});