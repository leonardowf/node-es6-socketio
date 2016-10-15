import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import SocketIO from 'socket.io';

let app = express();
app.server = http.createServer(app);
let io = new SocketIO(app.server);

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));


app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port);

	console.log(`Started on port ${app.server.address().port}`);
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

export default app;
