//Will use MongoDB to store Blogposts
//app.js is the client server-side setting up server and database for guestbook project.
let express = require("express");
let app = express(); // app using express
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
require('dotenv').config() // måste importera dotenv package 

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // åtkomst till public folder för stylesheets etc.

// INDEX route to serve HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

//Connect to MongoDB using try-catch. hämtar mongoDB uri från .env som sätter port och uri till databasen.
let mongoConnect = async () => {
    try {
        let connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB is connected successfully!!!");
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

//run the MongoDB
mongoConnect();

//BlogPostSchema to add data to Mongo Database..
let blogPostSchema = new mongoose.Schema({
    name: String,
    phone: Number,
    email: String,
    content: String 
});

// model för blogposts som också tar in blogpostSchema för DB
let BlogPost = mongoose.model('BlogPost', blogPostSchema);

//Sätta upp formuläret och visa blog posts på index sidan.
/*GET
INDEX*/ 
//Index ROUTE
app.get('/blogposts', async (req, res) => {
    console.log("Fetching blog posts....")
   try {
    let posts = await BlogPost.find({});
    res.json(posts)
   } catch (error) { // fånga upp error, OM error så skicka felkod 500.
    console.error(error)
    res.status(500).send("Internal Server Error")
   }
});

//POST ROUTE för att adda en ny post
//INDEX.HTML
app.post("/addpost", async (req, res) => {
 try {
    let newPost = new BlogPost({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        content: req.body.content
    });
    
    //sparar ny data till databasen.
    await newPost.save();
    //Loggar ut ett meddelande om ny blogpost är adderat till databasen...
    console.log('New Blog Post added to Mongo Database:', newPost);
    
    // redirectar till root:
    res.redirect('/')
 } catch (error) { // fånga upp error, OM error  skicka felkod 500, 
    console.error(error)
    res.status(500).send("Internal Server Error");
 }
});





//app running on port.....
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
