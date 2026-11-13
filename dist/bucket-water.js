import { createWaterMaterial } from "./water-material.js";

export function createBucketWater(THREE) {
  const segments = 48;
  const ringVertexCount = segments * 2;
  const bottomCenterIndex = ringVertexCount;
  const surfaceCenterIndex = ringVertexCount + 1;
  const positions = new Float32Array((ringVertexCount + 2) * 3);
  const indices = [];

  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    const bottom = index;
    const bottomNext = next;
    const surface = segments + index;
    const surfaceNext = segments + next;

    indices.push(
      bottom, bottomNext, surface,
      bottomNext, surfaceNext, surface,
      surfaceCenterIndex, surface, surfaceNext,
      bottomCenterIndex, bottomNext, bottom
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = createWaterMaterial(THREE);
  const water = new THREE.Mesh(geometry, material);
  water.visible = false;
  water.renderOrder = 2;

  const bottomY = -0.515;
  const fullLevel = 0.58;
  let maxY = fullLevel;
  const fillSpeed = 0.025;
  const drainSpeed = 0.08;
  let currentLevel = bottomY;
  let previousTime = null;

  function innerRadius(y) {
    const outerRadius = 0.42 + ((y + 0.625) / 1.25) * 0.16;
    return outerRadius - 0.085;
  }

  function update(elapsedTime) {
    const deltaTime =
      previousTime === null ? 0 : Math.max(0, elapsedTime - previousTime);
    previousTime = elapsedTime;

    if (currentLevel > maxY) {
      currentLevel = Math.max(maxY, currentLevel - drainSpeed * deltaTime);
    } else {
      currentLevel = Math.min(maxY, currentLevel + fillSpeed * deltaTime);
    }

    if (currentLevel <= bottomY + 0.005) {
      water.visible = false;
      return currentLevel;
    }

    water.visible = true;
    const bottomRadius = innerRadius(bottomY) - 0.01;
    const surfaceRadius = innerRadius(currentLevel) - 0.015;
    const position = geometry.attributes.position;

    for (let index = 0; index < segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const bottomOffset = index * 3;
      const surfaceOffset = (segments + index) * 3;

      position.array[bottomOffset] = cosine * bottomRadius;
      position.array[bottomOffset + 1] = bottomY;
      position.array[bottomOffset + 2] = sine * bottomRadius;
      position.array[surfaceOffset] = cosine * surfaceRadius;
      position.array[surfaceOffset + 1] = currentLevel;
      position.array[surfaceOffset + 2] = sine * surfaceRadius;
    }

    const bottomCenterOffset = bottomCenterIndex * 3;
    position.array[bottomCenterOffset + 1] = bottomY;
    const surfaceCenterOffset = surfaceCenterIndex * 3;
    position.array[surfaceCenterOffset + 1] = currentLevel;
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return currentLevel;
  }

  function setHalfFull(halfFull) {
    maxY = halfFull ? (bottomY + fullLevel) / 2 : fullLevel;
  }

  function isOverflowing() {
    return maxY === fullLevel && currentLevel >= fullLevel;
  }

  return { water, update, setHalfFull, isOverflowing };
}
