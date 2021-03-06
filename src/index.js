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
let server = http.createServer(app);
app.server = server;
let io = new SocketIO(server);

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

var connectedClients = 0;
var numberOfClicks = 0;

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port);

	console.log(`Started on port ${app.server.address().port}`);

  io.on('connection', function(socket) {
    console.log('a user connected');
    console.log(socket.id);

    connectedClients++;
    socket.emit('number_of_clients', {value: connectedClients});
    socket.emit('number_of_clicks', {value: numberOfClicks});
    socket.broadcast.emit('number_of_clients', {value: connectedClients});

    socket.on('disconnect', function() {
      connectedClients--;
      socket.broadcast.emit('number_of_clients', {value: connectedClients});

    });

    socket.on("click", function() {
      numberOfClicks++;
      console.log(`numberOfClicks: ${numberOfClicks}`);
      socket.emit('number_of_clicks', {value: numberOfClicks});
      socket.broadcast.emit('number_of_clicks', {value: numberOfClicks});
    });
  });
});

app.get('/', function (req, res) {
  console.log('banana');
  res.send('Hello World!');



});




export default app;
