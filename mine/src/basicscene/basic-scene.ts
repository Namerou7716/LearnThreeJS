/**
 * 基本的な３D シーンを作成し、クラスでまとめるコード
 */

import * as THREE from 'three'

//型定義
interface SceneConfig{
    camera:{
        fov:number; //視野角（数値が小さいほどズームイン）
        aspect:number; //アスペクト比（通常はブラウザの幅/高さ）
        near:number; //カメラに映る一番手前の距離
        
    }
}