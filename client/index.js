'use strict';

$(document).ready(init);

var root, shots, players, shipCharts, myPlayer, winner, myUid;

function init(){
  root = new Firebase('https://battleship-ng.firebaseio.com/');
  root.onDisconnect().remove();
  var winner = root.child('winner');
  players = root.child('players');
  players.on('child_added', playerAdded);
  shipCharts = root.child('shipCharts');
  shipCharts.on('child_added', chartAdded);
  shots = root.child('shots');
  $('#login').click(loginPlayer);
  $('#create-username').click(createPlayer);
  $('#player-board td').click(addShip);
  $('#start').click(playerReady);
  $('#radar td').click(fireMissle);
  shots.on('child_added', shotsFired);
  winner.on('child_added', showWinner);
}

function showWinner(snapshot){
  alert(snapshot.winner+' wins the game!!');
  root.remove();
}

function shotsFired(snapshot){
  var player = snapshot.val().player;
  var coords = {x: snapshot.val().x, y: snapshot.val().y};
  console.log(player, coords);
  if ((player !== myUid) && ($('#player-board td[data-x="'+coords.x+'"][data-y="'+coords.y+'"]').hasClass('enemyship'))){
    $('#player-board td[data-x="'+coords.x+'"][data-y="'+coords.y+'"]').addClass('boomboom');
  } else if ((player !== myUid) && (!$('#player-board td[data-x="'+coords.x+'"][data-y="'+coords.y+'"]').hasClass('enemyship'))){
    $('#player-board td[data-x="'+coords.x+'"][data-y="'+coords.y+'"]').removeClass().css('background-color','red');
  }
}

function fireMissle(){
  var x = $(this).data('x');
  var y = $(this).data('y');
  if (($(this).hasClass('enemyship')) && (!($(this).hasClass((myUid.split(':').join('')))) || $(this).hasClass('simplelogin'+'*'))){
    $(this).addClass('boomboom');
    console.log('boom');
    shots.push({player: myUid,x:x,y:y});
  } else {
    $(this).addClass('noboom');
    console.log('no hit');
    shots.push({player: myUid,x:x,y:y});
  }
  if ($('.boomboom').length >= 17){
  alert('winner!!!!');
  }
}

function playerReady(){
  $('#user-setup').css('display','none');
  pushChart();
  root.orderByValue().on('value',function(snapshot){console.log(snapshot.val());});

}

function pushChart(){
  var positions = $('.ship').map(function(i,value){
    var x = value.dataset.x;
    var y = value.dataset.y;
    shipCharts.push({player: (myUid.split(':').join('')),x:x,y:y}) ;
  });
  console.log(positions);
  shipCharts.push(positions);
}

function chartAdded(snapshot){
  var x = snapshot.val().x;
  var y = snapshot.val().y;
  var player = snapshot.val().player;
  $('#radar td[data-x="'+x+'"][data-y="'+y+'"]').addClass('enemyship').addClass(player);
}

function addShip(event){
  var x = $(this).data('x');
  var y = $(this).data('y');
  var ship = $('#ship-select').find(':selected').attr('id');
  var shipLength = $('#ship-select').find(':selected').data('n');
  $('.'+ship).css('background-image','initial');
  $('.'+ship).removeClass('ship');
  if(event.shiftKey){
    if (okayToPlace({x: x, y: y},'vertical', shipLength)){
      for(var i2 = 0;i2 < shipLength; i2++){
        var $current2 = $('#player-board td[data-x="'+x+'"][data-y="'+(y-i2)+'"]');
        $current2.css('background-image','url("/assets/'+ship+'/'+ship+'-'+i2+'.png")');
        $current2.css('background-size','cover').css('-webkit-transform','rotate(-90deg)');
        $current2.addClass(ship).addClass('ship');
      }
    }
  }
  else {
    if (okayToPlace({x: x, y: y},'horizontal', shipLength)){
      for(var i = 0;i < shipLength; i++){
        var $current = $('#player-board td[data-x="'+(x-i)+'"][data-y="'+y+'"]');
        $current.css('background-image','url("/assets/'+ship+'/'+ship+'-'+i+'.png")');
        $current.css('background-size','cover');
        $current.addClass(ship).addClass('ship');
      }
    }
  }
}

function okayToPlace(startCoords,orientation,shipLength){
  var isOkay;
  if (orientation === 'horizontal'){
    isOkay = ((startCoords.x - (shipLength - 1)) >= 0) ? true : false;
  } else {
    isOkay = ((startCoords.y - (shipLength - 1)) >= 0) ? true : false;
  }
  return isOkay;
}

function pushPlayer(player){
  var name = player;
  var uid = root.getAuth().uid;

  players.push({
    name: name,
    uid: uid
  });
}

function playerAdded(snapshot){
  myPlayer = myPlayer ? myPlayer : snapshot.val();
  myUid = root.getAuth() ? root.getAuth().uid : '';
}

function loginPlayer(){
  var uName = $('#username').val();
  var pWord = $('#password').val();
  console.log('user: ', uName,'pass: ', pWord );

  root.authWithPassword({
    email    : uName,
    password : pWord
  }, function(error, authData) {
    if (error) {
      console.log('Login Failed!', error);
    } else {
      console.log('Authenticated successfully with payload:', authData);
    }
  }, {
    remember: 'sessionOnly'
  });
  var player = root.getAuth().password.email.split('@')[0];
  pushPlayer(player);
}

function createPlayer(){
  var newName = $('#username').val();
  var newPWord = $('#password').val();
  console.log('user: ', newName,'pass: ', newPWord );

  root.createUser({
    email    : newName,
    password : newPWord
  }, function(error, userData) {
    if (error) {
      console.log('Error creating user:', error);
    } else {
      console.log('Successfully created user account with uid:', userData.uid);
    }
  });
}
