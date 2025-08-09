import * as THREE from 'three';

//Scene
const scene = new THREE.Scene();

//Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);
camera.position.set(0,15,15);
camera.lookAt(0,0,0);

//Render
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0xf0f0f0);
document.body.appendChild(renderer.domElement);

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff,0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.8);
directionalLight.position.set(5,10,7.5);
scene.add(directionalLight);

//Ground
const groundGeometry = new THREE.PlaneGeometry(50,50);
const groundMaterial = new THREE.MeshStandardMaterial({color:0xcccccc});
const ground = new THREE.Mesh(groundGeometry,groundMaterial);
ground.rotation.x -= Math.PI/2;
scene.add(ground);

function Animate():void{
    requestAnimationFrame(Animate);
    renderer.render(scene,camera);
}

//Handle window resize
window.addEventListener('resize',():void=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();//カメラを再設定
    renderer.setSize(window.innerWidth,window.innerHeight);
})

Animate();