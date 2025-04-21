let newPfp = null;
export function setNewPfp(value) {
    newPfp = value;
}
export function getNewPfp() {
    return newPfp;
}
export function eventList() {
    document.addEventListener('DOMContentLoaded', () => {
        const editBtn = document.getElementById('editBtn');
        const saveBtn = document.getElementById('saveBtn');
        const editBox = document.getElementById('editBox');
        const closeEB = document.getElementById('closeEB');
        const displayname = document.getElementById('displayname');
        const username = document.getElementById('username');
        const sidebarPfp = document.getElementById('sidebarPfp');
        const pfpMain = document.getElementById('mainPfp');
        const profilePicInput = document.getElementById('profilePicInput');
        const fileInput = document.getElementById('fileInput');
        const editNameInput = document.getElementById('editName');
        const nameLimit = document.getElementById('nameLimit');
        const addPostBtn = document.getElementById('addPostBtn');
        const postModal = document.getElementById('postModal');
        const closePostModal = document.getElementById('closePostModal');
        const submitPost = document.getElementById('submitPost');
        const postText = document.getElementById('postText');
        const postMedia = document.getElementById('postMedia');
        const postList = document.getElementById('postList');


        let accountType = localStorage.getItem("accountType"); // Update this dynamically if needed
        let un = localStorage.getItem("username"); // Update this dynamically if needed
        let dn = localStorage.getItem("displayname"); // Update this dynamically if needed
        let pp = localStorage.getItem("profilepic"); // Update this dynamically if needed

        console.log(un);
        console.log(dn);
        console.log(pp);

        username.innerText = un;
        displayname.innerText = dn;
        pfpMain.src = `https://bloom-zkk8.onrender.com/getProfilePic/${pp}`;
        sidebarPfp.src = `https://bloom-zkk8.onrender.com/getProfilePic/${pp}`;
        editButton(editBtn, editNameInput, profilePicInput, pfpMain, displayname, editBox, nameLimit);
        saveButton(saveBtn, editNameInput, displayname, pfpMain, sidebarPfp, editBox);
        exitButton(closeEB, editBox);
        changes(fileInput, profilePicInput);
        postRelated(addPostBtn, postModal, closePostModal);
        postSubmission(submitPost, postMedia, postText, postList, postModal);
    })
}

export function editButton(editBtn, editNameInput, profilePicInput, pfpMain, displayname, editBox, nameLimit) {
    editBtn.addEventListener('click', () => {
        editNameInput.value = displayname.textContent;
        profilePicInput.src = pfpMain.src;
        nameLimit.textContent = `${editNameInput.value.length}/50`;
        editBox.style.display = 'flex';
    });

    editNameInput.addEventListener('input', () => {
        nameLimit.textContent = `${editNameInput.value.length}/50`;
    });
}

export function saveButton(saveBtn, editNameInput, displayname, pfpMain, sidebarPfp, editBox) {
    saveBtn.addEventListener('click', async () => {
        try {
            const newName = editNameInput.value.trim();

            let un = localStorage.getItem("username");
        
            let response = await fetch(`https://bloom-zkk8.onrender.com/updateProfile/${un}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ un, newName, newPfp })
            });
    
            let data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || "Update profile failed successfully");
            }
            else {

                if (newName) {
                    displayname.textContent = newName;
                }
                if (newPfp) {
                    pfpMain.src = newPfp;
                    sidebarPfp.src = newPfp;
                }
            }

            editBox.style.display = 'none';    
        }
        catch(err) {
            console.error('update profile error:', err);
        }
    });
}

export function exitButton(closeEB, editBox) {
    closeEB.addEventListener('click', () => {
        editBox.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === editBox) {
            editBox.style.display = 'none';
        }
    });
}

export function changes(fileInput, profilePicInput) {
    fileInput.addEventListener('change', (event) => {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                profilePicInput.src = e.target.result;
                setNewPfp(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}
export function postRelated(addPostBtn, postModal, closePostModal) {
    addPostBtn.addEventListener('click', () => {
        postModal.style.display = 'flex';
    });

    closePostModal.addEventListener('click', () => {
        postModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === postModal) {
            postModal.style.display = 'none';
        }
    });
}

export function postSubmission(submitPost, postMedia, postText, postList, postModal) {
    submitPost.addEventListener('click', async () => {
        const text = postText.value.trim();
        const file = postMedia.files[0];

        if (!text && !file) {
            alert("Please add text or an image/video!");
            return;
        }

        const post = document.createElement('div');
        post.classList.add('update');

        if (text) {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            post.appendChild(paragraph);
        }

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let mediaElement;
                if (file.type.startsWith("image")) {
                    mediaElement = document.createElement('img');
                } else if (file.type.startsWith("video")) {
                    mediaElement = document.createElement('video');
                    mediaElement.setAttribute('controls', '');
                }
                mediaElement.src = e.target.result;
                post.appendChild(mediaElement);
            };
            reader.readAsDataURL(file);
        }

        const tk = localStorage.getItem('token');
        console.log(tk)
        if (tk) {
            try {
                const formData = new FormData();
                formData.append('token', tk);
                formData.append('text', text);
                if (file) {
                    formData.append('file', file);
                }

                try {
                    let response = await fetch('http://localhost:8000/addpost', {
                        method: 'POST',
                        body: formData
                    });

                    //if (!response.ok) {
                    //const data = await response.json();
                    //    throw new Error(data.error);
                    //}

                } catch (error) {
                    console.error("Error uploading post:", error);
                }
            } catch (error) {
                console.error("Invalid token format:", error);
            }
        } else {
            console.error("Token not found in localStorage");
        }


        postList.prepend(post);

        postText.value = "";
        postMedia.value = "";
        postModal.style.display = 'none';

    });
}
