let userId = null;  // Store logged-in user ID

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch('https://cse350-proj.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            userId = data.user_id;
            window.location.href = "index.html";
        } else {
            alert("Login failed: " + (data.error || "Unknown error"));
        }
    })
    .catch(error => console.error('Error:', error));
}

function signup() {
    const username = document.getElementById("new_username").value;
    const password = document.getElementById("new_password").value;

    fetch('https://cse350-proj.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Signup successful! Please log in.");
            window.location.href = "login.html";
        } else {
            alert("Signup failed: " + (data.error || "Unknown error"));
        }
    })
    .catch(error => console.error('Error:', error));
}


function loadPosts() {
    fetch('https://cse350-proj.onrender.com/getPosts')
    .then(response => response.json())
    .then(posts => {
        const postContainer = document.getElementById("postContainer");
        postContainer.innerHTML = '';  // Clear previous posts

        posts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.innerHTML = `
                <h3>${post.username}</h3>
                <img src="${post.image_url}" alt="Post Image" style="width:100%">
                <p>${post.description}</p>
            `;
            postContainer.appendChild(postElement);
        });
    })
    .catch(error => console.error('Error:', error));
}

function togglePostForm() {
    const postForm = document.getElementById("postForm");
    postForm.style.display = postForm.style.display === "none" ? "block" : "none";
}

function createPost() {
    const image_url = document.getElementById("image_url").value;
    const description = document.getElementById("description").value;

    fetch('https://cse350-proj.onrender.com/createPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, image_url, description })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();  // Try to parse JSON
    })
    .then(data => {
        if (data.success) {
            loadPosts();  // Reload posts after successfully creating a new post
            document.getElementById("image_url").value = '';
            document.getElementById("description").value = '';
            togglePostForm();  // Hide the form again
        } else {
            alert("Failed to create post: " + (data.error || "Unknown error"));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while creating the post. Please try again.");
    });
}