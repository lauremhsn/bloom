function showForm(type) {
    document.getElementById('selectionBox').style.display = 'none';
    document.getElementById('loginForm').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('signupForm').style.display = type === 'signup' ? 'block' : 'none';
}

function showSelection() {
    document.getElementById('selectionBox').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    resetForms(); 
}

function resetForms() {
    let allInputs = document.querySelectorAll("#signupForm input, #signupForm select, #signupForm textarea, #loginForm input");
    allInputs.forEach(input => {
        input.value = "";
        input.style.border = "2px solid var(--secondary-color)";
    });

    document.querySelectorAll(".errorMessage").forEach(error => {
        error.innerHTML = "";
        error.style.display = "none";
    });

    document.getElementById("extraFields").innerHTML = "";
}

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let errorMessage = document.getElementById('signupError');
    let formData = new FormData(this); // Collects all input fields, including file uploads
    
    
console.log([...formData]); // Logs the form data (key-value pairs)


    try {
        let response = await fetch('http://localhost:8000/signup', {
            method: 'POST',
            body: formData
        });
        
        console.log('API Response:', response);  
        let data = await response.json();
        console.log('Response Data:', data);
        if (!response.ok) {
            throw new Error(data.error || "Signup failed");
        }
        localStorage.setItem("accountType", data.user.accounttype);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("displayname", data.user.displayname);
        localStorage.setItem("profilepic", data.user.profilepic);
        console.log(data.user.accounttype);
        showSuccessMessage("Signup successful! Redirecting...", () => {
            accountType= localStorage.getItem("accountType");
            window.location.href = `${accountType}Profile.html`; // Redirects to the correct profile page
        });

    } catch (error) {
        errorMessage.innerHTML = `⚠️ <strong>Error:</strong> ${error.message}`;
        errorMessage.style.display = 'block';
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let errorMessage = document.getElementById('loginError');
    let email = document.getElementById('loginEmail').value.trim();
    let password = document.getElementById('loginPass').value.trim();

    if (!email || !password) {
        errorMessage.innerHTML = `⚠️ <strong>Error:</strong> Please enter both email and password.`;
        errorMessage.style.display = 'block';
        return;
    }

    try {
        let response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }
       
        

        localStorage.setItem('token', data.token); // Save token for authentication
        localStorage.setItem("accountType", data.user.accounttype);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("displayname", data.user.displayname);
        localStorage.setItem("profilepic", data.user.profilepic);
        

        
        console.log("✅ Stored accountType:", localStorage.getItem("accountType"));

        
        showSuccessMessage("Login successful! Redirecting...", () => {
            accountType= localStorage.getItem("accountType");
            console.log(data.user.accounttype);
            window.location.href = `${accountType}Profile.html`;
             // Redirect to the social feed page
        });

    } catch (error) {
        errorMessage.innerHTML = `⚠️ <strong>Error:</strong> ${error.message}`;
        errorMessage.style.display = 'block';
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
    extraFields.innerHTML = ""; // Clear previous fields

    if (selectedType === "pro") {
        extraFields.innerHTML = `<input type="number" id="years-experience" placeholder="Years of Experience" required>`;
    } else if (selectedType === "business") {
        extraFields.innerHTML = `
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
        extraFields.innerHTML = `<textarea id="ngo-description" placeholder="Brief Description" required></textarea>`;
    }
});
