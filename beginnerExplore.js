document.addEventListener("DOMContentLoaded", async () => {
    const feedContainer = document.querySelector('.feedCont');
  
    try {
      const response = await fetch("https://bloom-zkk8.onrender.com/getTopPosts?limit=30");
      if (!response.ok) throw new Error("Failed to fetch posts");
  
      const posts = await response.json();
  
      posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
  
        const timeAgo = formatTimeAgo(new Date(post.created_at));
  
        const mediaContent = post.media
          ? (post.media.endsWith(".mp4")
            ? `<div class="media"><video class="postVideo" controls><source src="${post.media}" type="video/mp4" /></video></div>`
            : `<div class="media"><img src="${post.media}" class="postImage" alt="Post media" /></div>`)
          : "";
  
        postDiv.innerHTML = `
          <div class="header">
              <img src="https://bloom-zkk8.onrender.com/getProfilePic/${post.profilepic || 'profile.jpg'}" alt="Profile Picture" class="postPfp" />
              <div class="profile-text">
                  <div class="username">${post.displayname}</div>
                  <div class="handle">@${post.username} • ${timeAgo}</div>
              </div>
          </div>
          <div class="content">
              <p class="postText">${post.content}</p>
              ${mediaContent}
          </div>
        `;
  
        feedContainer.appendChild(postDiv);
      });
  
    } catch (err) {
      console.error("Error loading posts:", err);
      feedContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
    }
  });
  
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
  