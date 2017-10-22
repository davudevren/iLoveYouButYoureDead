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

  die = () => {
    var participants = this.state.game.participants
    var nextTarget = ""
    for(var key in participants) {
      if (participants.hasOwnProperty(key)) {
        if (participants[key].uid === this.state.user.uid) {
          console.log('you died - ' + participants[key].target)
          nextTarget = participants[key].target
          ref.child('games/' + this.state.gameId + '/participants/' + key).update({
            state: "dead",
            target: ""
          })
        }
      }
    }
    //find killer:
    for(var killerKey in participants) {
      if (participants.hasOwnProperty(killerKey)) {
        if (participants[killerKey].target === this.state.user.displayName) {
          ref.child('games/' + this.state.gameId + '/participants/' + killerKey).update({
            target: nextTarget
          })
        }
      }
    }
  }

  componentWillMount() {
    var gameRef = ref.child('games/' + this.state.gameId);
    gameRef.on('value', (snapshot) => {
      var game = snapshot.val()
      this.setState({
        game: game,
      })
    });
  }

  componentWillUpdate(nextProps, nextState) {
    var participants = nextState.game.participants
    var found = false
    for(var key in participants) {
      if (participants.hasOwnProperty(key)) {
        if (participants[key].uid === this.state.user.uid) {
          found = true
          if (!this.state.isInGame || participants[key].target !== nextState.target) {
            this.setState({isInGame: true, target: participants[key].target, isAlive: participants[key].state})
          }
        }
      }
    }
    if (!found && this.state.isInGame) {
      this.setState({isInGame: false})
    }
  }

  render () {
    console.log(this.state.game)
    var gameController = (<div>loading</div>);
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
        break;
    }
    return (
      <div>
        {gameController}
      </div>
    )
  }
}
