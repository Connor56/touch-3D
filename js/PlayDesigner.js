export class PlayDesigner {
  constructor(scene, homeTeam, awayTeam, ball) {
    this.scene = scene;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.ball = ball;
    this.active = false;
    this.selectedPlayer = null;
    this.pathLines = new Map(); // Map to store path lines for each player
    this.markers = []; // Array to store path markers
    this.decisionPointMarkers = []; // Array to store decision point markers

    // Materials for visualization
    this.pathMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 2,
    });
    this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.decisionPointMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
    });

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Option UI elements
    this.optionContainer = document.createElement("div");
    this.optionContainer.className = "option-container";
    this.optionContainer.style.display = "none";
    document.body.appendChild(this.optionContainer);
  }

  activate() {
    this.active = true;
    this.addEventListeners();
  }

  deactivate() {
    this.active = false;
    this.removeEventListeners();
    this.clearSelectedPlayer();
  }

  addEventListeners() {
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  removeEventListeners() {
    window.removeEventListener("mousedown", this.onMouseDown.bind(this));
    window.removeEventListener("mousemove", this.onMouseMove.bind(this));
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
  }

  onMouseDown(event) {
    if (!this.active) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check if we're clicking a player to select
    this.raycaster.setFromCamera(this.mouse, window.camera);

    // Get all player meshes
    const allPlayers = [...this.homeTeam.players, ...this.awayTeam.players];
    const playerMeshes = allPlayers.map((player) => player.mesh);

    const intersects = this.raycaster.intersectObjects(playerMeshes, true);

    if (intersects.length > 0) {
      // Find which player was clicked by finding the mesh's parent
      const clickedMesh = intersects[0].object;
      const playerObject = clickedMesh.parent || clickedMesh;

      // Find the Player instance that owns this mesh
      const selectedPlayer = allPlayers.find(
        (player) => player.mesh === playerObject
      );

      if (selectedPlayer) {
        this.selectPlayer(selectedPlayer);
        return;
      }
    }

    // If we have a selected player, add a path point
    if (this.selectedPlayer) {
      // Raycast to the pitch to get the target position
      const pitchIntersects = this.raycaster.intersectObjects([
        this.scene.getObjectByName("pitch"),
      ]);

      if (pitchIntersects.length > 0) {
        const point = pitchIntersects[0].point;
        const isDecisionPoint = event.shiftKey; // Hold shift to create a decision point

        // Add path point to the player
        this.addPathPoint(point.x, point.z, isDecisionPoint);
      }
    }
  }

  onMouseMove(event) {
    if (!this.active) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onKeyDown(event) {
    if (!this.active) return;

    if (event.key === "Escape") {
      this.clearSelectedPlayer();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      this.clearSelectedPlayerPath();
    } else if (event.key === "p" || event.key === "P") {
      this.playCurrentPath();
    }
  }

  selectPlayer(player) {
    // Clear previous selection
    this.clearSelectedPlayer();

    this.selectedPlayer = player;

    // Highlight the selected player (e.g., by changing color)
    const originalMaterial = player.mesh.children[0].material;
    player.mesh.children[0].material = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
    });

    // Store the original material to restore later
    player.originalMaterial = originalMaterial;

    this.visualizePlayerPath();
  }

  clearSelectedPlayer() {
    if (this.selectedPlayer) {
      // Restore original material
      if (this.selectedPlayer.originalMaterial) {
        this.selectedPlayer.mesh.children[0].material =
          this.selectedPlayer.originalMaterial;
        delete this.selectedPlayer.originalMaterial;
      }

      this.selectedPlayer = null;

      // Clear path visualization
      this.clearPathVisualization();
    }
  }

  clearSelectedPlayerPath() {
    if (this.selectedPlayer) {
      this.selectedPlayer.clearPath();
      this.clearPathVisualization();
    }
  }

  addPathPoint(x, z, isDecisionPoint = false) {
    if (!this.selectedPlayer) return;

    // Add path point to player
    const pointIndex = this.selectedPlayer.addPathPoint(x, z, isDecisionPoint);

    // Visualize the updated path
    this.visualizePlayerPath();

    // If it's a decision point, add options
    if (isDecisionPoint) {
      this.addDecisionOptions(pointIndex);
    }
  }

  addDecisionOptions(pointIndex) {
    // In a real implementation, we would show a UI to configure options
    // For this prototype, we'll add default options
    const options = [
      { label: "Pass left", action: "pass_left" },
      { label: "Pass right", action: "pass_right" },
      { label: "Run forward", action: "run_forward" },
    ];

    // Update the path point with options
    this.selectedPlayer.path[pointIndex].options = options;
  }

  visualizePlayerPath() {
    this.clearPathVisualization();

    if (!this.selectedPlayer || this.selectedPlayer.path.length === 0) return;

    // Create a line connecting all path points
    const points = [
      new THREE.Vector3(
        this.selectedPlayer.position.x,
        0.1,
        this.selectedPlayer.position.z
      ),
    ];

    // Add all path points
    for (const point of this.selectedPlayer.path) {
      points.push(new THREE.Vector3(point.x, 0.1, point.z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, this.pathMaterial);
    this.scene.add(line);

    // Store the line for later removal
    this.pathLines.set(this.selectedPlayer, line);

    // Add markers for each point
    for (const point of this.selectedPlayer.path) {
      const markerGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const material = point.hasDecision
        ? this.decisionPointMaterial
        : this.markerMaterial;
      const marker = new THREE.Mesh(markerGeometry, material);
      marker.position.set(point.x, 0.1, point.z);
      this.scene.add(marker);

      if (point.hasDecision) {
        this.decisionPointMarkers.push(marker);
      } else {
        this.markers.push(marker);
      }
    }
  }

  clearPathVisualization() {
    // Remove line
    if (this.pathLines.has(this.selectedPlayer)) {
      this.scene.remove(this.pathLines.get(this.selectedPlayer));
      this.pathLines.delete(this.selectedPlayer);
    }

    // Remove markers
    for (const marker of this.markers) {
      this.scene.remove(marker);
    }
    this.markers = [];

    // Remove decision point markers
    for (const marker of this.decisionPointMarkers) {
      this.scene.remove(marker);
    }
    this.decisionPointMarkers = [];
  }

  playCurrentPath() {
    // Start moving the selected player along their path
    if (this.selectedPlayer) {
      this.selectedPlayer.startMoving();
    }
  }

  savePlay(name) {
    // In a full implementation, we would save the play configuration
    // including all player paths and decision points
    const play = {
      name,
      players: [],
    };

    // Save both home and away team data
    const allPlayers = [...this.homeTeam.players, ...this.awayTeam.players];

    for (const player of allPlayers) {
      play.players.push({
        team: player.team,
        number: player.number,
        position: {
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
        },
        path: [...player.path], // Clone the path array
        hasBall: player.hasBall,
      });
    }

    // In a real app, we would save this to localStorage or a server
    console.log("Saved play:", play);
    return play;
  }

  loadPlay(play) {
    // In a full implementation, we would load a saved play

    // Clear current paths
    for (const player of [...this.homeTeam.players, ...this.awayTeam.players]) {
      player.clearPath();
    }

    // Position players and set their paths
    for (const playerData of play.players) {
      // Find the corresponding player
      const team = playerData.team === "home" ? this.homeTeam : this.awayTeam;
      const player = team.players.find((p) => p.number === playerData.number);

      if (player) {
        // Set position
        player.setPosition(playerData.position.x, playerData.position.z);

        // Set path
        player.path = [...playerData.path]; // Clone the path array

        // Set ball carrier
        if (playerData.hasBall) {
          this.ball.attachToPlayer(player);
        }
      }
    }

    // Clear any selected player
    this.clearSelectedPlayer();
  }
}
