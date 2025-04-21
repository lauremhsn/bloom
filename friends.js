const searchInput = document.querySelector('.searchBar');
const searchResults = document.getElementById('searchResults');
const searchResultItems = document.querySelectorAll('.searchResultItem');
const searchBtn = document.getElementById('searchBtn');



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
        const item = document.createElement('div');
        item.className = 'searchResultItem';
        item.innerHTML = `
          <div class="thePfp">
              <img src="${user.profilepic || 'profile.jpg'}" alt="Profile Picture">
          </div>
          <div class="userInfo">
              <h1 class="name">${user.displayname}</h1>
              <p class="username">@${user.username}</p>
          </div>
        `;
        resultsContainer.appendChild(item);
      });
    } catch (err) {
      console.error('Search error:', err);
      resultsContainer.innerHTML = '<p>Error fetching results.</p>';
    }
  });
  
  
//accept/reject stuff
const friendReqs = document.querySelectorAll('.friendReq');
friendReqs.forEach(friendReq => {
    const acceptBtn = friendReq.querySelector('#accept');
    const rejectBtn = friendReq.querySelector('#reject');
    acceptBtn.addEventListener('click', (event) => {
        event.preventDefault();
        friendReq.remove();
    });
    rejectBtn.addEventListener('click', (event) => {
        event.preventDefault();
        friendReq.remove();
    });
});

const collabReqs = document.querySelectorAll('.collabReq');
collabReqs.forEach(collabReq => {
    const acceptBtn = collabReq.querySelector('#acceptCollab');
    const rejectBtn = collabReq.querySelector('#rejectCollab');
    acceptBtn.addEventListener('click', (event) => {
        event.preventDefault();
        collabReq.remove();
    });
    rejectBtn.addEventListener('click', (event) => {
        event.preventDefault();
        collabReq.remove();
    });
});
