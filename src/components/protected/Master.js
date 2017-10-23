import React, { Component } from 'react'
import { ref } from '../../config/constants'

export default class Master extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: false,
      gameId: 0,
      game: {},
      isInGame: false,
      target: "",
      isAlive: false,
    }
  }

  createGame = () => {
    console.log('create new Game')
    var newGameRef = ref.child('games/').push()
    this.setState({gameId: newGameRef.key})
    newGameRef.set({
      state: "preparing"
    })
  }

  startNextRound = () => {
    console.log('start Next Round')
    var participants = this.state.game.participants
    var targetKey = ""
    var firstKey = ""
    for(var key in participants) {
      if (participants.hasOwnProperty(key)) {
        if (!targetKey) {
          firstKey = key
        } else {
          ref.child('games/' + this.state.gameId + '/participants/' + key).update({
            target: participants[targetKey].name
          })
        }
        targetKey = key
      }
    }
    //assign first:
    ref.child('games/' + this.state.gameId + '/participants/' + firstKey).update({
      target: participants[key].name
    })
    ref.child('games/' + this.state.gameId).update({
      state: "running"
    })
  }

  componentWillMount() {
    var gameRef = ref.child('games').limitToLast(1);
    gameRef.on('value', (snapshot) => {
      var game = snapshot.val()
      for (var key in game){
        if (game.hasOwnProperty(key)){
          this.setState({
            game: game[key],
            gameId: key,
          })
        }
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {

  }

  render () {
    console.log(this.state)
    var gameController = (<div>loading</div>);
    var noGame = (
      <div>
        <button className="btn btn-primary" onClick={() => this.createGame()}>create Game</button>
      </div>
    );
    var runningGame = (
      <div>
        <h1>GAME STARTED</h1>
      </div>
    );
    var gamePreparation = (
      <div>
        <button className="btn btn-primary" onClick={() => this.startNextRound()}>nächste Runde starten</button>
      </div>
    );
    switch (this.state.game.state) {
      case "preparing":
        gameController = gamePreparation
        break;
      case "running":
        gameController = runningGame
        break;
      default:
        gameController = noGame
        break;
    }
    return (
      <div>
        {gameController}
      </div>
    )
  }
}
