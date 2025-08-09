//ジオメトリとマテリアルを作成するファクトリー
import * as THREE from 'three';
import type {
    GeometryType,
    MaterialType,
    GeometryConfig,
    MaterialConfig,
    GeometryInstance,
    MaterialInstance,
    BoxGeometryConfig,
    SphereGeometryConfig,
    ConeGeometryConfig,
    CylinderGeometryConfig,
    TorusGeometryConfig,
    PlaneGeometryConfig,
    BasicMaterialConfig,
    LambertMaterialConfig,
    PhongMaterialConfig,
    StandardMaterialConfig,
    RequiredObjectConfig,
    ObjectConfig
} from './types/geometry-types'
import { NetworkInterfaceInfoIPv4 } from 'os';

/**
 * 型安全なジオメトリとマテリアルの部品工場
 * 静的メソッド（newせずに直接呼び出せるメソッド）として機能を提供する
 */
export class TypedGeometryFactory {
    /**
     * 
     * 型安全なジオメトリを作成する
     * @param type 作成したいジオメトリの種類
     * @param config そのジオメトリに固有の設定
     * @returns 指定された型に対応するThree.jsのジオメトリインスタンス
     */
    static createGeometry<T extends GeometryType>(
        type: T,
        config: Extract<GeometryConfig, { type: T }>['config'] = {} //Uniton型GeometryConfigのT型に代入できる
    ): GeometryInstance<T> {
        //typeの値に応じてジオメトリを作成する
        switch (type) {
            case 'box':
                const boxCofig = config as BoxGeometryConfig; //型推論を補助するための型アサーション
                return new THREE.BoxGeometry(
                    boxCofig.width ?? 1,         //?? 1 はNULL合体演算子で、cfg.widthがnullまたはundefinedの場合に１を使用する
                    boxCofig.height ?? 1,
                    boxCofig.depth ?? 1
                ) as GeometryInstance<T>;   //戻り値の型を正しく推論させるための型アサーション

            case 'sphere':
                const sphereConfig = config as SphereGeometryConfig;
                return new THREE.SphereGeometry(
                    sphereConfig.radius ?? 1,
                    sphereConfig.widthSegments ?? 32,
                    sphereConfig.heightSegments ?? 16
                ) as GeometryInstance<T>;

            case 'cone':
                const coneConfig = config as ConeGeometryConfig;
                return new THREE.ConeGeometry(
                    coneConfig.radius ?? 1,
                    coneConfig.height ?? 1,
                    coneConfig.radialSegments ?? 8
                ) as GeometryInstance<T>;

            case 'cylinder':
                const cylinderConfig = config as CylinderGeometryConfig;
                return new THREE.CylinderGeometry(
                    cylinderConfig.radiusTop ?? 1,
                    cylinderConfig.radiusBottom ?? 1,
                    cylinderConfig.height ?? 1,
                    cylinderConfig.radialSegments ?? 8
                ) as GeometryInstance<T>;

            case 'torus':
                const torusConfig = config as TorusGeometryConfig;
                return new THREE.TorusGeometry(
                    torusConfig.radius ?? 1,
                    torusConfig.tube ?? 0.4,
                    torusConfig.radialSegments ?? 8,
                    torusConfig.tublarSegments ?? 8
                ) as GeometryInstance<T>;

            case 'plane':
                const planeConfig = config as PlaneGeometryConfig;
                return new THREE.PlaneGeometry(
                    planeConfig.width ?? 1,
                    planeConfig.height ?? 1
                ) as GeometryInstance<T>

            default:
                const _exhaustiveCheck: never = type;
                throw new Error(`Unsupported geometry type: ${String(_exhaustiveCheck)}`);
        }
    }

    static createMaterial<T extends MaterialType>(
        type: T,
        config: Extract<MaterialConfig, { type: T }>['config'] = {}
    ): MaterialInstance<T> {
        switch (type) {
            case 'basic':
                const basicConfig = config as BasicMaterialConfig;
                return new THREE.MeshBasicMaterial(
                    {
                        color: basicConfig.color ?? 0xffffff,
                        wireframe: basicConfig.wireframe ?? false
                    }
                ) as MaterialInstance<T>

            case 'lambert':
                const lambertConfig = config as LambertMaterialConfig;
                return new THREE.MeshLambertMaterial(
                    {
                        color: lambertConfig.color ?? 0xffffff,
                        emissive: lambertConfig.emssive ?? 0x000000
                    }
                ) as MaterialInstance<T>

            case 'phong' :
                const phongConfig = config as PhongMaterialConfig;
                return new THREE.MeshPhongMaterial(
                    {
                        color: phongConfig.color ?? 0xffffff,
                        specular : phongConfig.specular ?? 0x111111,
                        shininess : phongConfig.shininess ?? 30
                    }
                ) as MaterialInstance<T>

            case 'standard' :
                const standatdConfig = config as StandardMaterialConfig;
                return new THREE.MeshStandardMaterial(
                    {
                        color : standatdConfig.color ?? 0xffffff,
                        roughness : standatdConfig.roughness ?? 0.5,
                        metalness : standatdConfig.metalness ?? 0.5
                    }
                ) as MaterialInstance<T>

            default:
                const _exhaustiveCheck:never = type;
                throw new Error(`Unsupported material type : ${String(_exhaustiveCheck)}`);
        }
    }
}


// ===================================================================
// Part 2: The "Assembly" Factory (組立工場)
// 目的: 「部品工場」で作られた部品を組み立てて、最終製品（Mesh）を作成する。
// ===================================================================
export class TypedObjectFactory{

    /**
     * 設定オブジェクトに基づいて、単一のTHREE.Mesh（最終的なもの）を作成する
     * @param config ジオメトリ、マテリアル、その他の設定を含む完全なオブジェクト設定
     * @returns 作成されたThree.Meshインスタンス
     */
    static createMesh(config : RequiredObjectConfig): THREE.Mesh{
        //1.部品工場(TypedGeometryFactory)にジオメトリの作成を依頼する
        const geometry = TypedGeometryFactory.createGeometry(
            config.geometry.type,
            config.geometry.config
        );

        //2.部品工場にマテリアルの作成を依頼する
        const material = TypedGeometryFactory.createMaterial(
            config.material.type,
            config.material.config 
        );

        //3.ジオメトリ（形状）とマテリアル（材質）を組み合わせて、最終的な３Dオブジェクトであるメッシュを作成する
        const mesh = new THREE.Mesh(geometry,material);

        //4.名前の設定や位置・回転・スケールの調整など、追加の組み立て作業を行う
        if(config.name){
            mesh.name = config.name;
        }
        if(config.userData){
            mesh.userData = config.userData;
        }
        if(config.transform){
            this.applyTransform(mesh,config.transform);
        }

        return mesh;
    }

    /**
     * 設定オブジェクトの配列から、複数のTHREE.Meshを一括で作成する
     * @param configs 複数のオブジェクト設定を含む配列
     * @returns 作成されたTHREE.Meshインスタンスの配列
     */
    static createMeshes(configs:RequiredObjectConfig[]):THREE.Mesh[]{
        return configs.map(c=>this.createMesh(c));
    }

    /**
     * オブジェクトの位置、回転、スケールを適用するプライベートヘルパーメソッド
     * @param object 変換を適用するTHREE.Object3Dインスタンス
     * @param transform 変換設定オブジェクト
     */
    private static applyTransform(object: THREE.Object3D,transform: ObjectConfig['transform']):void{
        if(!transform) return;
        if(transform.position){
            object.position.set(transform.position.x??0,transform.position.y??0,transform.position.z??0);
        }
        if(transform.rotation){
            object.rotation.set(transform.rotation.x??0,transform.rotation.y??0,transform.rotation.z??0);
        }
        if(transform.scale){
            object.scale.set(transform.scale.x??1,transform.scale.y??1,transform.scale.z??1);
        }
    }
}

//==================================
//Helper Utilities（便利な道具箱）
//よく使う処理を安全で便利な関数として提供する
//==================================
export const TypedHelpers = {
    /**
     * 様々な形式の色の入力をTHREE.Colorオブジェクトに変換する
     * @param color 色の入力
     * @returns THREE.Colorインスタンス、無効な場合は白を返す
     */
    validateColor(color:unknown):THREE.Color{
        try{
            return new THREE.Color(color as THREE.ColorRepresentation);
        }catch{
            console.warn(`Invalid color provided, using default white`);
            return new THREE.Color(0xffffff);
        }
    },

    /**
     * 数値以外の値（NaN,Infinity）が入らない、安全なTHREE.Vector3を作成する
     * @param x 
     * @param y 
     * @param z 
     */
    createVector3(x:number = 0,y:number = 0,z:number = 0):THREE.Vector3{
        return new THREE.Vector3(
            Number.isFinite(x) ? x:0,
            Number.isFinite(y) ? y:0,
            Number.isFinite(z) ? z:0
        );
    },

    /**
     * THREE.Meshオブジェクトをジオメトリとマテリアルを含めて安全に複製する
     * @param mesh クローンするTHREE.Meshインスタンス
     * @returns 完全に複製されたTHREE.Meshインスタンス
     */
    cloneMesh<T extends THREE.Mesh>(mesh : T) : T{
        //オブジェクトのトランスフォーム（位置、回転、スケール）や名前などの基本情報をコピーする
        //ただし、ジオメトリとマテリアルは参照がコピーされるだけ）シャローコピー。    
        const cloned : T = mesh.clone() as T;
        //geometry.clone() : ジオメトリデータを完全に複製（ディープコピー）する
        //これにより元のジオメトリを変更してもクローンに影響しない 
        cloned.geometry = mesh.geometry.clone();
        cloned.material = (Array.isArray(mesh.material)
        ? mesh.material.map(m=>m.clone())
        : mesh.material.clone()) as T['material'];
        return cloned;
    }
} as const;