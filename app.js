var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	expressSanitizer = require('express-sanitizer'),
	app = express();

// APP CONFIG
app.set('view engine', 'ejs');
app.use(express.static('public')); // To serve our custom stylesheet
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
mongoose.connect('mongodb://localhost/restful_blog_app', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
app.use(methodOverride('_method'));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});
var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
// 	title: 'Test Blog',
// 	image: 'https://source.unsplash.com/N0NLGH5YU90',
// 	body: 'Hey, this is a blog post!'
// });

// ========RESTful ROUTES========

app.get('/', function(req, res) {
	res.redirect('/blogs');
});
// INDEX ROUTE
app.get('/blogs', function(req, res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			res.render('index', { blogs: blogs });
		}
	});
});
// NEW ROUTE- GET Request- Create new blog post Form
app.get('/blogs/new', function(req, res) {
	res.render('new');
});

// CREATE ROUTE - POST Request
app.post('/blogs', function(req, res) {
	// sanitize the textarea
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// create blog
	Blog.create(req.body.blog, function(err, newPost) {
		if (err) {
			res.render('new');
		} else {
			// redirect to /blogs
			res.redirect('/blogs');
		}
	});
});

// SHOW ROUTE - GET Request
app.get('/blogs/:id', function(req, res) {
	// find correct Blog with specific ID
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			// render post with specific ID
			res.render('show', { blog: foundBlog });
		}
	});
});

// EDIT ROUTE - Edit Form
app.get('/blogs/:id/edit', function(req, res) {
	// find ID of post we need to edit
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			// render the edit form
			res.render('edit', { blog: foundBlog });
		}
	});
});

// UPDATE ROUTE - PUT Request
app.put('/blogs/:id', function(req, res) {
	// sanitize the textarea
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// Find blog with ID and update it
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

// DELETE ROUTE
app.delete('/blogs/:id', function(req, res) {
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/blogs');
		} else {
			// redirect to index
			res.redirect('/blogs');
		}
	});
});

// Start Server
app.listen(3000, function() {
	console.log('Server Listening on Port 3000!');
});
