<template>
<div>
  <canvas id="canvas" />
  <div class="my-2" v-if="gameCode">{{'Game Code: '+gameCode}}</div>
</div>
</template>

<script>
import io from 'socket.io-client';
const BG_COLOR = '#F0F0F0';

const socket = io('https://tanks-socket.herokuapp.com/');
let canvas, ctx;

export default {
  data(){
    return{
      lastKeyDown: 0,
      lastKeyTime: 0,

      playerNumber: 0,
      gameCode: '',
    }
  },

  mounted(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 500;

    socket.on('init', number => this.playerNumber = number)
    socket.on('gamecode', code => this.gameCode = code);
    socket.on('unknownGame', () => this.handleUnknownGame);
    socket.on('tooManyPlayers', () => this.handleTooManyPlayers);

    socket.on('gameState', data => this.handleGameState(data));
  },

  methods: {
    newGame(){
      socket.emit('newGame');
      document.addEventListener('keydown', this.keydown);
      document.addEventListener('keyup', this.keyup);
    },
    joinGame(code){
      socket.emit('joinGame', code);
      document.addEventListener('keydown', this.keydown);
      document.addEventListener('keyup', this.keyup);
    },
    handleUnknownGame(){
      this.$emit('unknownGame');
    },
    handleTooManyPlayers(){
      this.$emit('tooManyPlayers')
    },

    drawGame(state){
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const player of state.players){
        this.drawPlayer(player);
      }
      for (let b of state.bullets){
        this.drawBullet(b);
      }
    },

    drawPlayer(player){
      const radius = 30;
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(player.pos.x, player.pos.y, radius, 0 ,2*Math.PI)
      ctx.fill()

      ctx.strokeStyle = 'red';
      ctx.lineWidth = '6';
      ctx.beginPath();
      ctx.moveTo(player.pos.x, player.pos.y);
      ctx.lineTo(player.pos.x + radius * Math.cos(player.dir), player.pos.y + radius * Math.sin(player.dir));
      ctx.closePath();
      ctx.stroke();
    },

    drawBullet(bullet){
      const radius = 5;
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(bullet.pos.x, bullet.pos.y, radius, 0, 2*Math.PI)
      ctx.fill();
    },

    handleGameState(state){
      state = JSON.parse(state);
      requestAnimationFrame(() => this.drawGame(state));
    },  

    keydown(e){
      //console.log(e.keyCode);
      /*if(e.keyCode == this.lastKeyDown && Date.now() - this.lastKeyTime < 100){
        this.lastKeyTime = Date.now();
        return;
      }*/
      socket.emit('keydown', e.keyCode);
    },
    keyup(e){
      socket.emit('keyup', e.keyCode);
    }
  }
}
</script>