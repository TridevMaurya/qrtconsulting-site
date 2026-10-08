// Three.js molecule orb - QRT Consulting services page
import * as THREE from 'three';

const canvas = document.getElementById('mol-canvas');
const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
camera.position.set(0, 0, 11);

scene.add(new THREE.AmbientLight(0xaabbff, .8));
const l1 = new THREE.PointLight(0x00f0ff, 50, 40); l1.position.set(-6,4,6); scene.add(l1);
const l2 = new THREE.PointLight(0xb6ff2e, 40, 40); l2.position.set(6,-4,5); scene.add(l2);

const mol = new THREE.Group(); scene.add(mol);
// core
mol.add(new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.4, 1),
  new THREE.MeshStandardMaterial({color:0x00f0ff, emissive:0x0088aa, emissiveIntensity:1, wireframe:true})
));
const core = new THREE.Mesh(
  new THREE.SphereGeometry(.55, 24, 24),
  new THREE.MeshStandardMaterial({color:0xffffff, emissive:0x66f6ff, emissiveIntensity:2.2})
);
mol.add(core);
// orbiting atoms
const atoms = [];
const atomCols = [0xf0b429, 0xb6ff2e, 0x8b5cf6, 0xffd319];
for (let i=0;i<4;i++){
  const pivot = new THREE.Group();
  const a = new THREE.Mesh(new THREE.SphereGeometry(.3, 18, 18),
    new THREE.MeshStandardMaterial({color:atomCols[i], emissive:atomCols[i], emissiveIntensity:1.4}));
  const R = 3.1 + i*.55;
  a.position.x = R;
  pivot.add(a);
  // orbit ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, .02, 8, 90),
    new THREE.MeshBasicMaterial({color:atomCols[i], transparent:true, opacity:.35}));
  pivot.add(ring);
  pivot.rotation.x = i*1.1; pivot.rotation.y = i*.7;
  mol.add(pivot);
  atoms.push({pivot, speed:.35 + i*.14});
}
// outer particle shell
const n=380, g=new THREE.BufferGeometry(), p=new Float32Array(n*3);
for(let i=0;i<n;i++){
  const r=5.4+Math.random()*2.4, th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
  p[i*3]=r*Math.sin(ph)*Math.cos(th); p[i*3+1]=r*Math.sin(ph)*Math.sin(th); p[i*3+2]=r*Math.cos(ph);
}
g.setAttribute('position', new THREE.BufferAttribute(p,3));
mol.add(new THREE.Points(g, new THREE.PointsMaterial({color:0x8b5cf6, size:.06, transparent:true, opacity:.8})));

let mx=0; addEventListener('pointermove', e=>{ mx = e.clientX/innerWidth - .5; });
function resize(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
const clock = new THREE.Clock();
(function tick(){
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();
  mol.rotation.y = t*.22 + mx*.8;
  mol.rotation.x = Math.sin(t*.2)*.25;
  core.scale.setScalar(1 + Math.sin(t*2.4)*.12);
  atoms.forEach(o=>{ o.pivot.rotation.z = t*o.speed; });
  renderer.render(scene, camera);
})();
