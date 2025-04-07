const searchInput = document.querySelector('.searchBar');
const searchResults = document.getElementById('searchResults');
const searchResultItems = document.querySelectorAll('.searchResultItem');
const searchBtn = document.getElementById('searchBtn');



//search bar stuff
searchInput.addEventListener('focus', () => {
    searchResults.style.display = "block";
});
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !searchResults.contains(event.target)){
        searchResults.style.display = "none";
    }
});
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

searchBtn.addEventListener('click', () => {
    event.stopPropagation();
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
