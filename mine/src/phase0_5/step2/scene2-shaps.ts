import * as THREE from 'three'

// 1.図形設定の設計図となるインターフェースを定義する
interface ShapeConfig{
    type: 'box' | 'sphere' | 'cone'; //図形の種類はこの3つ
    color: number; //色は16進数の数値で指定
    position:{x:number;y:number;z:number;},//座標
    scale?:number;//図形の拡大率
}

//2.図形を作成するための静的クラス（ファクトリー）を定義する
//このクラスではShapeConfigを受け取りTHREE.Meshを返す
class ShapeFactory{

    /**
     * 設定に基づいてThree.jsのジオメトリを作成する
     * @param type 作成するジオメトリの種類
     * @returns
     */
    static createGeometry(type:ShapeConfig['type']):THREE.BufferGeometry{
        switch(type){
            case 'box':
                //new THREE.BoxGeometry(width,height,depth):立方体の形状を作成
                return new THREE.BoxGeometry(1,1,1);
            case 'sphere':
                //new THREE.SphereGeometry(radius,wifthSegments,heightSegments);
                //球体の形状を作成する。width/heightSegmentsは球体の滑らかさを決定する分割数
                return new THREE.SphereGeometry(0.5,32,16);
            case 'cone':
                //new THREE.ConeGeometry(radius,height,radialSegments):円錐の形状を作成
                return new THREE.ConeGeometry(0.5,1,8);
            default:
                //TypeScriptの網羅性チェック:ShapeConfig[type]に新しい値が追加された場合、
                //ここがコンパイラエラーになり、新しい図形タイプの処理を書き忘れるのを防ぐ
                const _exhaustive:never = type;
                throw new Error(`Unknown shape type: ${_exhaustive}`);
        }
    }

    /**
     * 設定に基づいてThree.jsのMeshを作成する
     * @param config config図形の設定オブジェクト
     * @returns 作成されたTHREE.Meshインスタンス
     */
    static createShape(config:ShapeConfig):THREE.Mesh{
        //設定に応じてジオメトリを作成
        const geometry = this.createGeometry(config.type);
        //光源の影響を受ける、光沢のない（マットな）材質を作成する。影や光の方向を表現できる。
        const material = new THREE.MeshLambertMaterial({color:config.color});
        //ジオメトリとマテリアルを組み合わせてメッシュを作成する
        const mesh = new THREE.Mesh(geometry,material);

        //THREE.Mesh.position.set(x,y,z)
        mesh.position.set(config.position.x,config.position.y,config.position.z);

        //mesh.scale.setScalar(value):オブジェクトのX,y,Z軸の拡大率を同じ値に設定する
        //?? 1 はconfig.scaleがnull,undefinedの場合に1を使用するという意味
        const scale = config.scale ?? 1;
        mesh.scale.setScalar(scale);

        return mesh;
    }
}

//3.シーンのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,//fov
    window.innerWidth/window.innerHeight,//aspect
    0.1,//near
    1000//far
);
const renderer = new THREE.WebGLRenderer({antialias:true});

scene.background = new THREE.Color(0xf0f0f0);//背景色をグレーにする
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth,window.innerHeight);
camera.position.set(0,2,5);
camera.lookAt(0,0,0);

//4.ライトを追加する
//今回はMeshLamberMaterialが光源の影響を受けるため、ライトがないとオブジェクトが真っ黒に見える
//new THREE.AmbientLight(color,intensity):シーン全体を照らす環境光
scene.add(new THREE.AmbientLight(0x404040,1));
//new THREE.DirectionalLight(color,intensity):特定の方向から照らす平行光
const light = new THREE.DirectionalLight(0xffffff,0.8)
light.position.set(5,5,5);
scene.add(light);

//5.ShapeConfigの配列を定義
const shapeConfigs:ShapeConfig[] = [
    {
        type:'box',
        color:0xff0000,
        position:{x:-2,y:0,z:0}
    },
    {
        type:'sphere',
        color:0x00ff00,
        position:{x:0,y:0,z:0},
        scale:0.4
    },
    {
        type:'cone',
        color:0x0000ff,
        position:{x:2,y:2,z:3},
        scale:.5
    }
];

//6.設定配列をもとに一括で図形を作成してシーンに追加します。
const shapes = shapeConfigs.map(config=>{
    const shape = ShapeFactory.createShape(config);
    scene.add(shape);
    return shape;
});

//アニメーションループを設定する
function animate():void{
    requestAnimationFrame(animate);
    //シーン内の各図形をY軸周りに回転させる
    shapes.forEach(shape=>{shape.rotation.y += 0.01});
    renderer.render(scene,camera);
}
animate();

