import { Graphics} from 'pixi.js';
export class House {
    constructor(floors, elevator, app, fps) {
        this.floors = new Array(floors).fill(null).map(() => []);
        this.elevator = elevator;
        this.app = app;
        this.lineWidth = 2;
        this.floorHeight = 50;

        this.elevatorQueue = [];
        this.isElevatorBusy = false;

        this.FPS = fps
    }
    init()
    {
        for (let i = 0; i < this.floors.length; i++) {
            let floorLevel = i;
            
            let floorLine = new Graphics();
            
            
            floorLine
            .moveTo(50 + this.elevator.elevatorWidth, this.app.canvas.height - this.floorHeight * (floorLevel+1) - this.lineWidth)
            .lineTo(this.app.canvas.width,  this.app.canvas.height - this.floorHeight * (floorLevel+1) - this.lineWidth)
            .stroke({ color: "red", width: this.lineWidth });

            this.app.stage.addChild(floorLine);
        }
    
    }
    addPerson(floor, person) {
        this.floors[floor].push(person);
    }
    removePerson(floor)
    {
        return this.floors[floor].shift()
    }
    async processQueue() {
        if (this.isElevatorBusy || this.elevatorQueue.length === 0) return;
    
        this.isElevatorBusy = true;
    
        const nextFloor = this.elevatorQueue.shift();
        await this.elevator.moveTo(nextFloor);
    
        this.isElevatorBusy = false;
    
        this.processQueue();
      }
    callAnElevator(floor) {
        if (!this.elevatorQueue.includes(floor)) {
          this.elevatorQueue.push(floor);
        }
        this.processQueue();
      }
    info() {
        console.log(
        `\n-------------------------\n[HOUSE]\nFloors: ${this.floors.length}\nElevator: ${this.elevator}\nFloors Data:`
        );
        console.log(this.floors);
        console.log(`-------------------------`);
    }
}
