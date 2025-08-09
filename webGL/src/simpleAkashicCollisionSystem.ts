import {AABB,Circle,OBB,Segment,Line,Polygon} from './akashicCollisionSystemType';
import * as co from '@akashic-extension/collision-js'

/**
 * 基本的な衝突判定のデモンストレーションクラス
 * 
 * @akashic-extension/collision-jsの基本的な
 * 交差判定関数方法を学習する
 */
export class CollisionDemo{
    /**
     * AABB同士の交差判定デモ
     * 
     * AABBは最も高速な衝突判定で、単純な数値比較のみで良い
     * 
     * 計算量O(1) - 定数時間
     */
    testAABBtoAABB():void{
        //第1のAABB、正方形
        const aabb1:co.AABB = {
            min:{x:0,y:0},          //左上角
            max:{x:10,y:10}         //右下角
        };

        //第2のAABB、正方形
        const aabb2 :co.AABB = {
            min:{x:5,y:5},
            max:{x:15,y:15}
        };

        //aabbToAABB関数は内部で以下の判定を行う
        //(aabb1.min.x<=aabb2.max.x && aabb1.max.x >= aabb2.min.x) && 
        //(aabb1.min.y<=aabb2.max.y && aabb1.max.y >= aabb2.min.y)
        const result = co.aabbToAABB(aabb1,aabb2);
        console.log('AABB結果:',result);

        const aabb3: co.AABB = {
            min:{x:20,y:20},
            max:{x:30,y:30}
        };
        const failedResult = co.aabbToAABB(aabb1,aabb3);
        console.log('AABB結果:',failedResult);
    }

    /**
     * 円同士の交差判定デモ
     * 
     * 円の衝突判定は中心間の距離と半径の和を比較するだけで非常に効率的
     * 数学的には
     * distance(center1,center2) <= radius1 + radius2
     * 中心間のキョリが両者の半径の和より短ければ交差している
     * 計算量: O(1) - 平方根の計算
     * 最適化 : 平方根を避けるため、距離の2乗で比較することも可能
     */
    testCircleToCircle():void{
        const circle1:co.Circle = {
            position:{x:0,y:0},
            radius:5
        }
        const circle2:co.Circle = {
            position:{x:7,y:0},
            radius:5
        }
        const result = co.circleToCircle(circle1,circle2);
        console.log('円交差結果:',result);
        //上記関数内部を手動で計算
        const distance = Math.sqrt(
            Math.pow(circle2.position.x-circle1.position.x,2)+
            Math.pow(circle2.position.y-circle1.position.y,2)
        );
        const radiusSum = circle1.radius + circle2.radius;
        console.log('中心間距離:',distance,'半径の和:',radiusSum);
    }
}

(():void=>{
    const demo = new CollisionDemo();
    demo.testAABBtoAABB();
    demo.testCircleToCircle();
})();