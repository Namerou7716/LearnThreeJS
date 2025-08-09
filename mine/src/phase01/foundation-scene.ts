import * as THREE from 'three'
import { FoundationSceneConfig,DEFAULT_CONFIG,CameraConfig,RendererConfig,SceneConfig } from './scene-config'

/**
 * 基盤シーンクラス
 * Three.jsのコア要素（シーン、カメラ、レンダラー）をカプセル化し、
 * 初期化、アニメーション、リソース管理、イベント処理などの共通機能を提供する
 */
export class FoundationScene{
    //Three.jsのコア要素
    //public readonly 外部からの参照可能だが変更不可
    public readonly camera:THREE.Camera;
    public readonly scene:THREE.Scene;
    public readonly renderer:THREE.WebGLRenderer;


    //内部状態管理用のプロパティ
    //private修飾子により、これらのプロパティはクラスの内部でのみアクセス可能
    //外部からの意図しない変更を防ぎ、クラスの内部実装を隠蔽する(カプセル化) 
    private animationId:number | null = null;                               //requestAnimationFrameのID。アニメーションの停止に使う。
    private clock: THREE.Clock = new THREE.Clock();                         //アニメーションの時間管理用。経過時間などを観測
    private animatedObjects:Map<string,(deltaTime:number)=>void> = new Map();
    private config:FoundationSceneConfig;                                   //このシーンインスタンスに適用される最終的な設定
    private isInitialized:boolean = false;                                  //シーンが初期化済みかどうかのフラグ
    private isDisposed:boolean = false;                                     //シーンが破棄済みかどうかのフラグ


    //リソース管理用のプロパティ
    private managedObjects : Map<string,THREE.Object3D> = new Map();        //シーンに追加されたオブジェクトをIDで管理

    //イベント処理用のプロパティ
    private resizeHandler: (()=>void) | null = null;                        //ウィンドウリサイズ処理の関数を保持

    /**
     * コンストラクタ
     * @param userConfig ユーザーが指定するカスタム設定（Partialで部分的でも可）。省略した場合はデフォルト設定が適用される
     */
    constructor(userConfig:Partial<FoundationSceneConfig> = {}){
        //ユーザー設定がある場合はマージする
        this.config = this.mergeConfig(DEFAULT_CONFIG,userConfig);
        //コア要素の初期化
        //設定に基づいて、カメラ、シーン、レンダラの各インスタンスを作成する
        this.camera = this.createCamera(this.config.camera);
        this.scene = this.createScene(this.config.scene);
        this.renderer = this.createRenderer(this.config.renderer);

        //その他
        this.initialize();
    }

    private mergeConfig(defaultConfig:FoundationSceneConfig,userConfig:Partial<FoundationSceneConfig>):FoundationSceneConfig{
        return{
            ...defaultConfig,
            ...userConfig,
            camera:{...defaultConfig.camera,...userConfig.camera},
            renderer:{...defaultConfig.renderer,...userConfig.renderer},
            scene:{...defaultConfig.scene,...userConfig.scene}
        };
    }


    /**
     * 設定に基づいてThree.jsのカメラを作成するプライベートメソッド
     * @param config カメラ設定オブジェクト
     * @returns 作成されたTHREE.Cameraインスタンス
     */
    private createCamera(config:CameraConfig):THREE.Camera{
        let camera:THREE.Camera;
        if(config.type === 'perspective'){
            //遠近法カメラ
            camera = new THREE.PerspectiveCamera(config.fov,config.aspect,config.near,config.far);
        }else{
            //並行投影カメラ(2Dカメラ)
            //new THREE.OrthographicCamera(left,right,top,bottom)
            /**
             * left/right,top/bottomはカメラの描画領域を直接指定する
             * left : 左端の座標（通常は負の値）
             * right : 右端の座標（通常は正の値）
             * top : 上端の座標（通常は正の値）
             * bottom : 下端の座標（通常は負の値）
             * near,far : クリッピングの距離
             */
            camera  = new THREE.OrthographicCamera(-1,1,1,-1,config.near,config.far);
        }
        //指定したTHREE.Vector3の値をカメラの位置にコピーする
        camera.position.copy(config.position);
        if(config.target){
            //カメラを指定したTHREE.Vector3に向ける
            camera.lookAt(config.target);
        }
        return camera;
    }

    /**
     * 設定に基づいてThree.jsのシーンを作成するプライベートメソッド
     * @param config シーン設定オブジェクト
     * @returns 作成されたTHREE.Sceneオブジェクト
     */
    private createScene(config:SceneConfig):THREE.Scene{
        const scene = new THREE.Scene();
        if(config.background){
            scene.background = config.background;
        }
        if(config.fog){
            // new THREE.Fog(color,near,far):線形フォグを作成
            scene.fog = new THREE.Fog(config.fog.color,config.fog.near,config.fog.far);
        }
        return scene;
    }


    /**
     * 設定に基づいてレンダラを作成するプライベートメソッド
     * @param config レンダラー設定オブジェクト
     * @returns 作成されたTHREE.WebGLRendererインスタンス
     */
    private createRenderer(config:RendererConfig):THREE.WebGLRenderer{
        //new THREE.WebGLRenderer({antialias: ... , alpha: ...})
        //WebGLを使って３D シーンを描画するレンダラーを作成する
        const renderer = new THREE.WebGLRenderer({antialias:config.antialias,alpha:config.alpha});
        renderer.setPixelRatio(window.devicePixelRatio);
        //renderer.setPixelRatio():デバイスのピクセル比に合わせて解像度を調整
        //高解像度のディスプレイなどにも対応
        renderer.setSize(window.innerWidth,window.innerHeight);
        //レンダラの描画サイズをブラウザのウィンドウサイズに設定する。
        //これにより画面いっぱいに３Dシーンが画面いっぱいに表示される
        renderer.setSize(window.innerWidth,window.innerHeight);
        //renderer.shadowMap.enabled : シーン内で影を計算し、描画することを有効にする
        renderer.shadowMap.enabled = config.shadowMap.enabled;
        //renderer.shadowMap.type  : 影の品質や計算方法を設定する
        renderer.shadowMap.type = config.shadowMap.type;

        return renderer;
    }

    /**
     * DOMへの追加やイベントリスナー設定など初期化設定
     */
    private initialize():void {
        //すでに初期化済みかのチェック
        if(this.isInitialized)return;

        //renderer.domElement : レンダラが描画を行うためのHTMLの<canvas>要素
        //これをHTMLの<body>要素（または指定されたコンテナ）に追加
        const container = this.config.container || document.body;
        container.appendChild(this.renderer.domElement);

        //自動リサイズが有効な場合、ウィンドウリサイズイベントを設定する
        if(this.config.autoResize){
            this.setupResizeHandler();
        }

        this.isInitialized = true;
        console.log('FoundationScene has been initialized');
    }

    /**
     * ウィンドウリサイズ時に処理するメソッド
     * カメラとレンダラの表示を適切に設定
     */
    private setupResizeHandler():void{
        this.resizeHandler = ()=>{
            const width = window.innerWidth;
            const height = window.innerHeight;

            if(this.camera instanceof THREE.PerspectiveCamera){
                //カメラのアスペクト比を現在のウィンドウサイズに合わせて更新する
                this.camera.aspect = width/height;
                //canera.updateProjectionMatrix() : カメラのプロパティを変更（視野角、アスペクト比）後に、
                //その変更をThree.jsの内部で反映させるために必ず呼び出す必要がある
                this.camera.updateProjectionMatrix();
            }
            this.renderer.setSize(width,height);
        };
        window.addEventListener('resize',this.resizeHandler);
    }

    /**
     * シーンに３Dオブジェクトを追加するパブリックメソッド
     * @param object 追加するTHREE.Object3Dインスタンス（Mesh,Lightなど）
     * @param id 管理用のユニークID（省略可能）指定が無ければオブジェクトのuuidが使用される
     * @returns オブジェクトの管理ID
     */
    public addObject(object : THREE.Object3D,id?: string):string{
        const objectId = id || object.uuid; //idが指定されていない場合はThree.jsが自動生成するUUIDを使用する
        //オブジェクトをシーンに追加
        this.scene.add(object);
        this.managedObjects.set(objectId,object);//関数内でIDとセットで管理
        console.log(`Object added with ID ${objectId}`);
        return objectId
    }

    /**
     * シーンから３Dオブジェクトを削除するパブリックメソッド 
     * @param id 削除するオブジェクトのID
     * @returns 削除に成功した場合はtrue,見つからない場合はfalse
     */
    public removeObject(id:string): boolean{
        const object = this.managedObjects.get(id);
        if(object){
            this.scene.remove(object);
            this.managedObjects.delete(id);
            console.log(`Object removed ID : ${id}`);
            return true;
        }
        return false;
    }

    /**
     * オブジェクトにアニメーションを登録する
     * @param id アニメーションの識別子
     * @param animationFn 毎フレーム実行される関数
     */
    public addAnimation(id:string,animationFn:(deltaTime:number)=>void):void{
        this.animatedObjects.set(id,animationFn);
    }

    /**
     * アニメーションを削除する
     * @param id 削除するアニメーションの識別子
     */
    public removeAnimation(id:string) :void{
        this.animatedObjects.delete(id);
    }

    /**
     * アニメーションループを開始するパブリックメソッド
     * 毎フレーム、シーンの更新と描画が行われる
     */
    public startAnimation():void{
        if(this.animationId !== null) return; //すでにアニメーションが開始済みなら何もしない

        const animate = ():void=>{
            //requestAnimationFrame(callback) : ブラウザに次の描画タイミングで指定したコールバック関数を実行するように要求する
            //再帰的にanimate関数を呼び出すことでブラウザの描画サイクルに合わせたスムーズなアニメーションループが実現される
            this.animationId = requestAnimationFrame(animate);

            //ここでオブジェクトの更新処理を行う
            const deltaTime = this.clock.getDelta();
            //登録されたアニメーション関数を実行
            this.animatedObjects.forEach(animationFn=>{
                animationFn(deltaTime);
            });
            //renderer.render(scene,camera) : 指定したシーンを指定したカメラの視点から描画する
            //この処理が毎フレーム実行されることで3Dシーンがアニメーションとして見えるようになる
            this.renderer.render(this.scene,this.camera);
        };

        animate(); //アニメーションループを開始
        console.log('Animation started');
    }

    /**
     * アニメーションループを停止する
     */
    public stopAnimation():void{
        if(this.animationId !== null){
            //cancelAnimationFrame(id) : requestAnimetionFrameで予約されているコールバックをキャンセルする
            //これによりアニメーションループが停止する
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('animation stopped');
        }
    }

    /**
     * シーンを完全に破棄し、使用していたリソースを解放する
     * アプリケーション終了時や、シーンを切り替える際などに呼び出してメモリリークを防ぐ
     */
    public dispose():void{
        if(this.isDisposed) return;

        //アニメーションを停止
        this.stopAnimation();
        
        //管理しているオブジェクトをすべてシーンから削除する
        this.managedObjects.forEach(obj=>this.scene.remove(obj));
        this.managedObjects.clear(); //管理Mapもクリア

        //renderer.dispose:レンダラが使用しているWebGLコンテキストと
        //それに関連するすべてのGPUリソースを解放する
        this.renderer.dispose();
        //レンダラの<canvas>要素をHTMLから削除する
        if(this.renderer.domElement.parentNode){
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }

        //イベントリスナーを削除する
        if(this.resizeHandler){
            window.removeEventListener('resize',this.resizeHandler);
        }

        this.isDisposed = true;
        console.log('FoundationScene disposed successfully');
    }
}
