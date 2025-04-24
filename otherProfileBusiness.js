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

document.addEventListener('DOMContentLoaded', () => {
    const nameFr = document.querySelector('.name');
    const username = document.querySelector('.username');
    const number = document.querySelector('.number');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const pfpMain = document.querySelector('#mainPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const editNameInput = document.getElementById('editName');
    const editNumberInput = document.getElementById('editNumber');
    const postText = document.getElementById('postText');
    const postMedia = document.getElementById('postMedia');
    const postList = document.getElementById('postList');
    const flwBtn = document.getElementById("flwBtn");
  
    let newPfp = null;
  
    async function fetchUserProfile(userId) {
        try {
            const response = await fetch(`/profile/${userId}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('profile-username').innerText = data.username;
                document.getElementById('profile-displayName').innerText = data.displayname;
                document.getElementById('profile-accountType').innerText = data.accountType;

                if (data.profilepic) {
                    document.getElementById('profile-pic').src = `/getProfilePic/${data.profilepic}`;
                } else {
                    document.getElementById('profile-pic').src = 'default-profile-pic.jpg'; // Placeholder image
                }

                toggleFollowButton(userId);

                toggleFriendButton(userId);
            } else {
                console.error('Error fetching profile:', data.error);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    async function toggleFollowButton(userId) {
        const currentUserId = getCurrentUserId();

        try {
            const response = await fetch(`/checkFollowStatus?follower_id=${currentUserId}&followed_id=${userId}`);
            const data = await response.json();

            if (data.isFollowing) {
                flwBtn.innerText = "Unfollow";
                flwBtn.onclick = () => unfollowUser(currentUserId, userId);
            } else {
                flwBtn.innerText = "Follow";
                flwBtn.onclick = () => followUser(currentUserId, userId);
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    }

    async function followUser(followerId, followedId) {
        try {
            const response = await fetch('/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ follower_id: followerId, followed_id: followedId })
            });

            const data = await response.json();
            if (response.ok) {
                flwBtn.innerText = "Following!";
                flwBtn.style.backgroundColor = "#E2BFB3";
                flwBtn.style.cursor = "default";
                flwBtn.disabled = true;

                console.log('Followed user successfully');
                toggleFollowButton(followedId); 
            } else {
                console.error('Error following user:', data.error);
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    }

    async function unfollowUser(followerId, followedId) {
        try {
            const response = await fetch('/unfollow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ follower_id: followerId, followed_id: followedId })
            });

            const data = await response.json();
            if (response.ok) {
                flwBtn.innerText = "Follow";
                flwBtn.style.backgroundColor = "#4CAF50"; 
                flwBtn.disabled = false;

                console.log('Unfollowed user successfully');
                toggleFollowButton(followedId); 
            } else {
                console.error('Error unfollowing user:', data.error);
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    }

    function getCurrentUserId() {
        return "12345"; // Replace with the actual logic to get the current user ID
    }

    const userId = window.location.pathname.split("/").pop(); 
    fetchUserProfile(userId);

    flwBtn.addEventListener('click', () => {
        const currentUserId = getCurrentUserId(); 
        const userId = window.location.pathname.split("/").pop(); 

        if (flwBtn.innerText === "Follow") {
            followUser(currentUserId, userId);
        } else if (flwBtn.innerText === "Unfollow") {
            unfollowUser(currentUserId, userId);
        }
    });

});


// <a id="pfpLink" href="#">
//     <img id="profile-pic" src="blahbalh" />
// </a>

//  document.getElementById('profile-pic').src = `/getProfilePic/${data.profilepic}`

//  document.getElementById('pfpLink').href = `/profile/${data.username}`;

//  toggleFollowButton(userId);
//  toggleFriendButton(userId);