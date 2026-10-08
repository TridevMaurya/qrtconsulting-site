// Three.js DNA double-helix hero - QRT Consulting
import * as THREE from 'three';

const canvas = document.getElementById('dna-canvas');
const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x02010a, 0.045);
const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
camera.position.set(0, 0, 16);

scene.add(new THREE.AmbientLight(0x8899ff, .7));
const key = new THREE.PointLight(0x00f0ff, 60, 60); key.position.set(-8, 6, 8); scene.add(key);
const rim = new THREE.PointLight(0xf0b429, 60, 60); rim.position.set(8, -6, 6); scene.add(rim);

const dna = new THREE.Group();
scene.add(dna);

const TURNS = 5, SEG = 260, R = 2.6, H = 13, TWIST = Math.PI*2*TURNS;
const helix = t => {
  const a = t*TWIST, y = (t-.5)*H;
  return [new THREE.Vector3(Math.cos(a)*R, y, Math.sin(a)*R),
          new THREE.Vector3(Math.cos(a+Math.PI)*R, y, Math.sin(a+Math.PI)*R)];
};
const pts1 = [], pts2 = [];
for (let i=0;i<=SEG;i++){ const [p1,p2] = helix(i/SEG); pts1.push(p1); pts2.push(p2); }

const tubeMat1 = new THREE.MeshStandardMaterial({color:0x00f0ff, emissive:0x00a5b3, emissiveIntensity:.9, roughness:.25, metalness:.6});
const tubeMat2 = new THREE.MeshStandardMaterial({color:0xf0b429, emissive:0x9a6b12, emissiveIntensity:.9, roughness:.25, metalness:.6});
dna.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts1), SEG, .14, 12), tubeMat1));
dna.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), SEG, .14, 12), tubeMat2));

// base-pair rungs
const baseCols = [0x00ff9d, 0xffd319, 0x4d7cfe, 0xff6b35];
const rungGeo = new THREE.CylinderGeometry(.06, .06, R*2, 8);
for (let i=0;i<=40;i++){
  const t = i/40, [p1,p2] = helix(t);
  const m = new THREE.MeshStandardMaterial({color:baseCols[i%4], emissive:baseCols[i%4], emissiveIntensity:.55, roughness:.4});
  const rung = new THREE.Mesh(rungGeo, m);
  rung.position.copy(p1).lerp(p2, .5);
  rung.lookAt(p2); rung.rotateX(Math.PI/2);
  dna.add(rung);
  // nucleotide nodes
  const nodeGeo = new THREE.SphereGeometry(.22, 12, 12);
  [p1,p2].forEach(p=>{
    const n = new THREE.Mesh(nodeGeo, m);
    n.position.copy(p); dna.add(n);
  });
}

// floating particles
const pCount = 420, pGeo = new THREE.BufferGeometry(), pos = new Float32Array(pCount*3);
for (let i=0;i<pCount;i++){
  pos[i*3]=(Math.random()-.5)*34; pos[i*3+1]=(Math.random()-.5)*22; pos[i*3+2]=(Math.random()-.5)*20-4;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({color:0x66eaff, size:.07, transparent:true, opacity:.75}));
scene.add(pts);

dna.position.x = 3.4; // offset right so text sits left
if (innerWidth < 860) { dna.position.x = 0; dna.position.y = 3.6; camera.position.z = 20; }

let mx=0, my=0;
addEventListener('pointermove', e=>{
  mx = (e.clientX/innerWidth - .5); my = (e.clientY/innerHeight - .5);
});

function resize(){
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const clock = new THREE.Clock();
(function tick(){
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();
  dna.rotation.y = t*.28 + mx*.9;
  dna.rotation.x = Math.sin(t*.18)*.12 + my*.5;
  dna.position.y += Math.sin(t*.7)*.0016;
  pts.rotation.y = t*.02;
  renderer.render(scene, camera);
})();
