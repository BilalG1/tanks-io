<template>
  <div v-if="!gameActive" class="text-right mx-auto max-w-sm w-3/4">
    <button 
    @click="newGame" 
    class="bg-green-500 hover:bg-green-400 my-5 p-2 text-white rounded-xl font-bold">
      Create Game
    </button>
    <div>
      <input v-model="gameCode" class="border-black border-2 p-1 mx-1 rounded-lg" placeholder="Game Code"/> 
      <button @click="joinGame" 
      class="bg-green-500 hover:bg-green-400 my-5 p-2 text-white rounded-xl font-bold">
        Join Game
      </button>
    </div>
  </div>
  <div v-else>
    <Game class="mx-auto" ref="Game" @unknownGame="handleUnknown" @tooManyPlayers="handleTooMany"/>
  </div>
</template>

<script>
import Game from './components/Game.vue'

export default {
  name: 'App',
  components: {
    Game
  },
  data(){
    return{
      gameActive: false,
      gameCode: '',
    }
  },
  methods: {
    newGame(){
      if (this.gameActive)
        return;
      this.gameActive = true;
      setTimeout(() => this.$refs.Game.newGame(), 100);
    },

    joinGame(){
      console.log(this.gameCode);
      this.gameActive = true;
      setTimeout(() => this.$refs.Game.joinGame(this.gameCode), 100);
    },

    handleUnknown(){
      this.gameActive = false;
      alert('Invalid Game Code');
    },

    handleTooMany(){
      this.gameActive = false;
      alert('too many players currently in game')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
