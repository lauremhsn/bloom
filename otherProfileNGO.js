document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.getElementById("profileLink");
    if (!profileLink) return;
  
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("accountType");
  
    if (userId && role) {
        if (role === "ngo") {
            profileLink.href = `NGOProfile.html?id=${userId}`;
        } else if (role === "business") {
            profileLink.href = `businessProfile.html?id=${userId}`;
        } else if (role === "pro") {
            profileLink.href = `professionalProfile.html?id=${userId}`;
        } else if (role === "beginner") {
            profileLink.href = `beginnerProfile.html?id=${userId}`;
        } else {
            profileLink.href = "#";
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const nameFr = document.querySelector('.name');
    const username = document.querySelector('.username');
    const mission = document.querySelector('.mission');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const pfpMain = document.querySelector('#mainPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const editNameInput = document.getElementById('editName');
    const editMissionInput = document.getElementById('editMission');
    const nameLimit = document.getElementById('nameLimit');
    const postText = document.getElementById('postText');
    const postMedia = document.getElementById('postMedia');
    const postList = document.getElementById('postList');
    const flwBtn = document.getElementById('flwBtn');

    flwBtn.addEventListener('click', () => {
        if (flwBtn.innerText === "Follow"){
            //Backend stuff so that the request is sent
            flwBtn.innerText = "Following!";
            flwBtn.style.backgroundColor = "#E2BFB3";
            flwBtn.style.cursor = "default";
            flwBtn.disabled = true;
        }
    });
  });
  