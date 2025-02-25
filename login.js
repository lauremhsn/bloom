function showForm(type) {
    document.getElementById('selectionBox').style.display = 'none';
    document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = type === 'signup' ? 'block' : 'none';
}
function showSelection() {
    document.getElementById('selectionBox').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';

    resetForms(); //this isnt wokring I legit tried for like half an hour
}

function resetForms() {
    let allInputs = document.querySelectorAll("#signupForm input, #signupForm select, #signupForm textarea, #loginForm input");
    allInputs.forEach(input => {
        input.value = ""; 
        input.style.border = "2px solid var(--secondary-color)";
    });
    let errorMessages = document.querySelectorAll(".errorMessage");
    errorMessages.forEach(error => {
        error.innerHTML = "";
        error.style.display = "none";
    });
    document.getElementById("extraFields").innerHTML = "";
    let fileInput = document.getElementById("profilePic");
    if (fileInput) {
        fileInput.value = "";
    }
}
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let errorMessage = document.getElementById('signupError');
    let inputs = document.querySelectorAll('#signupForm input, #signupForm select, #signupForm textarea');
    let missingFields = [];
    let isValid = true;

    inputs.forEach(input => {
        if (input.type === 'file') {
            if (input.files.length === 0) {
                input.style.border = '2px solid red';
                missingFields.push("Profile Picture");
                isValid = false;
            } else {
                input.style.border = '2px solid var(--secondary-color)';
            }
        } else {
            if (!input.value.trim()) {
                input.style.border = '2px solid red';
                missingFields.push(input.placeholder || "A required field");
                isValid = false;
            } else {
                input.style.border = '2px solid var(--secondary-color)';
            }
        }
    });

    if (!isValid) {
        errorMessage.innerHTML = `⚠️ <strong>Nah-uh!</strong> Please fill out: <br> ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
        let profileType = document.getElementById('accountType').value;
        if (profileType === "beginner") {
            window.location.href =  "beginnerProfile.html";
        } else if (profileType === "pro") {
            window.location.href =  "professionalProfile.html";
        } else if (profileType === "business") {
            window.location.href =  "businessProfile.html";
        } else if (profileType === "ngo") {
            window.location.href =  "ngoProfile.html";
        }
    }
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let errorMessage = document.getElementById('loginError');
    let email = document.getElementById('loginEmail');
    let password = document.getElementById('loginPass');
    let missingFields = [];
    let isValid = true;

    if (!email.value.trim()) {
        email.style.border = '2px solid red';
        missingFields.push("Email");
        isValid = false;
    } else {
        email.style.border = '2px solid var(--secondary-color)';
    }

    if (!password.value.trim()) {
        password.style.border = '2px solid red';
        missingFields.push("Password");
        isValid = false;
    } else {
        password.style.border = '2px solid var(--secondary-color)';
    }

    if (!isValid) {
        errorMessage.innerHTML = `⚠️ <strong>Nah-uh!</strong> Please fill out: <br> ${missingFields.join(', ')}`;
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
        let profileType = document.getElementById('accountType').value;
        window.location.href =  "beginnerProfile.html";
    }
});

function showSuccessMessage(message, callback) {
    let successBox = document.createElement('div');
    successBox.className = 'success-box';
    successBox.innerHTML = message;
    document.body.appendChild(successBox);

    setTimeout(() => {
        successBox.remove();
        if (callback) callback();
    }, 2000);
}
document.getElementById('accountType').addEventListener('change', function() {
    let selectedType = this.value;
    let extraFields = document.getElementById('extraFields');

    extraFields.innerHTML = "";

    if (selectedType === "pro") {
        extraFields.innerHTML += `<input type="number" id="years-experience" placeholder="Years of Experience" required>`;
    } else if (selectedType === "business") {
        extraFields.innerHTML += `
            <select id="product-category">
                <option value="" disabled selected>Product Category</option>
                <option value="indoor">Indoor Plants</option>
                <option value="outdoor">Outdoor Plants</option>
                <option value="seeds">Seeds</option>
                <option value="care">Plant Care Products</option>
                <option value="decor">Home Decor</option>
            </select>
        `;
    } else if (selectedType === "ngo") {
        extraFields.innerHTML += `<textarea id="ngo-description" placeholder="Brief Description" required></textarea>`;
    }
});
