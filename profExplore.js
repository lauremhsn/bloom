document.addEventListener("DOMContentLoaded", () => {
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

document.getElementById("imageModal").addEventListener("click", closeModal);

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
