document.addEventListener("DOMContentLoaded", async () => {
    const feedContainer = document.querySelector(".feedCont");
  
    try {
      const response = await fetch("https://bloom-zkk8.onrender.com/getBeginnerTopPosts?limit=30");
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
        console.log(userId);
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
  