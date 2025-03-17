const plantVideo = document.getElementById("plantVideo");
const wateringCan = document.getElementById("wateringCan");
const trimButton = document.getElementById("trimButton");

let isDragging = false;

wateringCan.addEventListener("mousedown", () => {
    isDragging = true;
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        wateringCan.style.left = event.pageX - 40 + "px";  // Adjust to center
        wateringCan.style.top = event.pageY - 40 + "px";

        const canRect = wateringCan.getBoundingClientRect();
        const videoRect = plantVideo.getBoundingClientRect();

        if (
            canRect.left < videoRect.right &&
            canRect.right > videoRect.left &&
            canRect.top < videoRect.bottom &&
            canRect.bottom > videoRect.top
        ) {
            plantVideo.currentTime += 0.5; 
        }
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

trimButton.addEventListener("click", () => {
    plantVideo.currentTime = Math.max(0, plantVideo.currentTime - 1);
});
