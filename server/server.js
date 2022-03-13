const {createGameState, gameLoop } = require('./game.js')
const {FRAME_RATE, ANGULAR_SPEED, REVERSE_SPEED, SPEED, RADIUS, BULLET_SPEED } = require('./constants.js')

const state = {};
const clientRooms = {};

const io = require('socket.io')({
  cors: {
    origin: "https://tanks.bruinclubs.com"
  }
})

io.on('connection', client => {

  client.on('newGame', () => handleNewGame(client));
  client.on('joinGame', code => handleJoinGame(client, code))
  client.on('keydown', key => handleKeyDown(client, key));
  client.on('keyup', key => handleKeyUp(client, key));
})

function startGameInterval(roomName) {
  
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    if (!winner)
      io.sockets.in(roomName).emit('gameState', JSON.stringify(state[roomName]));
    else {
      io.sockets.in(roomName).emit('gameOver', winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);

  setTimeout(() => clearInterval(intervalId), 20 * 1000);
}

function handleKeyDown(client, key) {
  let roomName = clientRooms[client.id];
  try {
    key = parseInt(key);
  } catch(e){
    console.log(e);
    return;
  }
  if(!state[roomName])
    return;

  let player = state[roomName].players[client.number];
  if(!player)
    return;
  if(!player.keysdown.includes(key))
    player.keysdown.push(key);

}

function handleKeyUp(client, key){
  let roomName = clientRooms[client.id];
  try {
    key = parseInt(key);
  } catch(e){
    console.log(e);
    return;
  }
  if(!state[roomName])
    return;

  let player = state[roomName].players[client.number];
  if(!player || !player.keysdown.includes(key))
    return;

  player.keysdown = player.keysdown.filter(k => k !== key);
}

function handleNewGame(client){
  const roomName = makeid(3);
  clientRooms[client.id] = roomName;
  client.emit('gamecode', roomName);

  state[roomName] = createGameState();

  client.join(roomName);
  client.number = 0;
  client.emit('init', 0);
}

function handleJoinGame(client, code){
  const room = io.sockets.adapter.rooms.get(code);

  /*let allUsers;
  if (room)
    allUsers = room.sockets;*/
  let numClients = 0;
  if (room)
    numClients = room.size

  console.log(room, numClients);
  if (numClients === 0){
    client.emit('unknownGame');
    return;
  }
  else if(numClients > 2){
    client.emit('tooManyPlayers');
    return;
  }

  clientRooms[client.id] = code;
  client.join(code);
  client.number = numClients;
  client.emit('init', client.number);

  startGameInterval(code);
}


function makeid(len){
  let result = ''
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  for(let i = 0; i < len - 1; i++){
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += (Math.floor(Math.random() * 10)).toString();
  return result;
}

io.listen(process.env.PORT || '3000')