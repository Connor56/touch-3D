import { Player } from "./Player.js";

export class Team {
  constructor(teamType, playersCount = 6) {
    this.teamType = teamType; // 'home' or 'away'
    this.players = [];
    this.color = teamType === "home" ? 0x0000ff : 0xff0000; // Blue for home, red for away

    this.createPlayers(playersCount);
  }

  createPlayers(count) {
    for (let i = 0; i < count; i++) {
      // Create players with default positions, we'll set them later
      const player = new Player(
        this.teamType,
        i + 1,
        { x: 0, y: 0, z: 0 },
        this.color
      );
      this.players.push(player);
    }
  }

  positionPlayersForKickoff(pitchWidth, pitchLength) {
    // For home team, position in a basic formation near the halfway line
    // For away team, position them on the opposite half

    const zOffset = this.teamType === "home" ? 5 : -5; // Offset from center line
    const initialZ = zOffset;

    // Basic formation - spread across the width
    const positions = [
      { x: -15, z: initialZ }, // Left wing
      { x: -7.5, z: initialZ - 5 }, // Left center
      { x: 0, z: initialZ - 7 }, // Middle player
      { x: 7.5, z: initialZ - 5 }, // Right center
      { x: 15, z: initialZ }, // Right wing
      { x: 0, z: initialZ + 8 }, // Dummy half
    ];

    for (let i = 0; i < this.players.length; i++) {
      if (i < positions.length) {
        const pos = positions[i];
        // For away team, mirror the positions
        if (this.teamType === "away") {
          pos.z = -pos.z;
        }
        this.players[i].setPosition(pos.x, pos.z);
      }
    }
  }

  updateAllPlayers(delta) {
    for (const player of this.players) {
      player.update(delta);
    }
  }

  getPlayerWithBall() {
    return this.players.find((player) => player.hasBall);
  }
}
