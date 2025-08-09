import * as THREE from 'three';
import { FoundationScene } from './foundation-scene';

/**
 * デモシーンを管理するクラス
 * FoundationSceneをインスタンス化し、その上に具体的な３D オブジェクトを配置する
 */
class BasicFoundationDemo{
    private foundationScene:FoundationScene;

    constructor(){
        //FoundationSceneのインスタンスを作成する
        //ここではscene-config.tsで定義したデフォルト設定を自動的に適用する
        this.foundationScene = new FoundationScene();

        //シーンに表示する3Dオブジェクト（ライト、キューブ、地面）を作成し追加する
        this.createSceneContent();

        //アニメーションループを開始する
        //シーンがブラウザに描画され続ける
        this.foundationScene.startAnimation();
    }

    /**
     * シーンに表示する３Dオブジェクトをsか宇正史、FoundationSceneに追加するメソッド
     */
    private createSceneContent():void{
        //ライトの作成
        //new THREE.AmbientLight(color,intensity):シーン全体を均一に照らす環境光の作成
        const ambientLight = new THREE.AmbientLight(0xffffff,0.5);
        this.foundationScene.addObject(ambientLight,'ambientLight');//addObject()でシーンに追加し、IDで管理

        //太陽光のようにオブジェクトに影を落とす
        //new THREE.DirectionalLight():特定の方向から照らす平行光を作成する
        const directionalLight = new THREE.DirectionalLight(0xffffff,0.8);
        directionalLight.position.set(5,10,7.5);//ライトの位置
        directionalLight.castShadow = true;//ライトが影を生成するように設定
        this.foundationScene.addObject(directionalLight,'directionalLight');

        /**
         * オブジェクトの作成
         */
        //THREE.BoxGeometry(width,height,depth);
        const boxGeometry = new THREE.BoxGeometry(1,1,1);
        //PBRに基づいたリアルな質感のマテリアル
        const boxMaterial = new THREE.MeshStandardMaterial({color:0x00ff00});//緑色
        const cube = new THREE.Mesh(boxGeometry,boxMaterial);
        cube.castShadow = true;
        this.foundationScene.addObject(cube,'myCube');

        /**
         * オブジェクトのアニメーションを登録
         */
        this.foundationScene.addAnimation('cubeRotation',(deltaTime:number)=>{
            cube.rotation.x += deltaTime*2;//2 rad/s
            cube.rotation.y += deltaTime*1;//1 rad/s
        });
        let time = 0;
        this.foundationScene.addAnimation('cubeFloat',(deltaTime:number)=>{
            time += deltaTime;
            cube.position.y = Math.sin(time * 3) * 0.5;
        });

        /**
         * 地面の作成
         */
        //THREE.PlaneGeometry(width,height);
        const groundGeometry = new THREE.PlaneGeometry(10,10);
        const groundMaterial = new THREE.MeshStandardMaterial({color:0x808080});//グレー
        const ground = new THREE.Mesh(groundGeometry,groundMaterial);
        //x軸周りに-90度回転
        ground.rotation.x = -Math.PI/2;
        ground.position.y = -2;
        //他のオブジェクトから落とされた影を受け取るようにする
        ground.receiveShadow = true;
        this.foundationScene.addObject(ground,'ground');
    }

    /**
     * デモを終了し、FoundationSceneが使用していたリソースを解放するメソッド
     */
    public dispose():void{
        this.foundationScene.dispose();
    }
}

const demo = new BasicFoundationDemo();

//デバック用にグローバルスコープに公開（ブラウザのコンソールからdemoやfoundationSceneにアクセスできる）
(window as any).demo = demo;
(window as any).foundationScene = demo['foundationScene'];