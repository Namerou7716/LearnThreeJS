import * as THREE from 'three';

//基本3要素
const scene:THREE.Scene = new THREE.Scene();
const camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);
const renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer();

//レンダラーの設定
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//キューブを作成
const geometry:THREE.BoxGeometry = new THREE.BoxGeometry(1,1,1);
const material:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({color:0x12ff00});
const cube:THREE.Mesh<THREE.BoxGeometry,THREE.MeshBasicMaterial> = new THREE.Mesh(geometry,material);
scene.add(cube);


//カメラの位置設定
camera.position.z = 5;

//アニメーションループ
function animate():void {
    requestAnimationFrame(animate);

    //cube rotate
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene,camera);
}

window.addEventListener('resize',():void=>{
    const width:number = window.innerWidth;
    const height:number = window.innerHeight;
    
    camera.aspect = width/height;
    camera.updateProjectionMatrix();//カメラプロパティ変更後に必須

    renderer.setSize(width,height);
});

animate();