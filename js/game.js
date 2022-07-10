class Game {
   
    constructor(rows,columns,squares,mode){
        
        this.setBackground(rows,columns);
        this.setCanvas();
        this.setSnake(squares);
        this.setFood();
        this.setPoints();
        this.setDirection("right");
        this.setBuffer();
        this.keyDirectionMapping();
        this.setTimer();
        this.keydownHandler();
        this.runGame();
    }

  //Setters

    setDirection(direction){
        this.direction=direction;
    }

    //A list of keys , our keydown listener has to listen to (all the rest will be ignored)
    // A space will be added to pause the game
    keyDirectionMapping(){
       this.keyDirectionMap = {
           ArrowUp:"up",
           ArrowDown:"down",
           ArrowRight:"right",
           ArrowLeft:"left"
       }
    }
    //This method is mapping current direction to the button, player pressed 
    lastCompletedRequest(){
        let arrows = Object.keys(this.keyDirectionMap);
        return arrows.find(key=>this.keyDirectionMap[key] ===this.direction); 
    }

    //We use buffer to make sure, the snake makes one turn for the same period of time
    setBuffer(){
        this.pendingDirections = [];
    }

    setCanvas(){
        this.canvas = document.querySelector("#canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.height = this.canvas.offsetHeight;
        this.canvas.width=this.canvas.offsetWidth;
    }

    keydownHandler(){
       document.addEventListener("keydown",(event)=>{
         if(this.keyIsValid(event.key) && 
             !this.onTheSameAxisWithLastShifted(event.key)
              && !this.onTheSameAxisWithLastPushed(event.key)) {
              
              event.preventDefault();
              this.pendingDirections.push(event.key);
              
           }
       })
    }
    setPoints(){
        this.points=0;
    }

    setBackground(rows,columns){
        this.gameboard = document.querySelector('.gameboard');
        let cellEvenRow = "<section class='cell cell-even-row col-1'></section>" ;
        let cellOddRow = "<section class='cell cell-odd-row col-1'></section>" ;
        
        for(let row=0;row<rows;row++){
            let entry = document.createElement('section');
            entry.classList.add("row","g-0","line");
            Utilities.is_Even(row) ?entry.innerHTML+= cellEvenRow.repeat(columns)
                         :entry.innerHTML+= cellOddRow.repeat(columns);
            this.gameboard.append(...[entry]);
        }
    }

    setSnake(squares){
       this.snake=[];
       
       squares.forEach((square,index)=>{
         square.x=(index!==0 ? squares[index-1].x+square.side:100);
         square.y= 50;
         this.snake.push(square);
      })

       this.setHead();
    }

    setHead(){
        this.head=this.snake[this.snake.length-1];
        this.head["centerX"]=this.head.x+this.head.side/2;
        this.head["centerY"]=this.head.y+this.head.side/2;
        this.head["right"]=this.head.x+this.head.side;
        this.head["bottom"]=this.head.y+this.head.side;
    }

    setTimer(){
        this.timer = 80;
    }

    setFood(){
         
        let margin=20;
        this.food = {
                     centerX: Utilities.getRandomInt(margin, this.canvas.width-margin),
                     centerY: Utilities.getRandomInt(margin, this.canvas.height-margin),
                     radius:  Math.round(this.head.side*0.8)
                    } 

        this.food["top"] =this.food.centerY-this.food.radius;
        this.food["bottom"] =this.food.centerY+this.food.radius;
        this.food["left"]= this.food.centerX-this.food.radius;
        this.food["right"]= this.food.centerX+this.food.radius;

    }

    //Drawing methods

    drawFood(){
       this.ctx.beginPath();
       this.ctx.arc(this.food.centerX,this.food.centerY,this.food.radius, 0, 2*Math.PI);
       this.ctx.fillStyle="#c2272f"; //Check how to import scss variables
       this.ctx.fill();
    }


    drawSnake(){
        this.snake.forEach(cell=>{
           this.ctx.beginPath();
           this.ctx.rect(cell.x,cell.y,cell.side,cell.side);
           this.ctx.fillStyle= '#3f3047';
           this.ctx.fill();
        })
    }

    redrawCanvas(){
        this.ctx.clearRect(0,0,this.canvas.offsetWidth,this.canvas.offsetHeight);
        this.drawSnake(); 
        this.drawFood();
    }
    
    

    //Hit-the-bound checkers

    hitRightEdge(){
       
       return this.head.right>=this.canvas.width;
    }

    hitLeftEdge(){
       
        return this.head.x<=this.canvas.offsetLeft
    }

    hitTheTop(){
        return this.head.y<=this.canvas.offsetTop
    }

    hitTheBottom(){
        
        return this.head.bottom>=this.canvas.height;
    }

    
    outOfTheWorld(){
         
         let hitTheBoundDetector = {
            "up": this.hitTheTop(),
            "down":this.hitTheBottom(),
            "left": this.hitLeftEdge(),
            "right": this.hitRightEdge()
         }

         return hitTheBoundDetector[this.direction];
    }
    
    //Check if snake collided with itself
    collisionWithItselfDetected(){
      return  this.snake.some((cell)=>this.detected(cell));
    }

    detected(cell){
      let collisionDetector={
          "right": this.collisionFromTheLeft(cell),
          "left": this.collisionFromTheRight(cell),
          "up":this.collisionFromBelow(cell),
          "down":this.collisionFromAbove(cell)
      }

      return collisionDetector[this.direction];
    }

    collisionFromTheLeft(cell){
      
      return   this.head.y === cell.y && this.head.right ===cell.x;
    }

    collisionFromTheRight(cell){
        
        return  this.head.y === cell.y &&  this.head.x-this.head.side ===cell.x; 
    }

    collisionFromBelow(cell){
        
        return  this.head.x === cell.x && this.head.y-this.head.side ===cell.y;  
    }

    collisionFromAbove(cell){
       
        return  this.head.x === cell.x && this.head.bottom ===cell.y;  
    }

    //Food detectors

    foodDetected(){
        let foodDetector ={
            "right": this.foodOnTheRight(),
            "left": this.foodOnTheLeft(),
            "up":this.foodAbove(),
            "down":this.foodBelow()
        }
        
        return foodDetector[this.direction];
    }

    foodOnTheLeft(){
        return this.head.x <= this.food.right &&
               this.head.x >= this.food.left && !this.getsOffYBounds(); 
    }

    
    foodOnTheRight(){
       
        return this.head.right >= this.food.left && 
               this.head.right <=this.food.right
               && !this.getsOffYBounds();
    }

    foodAbove(){
        
        return this.head.y <=this.food.bottom &&  
               this.head.y >=this.food.top
               && !this.getsOffXBounds();
    }

    foodBelow(){
        return  this.head.bottom >=this.food.top && 
                this.head.bottom <= this.food.bottom  
                && !this.getsOffXBounds();
    }

    eatingHandler(){
        if(this.foodDetected()){
                
            this.addHead();
            this.points+=5;
            this.setFood();
            this.score();
            this.redrawCanvas();
        }
    }

    
    //These 2 methods check if the snake "hits" the food on its cross axis
    //That means doesn't go too far right/left, moving vertically ,
    //and similarly not too far above/below when goes horizontally .
    getsOffXBounds(){
        return this.head.centerX<this.food.left || this.head.centerX >this.food.right;
    }

    getsOffYBounds(){
        return this.head.centerY<this.food.top || this.head.centerY >this.food.bottom;
    }

    //To make sure our snake doesn't go back, when making the turn, we'll check whether the 
    //last pressed key is not on the same line with the current direction (last shifted) or
    //or with the last request in the buffer(last pushed). Since we don't know when exactly 
    //player will press the button, the last request might be either pending or already processed 
    //(current direction). That means, both these scenarios must be covered in our program.
    
    onTheSameAxis(pressedNow,pressedBefore){
        return (["ArrowRight","ArrowLeft"].includes(pressedNow) &&
               ["ArrowRight","ArrowLeft"].includes(pressedBefore))
                                        || 
               (["ArrowUp","ArrowDown"].includes(pressedNow) && 
               ["ArrowUp","ArrowDown"].includes(pressedBefore));
    }

    onTheSameAxisWithLastShifted(key){
        let lastProcessed = this.lastCompletedRequest(); 
        return this.onTheSameAxis(key,lastProcessed);
    }

    onTheSameAxisWithLastPushed(key){
        let lastPushed = this.pendingDirections[this.pendingDirections.length-1];
        
        return lastPushed!==undefined && this.onTheSameAxis(key,lastPushed);
    }

    

    keyIsValid(key){
        return Object.keys(this.keyDirectionMap).includes(key);
    }

    checkForPendingRequests(){
         if(this.pendingDirections.length>0){
            this.setDirection(this.keyDirectionMap[this.pendingDirections.shift()]);
            
         }
    }

    addHead(){
        let headToAdd = this.newHead();
        this.snake.push(new Square(this.snake.side,headToAdd.x,headToAdd.y));
        this.setHead();
    }

    moveSnake(){
        
        this.addHead();
        this.snake.shift();
    }

    score(){
          let score = document.querySelector(".score");
          score.innerHTML= (this.points<1000 ? `${"0".repeat(4-this.points.toString().length)}${this.points}`
                                              :this.points);
    }

    gameOver(){
        return this.outOfTheWorld() || this.collisionWithItselfDetected();
    }

    snakeIsDying(){
       this.timer=500;
       let counter=0;
       
       let death = setInterval(()=>{

        if(counter=== 6)
          clearInterval(death);

        Utilities.is_Even(counter) ? this.ctx.clearRect(0,0,this.canvas.offsetWidth,this.canvas.offsetHeight):this.drawSnake();
        counter++;
       },this.timer);
    }

   
    finalResult(){
        
        let finalResult = document.querySelector(".score")
        finalResult.innerHTML=(this.theRecordIsBroken()?`GAME OVER !!! <br>NEW RECORD IS ${this.points}`
                                                       :`GAME OVER !!! <br>YOUR SCORE IS ${this.points}`);
    }

    theRecordIsBroken(){
        
        let highScore = Number(window.localStorage.getItem("highScore")) || 0;
        let broken = this.points>highScore;
        
        if(broken)
          window.localStorage.setItem("highScore",this.points);

        return broken;
    }

    
    runGame(){
        let run = setInterval(()=>{
            
            if(this.gameOver()){
                clearInterval(run);
                this.pendingDirections=[];
                this.finalResult();
                this.snakeIsDying();
            }
               //These 4 lines have to be taken to a separate method
            this.redrawCanvas();
            this.eatingHandler();
            this.checkForPendingRequests();
            this.moveSnake();
            
        },this.timer)
    }

    newHead(){
      
        let coords={
            "up":{x:this.head.x,y:this.head.y-this.head.side},
            "down":{x:this.head.x,y:this.head.y+this.head.side},
            "left":{x:this.head.x-this.head.side,y:this.head.y},
            "right":{x:this.head.x+this.head.side,y:this.head.y}
        }

        return coords[this.direction];
    }

}







