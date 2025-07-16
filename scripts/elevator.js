import { Graphics} from 'pixi.js';

export class Elevator {
  constructor(
    capacity,
    speedPerFloor,
    elevatorWidth,
    elevatorHeight,
    app,
    delay,
    house
  ) {
    this.capacity = capacity;
    this.speedPerFloor = speedPerFloor;
    this.currentFloor = 0;
    this.elevator = undefined;
    this.elevatorWidth = elevatorWidth;
    this.elevatorHeight = elevatorHeight;
    this.delay = delay;
    this.app = app;
    this.house = house;
    this.loadedPeople = [];
    this.FPS = this.house.FPS;
    this.init();
  }
  init() {
    this.elevator = new Graphics();
    this.elevator.beginFill("lightgrey");
    this.elevator.drawRect(0, 0, this.elevatorWidth, this.elevatorHeight);
    this.elevator.endFill();

    // Y-координата (app.screen.height - elevatorHeight) розмістить його на самому низу
    // X-координата (0) розмістить його зліва
    this.elevator.x = 0 + this.elevatorWidth; // Зліва
    this.elevator.y = this.app.screen.height - this.elevatorHeight * 2; // Знизу

    // Додаємо ліфт до сцени (або до контейнера, якщо ти хочеш його групувати)
    this.app.stage.addChild(this.elevator);
  }
  updatePosition()
  {
    if (this.loadedPeople.length > 0) {
      for (let i = 0; i < this.loadedPeople.length; i++) {
        this.loadedPeople[i].person.y = this.elevator.y + (this.elevatorHeight - this.loadedPeople[i].personHeight);
        this.loadedPeople[i].person.x = this.elevator.x + (i * (this.loadedPeople[i].personWidth + 10));
      }
    }
    
  }
  async moveTo(targetFloor) {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    if (targetFloor === this.currentFloor) {
      await this.loadUnloadPeople();
      return;
    }
    const applier = targetFloor > this.currentFloor ? 1 : -1;



    // Рекурсивна функція кроку
    const step = async () => {

      // await new Promise((resolve)=>
      // {
      //   const step = (this.elevatorHeight * applier) / this.FPS;
      //     let counter = 1;
      //     let interval = setInterval(()=>
      //     {
      //       this.elevator.y -= step;
      //       this.currentFloor += applier;
      //       counter++;
      //       if (counter === 30) {
      //         // this.leftPos = this.person.x;
      //         clearInterval(interval);
      //         resolve();
      //       }
      //     }, 1000 / this.FPS)
      // })
      await new Promise((res) => setTimeout(res, this.speedPerFloor * 1000));
      
      this.elevator.y -= this.elevatorHeight * applier;
      this.currentFloor += applier;
      

      this.updatePosition()

      if (this.currentFloor === targetFloor) {
        console.log(`\nArrived on floor ${targetFloor}!`);
        await this.loadUnloadPeople("load");
        if (this.loadedPeople.length > 0) {
            const lastTarget = this.loadedPeople[this.loadedPeople.length - 1].targetFloor;
            await this.moveTo(lastTarget);
          
            // 3. Вивантажити
            await this.loadUnloadPeople("unload");
          }
        
        // await this.moveTo()
        return;
      }

      // Затримка між поверхами
      //   await new Promise(res => setTimeout(res, this.speedPerFloor * 1000));
      await step(); // рекурсивно викликаємо далі
    };
    await step(); // запускаємо
  }

  async loadUnloadPeople(load = "load") {
    await new Promise((res) => setTimeout(res, 800));
  
    if (load === "load") {
      while (
        this.loadedPeople.length < this.capacity &&
        this.house.floors[this.currentFloor].length > 0 &&
        this.house.floors[this.currentFloor][0].isReady &&
        (
          this.loadedPeople.length === 0 ||
          this.house.floors[this.currentFloor][0].color === this.loadedPeople[0].color
        )
      ) {
        const person = this.house.removePerson(this.currentFloor);
        if (person) {
          this.loadedPeople.push(person);
          await person.move("load"); // обов’язково await
          if (this.house.floors[this.currentFloor].length > 0) {
            for (let i = 0; i < this.house.floors[this.currentFloor].length; i++) {
              const nextPerson = this.house.floors[this.currentFloor][i];
              nextPerson.move('left')
            }
          }
        }
      }
    } 
    else if (load === "unload") {
      const peopleToUnload = this.loadedPeople.filter(p => p.targetFloor === this.currentFloor);
      this.loadedPeople = this.loadedPeople.filter(p => p.targetFloor !== this.currentFloor);

      for (const person of peopleToUnload) {
        person.currentFloor = this.currentFloor;
        person.person.y = this.app.canvas.height - (this.house.floorHeight * (this.currentFloor + 1)) - person.personHeight - this.house.lineWidth * 2;

        await person.move("unload");
        person.move('right');
      }
    }
  
  }
  async moveOnlyTo(targetFloor) {
    if (targetFloor === this.currentFloor) return;
  
    const applier = targetFloor > this.currentFloor ? 1 : -1;
  
    while (this.currentFloor !== targetFloor) {
      // await new Promise((res) => setTimeout(res, this.speedPerFloor * 1000));
      // this.elevator.y -= this.elevatorHeight * applier;
      // this.currentFloor += applier;
      // this.updatePosition();
      
      await new Promise((resolve)=>
      {
        const step = this.elevatorHeight / this.FPS * applier;
        let counter = 0;
        let interval = setInterval(()=>
        {
          this.elevator.y -= step;
          counter++;
          this.updatePosition();
          
          if (counter === 30) {
            clearInterval(interval);
            this.currentFloor += applier;
            resolve();
          }
        }, this.speedPerFloor * 1000 / this.FPS)
      })
    }
  
    console.log(`Arrived on floor ${targetFloor}`);
  }
  async unloadAllPeople() {
    // Збираємо всі унікальні поверхи, куди треба пасажирам
    const targets = [...new Set(this.loadedPeople.map(p => p.targetFloor))];
  
    // Сортуємо за напрямком руху (від поточного)
    targets.sort((a, b) => Math.abs(this.currentFloor - a) - Math.abs(this.currentFloor - b));
  
    for (const floor of targets) {
      await this.moveOnlyTo(floor);           // рух без load/unload
      await this.loadUnloadPeople("unload");  // вивантажити тих, хто тут
    }
  }
  async moveTo(floorToPickUp) {
    await this.moveOnlyTo(floorToPickUp);
    await this.loadUnloadPeople("load");
  
    if (this.loadedPeople.length > 0) {
      await this.unloadAllPeople();
    }
  }
  
  info() {
    console.log(
      `\n-------------------------\n[ELEVATOR]\nCapacity: ${this.capacity}\nSpeed per floor: ${this.speedPerFloor}\n-------------------------\n`
    );
  }
}
