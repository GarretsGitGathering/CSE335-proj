// Check for stored userId on page load
let userId = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", () => {
    loadPosts();

    // Show or hide logout button based on login state
    const logoutButton = document.getElementById("logoutButton");
    if (userId) {
        logoutButton.style.display = "inline-block";
    } else {
        logoutButton.style.display = "none";
    }
});

// Function to log out
function logout() {
    localStorage.removeItem("userId");
    userId = null;
    window.location.href = "login.html";
}

// Function to toggle the post form
function togglePostForm() {
    const postForm = document.getElementById("postForm");
    postForm.style.display = postForm.style.display === "none" ? "block" : "none";
}

// Function to create a new post
function createPost() {
    const image_url = document.getElementById("image_url").value;
    const description = document.getElementById("description").value;

    if (!userId) {
        alert("You must be logged in to create a post.");
        return;
    }

    fetch('https://cse350-proj.onrender.com/createPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, image_url, description })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to create post");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                loadPosts(); // Reload posts
                document.getElementById("image_url").value = '';
                document.getElementById("description").value = '';
                togglePostForm(); // Hide the form
            } else {
                alert(data.error || "Failed to create post");
            }
        })
        .catch(error => console.error("Error:", error));
}

// Function to load posts
function loadPosts() {
    fetch('https://cse350-proj.onrender.com/getPosts')
        .then(response => response.json())
        .then(posts => {
            const postContainer = document.getElementById("postContainer");
            postContainer.innerHTML = ''; // Clear previous posts

            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.classList.add("post");
                postElement.innerHTML = `
                    <h3>${post.username}</h3>
                    <img src="${post.image_url}" alt="Post Image" style="width:100%">
                    <p>${post.description}</p>
                    <div class="comments">
                        <h4>Comments:</h4>
                        <div class="comment-list" id="comments-${post.post_id}"></div>
                        ${userId ? `
                            <textarea id="commentInput-${post.post_id}" placeholder="Add a comment..."></textarea>
                            <button onclick="addComment(${post.post_id})">Post Comment</button>
                        ` : '<p>Please log in to comment.</p>'}
                    </div>
                `;
                postContainer.appendChild(postElement);

                // Load comments for the post
                loadComments(post.post_id);
            });
        })
        .catch(error => console.error("Error:", error));
}

// Function to load comments for a post
function loadComments(postId) {
    fetch(`https://cse350-proj.onrender.com/getComments?post_id=${postId}`)
        .then(response => response.json())
        .then(comments => {
            const commentList = document.getElementById(`comments-${postId}`);
            commentList.innerHTML = ''; // Clear existing comments

            comments.forEach(comment => {
                const commentElement = document.createElement("div");
                commentElement.classList.add("comment");
                commentElement.textContent = `${comment.username}: ${comment.content}`;
                commentList.appendChild(commentElement);
            });
        })
        .catch(error => console.error("Error:", error));
}

// Function to add a comment
function addComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const content = commentInput.value.trim();

    if (!content) {
        alert("Comment cannot be empty.");
        return;
    }

    fetch('https://cse350-proj.onrender.com/addComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, user_id: userId, content })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                commentInput.value = ''; // Clear the input
                loadComments(postId); // Reload comments
            } else {
                alert(data.error || "Failed to post comment");
            }
        })
        .catch(error => console.error("Error:", error));
}
