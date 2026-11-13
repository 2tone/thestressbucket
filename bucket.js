export function createBucket(THREE) {
  const bucket = new THREE.Group();
  const bodyHeight = 1.25;
  const topRadius = 0.58;
  const bottomRadius = 0.42;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(topRadius, bottomRadius, bodyHeight, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xe59a42,
      roughness: 0.55,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  bucket.add(body);

  const innerWall = new THREE.Mesh(
    new THREE.CylinderGeometry(
      topRadius - 0.07,
      bottomRadius - 0.07,
      bodyHeight - 0.15,
      40,
      1,
      true
    ),
    new THREE.MeshStandardMaterial({
      color: 0x9d5a28,
      roughness: 0.7,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  innerWall.position.y = 0.025;
  bucket.add(innerWall);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(bottomRadius, bottomRadius, 0.08, 40),
    new THREE.MeshStandardMaterial({ color: 0xb86e2d, roughness: 0.65 })
  );
  base.position.y = -bodyHeight / 2 + 0.04;
  bucket.add(base);

  const insideFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(bottomRadius - 0.07, bottomRadius - 0.07, 0.025, 40),
    new THREE.MeshStandardMaterial({ color: 0xc47a35, roughness: 0.7 })
  );
  insideFloor.position.y = -bodyHeight / 2 + 0.085;
  bucket.add(insideFloor);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(topRadius, 0.045, 12, 48),
    new THREE.MeshStandardMaterial({ color: 0xf2bd72, roughness: 0.4 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = bodyHeight / 2;
  bucket.add(rim);

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-topRadius * 0.9, bodyHeight * 0.35, 0),
    new THREE.Vector3(-0.55, 1.05, 0),
    new THREE.Vector3(0, 1.22, 0),
    new THREE.Vector3(0.55, 1.05, 0),
    new THREE.Vector3(topRadius * 0.9, bodyHeight * 0.35, 0),
  ]);
  const handle = new THREE.Mesh(
    new THREE.TubeGeometry(handleCurve, 32, 0.035, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.65, roughness: 0.35 })
  );
  bucket.add(handle);

  return bucket;
}
