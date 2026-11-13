import { createWaterMaterial } from "./water-material.js";

export function createRainCloud(THREE) {
  const group = new THREE.Group();
  group.position.y = 2.15;
  group.rotation.y = Math.PI / 2;

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0x8998ad,
    roughness: 0.85,
    transparent: true,
    opacity: 0.82,
  });
  const puffs = [
    { position: [-0.38, 0, 0], scale: [0.48, 0.3, 0.34] },
    { position: [0, 0.14, 0], scale: [0.56, 0.4, 0.4] },
    { position: [0.42, 0.02, 0], scale: [0.43, 0.3, 0.34] },
    { position: [0.12, -0.08, 0.1], scale: [0.62, 0.27, 0.38] },
  ];

  for (const puff of puffs) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 16),
      cloudMaterial
    );
    mesh.position.set(...puff.position);
    mesh.scale.set(...puff.scale);
    group.add(mesh);
  }

  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const labelContext = labelCanvas.getContext("2d");
  if (!labelContext) {
    throw new Error("Unable to create the stressor label canvas.");
  }
  labelContext.font = "600 58px system-ui, sans-serif";
  labelContext.textAlign = "center";
  labelContext.textBaseline = "middle";
  labelContext.fillStyle = "#eef4fc";
  labelContext.shadowColor = "rgba(0, 0, 0, 0.45)";
  labelContext.shadowBlur = 10;
  labelContext.fillText("Stressors", labelCanvas.width / 2, labelCanvas.height / 2);

  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: labelTexture, transparent: true })
  );
  label.position.set(0, 0.72, 0);
  label.scale.set(1.45, 0.36, 1);
  group.add(label);

  const rainMaterial = createWaterMaterial(THREE);
  const dropGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8);
  const drops = [];

  for (let index = 0; index < 7; index += 1) {
    const drop = new THREE.Mesh(dropGeometry, rainMaterial);
    drop.position.x = (index - 3) * 0.13;
    drop.position.z = index % 2 === 0 ? 0.08 : -0.08;
    group.add(drop);
    drops.push(drop);
  }

  function update(elapsedTime) {
    for (let index = 0; index < drops.length; index += 1) {
      const progress = (elapsedTime * 0.8 + index * 0.17) % 1;
      drops[index].position.y = 0.1 - progress * 1.45;
    }
  }

  return { group, update };
}
