export let newPfp = null;
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
    const nameFr = document.querySelector('.name');
    const username = document.querySelector('.username');
    const number = document.querySelector('.number');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const pfpMain = document.querySelector('#mainPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const editNameInput = document.getElementById('editName');
    const editNumberInput = document.getElementById('editNumber');
    const nameLimit = document.getElementById('nameLimit');
    const addPostBtn = document.getElementById('addPostBtn');
    const postModal = document.getElementById('postModal');
    const closePostModal = document.getElementById('closePostModal');
    const submitPost = document.getElementById('submitPost');
    const postText = document.getElementById('postText');
    const postMedia = document.getElementById('postMedia');
    const postList = document.getElementById('postList');
    editButton(editBtn, editNameInput, profilePicInput, pfpMain, nameFr, editBox, nameLimit);
    saveButton(saveBtn, editNameInput, number, nameFr, pfpMain, sidebarPfp, editBox, editNumberInput);
    exitButton(closeEB, editBox);
    changes(fileInput, profilePicInput);
    postRelated(addPostBtn, postModal, closePostModal);
    postSubmission(submitPost, postMedia, postText, postList, postModal);
  })
}
export function editButton(editBtn, editNameInput, profilePicInput, pfpMain, nameFr, editBox, nameLimit) {
  editBtn.addEventListener('click', () => {
    editNameInput.value = nameFr.textContent;
    profilePicInput.src = pfpMain.src;
    nameLimit.textContent = `${editNameInput.value.length}/50`;
    editBox.style.display = 'flex';
  });

  editNameInput.addEventListener('input', () => {
    nameLimit.textContent = `${editNameInput.value.length}/50`;
  });
}

export function saveButton(saveBtn, editNameInput, number, nameFr, pfpMain, sidebarPfp, editBox, editNumberInput) {
  saveBtn.addEventListener('click', () => {
    const newName = editNameInput.value.trim();
    const newNumber = editNumberInput.value.trim();

    if (newName) {
      nameFr.textContent = newName;
    }
    if (newNumber) {

      number.textContent = `🌱 To contact call: ${newNumber}`;
    }
    if (newPfp) {
      pfpMain.src = newPfp;
      sidebarPfp.src = newPfp;
    }

    editBox.style.display = 'none';
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

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('text', text);
    formData.append('file', file);
    formData.append('token', token);

    try {
      const response = await fetch('https://bloom-zkk8.onrender.com/addpost', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unknown error');
      }

      console.log("Post successful:", result.message);
      postList.prepend(post);
      postText.value = "";
      postMedia.value = "";
      postModal.style.display = 'none';

    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post: ' + error.message);
    }
  });
}

async function fetchPosts() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage");
      return;
    }

    const response = await fetch("https://bloom-zkk8.onrender.com/getposts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const posts = await response.json();
    const container = document.getElementById("postsContainer");

    posts.forEach((post) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>${post.text}</p>
        ${post.media ? `<img src="https://bloom-zkk8.onrender.com/uploads/${post.media}" class="postImage" style="max-width:200px; cursor:pointer;" />` : ''}
        <hr />
      `;
      container.appendChild(div);
    });

    document.querySelectorAll('.postImage').forEach(img => {
      img.addEventListener('click', function () {
        openModal(this);
      });
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}
fetchPosts();
