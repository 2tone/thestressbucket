export function createWaterMaterial(THREE) {
  return new THREE.MeshStandardMaterial({
    color: 0x168cff,
    roughness: 0.2,
    metalness: 0.05,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
