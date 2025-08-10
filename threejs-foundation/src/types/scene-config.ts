import * as THREE from 'three'

/**
 * カメラ設計図
 */
export interface CameraConfig{
    type:'perspective' | 'orthographic'; //カメラの種類
    fov?: number;   //視野角
    aspect?:number; //アスペクト比
    near:number;    //クリッピングのキョリ（近傍）
    far:number;     //クリッピングのキョリ（遠方）
    position: THREE.Vector3;    //カメラの位置
    target?: THREE.Vector3;     //カメラのターゲット方向
}

/**
 * レンダラーの設定
 * Three.jsの描画エンジンに関する設定
 */
export interface RendererConfig{
    antialias :  boolean; //アンチエイリアス : オブジェクトの輪郭のギザギザを滑らかにするかどうか
    alpha : boolean;      //アルファ（透明度） : レンダラーの背景を透過させるか
    shadowmap : {        //影の描画設定 : シーン内で影を有効にするか同化、その品質を設定する
        enabled : boolean;
        type : THREE.ShadowMapType; //影の計算方法や品質の種類
    };
}

/**
 * シーン設定の設計図
 * 3D空間全体の設定
 */
export interface SceneConfig{
    background?: THREE.Color | THREE.Texture | null;
    fog?:{
        type: 'linear' | 'exponential'; //線形か指数関数
        color : THREE.Color;
        near?: number; //線形フォグの場合の設定 : フォグが始まる距離
        far?: number;//線形フォグの場合の設定 : フォグが最大になる距離
        density?: number //指数関数フォグの場合の設定 : フォグの密度
    };
}

/**
 * すべての設定を統合した設計図
 */
export interface FoundationSceneConfig{
    camera : CameraConfig;
    renderer : RendererConfig;
    scene : SceneConfig;
    autoResize : boolean;
}