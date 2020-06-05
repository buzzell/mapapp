var app = require('./app.js');
var socket = require("socket.io");

var server = app.listen(4000, function(){
	console.log("Now listening to requests on port 4000");
});

var io = socket(server);

io.on("connection", function(socket){

	socket.on('subscribe', function(room) {
  	socket.join(room);
	})

	socket.on('stopLocationUpdate', room => {
		socket.to(room).emit('stopLocationUpdate',  socket.id);
	})

	socket.on('locationUpdate', data => {
		socket.to(data.room).emit('locationUpdate', {
			id: socket.id,
			latLng: data.latLng
		});
	})

	socket.on('chat', data => {
		socket.to(data.room).emit('chat', {
			message: data.message
		});
	})

});
