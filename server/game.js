const {FRAME_RATE, ANGULAR_SPEED, REVERSE_SPEED, SPEED, RADIUS, BULLET_SPEED } = require('./constants.js')

module.exports = {
  createGameState,
  gameLoop,
}

function createGameState() {
  return {
    players: [{
      pos: {
        x: 50,
        y: 50,
      },
      dir: Math.PI/2,
      vel: {
        x: 0,
        y: 0,
        theta: 0,
      },
      keysdown: []
    },
    {
      pos: {
        x: 150,
        y: 150,
      },
      dir: 3*Math.PI/2,
      vel: {
        x: 0,
        y: 0,
        theta: 0,
      },
      keysdown: []
    }],
    bullets: [],
    gridsize: 500,
    active: true,
  }
}

function gameLoop(state){
  if(!state)
    return;

  for (let player of state.players){
    let bullet = updatePlayerVelocity(player);
    if(bullet)
      state.bullets.push(bullet);

    let xUpdated = player.pos.x + player.vel.x;
    let yUpdated = player.pos.y + player.vel.y;

    if(xUpdated > 0 && xUpdated < state.gridsize)
      player.pos.x += player.vel.x;
    if(yUpdated > 0 && yUpdated < state.gridsize)
      player.pos.y += player.vel.y;
    player.dir += player.vel.theta;
  }


  for (let b in state.bullets){
    let bullet = state.bullets[b];
    bullet.pos.x += bullet.vel.x;
    bullet.pos.y += bullet.vel.y;
    if(bullet.pos.x < 0 || bullet.pos.x > state.gridsize || bullet.pos.y < 0 || bullet.pos.y > state.gridsize)
      state.bullets.splice(b,1);
  }

  return 0;
}

function updatePlayerVelocity(player){
  const keysdown = player.keysdown;


  if(keysdown.includes(65) && !keysdown.includes(68))
    player.vel.theta = - ANGULAR_SPEED;
  else if (!keysdown.includes(65) && keysdown.includes(68))
    player.vel.theta = ANGULAR_SPEED;
  else
    player.vel.theta = 0;


  if(keysdown.includes(87) && !keysdown.includes(83)){
    player.vel.x = SPEED * Math.cos(player.dir);
    player.vel.y = SPEED * Math.sin(player.dir);
  }
  else if (keysdown.includes(83) && !keysdown.includes(87)){
    player.vel.x = - REVERSE_SPEED * Math.cos(player.dir);
    player.vel.y = - REVERSE_SPEED * Math.sin(player.dir);
  }
  else {
    player.vel.x = 0;
    player.vel.y = 0;
  }


  if(keysdown.includes(32)){
    let bullet = {
      pos: {
        x: player.pos.x + RADIUS * Math.cos(player.dir),
        y: player.pos.y + RADIUS * Math.sin(player.dir),
      },
      vel: {
        x: BULLET_SPEED * Math.cos(player.dir),
        y: BULLET_SPEED * Math.sin(player.dir),
      },
    };
    return bullet;
  }
  return 0;
}