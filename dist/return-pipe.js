import { createWaterMaterial } from "./water-material.js";

export function createReturnPipe(THREE) {
  const bodyHeight = 1.25;
  const bottomRadius = 0.42;
  const topRadius = 0.58;
  const lowerY = -0.36;
  const tapRadius = bottomRadius
    + ((lowerY + bodyHeight / 2) / bodyHeight) * (topRadius - bottomRadius);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, lowerY - 0.18, tapRadius + 0.4),
    new THREE.Vector3(0, -0.67, tapRadius + 0.4),
    new THREE.Vector3(0, -0.76, tapRadius + 0.52),
    new THREE.Vector3(0, -0.76, 1.3),
    new THREE.Vector3(0, -0.68, 1.48),
    new THREE.Vector3(0, -0.4, 1.5),
    new THREE.Vector3(0, 0.35, 1.5),
    new THREE.Vector3(0, 0.72, 1.45),
    new THREE.Vector3(0, 0.9, 1.2),
    new THREE.Vector3(0, 0.9, 0.75),
    new THREE.Vector3(0, 0.82, topRadius),
    new THREE.Vector3(0, 0.68, topRadius - 0.13),
  ]);
  const group = new THREE.Group();
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.045, 12, false),
    new THREE.MeshStandardMaterial({
      color: 0x8fd8ff,
      metalness: 0.05,
      roughness: 0.22,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
  );
  group.add(pipe);

  const waterMaterial = createWaterMaterial(THREE);
  const water = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.029, 12, false),
    waterMaterial
  );
  water.renderOrder = 1;
  water.visible = false;
  group.add(water);

  const dropMaterial = createWaterMaterial(THREE);
  const dropGeometry = new THREE.SphereGeometry(0.035, 12, 10);
  const drops = [];
  const dropCount = 5;

  for (let index = 0; index < dropCount; index += 1) {
    const drop = new THREE.Mesh(dropGeometry, dropMaterial);
    drop.scale.set(0.8, 1.8, 0.8);
    drop.visible = false;
    group.add(drop);
    drops.push(drop);
  }

  const dropAxis = new THREE.Vector3(0, 1, 0);
  const pipeExit = curve.getPointAt(1);
  const fallDistance = 0.7;
  let flowing = false;

  function setFlowing(enabled) {
    flowing = enabled;
    water.visible = enabled;
    for (const drop of drops) {
      drop.visible = enabled;
    }
  }

  function update(elapsedTime) {
    if (!flowing) {
      return;
    }

    for (let index = 0; index < drops.length; index += 1) {
      const progress = (elapsedTime * 0.18 + index / dropCount) % 1;
      if (progress < 0.82) {
        const pipeProgress = progress / 0.82;
        drops[index].position.copy(curve.getPointAt(pipeProgress));
        drops[index].quaternion.setFromUnitVectors(
          dropAxis,
          curve.getTangentAt(pipeProgress).normalize()
        );
      } else {
        const fallProgress = (progress - 0.82) / 0.18;
        drops[index].position.set(
          pipeExit.x,
          pipeExit.y - fallDistance * fallProgress,
          pipeExit.z
        );
        drops[index].quaternion.setFromUnitVectors(
          dropAxis,
          new THREE.Vector3(0, -1, 0)
        );
      }
    }
  }

  return { group, update, setFlowing };
}
