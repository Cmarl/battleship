'use strict';

$(document).ready(init);

var root, players, shipCharts, myPlayer, myUid;

function init(){
  root = new Firebase('https://battleship-ng.firebaseio.com/');
  players = root.child('players');
  players.on('child_added', playerAdded);
  shipCharts = root.child('shipCharts');
  shipCharts.on('child_added', chartAdded);
  $('#login').click(loginPlayer);
  $('#create-username').click(createPlayer);
  $('#player-board td').click(addShip);
  $('#start').click(playerReady);
}

function playerReady(){
  pushChart();
  $('#user-setup').css('display','none');
}

function pushChart(){
  var positions = $('.ship').map(function(i,value){
    var x = value.dataset.x;
    var y = value.dataset.y;
    return {x:x ,y:y };
  });
  shipCharts.push(positions);
}

function chartAdded(){
  $('#player-board td').each(function(td){
  });
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
  myPlayer = snapshot.val();
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
