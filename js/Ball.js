export class Ball {
  constructor() {
    this.mesh = this.createBallMesh();
    this.carrier = null;
  }

  createBallMesh() {
    // Create a simple rugby ball (elongated ellipsoid)
    const ballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    // Scale to create an oval rugby ball shape
    ballGeometry.scale(0.7, 0.5, 1.2);

    const ballMaterial = new THREE.MeshLambertMaterial({ color: 0x964b00 }); // Brown
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.castShadow = true;

    // Initially position it above the ground
    ball.position.y = 1;

    return ball;
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  attachToPlayer(player) {
    if (this.carrier) {
      this.carrier.removeBall();
    }

    this.carrier = player;
    player.giveBall();

    // Position the ball in the player's hands (slightly in front)
    const offset = new THREE.Vector3(0, 2.5, 0.8);
    this.mesh.position.copy(player.mesh.position).add(offset);
  }

  update() {
    if (this.carrier) {
      // Update ball position to stay with carrier
      const offset = new THREE.Vector3(0, 2.5, 0.8);
      // Adjust the offset based on player's rotation
      offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.carrier.mesh.rotation.y
      );
      this.mesh.position.copy(this.carrier.mesh.position).add(offset);
    }
  }
}
