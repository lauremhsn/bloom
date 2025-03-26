document.addEventListener("DOMContentLoaded", async function () {
    let streakData = { plant1: 0, plant2: 0, plant3: 0 };

    async function fetchStreaks() {
        try {
            const response = await fetch("/api/streaks", {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                credentials: "include"
            });

            if (!response.ok) throw new Error("Failed to fetch streak data");
            streakData = await response.json();

            Object.keys(streakData).forEach(plantId => {
                document.getElementById(`streak${capitalizeFirstLetter(plantId)}`).textContent = 
                    `Streak: ${streakData[plantId]} days`;
            });

            updateUnlockState();
        } catch (error) {
            console.error(error);
        }
    }

    async function updateStreak(plantId) {
        try {
            const response = await fetch("/api/streaks", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ plantId }),
                credentials: "include"
            });

            if (!response.ok) throw new Error("Failed to update streak");

            await fetchStreaks();
        } catch (error) {
            console.error(error);
        }
    }

    function updateUnlockState() {
        document.getElementById("lockPlant2").style.display = streakData.plant1 >= 10 ? "none" : "block";
        document.getElementById("lockPlant3").style.display = streakData.plant2 >= 20 ? "none" : "block";
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    document.getElementById("plant1Video").addEventListener("click", async () => {
        await updateStreak("plant1");
        window.location.href = "plant.html"; 
    });

    document.getElementById("plant2Video").addEventListener("click", async () => {
        if (streakData.plant1 >= 10) {
            await updateStreak("plant2");
            window.location.href = "plant2.html";
        } else {
            alert("You need a 10-day streak on Plant 1 to unlock this!");
        }
    });

    document.getElementById("plant3Video").addEventListener("click", async () => {
        if (streakData.plant2 >= 20) {
            await updateStreak("plant3");
            window.location.href = "plant3.html";
        } else {
            alert("You need a 20-day streak on Plant 2 to unlock this!");
        }
    });

    document.getElementById("plant1").addEventListener("click", () => {
        window.location.href = "plant.html";
    });

    document.getElementById("plant2").addEventListener("click", () => {
        if (streakData.plant1 >= 10) {
            window.location.href = "plant.html";
        } else {
            alert("You need a 10-day streak on Plant 1 to unlock this!");
        }
    });

    document.getElementById("plant3").addEventListener("click", () => {
        if (streakData.plant2 >= 20) {
            window.location.href = "plant.html";
        } else {
            alert("You need a 20-day streak on Plant 2 to unlock this!");
        }
    });

    await fetchStreaks();
});
