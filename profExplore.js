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
