import * as THREE from 'three'

/**
 * シーン全体を管理するクラス。
 * シーン、カメラ、レンダラ、シーン内のオブジェクトの配列といったシーンに関連するすべての状態を管理
 */
class InteractiveScene{
    //private修飾子によってクラス外からのアクセスを拒否（カプセル化）
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private shapes: THREE.Mesh[] =[];

    constructor(){
        //コンストラクタで基本的なThree.jsのセットアップを呼出す
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,//fov
            window.innerWidth/window.innerHeight,//aspect
            0.1,//near
            1000//far
        );
        this.renderer = new THREE.WebGLRenderer({antialias:true});

        this.init();
    }

    private init():void{
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        //ライトを追加する
        this.scene.add(new THREE.AmbientLight(0x404040,1));
        const light = new THREE.DirectionalLight( 0xffffff,1)
        light.position.set(5,5,5);
        this.scene.add(light);

        //カメラの位置を設定し、シーンの中心に向かわせる
        this.camera.position.set(0,2,8);
        this.camera.lookAt(0,0,0);

        //イベントリスナー（ユーザーの操作やブラウザの状態変化を待つ仕組み）を設定する
        this.setupEventListeners();
    }

    /**
     * キーボードイベントなどのイベントリスナーを設定するプライベートメソッド
     */
    private setupEventListeners():void{
        window.addEventListener('keydown',(event:KeyboardEvent)=>{
            this.handleKeyPress(event.key);
        })
    }

    /**
     * キー入力に応じた処理を実行するプライベートメソッド
     * @param key 押されたキーの文字列
     */
    private handleKeyPress(key:string):void{
        switch(key.toLowerCase()){
            case 'b':
                this.addShape('box');
                break;
            case 's':
                this.addShape('sphere');
                break;
            case 'c':
                this.addShape('cone');
                break;
            case 'r':
                this.clearAllShapes()
                break;
            default:
                console.log('バインドされていないキーです');
        }
    }

    /**
     * 指定された種類の図形をシーンに追加するパブリックメソッド
     * @param type 追加する図形の種類('box'または'sphere')
     */
    public addShape(type:'box' | 'sphere'|'cone'):void{
        let geometry:THREE.BufferGeometry;
        if(type === 'box'){
            geometry = new THREE.BoxGeometry(1,1,1);
        }else if(type === 'cone'){
            geometry = new THREE.ConeGeometry(0.2,1.0,8);
        }else{
            geometry = new THREE.SphereGeometry(0.7,32,16);
        }

        //new THREE.MeshLamberMaterial({color})光源の影響を受けるマテリアル
        //ランダムな色をMath.ramdom()を書けることで実現している
        const material = new THREE.MeshLambertMaterial({color:Math.random() * 0xffffff});
        const shape = new THREE.Mesh(geometry,material);

        //図形をランダムな位置に配置する
        shape.position.set(
            (Math.random()-0.5)*10, //-5から5の範囲
            (Math.random()-0.5)*5, //-2.5から2.5の範囲
            (Math.random() - 0.5)*5
        );

        this.scene.add(shape);
        this.shapes.push(shape);
        console.log(`${type}を追加しました。現在の合計${this.shapes.length}`);
    }

    /**
     * シーン内のすべての図形を削除し、関連するリソースを解放するパブリックメソッド
     * メモリリークを防ぐために必要
     */
    public clearAllShapes():void{
        this.shapes.forEach(shape=>{
            //scene.remove(shape):シーンからオブジェクトを削除する。描画対象から外れる
            this.scene.remove(shape);      

            //メモリリーク対策
            //Three.jsのオブジェクト（ジオメトリやマテリアル）はWebGLのGPUメモリを使用する
            //シーンから削除されるだけではGPUメモリは解放されないため、明示的にdisposeを呼出す必要がある

            //ジオメトリ（形状データ）が使用しているGPUメモリを開放する
            shape.geometry.dispose();

            //マテリアルが使用しているGPUメモリ（テクスチャなど）を解放
            //マテリアルが配列の場合も考慮して書く
            if(Array.isArray(shape.material)){
                shape.material.forEach(element => {
                    element.dispose()
                });
            }else{
                shape.material.dispose();
            }
        })
        this.shapes = [];//管理用の配列も空にする
        console.log('すべての図形を削除し、リソースを解放しました');
    }

    /**
     * アニメーションループを開始するパブリックメソッド
     */
    public animate():void{
        //requestAnimationFrameを再帰的に呼び出すことで、アニメーションループを実現する
        requestAnimationFrame(()=>this.animate());

        //シーン内の各図形を回転させる
        this.shapes.forEach(element => {
            element.rotation.x += 0.01;
            element.rotation.y += 0.01; 
        });

        //シーンをレンダリングする
        this.renderer.render(this.scene,this.camera);
    }


}

//実行
//InteractiveSceneのインスタンスを作成し、アニメーションを開始する
const scene = new InteractiveScene();
scene.animate();

//初期表示としてボックスを1つ追加
scene.addShape('box');

//操作方法をコンソールに追加
console.log(
    `
    ===インタラクティブシーン===\n
    キーボード操作で図形を追加、削除\n
    B:ボックスを追加\n
    S:球体を追加\n
    R:全ての図形を削除`
);
