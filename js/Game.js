import { Team } from "./Team.js";
import { Ball } from "./Ball.js";
import { PlayDesigner } from "./PlayDesigner.js";

export class Game {
  constructor(scene) {
    this.scene = scene;
    this.homeTeam = new Team("home");
    this.awayTeam = new Team("away");
    this.ball = new Ball();
    this.playDesigner = new PlayDesigner(
      scene,
      this.homeTeam,
      this.awayTeam,
      this.ball
    );

    this.score = 0;
    this.currentPlay = null;
    this.gameState = "mainMenu"; // 'mainMenu', 'playDesigner', 'playingMove', 'decisionPoint'
    this.currentDecision = null;
    this.correctDecisions = 0;
    this.totalDecisions = 0;

    // Create UI elements
    this.createUI();

    // Add players and ball to the scene
    this.initializeScene();
  }

  createUI() {
    // Main menu container
    this.mainMenuContainer = document.createElement("div");
    this.mainMenuContainer.className = "main-menu";
    this.mainMenuContainer.innerHTML = `
            <h1>Touch Rugby Play Learner</h1>
            <div class="score">Score: <span id="score">0</span></div>
            <button id="start-play">Start Practice</button>
            <button id="design-play">Design New Play</button>
        `;
    document.body.appendChild(this.mainMenuContainer);

    // Decision UI container
    this.decisionContainer = document.createElement("div");
    this.decisionContainer.className = "decision-container";
    this.decisionContainer.style.display = "none";
    document.body.appendChild(this.decisionContainer);

    // Set up event listeners
    document
      .getElementById("start-play")
      .addEventListener("click", () => this.startPractice());
    document
      .getElementById("design-play")
      .addEventListener("click", () => this.startDesigner());
  }

  initializeScene() {
    // Position teams on the pitch
    this.homeTeam.positionPlayersForKickoff(70, 100);
    this.awayTeam.positionPlayersForKickoff(70, 100);

    // Add all players to the scene
    for (const player of this.homeTeam.players) {
      this.scene.add(player.mesh);
    }

    for (const player of this.awayTeam.players) {
      this.scene.add(player.mesh);
    }

    // Add ball to the scene
    this.scene.add(this.ball.mesh);

    // Start with the ball at the home team's dummy half
    this.ball.attachToPlayer(this.homeTeam.players[5]); // Assuming player 6 (index 5) is the dummy half
  }

  startPractice() {
    this.gameState = "playingMove";
    this.mainMenuContainer.style.display = "none";

    // For now, we'll use a hardcoded play
    // In a full implementation, we would load from saved plays
    this.loadRandomPlay();

    // Start all players moving
    for (const player of this.homeTeam.players) {
      player.startMoving();
    }
  }

  startDesigner() {
    this.gameState = "playDesigner";
    this.mainMenuContainer.style.display = "none";
    this.playDesigner.activate();
  }

  loadRandomPlay() {
    // In a full implementation, we would load from a library of plays
    // For now, create a simple example play

    // Reset players to initial positions
    this.homeTeam.positionPlayersForKickoff(70, 100);
    this.awayTeam.positionPlayersForKickoff(70, 100);

    // Give the ball to the dummy half
    this.ball.attachToPlayer(this.homeTeam.players[5]);

    // Create a simple play - dummy half passes to middle player who runs forward
    const dummyHalf = this.homeTeam.players[5];
    const middlePlayer = this.homeTeam.players[2];

    // Clear any existing paths
    dummyHalf.clearPath();
    middlePlayer.clearPath();

    // Dummy half steps forward and passes
    dummyHalf.addPathPoint(0, 2);

    // Middle player gets the ball and runs forward with a decision point
    middlePlayer.addPathPoint(0, -2); // Move to receive the ball
    middlePlayer.addPathPoint(0, -10);
    middlePlayer.addPathPoint(0, -20, true, [
      { label: "Cut left", action: "cut_left", correct: false },
      { label: "Cut right", action: "cut_right", correct: true },
      { label: "Pass wide", action: "pass_wide", correct: false },
    ]);

    // Add continuation paths that will only be used if the correct decision is made
    middlePlayer.addPathPoint(10, -30); // Cut right and continue
    middlePlayer.addPathPoint(15, -40);

    // At the start, the ball is with the dummy half
    // We'll simulate passing the ball after the dummy half completes movement
    this.currentPlay = {
      ballTransfers: [
        { fromPlayer: dummyHalf, toPlayer: middlePlayer, afterPathIndex: 0 },
      ],
    };
  }

  update(delta) {
    // Update all players
    this.homeTeam.updateAllPlayers(delta);
    this.awayTeam.updateAllPlayers(delta);

    // Update ball position
    this.ball.update();

    // Check for completed player movements and handle game logic
    if (this.gameState === "playingMove") {
      this.checkPlayerMovements();
    }
  }

  checkPlayerMovements() {
    // Check if the player with the ball has reached a decision point
    const playerWithBall = this.ball.carrier;

    if (!playerWithBall || !playerWithBall.isMoving) {
      // Check if we need to transfer the ball
      if (this.currentPlay && this.currentPlay.ballTransfers.length > 0) {
        for (const transfer of this.currentPlay.ballTransfers) {
          if (
            transfer.fromPlayer === playerWithBall &&
            transfer.fromPlayer.currentPathIndex > transfer.afterPathIndex
          ) {
            // Transfer the ball
            this.ball.attachToPlayer(transfer.toPlayer);

            // Start the new carrier moving
            transfer.toPlayer.startMoving();

            // Remove this transfer from the list
            this.currentPlay.ballTransfers =
              this.currentPlay.ballTransfers.filter((t) => t !== transfer);

            break;
          }
        }
      }
    }

    // Check if player with ball has stopped at a decision point
    if (playerWithBall && !playerWithBall.isMoving) {
      const currentPathPoint =
        playerWithBall.path[playerWithBall.currentPathIndex];

      if (currentPathPoint && currentPathPoint.hasDecision) {
        this.showDecisionPoint(playerWithBall, currentPathPoint);
      }
    }
  }

  showDecisionPoint(player, pathPoint) {
    this.gameState = "decisionPoint";
    this.currentDecision = {
      player,
      pathPoint,
      options: pathPoint.options,
    };

    // Show the decision UI
    this.decisionContainer.innerHTML = "";
    this.decisionContainer.style.display = "block";

    const title = document.createElement("h2");
    title.textContent = "Make a Decision";
    this.decisionContainer.appendChild(title);

    // Add each option as a button
    for (const option of pathPoint.options) {
      const button = document.createElement("button");
      button.textContent = option.label;
      button.addEventListener("click", () => this.makeDecision(option));
      this.decisionContainer.appendChild(button);
    }
  }

  makeDecision(selectedOption) {
    this.totalDecisions++;
    this.decisionContainer.style.display = "none";

    // Check if the decision was correct
    if (selectedOption.correct) {
      this.correctDecisions++;
      this.score += 10;
      document.getElementById("score").textContent = this.score;

      // Continue with the play
      this.currentDecision.player.currentPathIndex++;
      this.currentDecision.player.startMoving();

      this.gameState = "playingMove";
    } else {
      // Wrong decision
      this.showFeedback(false, selectedOption);

      // After a delay, go back to menu and let them try again
      setTimeout(() => {
        this.gameState = "mainMenu";
        this.mainMenuContainer.style.display = "block";
      }, 3000);
    }
  }

  showFeedback(correct, option) {
    const feedback = document.createElement("div");
    feedback.className = correct ? "feedback correct" : "feedback incorrect";
    feedback.textContent = correct
      ? "Correct! Great decision."
      : `Incorrect. "${option.label}" was not the best choice in this situation.`;

    document.body.appendChild(feedback);

    // Remove feedback after 3 seconds
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 3000);
  }

  saveCurrentPlay(name) {
    return this.playDesigner.savePlay(name);
  }

  exitDesigner() {
    this.playDesigner.deactivate();
    this.gameState = "mainMenu";
    this.mainMenuContainer.style.display = "block";
  }

  resetGame() {
    this.score = 0;
    document.getElementById("score").textContent = this.score;
    this.correctDecisions = 0;
    this.totalDecisions = 0;

    // Reset player positions
    this.homeTeam.positionPlayersForKickoff(70, 100);
    this.awayTeam.positionPlayersForKickoff(70, 100);

    // Give the ball to the dummy half
    this.ball.attachToPlayer(this.homeTeam.players[5]);

    // Clear all paths
    for (const player of [...this.homeTeam.players, ...this.awayTeam.players]) {
      player.clearPath();
    }

    this.gameState = "mainMenu";
    this.mainMenuContainer.style.display = "block";
    this.decisionContainer.style.display = "none";
  }
}
