export function createTap(THREE, { angle = 0, y = -0.36 } = {}) {
  const tap = new THREE.Group();
  const tapMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9c2c9,
    metalness: 0.8,
    roughness: 0.25,
  });
  const bodyHeight = 1.25;
  const bottomRadius = 0.42;
  const topRadius = 0.58;
  const radiusAtTap = bottomRadius
    + ((y + bodyHeight / 2) / bodyHeight) * (topRadius - bottomRadius);
  tap.position.set(
    radiusAtTap * Math.sin(angle),
    y,
    radiusAtTap * Math.cos(angle)
  );
  tap.rotation.y = angle;

  const mount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.12, 24),
    tapMaterial
  );
  mount.rotation.x = Math.PI / 2;
  mount.position.z = 0.06;
  tap.add(mount);

  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.34, 20),
    tapMaterial
  );
  pipe.rotation.x = Math.PI / 2;
  pipe.position.z = 0.25;
  tap.add(pipe);

  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.18, 20),
    tapMaterial
  );
  spout.position.set(0, -0.09, 0.4);
  tap.add(spout);

  const valveStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.15, 16),
    tapMaterial
  );
  valveStem.position.set(0, 0.1, 0.2);
  tap.add(valveStem);

  const valveHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.22, 16),
    tapMaterial
  );
  valveHandle.rotation.z = Math.PI / 2;
  valveHandle.position.set(0, 0.18, 0.2);
  tap.add(valveHandle);

  return tap;
}
