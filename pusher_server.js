var express = require('express');
var Pusher = require('pusher');
var app=express();
var pusher = new Pusher({
  appId: '84171',
  key: '599a9eb32ff37b5469f7',
  secret: '413438491ed4db5b583e'
});

app.use(express.static(__dirname + '/AC'));
app.get('/api/get/on',function(req,res){
  
pusher.trigger('private-channel', 'client-turnon', { message: "on" });
res.send('sended channel-1');
});
app.get('/api/get/off',function(req,res){
  
pusher.trigger('private-channel', 'client-turnoff', { message: "on" });
res.send('sended channel-1');
});
app.get('/hello.txt', function(req, res){

pusher.trigger('channel-1', 'test_event', { message: "hello world" });
  
});
    






var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
    console.log(req);
});

