// グローバル領域でのテスト
let globalNum: number = 5;

function testFunction() {
    // function内でのテスト
    let localNum: number = 10;
    return localNum;
}

// 別の関数でもテスト
const arrowFunc = (): number => {
    let arrowNum: number = 15;
    return arrowNum;
}

export { globalNum, testFunction, arrowFunc };