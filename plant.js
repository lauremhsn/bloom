const plantVideo = document.getElementById("plantVideo");
const wateringCan = document.getElementById("wateringCan");
const trimButton = document.getElementById("trimButton");
const plantContainer = document.querySelector(".plant-container");
const streakDisplay = document.createElement("p"); 

streakDisplay.id = "streakDisplay";
document.body.appendChild(streakDisplay);


let streakData = JSON.parse(localStorage.getItem("plantStreak")) || { streak: 0, lastDate: null };
let isDragging = false;
let offsetX = 0, offsetY = 0;
let lastUpdate = 0;
let user_id = 1;  
let progress = 0;
let streak = 0;   
let trimmed = false; 


function updateStreak() {
    const today = new Date().toDateString();

    if (streakData.lastDate === today) {
        return; 
    }

    const lastInteractionDate = new Date(streakData.lastDate);
    const difference = (new Date(today) - lastInteractionDate) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
        streakData.streak++; 
    } else {
        streakData.streak = 1; 
    }

    streakData.lastDate = today;
    localStorage.setItem("plantStreak", JSON.stringify(streakData));

    displayStreak();
}

function displayStreak() {
    streakDisplay.textContent = `Streak: ${streakData.streak} days`;
}

function userInteraction() {
    updateStreak();
}

wateringCan.addEventListener("mousedown", (event) => {
    isDragging = true;
    const rect = wateringCan.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    wateringCan.style.pointerEvents = "none";
    userInteraction(); 
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const containerRect = plantContainer.getBoundingClientRect();
        wateringCan.style.left = event.clientX - containerRect.left - offsetX + "px";
        wateringCan.style.top = event.clientY - containerRect.top - offsetY + "px";

        const canRect = wateringCan.getBoundingClientRect();
        const videoRect = plantVideo.getBoundingClientRect();

        const now = Date.now();
        if (canRect.left < videoRect.right &&
            canRect.right > videoRect.left &&
            canRect.top < videoRect.bottom &&
            canRect.bottom > videoRect.top &&
            now - lastUpdate > 200) {
            plantVideo.currentTime += 0.5; 
            lastUpdate = now;
        }
    }
});

window.addEventListener("mouseup", () => {
    isDragging = false;
    wateringCan.style.pointerEvents = "auto";
});

trimButton.addEventListener("click", () => {
    if (plantVideo.currentTime > 0) {
        plantVideo.currentTime = Math.max(0, plantVideo.currentTime - 1); 
        trimmed = true; 
        userInteraction(); 
        updatePlantProgress(); 
    }
});

async function updatePlantProgress() {
    const trimmed_at = trimmed ? new Date().toISOString() : null;
    const last_watered = new Date().toISOString();

    const response = await fetch('/updatePlantProgress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id,
            trimmed,
            streak: streakData.streak,
            progress,
            trimmed_at,
            last_watered
        }),
    });

    const data = await response.json();
    console.log('Plant progress updated:', data);
}

async function getPlantProgress() {
    const response = await fetch(`/getPlantProgress/${user_id}`);
    const data = await response.json();
    console.log('Fetched plant progress:', data);

    if (data && data.progress) {
        progress = data.progress;
        streakData.streak = data.streak;
        trimmed = data.trimmed;

        if (trimmed) {
            console.log("The plant is trimmed");
        }
    }
}

window.onload = () => {
    getPlantProgress();
    displayStreak(); 
};
