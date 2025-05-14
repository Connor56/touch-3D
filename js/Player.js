export class Player {
  constructor(team, number, position = { x: 0, y: 0, z: 0 }, color = 0x0000ff) {
    this.team = team; // 'home' or 'away'
    this.number = number;
    this.position = position;
    this.color = color;
    this.mesh = this.createPlayerMesh();
    this.path = [];
    this.currentPathIndex = 0;
    this.isMoving = false;
    this.hasBall = false;
    this.decisionPoints = [];
  }

  createPlayerMesh() {
    // Create a simple humanoid figure with cylinders and spheres
    const group = new THREE.Group();

    // Body (capsule-like shape using cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.7, 3, 16);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2.5;
    body.castShadow = true;
    group.add(body);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac }); // Skin tone
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 4.5;
    head.castShadow = true;
    group.add(head);

    // Player number display
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // In a real implementation, we would use TextGeometry from THREE
    // For now, we'll simulate with a small cube as a placeholder
    const textPlaceholder = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.1),
      textMaterial
    );
    textPlaceholder.position.set(0, 2.5, 0.8);
    group.add(textPlaceholder);

    // Position the entire player
    group.position.set(this.position.x, this.position.y, this.position.z);

    return group;
  }

  setPosition(x, z) {
    this.position.x = x;
    this.position.z = z;
    this.mesh.position.set(x, this.position.y, z);
  }

  addPathPoint(x, z, hasDecision = false, options = []) {
    this.path.push({ x, z, hasDecision, options });
    return this.path.length - 1; // Return index of the added point
  }

  clearPath() {
    this.path = [];
    this.currentPathIndex = 0;
    this.isMoving = false;
  }

  startMoving() {
    if (this.path.length > 0) {
      this.isMoving = true;
      this.currentPathIndex = 0;
    }
  }

  update(delta) {
    if (!this.isMoving || this.path.length === 0) return;

    const target = this.path[this.currentPathIndex];
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Movement speed
    const speed = 5; // units per second

    if (distance < 0.1) {
      // Reached the current target point
      this.setPosition(target.x, target.z);

      if (target.hasDecision) {
        this.isMoving = false;
        // Here we would trigger the decision UI
        // For now, we'll just stop
        return;
      }

      // Move to next point
      this.currentPathIndex++;

      if (this.currentPathIndex >= this.path.length) {
        // Reached the end of the path
        this.isMoving = false;
        return;
      }
    } else {
      // Move toward the target
      const moveX = (dx / distance) * speed * delta;
      const moveZ = (dz / distance) * speed * delta;
      this.setPosition(this.position.x + moveX, this.position.z + moveZ);

      // Rotate to face direction of movement
      this.mesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  giveBall() {
    this.hasBall = true;
    // In a full implementation, we would add the ball to the player mesh
  }

  removeBall() {
    this.hasBall = false;
  }
}
