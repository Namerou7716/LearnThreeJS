//Canvas座標系で考える
function isPointInRect(
    pointX: number,
    pointY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
): boolean{
    return(
        pointX >= rectX &&                          //点が矩形の左端より右にある
        pointX <=rectX + rectWidth &&               //点が矩形の右端より左にある
        pointY >= rectY &&                          //点が矩形の上端より下にある
        pointY <= rectY + rectHeight                //点が矩形の下端より上にある
    );
}

const mouseX = 100;
const mouseY = 150;
const buttonX = 50;
const buttonY = 100;
const buttonWidth = 100;
const buttonHeight = 50;

if(isPointInRect(mouseX,mouseY,buttonX,buttonY,buttonWidth,buttonHeight)){
    console.log("mouse on button");
}