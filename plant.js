const plantVideo = document.getElementById("plantVideo");
const wateringCan = document.getElementById("wateringCan");
const trimButton = document.getElementById("trimButton");
const plantContainer = document.querySelector(".plant-container");
const streakDisplay = document.createElement("p"); 

streakDisplay.id = "streakDisplay";
document.body.appendChild(streakDisplay);


let streakData = JSON.parse(localStorage.getItem("plantStreak")) || { 
    streak: 0, lastDate: null , dailyGrowth: 0, dead: false, missedDays:0 };
let isDragging = false;
let offsetX = 0, offsetY = 0;
let lastUpdate = 0;
let user_id = 1;  
let progress = 0;
let streak = 0;   
let trimmed = false; 


function updateStreak() {
    const today = new Date().toDateString();

    if (!streakData.lastDate) {
        streakData.lastDate = today;
        localStorage.setItem("plantStreak", JSON.stringify(streakData));
        return;
    }

    if (streakData.lastDate === today) return;

    const lastInteractionDate = new Date(streakData.lastDate);
    const difference = (new Date(today) - lastInteractionDate) / (1000 * 60 * 60 * 24);

    if (difference === 1) {
        streakData.streak++;
        streakData.missedDays = 0;
    } else if (difference > 1 && difference < 3) {
        streakData.streak = 1;
        streakData.missedDays += 1;
    } else if (difference >= 3) {
        streakData.streak = 1;
        streakData.missedDays += Math.floor(difference);
    }

    if (streakData.missedDays >= 3) {
        handlePlantDeath();
        return;
    }

    streakData.dailyGrowth = 0;
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

function handlePlantDeath() {
    streakData.dead = true;
    localStorage.setItem("plantStreak", JSON.stringify(streakData));
    plantVideo.src = "plant1.mp4";
    plantVideo.currentTime = 0;
    plantVideo.play();

    alert("Your plant has died!");

    showRestartButton();
}

function showRestartButton() {
    const restartBtn = document.getElementById("restartButton");
    restartBtn.style.display = "block";

    restartBtn.onclick = () => {
        streakData.dead = false;
        streakData.streak = 1;
        streakData.lastDate = new Date().toDateString();
        streakData.dailyGrowth = 0;
        streakData.missedDays =0;
        localStorage.setItem("plantStreak", JSON.stringify(streakData));
    
        plantVideo.src = "plant1.mp4";
        plantVideo.currentTime = 0;
        plantVideo.play();
    
        displayStreak();
        restartBtn.style.display = "none";
    };
    
}

wateringCan.addEventListener("mousedown", (event) => {
    isDragging = true;
    // watering can position wrt container
    const rect = wateringCan.getBoundingClientRect();
    // offset relative to where the user clicked, this is to fix the bug of the displaced watering-can picture when we click on it to drag
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    wateringCan.style.pointerEvents = "none";
    userInteraction(); 
});

document.addEventListener("mousemove", (event) => {
    if (isDragging && !streakData.dead) {  // <- only allow growing if alive
        const containerRect = plantContainer.getBoundingClientRect();
        wateringCan.style.left = event.clientX - containerRect.left - offsetX + "px";
        wateringCan.style.top = event.clientY - containerRect.top - offsetY + "px";

        const canRect = wateringCan.getBoundingClientRect();
        const videoRect = plantVideo.getBoundingClientRect();
        const now = Date.now();
        const maxDailyGrowth = 300.0; // limit: 3 seconds per day

        if (
            canRect.left < videoRect.right &&
            canRect.right > videoRect.left &&
            canRect.top < videoRect.bottom &&
            canRect.bottom > videoRect.top &&
            now - lastUpdate > 200
        ) {
            if (streakData.dailyGrowth < maxDailyGrowth) {
                const growAmount = Math.min(0.5, maxDailyGrowth - streakData.dailyGrowth);
                plantVideo.currentTime += growAmount;
                streakData.dailyGrowth += growAmount;
                lastUpdate = now;

                progress = plantVideo.currentTime;
                localStorage.setItem("plantStreak", JSON.stringify(streakData));
            }
        }
    }
});


window.addEventListener("mouseup", () => {
    isDragging = false;
    wateringCan.style.pointerEvents = "auto"; //activate pointer events again when we are not holding the cursor down on the watering can
});

trimButton.addEventListener("click", () => {
    if (plantVideo.currentTime > 0) {
        plantVideo.currentTime = Math.max(0, plantVideo.currentTime - 0.1);  //go backward in the video, make sure the video doesn't get decreased to <0 sec
        trimmed = true; 
        userInteraction(); 
        updatePlantProgress(); 
    }
});

async function getUserColumnPrefix(user_id) {
    const result = await db.query(`
        SELECT * FROM "Plants" WHERE user1_id = $1 OR user2_id = $1
    `, [user_id]);

    if (result.rows.length === 0) {
        throw new Error('User does not have a plant assigned.');
    }

    const plant = result.rows[0];
    return plant.user1_id === user_id ? 'user1' : 'user2';
}

async function updatePlantProgress() {
    const trimmed_at = trimmed ? new Date().toISOString() : null;
    const last_watered = new Date().toISOString();

    const columnPrefix = await getUserColumnPrefix(user_id);

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
            last_watered,
            columnPrefix, 
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

        plantVideo.currentTime = progress; 
        displayStreak();
    }
}


window.onload = () => {
    getPlantProgress();
    updateStreak();
    displayStreak();

    if (streakData.dead) {
        handlePlantDeath();
    }
};


