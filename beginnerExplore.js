fetch("/api/getTopPosts")
  .then(res => res.json())
  .then(posts => {
    const feed = document.querySelector(".feedCont");
    feed.innerHTML = ""; 

    posts.forEach(post => {
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");

      const mediaHTML = post.media
        ? post.media.endsWith(".mp4")
          ? `<div class="media"><video class="postVideo" controls><source src="${post.media}" type="video/mp4" /></video></div>`
          : `<div class="media"><img class="postImg" src="${post.media}" alt="Post media" /></div>`
        : "";

      postDiv.innerHTML = `
        <div class="header">
          <a href="otherProfileBeginner.html?user_id=${post.user_id}">
            <img src="${post.profilepic}" alt="Profile Picture" class="postPfp" />
          </a>
          <div class="profile-text">
            <a href="otherProfileBeginner.html?user_id=${post.user_id}" class="username">${post.displayname}</a>
            <div class="handle">@${post.username} • ${formatTime(post.created_at)}</div>
          </div>
        </div>
        <div class="content">
          <p class="postText">${post.content}</p>
          ${mediaHTML}
        </div>
      `;

      feed.appendChild(postDiv);
    });
  });

function formatTime(isoDate) {
  const diff = Math.floor((new Date() - new Date(isoDate)) / 3600000);
  return diff < 1 ? "just now" : `${diff}h ago`;
}
