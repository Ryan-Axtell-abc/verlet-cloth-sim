import { Graphics } from 'pixi.js';


export class Constants {
	constructor() {
		this.DAMPING = .03;
		this.DRAG = .995;
		this.GRAVITY = 980;
		this.FIXED_TIME_STEP = 1/60;
                this.DEFAULT_COLUMNS = 60;
                this.DEFAULT_ROWS = 30;
                this.DEFAULT_PINS = 7;
	}
}

export class Globals {
	constructor() {
        this.vertex_holder = [];
        this.line_holder = new Set();
        this.particle_holder = [];
        this.all_lines_graphics = new Graphics();
        this.particle_container;
        this.render_offset_x = 100;
        this.render_offset_y = 100;
        this.render_scale = 1

        this.cut_mode = false;
        this.drag_mode = false;
        this.still_dragging = false;
        this.chosen_dragging_vertex = null;
        this.line_length;
        this.mouse_position = {x:0, y:0};

        this.tearing = true;
        this.tearing_ratio = 10;

        this.grav_modifier = 1;

        this.constraint_itterations = 8;

        this.drag_button = 0;
        this.grav_button = 1;
        this.cut_button = 2;

        this.menu_open = true;
	}
}

export class Elements {
	constructor() {
        this.cloth_sim_holder = document.getElementById("cloth-sim-holder");
        this.settings_overlay = document.getElementById("settings-overlay");
        this.settings_close_button = document.getElementById("settings-close-button");
        this.settings_open_button = document.getElementById("settings-open-button");
        this.tearing_checkbox = document.getElementById("tearing-checkbox");
        this.tearing_input = document.getElementById("tearing-input");
        this.columns_input = document.getElementById("columns-input");
        this.rows_input = document.getElementById("rows-input");
        this.pins_input = document.getElementById("pins-input");
        this.build_button = document.getElementById("build-button");
        this.menu_toggle_button = document.getElementById("menu-toggle-button");
        this.menu_holder = document.getElementById("menu-holder");
        this.menu_items_holder_wrapper = document.getElementById("menu-items-holder-wrapper");
        this.constraint_itterations_input = document.getElementById("constraint-itterations-input");
        this.close_arrow = document.getElementById("close-arrow");
        this.open_arrow = document.getElementById("open-arrow");
        this.fps_counter;
        this.show_fps_checkbox = document.getElementById("show-fps-checkbox");
        this.drag_button_selection_dropdown = document.getElementById("drag-button-selection-dropdown");
        this.grav_button_selection_dropdown = document.getElementById("grav-button-selection-dropdown");
        this.cut_button_selection_dropdown = document.getElementById("cut-button-selection-dropdown");
	}
}