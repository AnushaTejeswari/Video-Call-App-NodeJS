const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const stream = require('./ws/stream');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

let cors=require('cors')

mongoose.connect('mongodb+srv://Anusha:anusha123@cluster0.sllbp.mongodb.net/myusers?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('open', () => console.log('Connected to Database!'));
db.on('error', () => console.log('Error in connecting to Database.'));

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors()) //security purposes
app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );
app.use('/static',express.static(path.join(__dirname,"..","build","static")))
app.use(express.static(path.join(__dirname,"build")))



const UserSchema = mongoose.Schema({
	name: String,
	email: String,
	phone: String,
	password: String,
	userType: String,
	programs: Array,
});
const User = new mongoose.model('User', UserSchema);

app.post("/code",(req,res)=>{
	return res.status(200).json({code:req.body.code})
})
// User register API
app.post('/signup', (req, res) => {
	var data = {...req.body,"programs":[{"name":"1.py","date":"13-04-2022","code":code}]};
	console.log(req.body,"data",data)
	db.collection('users').insertOne(data, (err, result) => {
		if (err) throw err;
		delete data.password;
		delete data._id;
		return res.status(200).json({ message: 'User added successfully', user: data, status: 'success' });
	});
});

// User Login API
app.post('/login', (req, res) => {
	var data = req.body;
	User.findOne(data, (err, result) => {
		if (err) throw err;
		if (result) {
			return res.status(200).json({
				user: { name: result.name, email: result.email, phone: result.phone, userType: result.userType },
				status: 'success'
			});
		} else {
			res.status(403).json({ message: 'Invalid username or password', status: 'error' });
		}
	});
});

app.get('/', (req, res) => {
	res.set({
		'Allow-access-Allow-Origin': '*'
	});
	res.sendFile(__dirname + '/index.html');
});



app.get('/compile',(req,res)=>{
    res.sendFile(path.join(__dirname,"..","build","app.html"))
    //res.send("hielo")
})


io.of('/stream').on('connection', stream);

server.listen(8000);
