import * as THREE from 'three';

/**
 * カメラ設定の設計図（インターフェース）
 * Three.jsのカメラを作成する際に必要な設定項目を定義する
 */
export interface CameraConfig{
    type:'perspective'|'orthographic';              //カメラの種類:遠近法カメラか並行投影カメラか
    fov?: number;                                   //視野角、PerspectiveCamera用の設定。カメラが見る範囲の角度、小さいほどズームインする。
    aspect?: number;                                //アスペクト比:通常は描画領域の幅を高さで割った値
    near: number;                                   //近クリッピング面:カメラに映る最も手前の距離
    far:number;                                     //遠クリッピング面:カメラに映る最も遠い距離
    position: THREE.Vector3;                        //カメラの3D空間における位置(x,y,z座標)
    target?: THREE.Vector3;                         //カメラが中止する点:カメラがどの方向を向くかを指定する
}


/**
 * レンダラ設定の設計図
 * Three.jsの描画エンジンであるレンダラーに関する設定項目を定義する
 */
export interface RendererConfig{
    antialias:boolean;                              //アンチエイリアス:オブジェクトの輪郭のギザギザを滑らかにするか
    alpha: boolean;                                 //アルファ（透明度）:レンダラーの背景を透過させるか
    shadowMap:{                                     //影の描画設定:シーン内で影を有効にするか、その品質などを設定します。
        enabled:boolean;
        type:THREE.ShadowMapType;                   //影の計算方法や品質の種類
    };
}

/**
 * シーン設定の設計図（インターフェース）
 * ３D空間全体（THREE.Scene）に関する設定項目を定義する
 */
export interface SceneConfig{
    background?: THREE.Color | THREE.Texture | null;        //背景:シーンの背景色や背景画像を設定する
    fog?:{                                                  //霧（フォグ）の設定:遠くのオブジェクトが霧でかすむ効果を追加します。
        type: 'linear' | 'exponential';                     //フォグの種類:線形か指数関数か
        color: THREE.Color;                                 //霧の色
        near?: number;                                      //線形フォグの場合:フォグが始まる距離
        far?: number;                                       //線形フォグの場合:フォグが最大になる距離
        density?:number;                                    //指数関数的フォグの場合:フォグの密度
    };
}


/**
 * すべての設定を統合した、最終的な設計図
 * FoundationSceneクラスのコンストラクタに渡される設定オブジェクトの完全な形を定義する
 * このインターフェースに従うことで、シーン作成に必要な設定がすべてそろうことを保証する
 */
export interface FoundationSceneConfig{
    camera: CameraConfig;
    renderer: RendererConfig;
    scene: SceneConfig;
    container?: HTMLElement;                                //レンダラが描画されるHTML要素。指定が無ければdocumet.bodyに描画される
    autoResize: boolean;                                    //ウィンドウサイズ変更時に、シーンが自動でリサイズされるようにするか。
    stats?: boolean;                                        //パフォーマンス統計（FPSなど）を表示するか
}


/**
 * デフォルト設定オブジェクト
 * ユーザーがFoundationSceneのインスタンスを作成する際に
 * 特定の設定を省略した場合に自動的に適用される標準的な設定値
 * FoundationSceneConfigインターフェースに準拠しているため型安全
 */
export const DEFAULT_CONFIG : FoundationSceneConfig = {
    camera:{
        type:'perspective',
        fov:75,
        aspect:window.innerWidth/window.innerHeight,
        near:0.1,
        far:1000,
        position: new THREE.Vector3(0,0,5)
    },
    renderer:{
        antialias:true,
        alpha:false,
        shadowMap:{
            enabled:true,
            type:THREE.PCFSoftShadowMap                      //影のタイプ:やわらかい影を生成
        }
    },
    scene:{
        background: new THREE.Color(0x222222)               //シーンの背景色を暗いグレーに設定
    },
    autoResize:true,
    stats:false
}