const plantVideo = document.getElementById("plantVideo");
const wateringCan = document.getElementById("wateringCan");
const trimButton = document.getElementById("trimButton");
const plantContainer = document.querySelector(".plant-container");

let isDragging = false;
let offsetX = 0, offsetY = 0;
let lastUpdate = 0;

wateringCan.addEventListener("mousedown", (event) => {
    isDragging = true;

    // watering can position wrt container
    const rect = wateringCan.getBoundingClientRect();
    // offset relative to where the user clicked, this is to fix the bug of the displaced watering-can picture when we click on it to drag
    offsetX = event.clientX - rect.left; 
    offsetY = event.clientY - rect.top;
    wateringCan.style.pointerEvents = "none";
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const containerRect = plantContainer.getBoundingClientRect(); //container offset

        // position the watering can wrt to container
        wateringCan.style.left = event.clientX - containerRect.left - offsetX + "px";
        wateringCan.style.top = event.clientY - containerRect.top - offsetY + "px";

        const canRect = wateringCan.getBoundingClientRect();
        const videoRect = plantVideo.getBoundingClientRect();

        const now = Date.now();
        if (
            canRect.left < videoRect.right &&
            canRect.right > videoRect.left &&
            canRect.top < videoRect.bottom &&
            canRect.bottom > videoRect.top &&
            now - lastUpdate > 200
        ) {
            plantVideo.currentTime += 0.5; //we move forward the frames of the video
            lastUpdate = now; //we save our old video time
        }
    }
});

window.addEventListener("mouseup", () => {
    isDragging = false;
    wateringCan.style.pointerEvents = "auto"; //activate pointer events again when we are not holding the cursor down on the watering can
});

trimButton.addEventListener("click", () => {
    if (plantVideo.currentTime > 0) {
        plantVideo.currentTime = Math.max(0, plantVideo.currentTime - 1);   //go backward in the video, make sure the video doesn't get decreased to <0 sec
    }
});
