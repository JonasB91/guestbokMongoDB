//Will use MongoDB to store Blogposts
//app.js is the client server-side setting up server and database for guestbook project.
let express = require("express");
let app = express(); // app using express
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let bcrypt = require('bcrypt');
const session = require('express-session');

require('dotenv').config() // måste importera dotenv package 

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // åtkomst till public folder för stylesheets etc.
app.use(session({ secret: 'snusdosan123', resave: true, saveUninitialized: true }));


// INDEX route to serve HTML

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/index');
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.get('/blog', (req, res) => {
    if (!req.session.user) {
        // om användaren inte är inloggad kör login
        return res.redirect('/login');
    }

    // om användaren är inloggad så kör index
    res.sendFile(__dirname + '/public/blog.html');
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

//Login Schema to add user name and user password to Mongo Database...
let loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Collection in database...
let userCollection = new mongoose.model("users", loginSchema);


/*APP POST
SIGN UP USERS TO DATABASE
*/
app.post('/signup', async (req, res) => {
let username = req.body.username;
let hashPassword = req.body.password;
//Kolla om user redan finns i databasen
let existingUser = await userCollection.findOne({ name: username });
    if(existingUser) {
        //om en user redan finns så ska vi skriva ut error
        return res.status(400).send("User already exists!")
    }

    //om en user inte finns i databasen, fortsätt med att registrera
    try {
        // Hash password
        let hashedPassword = await bcrypt.hash(hashPassword, 10);

        //Skapar en newUser 
        let newUser = await userCollection.create({
             name: username, 
             password: hashedPassword,
            });
            
            //Loggar om skapas ny användare, Ny användare skapad...
        console.log("New User Registered...", newUser);
        res.redirect('/login.html');// om ny user skapas ska vi skickas till login sidan.
    } catch (error) {
        console.error(error)
        console.log("Internal Server Error", error)
    }
});

/*APP POST
LOGIN USERS TO DATABASE
*/
app.post('/login', async (req, res) => {
    try {
        let checkUser = await userCollection.findOne( {name: req.body.username});
        if(!checkUser) {
            res.send("User name cannot be found");
            console.log("User name cannot be found in database!");
        } else {
            let isPasswordCorrect = await bcrypt.compare(req.body.password, checkUser.password);
            if(isPasswordCorrect) {
                //Session som indikerar om user är inloggad.
                req.session.user = checkUser;
                res.redirect('/blog.html')
            } else {
                res.send("Wrong Password")
                console.log("Wrong Password!")
            }
        }
    } catch (error) {
        console.log(error);
        
    }
})

//LOUGOUT ROUTE...
app.get('/logout', (req, res) => {
    //Logga ut nuvarande user från session
    req.session.destroy((error) => {
        if (error) {
            console.error('Error Kunde inte logga ut!', error);
        } else {
            res.redirect('/login.html'); // Redirect to the login page after logout
            console.log("User Logged out from session!")
        }
    });
});


//BlogPostSchema to add data to Mongo Database..
let blogPostSchema = new mongoose.Schema({
    name: String,
    phone: Number,
    email: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
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
    let posts = await BlogPost.find({}).sort({ createdAt: -1 });
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
    res.redirect('/blog.html')
 } catch (error) { // fånga upp error, OM error  skicka felkod 500, 
    console.error(error)
    res.status(500).send("Internal Server Error");
 }
});


//app running on port.....
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
