//ファクトリーが受け入れることが出来るジオメトリとマテリアルの種類、それぞれの設定項目を型で定義する
import * as THREE from 'three';

//Union Typesを使って定義する

//このファクトリーが作成をサポートするジオメトリの種類を定義する
//これ以外の文字を指定するとエラーになる
export type GeometryType = 
| 'box'
| 'sphere'
| 'cone'
| 'cylinder'
| 'torus'
| 'plane'

//このファクトリーが作成をサポートするマテリアル
export type MaterialType =
| 'basic'                   //最もシンプルなマテリアル
| 'lambert'                 //光の当たり型を考慮するが、反射はしないマットなマテリアル
| 'phong'                   //光沢のある反射（ハイライト）を表現するマテリアル
| 'standard'                //PBR（物理ベース）の元もリアルなマテリアル


//それぞれのジオメトリやマテリアルが持つ固有の設定項目をinterfaceで定義する。
//各タイプに必要なプロパティが明確になる
export interface BoxGeometryConfig{width?:number;height?:number;depth?:number};
export interface SphereGeometryConfig{radius?:number;widthSegments?:number;heightSegments?:number};
export interface ConeGeometryConfig{radius?:number;height?:number;radialSegments?:number};
export interface CylinderGeometryConfig{radiusTop?:number;radiusBottom?:number;height?:number;radialSegments?:number;};
export interface TorusGeometryConfig{radius?:number;tube?:number;radialSegments?:number;tublarSegments?:number;};
export interface PlaneGeometryConfig{width?:number;height?:number;};

//マテリアル設定インターフェース
export interface BasicMaterialConfig{color?:number;wireframe?:boolean;}
export interface LambertMaterialConfig{color?:number;emssive?:number;}
export interface PhongMaterialConfig{color?:number;specular?:number;shininess?:number;}
export interface StandardMaterialConfig{color?:number;roughness?:number;metalness?:number;}

/**
 * すべてのジオメトリ設定を統合する型（Discriminated Union）
 * 識別可能な合併型
 * TypeScriptはこの型を賢く解釈し
 * if(config:GeometryConfig === 'box')のようなコードブロック内ではこのconfigがBoxGeometryConfigのプロパティを持つことを理解してくれる
 */
export type GeometryConfig = 
| {type:'box';config?:BoxGeometryConfig}
| {type:'sphere';config?:SphereGeometryConfig}
| {type:'cone';config?:ConeGeometryConfig}
| {type:'cylinder';config?:CylinderGeometryConfig}
| {type:'torus';config?:TorusGeometryConfig}
| {type:'plane';config?:PlaneGeometryConfig}


/**
 * すべてのマテリアル設定を統合する型
 */
export type MaterialConfig = 
| {type:'basic';config?:BasicMaterialConfig}
| {type:'lambert';config?:LambertMaterialConfig}
| {type:'phong';config?:PhongMaterialConfig}
| {type:'standard';config?:StandardMaterialConfig}

/**
 * 色の表現方法
 */
export type ColorInput = THREE.ColorRepresentation | string | number;

/**
 * 位置・回転・スケール
 */
export interface Vector3Like{
    x:number;
    y:number;
    z:number;
}

//===========================
//メッシュオブジェクト関連の型
//===========================

/**
 * ３Dオブジェクトの変換情報
 */
export interface Transform{
    position?: Partial<Vector3Like>;
    rotation?: Partial<Vector3Like>;
    scale?:Partial<Vector3Like>;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig{
    enabled:boolean;
    rotation?:{
        x?:number;
        y?:number;
        z?:number;
    }
    /**
     * 位置の振動アニメーション
     */
    position?:{
        amplitude?:number;              //振動の振幅
        frequency?:number;              //振動の周波数
        axis?:'x'|'y'|'z';              //振動する軸
    };
    /**
     * スケールの周期的変化
     */
    scale?:{
        min?:number;
        max?:number;
        frequency:number;               //スケール変化の周波数
    }
}

/**
 * ３Dオブジェクトの完全な設定
 * ジオメトリ、マテリアル、変換、アニメーションを統合した設定
 */
export interface ObjectConfig{
    //ジオメトリの設定
    geometry:GeometryConfig;
    //マテリアルの設定
    material:MaterialConfig;
    //初期の変換情報（位置、回転、スケール）
    transform?:Transform;
    //アニメーションの設定
    animation?:AnimationConfig;
    //オブジェクトの名前（デバックや管理用）
    name?:string;
    //カスタムデータを格納するオブジェクト
    //Recordは任意のオブジェクトを定義できる
    //unknownは任意の型を入れられるが、使用時には型チェックが必要になる
    userData?:Record<string,unknown>;       
}

//==========================
//ユーティリティ型とヘルパー
//===========================

/**
 * 型安全なジオメトリファクトリーの戻り値型
 * 三項演算子でGeometryTypeのサブタイプで返す型を決める
 */
export type GeometryInstance<T extends GeometryType> = 
    T extends 'box' ? THREE.BoxGeometry : 
    T extends 'sphere' ? THREE.SphereGeometry :
    T extends 'cone' ? THREE.ConeGeometry :
    T extends 'cylinder' ? THREE.CylinderGeometry :
    T extends 'torus' ? THREE.TorusGeometry :
    T extends 'plane' ? THREE.PlaneGeometry :
    THREE.BufferGeometry;

/**
 * 型安全なマテリアルファクトリーの戻り値型
 */
export type MaterialInstance<T extends MaterialType> = 
    T extends 'basic' ? THREE.MeshBasicMaterial :
    T extends 'lambert' ? THREE.MeshLambertMaterial :
    T extends 'phong' ? THREE.MeshPhongMaterial :
    T extends 'standard' ? THREE.MeshStandardMaterial :
    THREE.Material;

/**
 * 必須フィールドを持つ型を作成するユーティリティ型
 * 指定したプロパティを必須にし、他はオプショナルのままにする
 */
export type RequiredFields<T,K extends keyof T> = T & Required<Pick<T,K>>
/**
 * keyof T : Tのキーを抽出する
 * Pick<T,K> : 型Tで指定されたKのプロパティのみ抽出
 * Required<T> : 指定したTのプロパティをすべて必須にする(?を消す)
 */
    

/**
 * 部分的に必須フィールドを持つオブジェクト設定型
 * geometry,materialを必須にしたObjectConfig
 */
export type RequiredObjectConfig = RequiredFields<ObjectConfig,'geometry'|'material'>
    

//===================================
//イベント関連の型定義
//===================================

/**
 * マウスイベントの情報
 * マウス操作に関する情報をまとめた型
 */
export interface MouseEventInfo{
    //スクリーン座標系でのマウス位置
    position:THREE.Vector2;
    //正規化された座標(-1 ~ 1)
    normalized:THREE.Vector2;
    //クリックされた3Dオブジェクト(レイキャスト結果)
    target?: THREE.Object3D;
}

/**
 * インタラクションイベントのコールバック型
 * マウスイベントが発生したときに呼び出される関数の型
 */
export type InteractionCallback = (info:MouseEventInfo)=>void;


/**
 * イベントハンドラーのマップ
 * 3Dオブジェクトに登録できるイベントハンドラーの組み合わせ
 */
export interface EventHandlers{
    //click calllback
    onClick?: InteractionCallback;
    //hover callback
    onHover?: InteractionCallback;
    //mouse move callback
    onMouseMove?: InteractionCallback;
}

//==================================
//パフォーマンス関連の型定義
//==================================

/**
 * レンダリング統計情報
 * レンダリングパフォーマンスの監視に使用するメトリクス
 */
export interface RenderStats{
    fps:number;                     //1秒あたりのフレーム数
    frameTime:number;               //1フレームの描画時間
    triabgles:number;               //描画された三角形の数
    vertices:number;                //描画された頂点の数
    drawCalls:number;               //GPUへの描画呼び出し回数
    memory:{                        //メモリ使用量情報
        geometries:number;          //ジオメトリが使用するメモリ量（MB)
        textures:number;            //テクスチャが使用するメモリ量(MB)
        materials:number;           //マテリアルが使用するメモリ量(MB)
    };
}


/**
 * パフォーマンスモニターのコールバック
 * レンダリング統計が更新されたときに呼び出される関数の型
 */
export type PerformanceCallback = (stats:RenderStats)=>void;