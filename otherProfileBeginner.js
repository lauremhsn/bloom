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

document.addEventListener('DOMContentLoaded', () =>{
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const editBox = document.getElementById('editBox');
    const closeEB = document.getElementById('closeEB');
    const nameFr = document.querySelector('.name');
    const username = document.querySelector('.username');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const pfpMain = document.querySelector('#mainPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const editNameInput = document.getElementById('editName');
    const editExperienceInput = document.getElementById('editExperience');
    const nameLimit = document.getElementById('nameLimit');
    const addPostBtn = document.getElementById('addPostBtn');
    const postModal = document.getElementById('postModal');
    const closePostModal = document.getElementById('closePostModal');
    const submitPost = document.getElementById('submitPost');
    const postText = document.getElementById('postText');
    const postMedia = document.getElementById('postMedia');
    const postList = document.getElementById('postList');
    const frndBtn = document.getElementById('frndBtn');

    let newPfp = null;

    if (frndBtn && frndBtn.innerText === "Friends"){
        collabBtn.style.display = "block";
        collabBtn.addEventListener("click", () => {
            collabBtn.innerText = "Collab Requested!";
            collabBtn.disabled = true;
            collabBtn.style.backgroundColor = "#E2BFB3";
        });
    }

    frndBtn.addEventListener('click', () => {
        if (frndBtn.innerText === "Request Friendship?"){
            //Backend stuff so that the request is sent
            frndBtn.innerText = "Requested!";
            frndBtn.style.backgroundColor = "#E2BFB3";
            frndBtn.style.cursor = "default";
            frndBtn.disabled = true;
        }
    });
});
