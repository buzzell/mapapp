var app = require('./app.js');
var socket = require("socket.io");
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
var server = app.listen(port, function(){
	console.log("Now listening to requests on port", port);
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
