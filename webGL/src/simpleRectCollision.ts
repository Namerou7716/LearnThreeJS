function isRectCollision(
    rect1X:number,rect1Y:number,rect1Width:number,rect1Height:number,
    rect2X:number,rect2Y:number,rect2Width:number,rect2Height:number,
):boolean{
    return(
        rect1X<rect2X+rect2Width && //矩形①の左端が矩形②の右端より左
        rect1X+rect1Width>rect2X && //矩形①の右端が矩形②の左端より右
        rect1Y<rect2Y + rect2Height && //矩形②の上端より矩形1の上端が下
        rect1Y+rect1Height >rect2Y//矩形②の下端より矩形1の上端が上
    );
}

const player = {x:100,y:100,width:50,height:50};
const enemy = {x:150,y:150,width:30,height:30};

if(isRectCollision(player.x,player.y,player.width,player.height,enemy.x,enemy.y,enemy.width,enemy.height)){
    console.log('player hit enemy');
}else{
    console.log('player not hit enemy');
}

