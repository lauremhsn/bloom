
function loadUserProfilePicture() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const sidebarPfp = document.getElementsByClassName("")
    if (currentUser && currentUser.profilepic) {
        const sidebarPfp = document.getElementById("sidebarPfp");
        if (sidebarPfp) {
            sidebarPfp.src = currentUser.profilepic;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfilePicture();
});

document.querySelectorAll('.productImage').forEach(img => {
    img.addEventListener('click', function () {
        const productName = this.dataset.productName;
        const productDescription = this.dataset.productDescription;
        const productPrice = this.dataset.productPrice;
        openModal(this, productName, productDescription, productPrice);
    });
});

var modal = document.getElementById("imageModal");
modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

export function openModal(imgElement, productName, productDescription, productPrice) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImg");
    var modalProductName = document.getElementById("modalProductName");
    var modalProductDescription = document.getElementById("modalProductDescription");
    var modalProductPrice = document.getElementById("modalProductPrice");

    modal.style.display = "flex";
    modalImg.src = imgElement.src;
    modalProductName.textContent = productName;
    modalProductDescription.textContent = productDescription;
    modalProductPrice.textContent = productPrice;

    var buyNowBtn = document.getElementById("buyNowBtn");
    if (buyNowBtn) {
        buyNowBtn.onclick = function () {
            createCheckoutSession(productName, productPrice);
        };
    } else {
        console.error("Buy Now button not found.");
    }
}


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

export function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

export function createCheckoutSession(productName, productPrice) {
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productName: productName,
            productPrice: productPrice
        }),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (sessionId) {
            var stripe = Stripe('pk_test_51RBMvvRrBw2cTi1AnWBPfP1ETIRFUHJMdq7PLCqUQ8dsmFb5rfUKFxvxO0RqC16N4SUQN5T5sm0ZUysEj8f2a75D00rX9uzN0g');
            return stripe.redirectToCheckout({ sessionId: sessionId });
        })
        .then(function (result) {
            if (result.error) {
                alert(result.error.message);
            }
        })
        .catch(function (error) {
            console.error("Error:", error);
        });
}

function handleBuyNowClick() {
    const productName = "Product Name";
    const productPrice = 29.99;  //parse from product info

    createCheckoutSession(productName, productPrice);
}


var modal = document.getElementById("imageModal");
modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const feedContainer = document.querySelector(".feedCont");
  
    try {
      const response = await fetch("https://bloom-zkk8.onrender.com/getBusinessTopPosts?limit=30");
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
  
