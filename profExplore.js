function loadUserProfilePicture() {
  const profilepic = localStorage.getItem("profilepic");
  const sidebarPfp = document.getElementById("sidebarPfp");

  if (sidebarPfp) {
    sidebarPfp.src = profilepic
      ? `https://bloom-zkk8.onrender.com/getProfilePic/${profilepic}`
      : "profile.jpg"; // fallback
  }
}

function openModal(imgElement) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");

  modal.style.display = "flex";
  modalImg.src = imgElement.src;
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", async () => {
  loadUserProfilePicture();

  // Modal close listener
  const imageModal = document.getElementById("imageModal");
  if (imageModal) {
    imageModal.addEventListener("click", closeModal);
  }

  // Profile link setup
  const profileLink = document.getElementById("profileLink");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("accountType");

  if (profileLink && userId && role) {
    const roleToPage = {
      ngo: "NGOProfile.html",
      business: "businessProfile.html",
      pro: "professionalProfile.html",
      beginner: "beginnerProfile.html"
    };
    profileLink.href = roleToPage[role] ? `${roleToPage[role]}?id=${userId}` : "#";
  }

  // Fetch top posts
  const feedContainer = document.querySelector(".feedCont");
  if (feedContainer) {
    try {
      const response = await fetch("https://bloom-zkk8.onrender.com/getNGOTopPosts?limit=30");
      if (!response.ok) throw new Error("Failed to fetch posts");

      const posts = await response.json();

      posts.forEach(post => {
        const postElement = createPostElement(post);
        feedContainer.appendChild(postElement);
      });
    } catch (err) {
      console.error("Error loading posts:", err);
      feedContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
    }
  }

  // Fetch user posts
  await fetchPosts(); 
});

async function fetchPosts() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("https://bloom-zkk8.onrender.com/getposts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const posts = await response.json();
    const container = document.getElementById("postsContainer");
    if (!container) return;

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

// Helper function you should define elsewhere
function createPostElement(post) {
  const div = document.createElement("div");
  div.className = "post";
  const media = post.media ? (post.media.endsWith(".mp4")
    ? `<video controls src="https://bloom-zkk8.onrender.com/${post.media}" style="max-width: 100%;"></video>`
    : `<img src="https://bloom-zkk8.onrender.com/${post.media}" alt="media" style="max-width: 100%;" />`)
    : "";

  div.innerHTML = `
    ${media}
    <p>${post.text}</p>
  `;
  return div;
}
