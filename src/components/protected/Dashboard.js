import React, { Component } from 'react'
import { ref, firebaseAuth } from '../../config/constants'

export default class Dashboard extends Component {
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

  playNextRound = () => {
    console.log('play Next Round ' + this.state.user.displayName)
    var user  = this.state.user
    ref.child('games/' + this.state.gameId + '/participants').push()
      .set({
        name: user.displayName,
        uid: user.uid,
        state: "alive",
        target: "",
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
    var user = firebaseAuth().currentUser;
    if (user) {
      if (!user.displayName) {
        var displayName = /[^@]*/.exec(user.email)[0]
        console.log(displayName)
        user.updateProfile({
          displayName: displayName,
        }).then(() => this.setState({user: user}))
        ref.child(`users/${user.uid}/info`)
          .set({
            email: user.email,
            displayName: displayName,
            uid: user.uid
          })
      } else {
        this.setState({user: user})
      }
    }
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
            this.setState({isInGame: true, target: participants[key].target, isAlive: participants[key].state === "alive" ? true : false})
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
        <h1>Your Target: {this.state.target}</h1>
        <button className="btn btn-primary" onClick={() => this.die()} disabled={!this.state.isAlive}>sterben</button>
      </div>
    );
    var gamePreparation = (
      <div>
        <h1>
          {this.state.user.displayName} is logged in.
        </h1>
        <button className="btn btn-primary" onClick={() => this.playNextRound()} disabled={this.state.isInGame}>nächste Runde mitspielen</button>
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
