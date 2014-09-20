console.log("starting up server...");

var http = require("http");
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')

// db stuff
var connection  = require('express-myconnection'); 
var mysql = require('mysql');

// session stuff
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

var app = express();
app.set('port', process.env.PORT || 8888);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }, secret: 'Holiday Bottle For Unity', saveUninitialized: true, resave: true}));
app.use(flash());

app.use(
	connection(mysql,{
		host: 'localhost',
		user: 'root',
		password : '87uncle13',
        port : 3306, //port mysql
        database:'likesdb'
    },'request')
	);

app.get('/', function (req, res) {
	res.send('<html><body><h1>Hello World</h1></body></html>');
});

app.get('/links', function (req, res) {
	req.getConnection(function(err,connection){

		connection.query('SELECT * FROM links',function(err,rows) {
			if(err)
				console.log("Error Selecting : %s ", err);
			//var myJsonString = JSON.stringify(rows);
			res.render('links',{page_title:"links",data:rows});
		});

	});
});

app.get('/links/add', function(req, res) {
	res.render('addlink', {page_title:"add link"});
});

app.post('/links/add', function(req, res) {
	var data = {
            url: req.body.url
    };

    if(req.body.url) {
    	if(req.body.password && req.body.password == 'rofl') {
		    req.getConnection(function(err,connection){
				connection.query("INSERT INTO links SET ? ",data, function(err, rows) {

		          if (err)
		              console.log("Error inserting : %s ",err );
		         
		          res.redirect('/links');
		          
		        });
			});
		} else {
			req.flash('info', "Wrong password!");
			res.render('addlink', {page_title:"add link", messages: req.flash('info')});
		}
	} else {
		req.flash('info', "No URL provided!");
		res.render('addlink', {page_title:"add link", messages: req.flash('info')});
	}
});

app.get('/links/delete/:id', function(req, res) {
	var id = req.params.id;
    req.getConnection(function(err,connection){
		connection.query("DELETE FROM links WHERE id = ? ", id, function(err, rows) {

          if (err)
              console.log("Error deleting : %s ",err );
         
          res.redirect('/links');
        });
	});
});

app.use(function (req,res) {
	res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('express server started up! (port:' + app.get('port') + ")");
});