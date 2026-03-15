import { Application, Container, Graphics, Sprite, autoDetectRenderer } from 'pixi.js';
import { Constants, Elements, Globals } from './classes.js'
import { draw_lines, hide_element, show_element, update_drawn_particles, updatePhysics, setup, set_up_event_listeners, create_fps_counter, } from './functions.js'

const constants = new Constants();
const globals = new Globals();
const elements = new Elements();

// Create a PixiJS application.
const app = new Application();

let accumulator = 0;

// Asynchronous IIFE
(async () => {
	// Intialize the application.
	await app.init({
		backgroundAlpha: 0,
		resizeTo: window,
		antialias: true,
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,

	});


	elements.cloth_sim_holder.appendChild(app.canvas);
	set_up_event_listeners(globals, elements, constants, app);

	const columns = window.innerWidth < constants.MOBILE_BREAKPOINT ? constants.DEFAULT_COLUMNS_MOBILE : constants.DEFAULT_COLUMNS;
	const rows = window.innerWidth < constants.MOBILE_BREAKPOINT ? constants.DEFAULT_ROWS_MOBILE : constants.DEFAULT_ROWS;
	const pins = window.innerWidth < constants.MOBILE_BREAKPOINT ? constants.DEFAULT_PINS_MOBILE : constants.DEFAULT_PINS;
	setup(globals, app, constants, columns, rows, pins);
	create_fps_counter();
	var running_setup = true;

	const perfText = document.getElementById("perf-text");
	const perfOverlay = document.getElementById("perf-overlay");
	perfOverlay.style.display = "block"; // remove this line when you add a proper toggle

	app.ticker.add((time) => {
		if (running_setup) {
			if (document.getElementById("fps-counter-element") != undefined && document.getElementById("fps-counter-element") != null) {
				elements.fps_counter = document.getElementById("fps-counter-element");
				elements.fps_counter.classList.add('hidden');
				running_setup = false;
			}
		} else {
			accumulator += time.deltaTime / 60;

			const t0 = performance.now();

			while (accumulator >= constants.FIXED_TIME_STEP) {
				updatePhysics(globals, constants, constants.FIXED_TIME_STEP);
				accumulator -= constants.FIXED_TIME_STEP;
			}

			const t1 = performance.now();
			update_drawn_particles(globals);

			const t2 = performance.now();
			draw_lines(globals);

			const t3 = performance.now();

			// Store this frame's sample
			const perf = globals.perf;
			const sample = perf.samples[perf.sample_index];
			sample.physics = t1 - t0;
			sample.particles = t2 - t1;
			sample.lines = t3 - t2;
			sample.total = t3 - t0;

			perf.sample_index = (perf.sample_index + 1) % perf.sample_count;

			// Update display every 30 frames to avoid thrashing the DOM
			if (perf.sample_index % 30 === 0) {
				let sum_physics = 0, sum_particles = 0, sum_lines = 0, sum_total = 0;
				for (let i = 0; i < perf.sample_count; i++) {
					sum_physics += perf.samples[i].physics;
					sum_particles += perf.samples[i].particles;
					sum_lines += perf.samples[i].lines;
					sum_total += perf.samples[i].total;
				}
				const n = perf.sample_count;
				perfText.textContent =
					`physics:   ${(sum_physics / n).toFixed(2)}ms\n` +
					`particles: ${(sum_particles / n).toFixed(2)}ms\n` +
					`lines:     ${(sum_lines / n).toFixed(2)}ms\n` +
					`total:     ${(sum_total / n).toFixed(2)}ms`;
			}
		}
	});

})();


