document.addEventListener('DOMContentLoaded', () => {
    const nameFr = document.querySelector('.name');
    const username = document.querySelector('.username');
    const number = document.querySelector('.number');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const pfpMain = document.querySelector('#mainPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const editNameInput = document.getElementById('editName');
    const editNumberInput = document.getElementById('editNumber');
    const postText = document.getElementById('postText');
    const postMedia = document.getElementById('postMedia');
    const postList = document.getElementById('postList');
    const flwBtn = document.getElementById("flwBtn");
  
    let newPfp = null;
  
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
  