function loadUserProfilePicture() {
  const profilepic = localStorage.getItem("profilepic");
  const sidebarPfp = document.getElementById("sidebarPfp");

  if (sidebarPfp) {
      sidebarPfp.src = profilepic
          ? `https://bloom-zkk8.onrender.com/getProfilePic/${profilepic}`
          : "profile.jpg"; // fallback if profilepic is not available
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfilePicture();
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

function openModal(imgElement) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImg");
    
    modal.style.display = "flex";
    modalImg.src = imgElement.src;
  }
  
  function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
  }
  
  document.querySelectorAll('.postImage').forEach(img => {
    img.addEventListener('click', function() {
      openModal(this);
    });
  });

  document.addEventListener("DOMContentLoaded", async () => {
    const feedContainer = document.querySelector(".feedCont");
  
    try {
      const response = await fetch("https://bloom-zkk8.onrender.com/getNGOTopPosts?limit=30");
      if (!response.ok) throw new Error("Failed to fetch posts");
  
      const posts = await response.json();
  
      posts.forEach(post => {
        console.log(post);
        const postElement = createPostElement(post);
        feedContainer.appendChild(postElement);
      });
    } catch (err) {
      console.error("Error loading posts:", err);
      feedContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
    }
  });
  
  function createPostElement(post) {
    const postElement = document.createElement("div");
    postElement.classList.add("post");
  
    const timeAgo = formatTimeAgo(new Date(post.created_at));
  
    postElement.innerHTML = `
      <div class="header">
        <img src="https://bloom-zkk8.onrender.com/getProfilePic/${post.profilepic || 'profile.jpg'}" alt="Profile Picture" class="postPfp" data-user-id="${post.user_id}" />
        <div class="profile-text">
          <div class="username" data-user-id="${post.user_id}">${post.displayname || post.username}</div>
          <div class="handle">@${post.username} • ${timeAgo}</div>
        </div>
      </div>
      <div class="content">
        <p class="postText">${post.text || ''}</p>
        ${post.media ? createMediaHTML(post.media) : ''}
      </div>
    `;
  
    postElement.querySelectorAll("[data-user-id]").forEach(el => {
      el.addEventListener("click", () => {
        const userId = el.getAttribute("data-user-id");
        localStorage.setItem("selectedUserId", userId);
        window.location.href = "otherProfileBeginner.html";
      });
    });
  
    return postElement;
  }
  
  function createMediaHTML(media) {
    if (media.endsWith(".mp4")) {
      return `
        <div class="media">
          <video class="postVideo" controls>
            <source src="${media}" type="video/mp4" />
          </video>
        </div>
      `;
    } else {
      return `
        <div class="media">
          <img src="${media}" alt="Post Media" class="postImg" />
        </div>
      `;
    }
  }
  
  function formatTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);
  
    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }
  
  