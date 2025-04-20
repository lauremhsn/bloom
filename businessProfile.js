let newPfp = null;
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
        newPfp = e.target.result;
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
  submitPost.addEventListener('click', () => {
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

    postList.prepend(post);
    postText.value = "";
    postMedia.value = "";
    postModal.style.display = 'none';
  });
}
