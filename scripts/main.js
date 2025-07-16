import { Application, Container} from 'pixi.js';
import { House } from "./house.js";
import { Elevator } from "./elevator.js";
import { PersonManager } from "./person.js";




const floors = 7;
const capacity = 2;
const speedPerFloor = 1;
const elevatorWidth = 30;
const elevatorHeight = 50;
const elevatorDelayMs = 800;

const FPS = 30

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Create and add a container to the stage
    const container = new Container();

    app.stage.addChild(container);


    const house = new House(floors, null, app, FPS); // тимчасово null

    const elevator = new Elevator(
      capacity,
      speedPerFloor,
      elevatorWidth,
      elevatorHeight,
      app,
      elevatorDelayMs,
      house // ✅ передаємо
    );

    // потім оновлюємо house
    house.elevator = elevator;

    house.init()

    const personManager = new PersonManager(floors, house, 40, 20, app)

    function getRandomDelay(minSeconds, maxSeconds) {
      const min = minSeconds * 1000;
      const max = maxSeconds * 1000;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    async function spawnPeopleLoop(personManager) {
      let i = 0
      while (i !== 10) {
        await personManager.spawnPerson();
    
        // const delay = getRandomDelay(4, 10); //uncomment for need
        const delay = 1000; //test delay
        console.log(`🕐 Next person in ${delay / 1000} sec`);
        await new Promise(resolve => setTimeout(resolve, delay));
        i++;
      }
    }

    spawnPeopleLoop(personManager)
})();