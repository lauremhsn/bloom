// const { request } = require("express");

const searchInput = document.querySelector('.searchBar');
const searchResults = document.getElementById('searchResults');
const searchResultItems = document.querySelectorAll('.searchResultItem');
const searchBtn = document.getElementById('searchBtn');
function decodeJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
  );
  return JSON.parse(jsonPayload);
}


const CURRENTuserID = localStorage.getItem("userId");
if (!CURRENTuserID) {
  console.error("No user ID found in localStorage!");
}

//search bar stuff
// searchInput.addEventListener('focus', () => {
//     searchResults.style.display = "block";
// });
// document.addEventListener('click', (event) => {
//     if (!searchInput.contains(event.target) && !searchResults.contains(event.target)){
//         searchResults.style.display = "none";
//     }
// });
/*searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    searchResultItems.forEach(item => {
        const name = item.querySelector('.name').textContent.toLowerCase();
        const username = item.querySelector('.username').textContent.toLowerCase();
        if (name.includes(searchTerm) || username.includes(searchTerm)){
            item.style.display = "flex";
        }
        else{
            item.style.display = "none";
        }
    });
});*/ 
//That was in case I wanna remove the search button fr

// searchBtn.addEventListener('click', () => {
//     event.stopPropagation();
//     const searchTerm = searchInput.value.toLowerCase();
//     searchResultItems.forEach(item => {
//         const name = item.querySelector('.name').textContent.toLowerCase();
//         const username = item.querySelector('.username').textContent.toLowerCase();
//         if (name.includes(searchTerm) || username.includes(searchTerm)){
//             item.style.display = "flex";
//         }
//         else{
//             item.style.display = "none";
//         }
//     });
// });

document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.querySelector('.searchBar').value.trim();
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'block';

  const apiUrl = `https://bloom-zkk8.onrender.com/api/search-users?q=${encodeURIComponent(query)}`;
  console.log("Calling API:", apiUrl); // Debug log

  try {
    const response = await fetch(apiUrl);

    // Check if the endpoint exists
    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`);
      resultsContainer.innerHTML = `<p>Error: ${response.statusText}</p>`;
      return;
    }

    const users = await response.json();

    if (!users.length) {
      resultsContainer.innerHTML = '<p>No users found.</p>';
      return;
    }

    users.forEach(user => {
      console.log(user);
      console.log("user id: ", user.id);
      const item = document.createElement('div');
      item.className = 'searchResultItem';
      item.innerHTML = `
        <div class="thePfp">
            <img src="https://bloom-zkk8.onrender.com/getProfilePic/${user.profilepic || 'profile.jpg'}" alt="Profile Picture">
        </div>
        <div class="userInfo">
            <h1 class="name">${user.displayname}</h1>
            <p class="username">@${user.username}</p>
            <button class="request-friend" data-user-id=${user.id}>Request Friend</button>
            <button class="request-collab" data-user-id=${user.id}>Request Collab</button>
        </div>
      `;
      const requestFriendInfo = item.querySelector(".userInfo");
      const requestFriendButton = requestFriendInfo.querySelector(".request-friend");
      console.log("Friend button element:", requestFriendButton);
      console.log("data-user-id attribute exists:", requestFriendButton.hasAttribute("data-user-id"));

resultsContainer.appendChild(item);

requestFriendButton.addEventListener("click", async () => {
  const friend2_id = parseInt(requestFriendButton.getAttribute("data-user-id"));
  const token = localStorage.getItem('token');

  if (!token) {
    alert("You must be logged in to add friends.");
    return;
  }

  // Decode token to get your user ID
  const { id: friend1_id } = decodeJWT(token);

  console.log (friend1_id, friend2_id);

  try {
    const response = await fetch("https://bloom-zkk8.onrender.com/sendFriendRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user1_id: friend1_id, user2_id: friend2_id })
    });

    const result = await response.json();

    if (response.ok) {
      requestFriendButton.textContent = "Friend Requested";
      requestFriendButton.disabled = true;
    } else {
      alert("Failed to send request: " + result.error);
    }
  } catch (err) {
    console.error("Error sending friend request:", err);
  }
});     
          
      const requestCollabButton = item.querySelector(".request-collab");
      requestCollabButton.addEventListener("click", async () => {
        const user2_id = requestCollabButton.getAttribute("data-user-id");

        try {
          const res = await fetch("https://bloom-zkk8.onrender.com/sendCollabRequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user1_id: CURRENTuserID, user2_id })
          });
          const result = await res.json();
          alert(result.message || "Request sent!");
          requestCollabButton.innerHTML = `Requested!`;
          requestCollabButton.disabled = true;
        } catch (err) {
          console.error("Request failed:", err);
          alert("Something went wrong.");
        }
      });
    });
  } catch (err) {
    console.error('Search error:', err);
    resultsContainer.innerHTML = '<p>Error fetching results.</p>';
  }
});
  

const friendReqs = document.querySelectorAll('.friendReq');
friendReqs.forEach(friendReq => {
const acceptBtn = friendReq.querySelector('#accept');
const rejectBtn = friendReq.querySelector('#reject');
const user2_id = friendReq.dataset.senderId; 
const acceptBtn1 = document.getElementById("acceptBtn");
if (acceptBtn1) {
acceptBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const res = await fetch("https://bloom-zkk8.onrender.com/acceptFriendRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1_id: CURRENTuserID, user2_id })
    });
    const result = await res.json();
    alert(result.message || "Accepted!");
    friendReq.remove();
  } catch (err) {
    console.error("Accept failed:", err);
    alert("Could not accept friend request.");
  }
});}

rejectBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const res = await fetch("https://bloom-zkk8.onrender.com/rejectFriendRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1_id: CURRENTuserID, user2_id })
    });
    const result = await res.json();
    alert(result.message || "Rejected!");
    friendReq.remove();
  } catch (err) {
    console.error("Reject failed:", err);
    alert("Could not reject friend request.");
  }
});
});


const collabReqs = document.querySelectorAll('.friendReq');
collabReqs.forEach(collabReq => {
const acceptBtn = collabReq.querySelector('#acceptCollab');
const rejectBtn = collabReq.querySelector('#rejectCollab');
const user2_id = collabReq.dataset.senderId; 

acceptBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const res = await fetch("https://bloom-zkk8.onrender.com/acceptCollabRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1_id: CURRENTuserID, user2_id: user2_id , plant_id})
    });
    const result = await res.json();
    alert("Accepted!");
    if (result.message === 'Collaboration accepted and plant shared successfully') {
      
        console.log('Collaboration accepted, both users are now sharing the same plant!');
        await getPlantProgress(); }
      else { console.error('Failed to accept collaboration.');}

    collabReq.remove();

  } catch (err) {
    console.error("Accept failed:", err);
    alert("Could not accept collab request.");
  }
});

rejectBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const res = await fetch("https://bloom-zkk8.onrender.com/rejectCollabRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1_id: CURRENTuserID, user2_id })
    });
    const result = await res.json();
    alert(result.message || "Rejected!");
    collabReq.remove();
  } catch (err) {
    console.error("Reject failed:", err);
    alert("Could not reject collab request.");
  }
});
});


async function loadCollabRequests() {
  const res = await fetch(`/myCollabRequests/${CURRENTuserID}`);
  const data = await res.json();
  const container = document.getElementById("collabReqSection");
  container.innerHTML = ""; 

  data.forEach(user => {
    const div = document.createElement("div");
    div.className = "request-card";
    div.innerHTML = `
      <img src="/getProfilePic/${user.profilepic || 'profile.jpg'}" />
      <h3>${user.displayname}</h3>
      <p>@${user.username}</p>
      <p>Plant ID: ${user.plant_id}</p>
      <button onclick="acceptCollab(${CURRENTuserID}, ${user.other_id}, ${user.plant_id})">Accept</button>
      <button onclick="rejectCollab(${CURRENTuserID}, ${user.other_id}, ${user.plant_id})">Reject</button>
    `;
    container.appendChild(div);
  });
}