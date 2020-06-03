console.log(uuid);






function init(){
  var socket = io.connect("http://10.20.0.114:4000");
  socket.emit('subscribe', uuid);
  var map = L.map('map').setView([36.438348, -10.483509], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  var myIcon = L.icon({
      iconUrl: '/img/dot.png',
      iconSize: [10, 10],
      iconAnchor: [5, 5]
  });
  var me = L.marker().setIcon(myIcon)


  var watchId;
  function sendLocation(){
    navigator.geolocation.getCurrentPosition(
      p => {
        console.log(p)
        me.setLatLng([p.coords.latitude, p.coords.longitude]).addTo(map)
        map.setView([p.coords.latitude, p.coords.longitude], 13)
        $('button').addClass('on').text('Location on')
        watchId = navigator.geolocation.watchPosition(
          p => {


            socket.emit('locationUpdate', {room:uuid, latLng:[p.coords.latitude, p.coords.longitude]});    


            me.setLatLng([p.coords.latitude, p.coords.longitude])
          },null,{enableHighAccuracy:true,timeout:60000,maximumAge:0}
        );

      },e => {

        console.log(e)


      },{enableHighAccuracy:true,timeout:60000,maximumAge:0}
    );


  }


  function stopSendLocation(){
    $('button').removeClass('on').text('Location off')
    console.log(watchId)
    navigator.geolocation.clearWatch(watchId);
    watchId = false;
    me.removeFrom(map)


  }




  $('button').on('click',e => {
    if(watchId){
      stopSendLocation()
    }else{

      sendLocation()


    }



  })


}




if(navigator.geolocation) {
  init();
}else {

}
