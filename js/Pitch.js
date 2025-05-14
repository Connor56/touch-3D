export function createPitch() {
  // Use the global THREE variable
  const pitchMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 }); // Dark green
  const pitchGeometry = new THREE.PlaneGeometry(70, 100); // Standard touch pitch is 70m x 50m, but for better view let's make it longer

  const pitch = new THREE.Mesh(pitchGeometry, pitchMaterial);
  pitch.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  pitch.receiveShadow = true;
  pitch.name = "pitch";
  return pitch;
}
