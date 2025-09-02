// 表單驗證函式
function validateForm(email, password) {
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push("請輸入電子郵件");
  } else if (!emailRegex.test(email)) {
    errors.push("請輸入有效的電子郵件格式");
  }

  if (!password) {
    errors.push("請輸入密碼");
  } else {
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
  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  if (errors.length > 0) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "red";
    errorDiv.style.marginTop = "10px";
    errorDiv.innerHTML = errors.join("<br>");

    const form = document.querySelector(".loginContainer") || document.body;
    form.appendChild(errorDiv);
    return false;
  }
  return true;
}

// 顯示成功訊息函式
function showSuccess(message) {
  const existingError = document.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.style.color = "green";
  successDiv.style.marginTop = "10px";
  successDiv.innerHTML = message;

  const form = document.querySelector(".loginContainer") || document.body;
  form.appendChild(successDiv);
}

export { validateForm, showErrors, showSuccess };
