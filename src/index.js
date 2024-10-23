import { Application, Container, Graphics, Sprite, autoDetectRenderer } from 'pixi.js';
import { Constants, Elements, Globals } from './classes.js'
import { draw_lines, hide_element, show_element, update_drawn_particles, updatePhysics, setup, set_up_event_listeners, create_fps_counter,  } from './functions.js'

const constants = new Constants();
const globals = new Globals();
const elements = new Elements();

// Create a PixiJS application.
const app = new Application();

let accumulator = 0;

// Asynchronous IIFE
(async () =>
{
    // Intialize the application.
    await app.init({
        backgroundAlpha: 0,
        resizeTo: window,
        antialias: true,
    });


    elements.cloth_sim_holder.appendChild(app.canvas);
    set_up_event_listeners(globals, elements, constants, app);

    setup(globals, app, constants.DEFAULT_COLUMNS, constants.DEFAULT_ROWS, constants.DEFAULT_PINS);
    create_fps_counter();
    var running_setup = true;

    app.ticker.add((time) =>
    {
        if (running_setup) {
				if ( document.getElementById("fps-counter-element") != undefined && document.getElementById("fps-counter-element") != null) {
					//console.log("Done")
                    elements.fps_counter = document.getElementById("fps-counter-element");
                    elements.fps_counter.classList.add('hidden');
                    running_setup = false
				}
        } else {
            accumulator += time.deltaTime / 60; // Convert to seconds

            // Perform fixed time step updates
            while (accumulator >= constants.FIXED_TIME_STEP) {
                updatePhysics(globals, constants, constants.FIXED_TIME_STEP);
                accumulator -= constants.FIXED_TIME_STEP;
            }

            update_drawn_particles(globals);
            draw_lines(globals);

            
        }
    });
})();


