function init(){

  var socket = io.connect("http://10.20.0.114:4000");
  socket.emit('subscribe', uuid);
  var map = L.map('canvas',{
    center: [0, 0],
    zoom: 2,
    zoomControl: false,
    attributionControl:false
  })
  L.control.attribution({prefix:'<a target="_blank" href="https://leafletjs.com/">Leaflet</a>'}).addTo(map)
  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {attribution: 'Data by <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles by <a target="_blank" href="https://carto.com/attribution">Carto</a>'}).addTo(map);
  L.control.zoom({position: 'bottomright'}).addTo(map)

  var myIcon = L.icon({
      iconUrl: '/img/star.png',
      iconSize: [18, 18],
      iconAnchor: [5, 5]
  });
  var me = L.marker().setIcon(myIcon)
  var markers = Array();
  var watchId;

  function sendLocation(){
    navigator.geolocation.getCurrentPosition(
      p => {
        socket.emit('locationUpdate', {room:uuid, latLng:[p.coords.latitude, p.coords.longitude]});
        me.setLatLng([p.coords.latitude, p.coords.longitude]).addTo(map)
        map.setView([p.coords.latitude, p.coords.longitude], 13)
        $('.sendlocation').addClass('on').text('Location on')
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
    $('.sendlocation').removeClass('on').text('Location off')
    navigator.geolocation.clearWatch(watchId);
    socket.emit('stopLocationUpdate', uuid);
    watchId = false;
    me.removeFrom(map)
  }

  $('.sendlocation').on('click', e => {
    if(watchId){
      stopSendLocation()
    }else{
      sendLocation()
    }
  })

  socket.on('locationUpdate', data => {
    console.log(data)

    if(data.id in markers){
      markers[data.id].setLatLng(data.latLng)
    }else{
      markers[data.id] = L.marker(data.latLng)
      markers[data.id].setIcon(myIcon).addTo(map);
    }
  });

  socket.on('stopLocationUpdate', id => {
    markers[id].removeFrom(map);
    delete markers[id];
  });

  window.addEventListener("unload", function(e){
     socket.emit('stopLocationUpdate', uuid);
  }, false);


  var copiedTimer;
  new ClipboardJS('.copylink');
  $('.copylink').on("click", e => {
    $('.copylink').addClass('copied').text("Copied!")
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(function(){
      $('.copylink').removeClass('copied').text("Copy link")

    },1500)
  })

}




if(navigator.geolocation) {
  init();
}else {

}
