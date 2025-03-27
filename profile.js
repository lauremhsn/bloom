document.addEventListener('DOMContentLoaded', async() =>{
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

    

    let newPfp = null;

   
    let accountType = localStorage.getItem("accountType"); // Update this dynamically if needed
    let un = localStorage.getItem("username"); // Update this dynamically if needed
    let dn = localStorage.getItem("displayname"); // Update this dynamically if needed
    let pp = localStorage.getItem("profilepic"); // Update this dynamically if needed
    
    console.log(un);
    console.log(dn);
    console.log(pp);
    
    username.innerText = un;
    displayname.innerText = dn;
    pfpMain.src = `http://localhost:8000/getProfilePic/${pp}`;
    sidebarPfp.src = `http://localhost:8000/getProfilePic/${pp}`;

    editBtn.addEventListener('click', () =>{
        editNameInput.value = nameFr.textContent;
        profilePicInput.src = pfpMain.src;
        nameLimit.textContent = `${editNameInput.value.length}/50`;
        editBox.style.display = 'flex';
    });

    editNameInput.addEventListener('input', () =>{
        nameLimit.textContent = `${editNameInput.value.length}/50`;
    });

    saveBtn.addEventListener('click', () =>{
        const newName = editNameInput.value.trim();

        if (newName){
            nameFr.textContent = newName;
        }
        if (newPfp){
            pfpMain.src = newPfp;
            sidebarPfp.src = newPfp;
        }

        editBox.style.display = 'none';
    });

    closeEB.addEventListener('click', () =>{
        editBox.style.display = 'none';
    });
    window.addEventListener('click', (event) =>{
        if (event.target === editBox){
            editBox.style.display = 'none';
        } /*I need to add a wrapper fof the entire editBox thingy to do this so Im leaving it for later. Its not that important */
    });

    fileInput.addEventListener('change', (event) =>{
        let file = event.target.files[0];
        if (file){
            let reader = new FileReader();
            reader.onload = function (e){
                profilePicInput.src = e.target.result;
                newPfp = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

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

    
    
});
