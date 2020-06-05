function init(){

  var socket = io.connect("http://10.20.0.159:4000");
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
  var blipicon = L.icon({iconUrl: '/img/star.png', iconSize: [18, 18], iconAnchor: [5, 5]});
  var me = L.marker().setIcon(blipicon)
  var markers = Array();
  var watchId = false;

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
      },null,{enableHighAccuracy:true,timeout:60000,maximumAge:0}
    );
  }

  function stopSendLocation(){
    $('.sendlocation').removeClass('on').text('Location off')
    navigator.geolocation.clearWatch(watchId);
    socket.emit('stopLocationUpdate', uuid);
    watchId = false;
    me.removeFrom(map)
  }

  $('.sendlocation').on('click', e => { (watchId) ? stopSendLocation() : sendLocation() })

  socket.on('locationUpdate', data => {
    if(data.id in markers){
      markers[data.id].setLatLng(data.latLng)
    }else{
      markers[data.id] = L.marker(data.latLng)
      markers[data.id].setIcon(blipicon).addTo(map);
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

  var chatbox = false;
  $('.chat').on('click', e => {
    if(chatbox){
      $(".chatbox").animate({ top: '-100%' }, 250);
      $('.chat').removeClass("close").text("Chat");
      chatbox = false;
    }else{
      $(".chatbox").animate({ top: 0 }, 250);
      $('.chat').addClass("close").text("Close");
      chatbox = true;
    }
  })

  $('.messageinput textarea').on("keydown", e =>{
    if(e.keyCode == 13){
      e.preventDefault();
      sendmessage();
    }
  })

  $('.sendchat').on('click', sendmessage)

  function sendmessage(){
    let message = $('.messageinput textarea').val().trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    if(message != ""){
      $(".chatlist").append('<div class="message me">'+message+'</div>');
      $(".chatlist").scrollTop($(".chatlist")[0].scrollHeight);
      $('.messageinput textarea').val("").focus();
      $('.sendchat').blur();
      socket.emit('chat', {room:uuid, message: message});
    }
  }

  socket.on('chat', data => {
    $(".chatlist").append('<div class="message">'+data.message+'</div>');
    $(".chatlist").scrollTop($(".chatlist")[0].scrollHeight);
  })

}

if(navigator.geolocation) {
  init();
}else {
  $('.nosupport').css('display','flex');
}
