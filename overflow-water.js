import { createWaterMaterial } from "./water-material.js";

export function createOverflowWater(THREE) {
  const group = new THREE.Group();
  const streamCount = 8;
  const dropCount = 2;
  const entryY = 0.58;
  const topY = 0.625;
  const bottomY = -0.58;
  const waterMaterial = createWaterMaterial(THREE);
  const dropGeometry = new THREE.SphereGeometry(0.025, 10, 8);
  const dropAxis = new THREE.Vector3(0, 1, 0);
  const puddle = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 16),
    waterMaterial
  );
  puddle.scale.set(0.9, 0.012, 0.76);
  puddle.position.y = -0.64;
  puddle.renderOrder = 1;
  puddle.visible = false;
  group.add(puddle);
  const streams = [];
  const streamMeshes = [];
  const drops = [];
  let flowing = false;

  function outerRadius(y) {
    return 0.42 + ((y + 0.625) / 1.25) * 0.16 + 0.015;
  }

  function innerRadius(y) {
    return 0.42 + ((y + 0.625) / 1.25) * 0.16 - 0.085 - 0.015;
  }

  for (let index = 0; index < streamCount; index += 1) {
    const angle = (index / streamCount) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        Math.cos(angle) * innerRadius(entryY),
        entryY,
        Math.sin(angle) * innerRadius(entryY)
      ),
      new THREE.Vector3(
        Math.cos(angle) * outerRadius(topY),
        topY,
        Math.sin(angle) * outerRadius(topY)
      ),
      new THREE.Vector3(
        Math.cos(angle) * outerRadius(0.3),
        0.3,
        Math.sin(angle) * outerRadius(0.3)
      ),
      new THREE.Vector3(
        Math.cos(angle) * outerRadius(-0.15),
        -0.15,
        Math.sin(angle) * outerRadius(-0.15)
      ),
      new THREE.Vector3(
        Math.cos(angle) * outerRadius(bottomY),
        bottomY,
        Math.sin(angle) * outerRadius(bottomY)
      ),
    ]);
    const stream = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, 0.014, 8, false),
      waterMaterial
    );
    stream.renderOrder = 2;
    stream.visible = false;
    group.add(stream);
    streams.push(curve);
    streamMeshes.push(stream);

    for (let dropIndex = 0; dropIndex < dropCount; dropIndex += 1) {
      const drop = new THREE.Mesh(dropGeometry, waterMaterial);
      drop.scale.set(0.8, 1.6, 0.8);
      drop.visible = false;
      group.add(drop);
      drops.push({ mesh: drop, curve, offset: dropIndex / dropCount });
    }
  }

  function setFlowing(enabled) {
    if (flowing === enabled) {
      return;
    }

    flowing = enabled;
    puddle.visible = enabled;
    for (const stream of streamMeshes) {
      stream.visible = enabled;
    }
    for (const { mesh } of drops) {
      mesh.visible = enabled;
    }
  }

  function update(elapsedTime) {
    if (!flowing) {
      return;
    }

    for (let index = 0; index < drops.length; index += 1) {
      const { mesh, curve, offset } = drops[index];
      const progress =
        (elapsedTime * 0.22 +
          offset +
          Math.floor(index / dropCount) / streamCount) %
        1;
      mesh.position.copy(curve.getPointAt(progress));
      mesh.quaternion.setFromUnitVectors(
        dropAxis,
        curve.getTangentAt(progress).normalize()
      );
    }
  }

  return { group, update, setFlowing };
}
