// Javascript DOM för index.html

async function getBlogPosts() {
    try {
        let response = await fetch('/blogposts');
        let posts = await response.json();

        //Clearar nuvarande blog-posts elementet
        let blogPostContainer = document.getElementById('blog-posts');
        blogPostContainer.innerHTML = '';

        //Visar nya blogposts
        posts.forEach(post => {
            let postContainer = document.createElement('div');
            postContainer.classList.add('blog-post');// Styling för varje blogpost container

            // formatera datum för varje blogpost.
        let formattedDate = new Date(post.createdAt).toString();    
            // lägg till content för varje blogpost...
        postContainer.innerHTML = `
            <p><strong>Name:</strong> ${post.name}</p>
            <p><strong>Email:</strong> ${post.email}</p>
            <p><strong>Phone:</strong> ${post.phone}</p>
            <p><strong>Message:</strong> ${post.content}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <hr>
        `;
            //appendar
        blogPostContainer.appendChild(postContainer);
        });
    } catch (error) { // fångar upp error OM error så logga error 
        console.log('Error finding blog posts:', error)
    }
}

// kör functionen för att fetcha blogposts och displaya dom i listan.
getBlogPosts();