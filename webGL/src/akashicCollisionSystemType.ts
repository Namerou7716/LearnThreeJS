import * as co from '@akashic-extension/collision-js';

/**
 * 線平行バウンディングボックス
 * ゲームのフィールド境界、UI要素の当たり判定
 */
export interface AABB{
    min: co.Vec2Like; //最小座標
    max: co.Vec2Like; //最大座標
}

/**
 * 円
 * キャラクターの当たり判定、アイテム収集、弾丸
 */
export interface Circle{
    position: co.Vec2Like; //中心座標
    radius: number; //半径
}

/**
 * 有向ボックス（回転可能な矩形）
 * 車、建物、回転するプラットフォーム
 */
export interface OBB{
    position: co.Vec2Like; //中心座標
    halfExtend: co.Vec2Like; //半分のサイズ
    angle: number;          //回転角(rad)
}

/**
 * 線分
 * レイキャスト、プラットフォームの端
 */
export interface Segment{
    startPosition: co.Vec2Like; //始点
    endPosition: co.Vec2Like; //終点
}

/**
 * 直線
 * 数学的な計算や、理論的な判定に使用、物理シミュレーション、幾何学計算
 */
export interface Line{
    position: co.Vec2Like; // 直線状の1点
    direction: co.Vec2Like; //方向ベクトル
}

/**
 * 多角形
 * 凸多角形のサポート、宇宙船、地形のような複雑な形
 */
export interface Polygon{
    vertices: co.Vec2Like; //頂点配列(時計回り)
}