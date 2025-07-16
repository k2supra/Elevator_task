import { Graphics } from "pixi.js";

export class Person {
  constructor(currentFloor, targetFloor, house, personHeight, personWidth, app) {
    this.color = targetFloor < currentFloor ? "green" : "blue";
    this.currentFloor = currentFloor;
    this.targetFloor = targetFloor;
    this.name = `Person ${this.currentFloor}`;
    this.house = house;
    this.personHeight = personHeight;
    this.personWidth = personWidth;
    this.app = app;
    this.leftPos = 100 + ((this.house.floors[this.currentFloor].length - 1) * (this.personWidth * 2));
    this.delay = Math.floor(Math.random()*3)
    this.person = null;
    this.isReady = false;
    this.FPS = this.house.FPS;
    this.init();
  }
  init()
  {
    let person = new Graphics()
    .drawRect(0, 0, this.personWidth, this.personHeight).fill(this.color) // width, height
    person.x = this.app.screen.width - this.personWidth * 2;
    // person.y = this.app.screen.height - this.personHeight - this.house.floorHeight - (this.house.lineWidth * 2) - (this.currentFloor * this.personHeight)
    person.y = this.app.canvas.height - (this.house.floorHeight * (this.currentFloor + 1)) - this.personHeight - this.house.lineWidth * 2

    this.app.stage.addChild(person);
    this.app.stage.setChildIndex(person, this.app.stage.children.length - 1)

    this.person = person;   
  }
  async move(align)
  {
    if(align === 'left')
    {
        return new Promise((resolve) => {
          const step = (this.person.x - this.leftPos) / 30;
          let counter = 1;
          let interval = setInterval(()=>
          {
            this.person.x -= step;
            counter++;
            if (counter === 30) {
              // this.leftPos = this.person.x;
              clearInterval(interval);
              if (this.house.floors[this.currentFloor].length === 1) {
                this.callAnElevator()
              }
              resolve();
              this.isReady = true;
            }
          }, 1000 / this.FPS)
          // setTimeout(()=>
          //   {
          //     this.person.x = 100 + ((this.house.floors[this.currentFloor].length - 1) * (this.personWidth * 2));
          //     this.leftPos = this.person.x;
          //     if (this.house.floors[this.currentFloor].length === 1) {
          //       this.callAnElevator()
          //     }
          //     resolve();
          //     this.isReady = true;
          //   }, 1000)
        
        })
    }
    else if (align === "right") {
      return new Promise((resolve) => {
        const step = (this.person.x - (this.app.screen.width - this.personWidth * 2)) / 30;
          let counter = 1;
          let interval = setInterval(()=>
          {
            this.person.x -= step;
            counter++;
            if (counter === 30) {
              // this.leftPos = this.person.x;
              clearInterval(interval);
              setTimeout(() => {
                this.person.alpha = 0;
                resolve();
              }, 1000);
              this.isReady = true;
            }
          }, 1000 / this.FPS)
        // setTimeout(() => {
        //   this.person.x = this.app.screen.width - this.personWidth * 2;
        //   setTimeout(() => {
        //     this.person.alpha = 0;
        //     resolve();
        //   }, 1000);
        // }, 1000);
        
      });
    }
    else if(align === 'load')
    {
      this.person.x = this.house.elevator.elevator.x;
    }
    else if(align === 'unload')
    {
      this.person.x = this.leftPos;
    }
  }
  callAnElevator()
  {
    console.log(`Elevator was called to the ${this.currentFloor} floor`);
    
    this.house.callAnElevator(this.currentFloor);
  }
  info() {
    console.log(
      `\n-------------------------\n[PERSON]\nColor: ${this.color}\nCurrent floor: ${this.currentFloor}\nTarget floor: ${this.targetFloor}\nName: ${this.name}\n-------------------------\n`
    );
  }
}

export class PersonManager {
  constructor(floors, house, personHeight, personWidth, app) {
    this.floors = floors;
    this.house = house;
    this.personHeight = personHeight;
    this.personWidth = personWidth;
    this.app = app;
  }
  async spawnPerson() {
    const randomCurrentFloor = Math.floor(Math.random() * (this.floors-1)) + 0;
    let randomTargetFloor = randomCurrentFloor;
    do {
      randomTargetFloor = Math.floor(Math.random() * this.floors);
    } while (randomTargetFloor === randomCurrentFloor);
    const person = new Person(
      randomCurrentFloor,
      randomTargetFloor,
      this.house,
      this.personHeight,
      this.personWidth,
      this.app
    );
    console.log(person);
    this.house.addPerson(randomCurrentFloor, person);
    
    
    await person.move("left");
    // const randomCurrentFloor = Math.floor(Math.random() * this.floors);
    // let randomTargetFloor = randomCurrentFloor;
    // do
    // {
    //     randomTargetFloor = Math.floor(Math.random() * this.floors);
    // }
    // while (randomTargetFloor === randomCurrentFloor);
    // const person = new Person(randomCurrentFloor, randomTargetFloor, this.house)
    // this.house.addPerson(randomCurrentFloor, person);
    // person.info();
    // person.callAnElevator()
  }
}
