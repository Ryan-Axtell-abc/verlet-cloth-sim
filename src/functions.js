import { Container, Graphics, Sprite } from "pixi.js";

export function create_fps_counter() {
	var script=document.createElement('script');
	script.onload=function(){var stats=new Stats();
		document.body.appendChild(stats.dom);
		stats.dom.id='fps-counter-element'
		requestAnimationFrame(function loop(){stats.update();
			requestAnimationFrame(loop)});
	};
	script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';
	document.head.appendChild(script);
	//globals.loading_fps_counter
}

export function draw_lines(globals) {
    globals.all_lines_graphics.clear();
    globals.all_lines_graphics.beginPath();

    for (let line of globals.line_holder) {
        const vertice_1 = globals.vertex_holder[line.point_index_1];
        const vertice_2 = globals.vertex_holder[line.point_index_2];

        globals.all_lines_graphics.moveTo(vertice_1.x*globals.render_scale +globals.render_offset_x, vertice_1.y*globals.render_scale +globals.render_offset_y);
        globals.all_lines_graphics.lineTo(vertice_2.x*globals.render_scale +globals.render_offset_x, vertice_2.y*globals.render_scale +globals.render_offset_y);
    }
    globals.all_lines_graphics.stroke();
}

export function hide_element(element) {
    element.classList.add('hidden');
}

export function show_element(element) {
    element.classList.remove('hidden');
}

export function createCircleTexture(app, radius) {
    const graphics = new Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill(0x000000);
    return app.renderer.generateTexture(graphics);
}

export function set_render_offsets_and_scale(globals) {

    //I want to just scale for horizontal
    globals.render_offset_y = 100

    if ( window.innerWidth < 1040 ) {
        globals.render_offset_x = 20
        globals.render_scale = (window.innerWidth - 40)/1000
    } else {
        globals.render_scale = 1
        globals.render_offset_x = Math.floor((window.innerWidth-1000)/2)
    }
    
}

function ccw(A,B,C) {
    return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
}

// Return true if line segments AB and CD intersect
export function intersect(A,B,C,D) {
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D)
}


export function update_drawn_particles(globals) {
    for (let i = 0; i < globals.vertex_holder.length; i++) {
        let vertex = globals.vertex_holder[i];
        let particle = globals.particle_holder[i];
        particle.position.set(vertex.x*globals.render_scale +globals.render_offset_x, vertex.y*globals.render_scale +globals.render_offset_y);
    }
}

export function updatePhysics(globals, constants, dt) {
    // Update positions
    for (let vertex of globals.vertex_holder) {
        if (vertex.fixed && !vertex.grabbed) {
            vertex.prev_x = vertex.x;
            vertex.prev_y = vertex.y;
            
        } else if (vertex.grabbed) {
            vertex.prev_x = vertex.x;
            vertex.prev_y = vertex.y;

            vertex.x = (globals.mouse_position.x-globals.render_offset_x)/globals.render_scale;
            vertex.y = (globals.mouse_position.y-globals.render_offset_y)/globals.render_scale;

        } else {
            const vx = (vertex.x - vertex.prev_x) * constants.DRAG;
            const vy = (vertex.y - vertex.prev_y) * constants.DRAG + constants.GRAVITY * globals.grav_modifier * dt * dt;

            vertex.prev_x = vertex.x;
            vertex.prev_y = vertex.y;
            vertex.x += vx;
            vertex.y += vy;
        }
    }

    // Solve constraints
    for (let f = 0; f < globals.constraint_itterations; f++) {

        //console.log("globals.line_holder:", globals.line_holder)
        for (let line of globals.line_holder) {
            const vertice_1 = globals.vertex_holder[line.point_index_1];
            const vertice_2 = globals.vertex_holder[line.point_index_2];

            const distance_x = vertice_2.x - vertice_1.x;
            const distance_y = vertice_2.y - vertice_1.y;
            const distance = Math.sqrt(distance_x**2 + distance_y**2);
            const difference = (line.length - distance) / distance;
            if (globals.tearing && distance/line.length > globals.tearing_ratio) {
                globals.line_holder.delete(line);
            }

            const correction_x = distance_x * difference * 0.5;
            const correction_y = distance_y * difference * 0.5;

            if (!vertice_1.fixed && !vertice_1.grabbed) {
                vertice_1.x -= correction_x * (1 - constants.DAMPING);
                vertice_1.y -= correction_y * (1 - constants.DAMPING);
            }
            if (!vertice_2.fixed && !vertice_2.grabbed) {
                vertice_2.x += correction_x * (1 - constants.DAMPING);
                vertice_2.y += correction_y * (1 - constants.DAMPING);
            }
        }
    }

    if (globals.cut_mode) {
        var chosen_line = null;
        for (let line of globals.line_holder) {

            const vertice_1 = globals.vertex_holder[line.point_index_1];
            const vertice_2 = globals.vertex_holder[line.point_index_2];

            const adjusted_mouse_position = {x:(globals.mouse_position.x-globals.render_offset_x)/globals.render_scale, y: (globals.mouse_position.y-globals.render_offset_y)/globals.render_scale}
            const mouse_bottom_point = {x: adjusted_mouse_position.x, y: adjusted_mouse_position.y+10}
            const mouse_right_point = {x: adjusted_mouse_position.x+10, y: adjusted_mouse_position.y}

            const does_intersect = intersect(adjusted_mouse_position,mouse_bottom_point,vertice_1,vertice_2) || intersect(adjusted_mouse_position,mouse_right_point,vertice_1,vertice_2);

            if (does_intersect) {
                chosen_line = line;
                break
            }
        }
        if (chosen_line != null) {
            globals.line_holder.delete(chosen_line)
        }
    }

    if (globals.drag_mode) {
        if (globals.still_dragging == false) {
            var shortest_distance = 9999999999999;
            globals.chosen_dragging_vertex = null;
            for (let vertex of globals.vertex_holder) {
                const distance_to_mouse_x = ((globals.mouse_position.x-globals.render_offset_x)/globals.render_scale) - vertex.x;
                const distance_to_mouse_y = ((globals.mouse_position.y-globals.render_offset_y)/globals.render_scale) - vertex.y;
                const distance_to_mouse_squared = distance_to_mouse_x**2+distance_to_mouse_y**2
                if (distance_to_mouse_squared < shortest_distance) {
                    shortest_distance = distance_to_mouse_squared
                    globals.chosen_dragging_vertex = vertex
                }
                vertex.grabbed = false;
            }
            if (shortest_distance < ((globals.line_length/2)*globals.render_scale)**2) {
                globals.chosen_dragging_vertex.grabbed = true;
                globals.still_dragging = true;
            }
        }
    }
}


export function setup(globals, app, width, height, pin_number) {
    width = Math.min(width, 250)
    height = Math.min(height, 250)

    if (globals.all_lines_graphics != undefined) {
        globals.all_lines_graphics.destroy();
    }
    if (globals.particle_container != undefined) {
        globals.particle_container.destroy();
    }

    globals.vertex_holder = [];
    globals.line_holder = new Set();
    globals.particle_holder = [];
    globals.all_lines_graphics = new Graphics();

	globals.line_length = 1000/width
    
    if ( window.innerWidth < 800 ) {
        globals.all_lines_graphics.setStrokeStyle({ color: 0x000000, width: 1  });
    } else {
        globals.all_lines_graphics.setStrokeStyle({ color: 0x000000, width: Math.max(parseInt(globals.line_length/8), 1)  });

    }
    app.stage.addChild(globals.all_lines_graphics);
    

    globals.particle_container = new Container(width * height, {
        position: true,
        rotation: false,
        uvs: false,
        tint: true
    });

    app.stage.addChild(globals.particle_container);

	var circle_graphic_radius = Math.max(parseInt(globals.line_length/6), 2) 
    var circleTexture = createCircleTexture(app, circle_graphic_radius);

	for (let i = 0; i < (width*height); i++) {
		
		let x = ((i%width)*globals.line_length);
		let y = (Math.floor(i/width)*globals.line_length);

        const particle = new Sprite(circleTexture);
        particle.anchor.set(0.5);
        particle.position.set(x, y);
        globals.particle_container.addChild(particle);

        globals.particle_holder.push(particle);

		var vertex = {
			x : x,
			y : y,
			prev_x : x,
			prev_y : y,
			fixed : false,
			grabbed : false,
		}
		globals.vertex_holder.push(vertex);
	}

    var total_row_lines = (width-1)*height;
	for (let i = 0; i < total_row_lines; i++) {
		let x_coord = (i%(width-1));
		let y_coord = Math.floor(i/(width-1));
		let left_vertex_index = x_coord+(width*y_coord);
		let right_vertex_index = left_vertex_index+1;

		var line = {
			point_index_1 : left_vertex_index,
			point_index_2 : right_vertex_index,
			length : globals.line_length,
		}
		
		globals.line_holder.add(line);
	}

    var total_column_lines = (height-1)*width;
	for (let i = 0; i < total_column_lines; i++) {
		let x_coord = i%width;
		let y_coord = Math.floor(i/width);
		let top_vertex_index = x_coord+(width*y_coord);
		let bottom_vertex_index = top_vertex_index+width;

		var line = {
			point_index_1 : top_vertex_index,
			point_index_2 : bottom_vertex_index,
			length : globals.line_length,
		}
		
		globals.line_holder.add(line);
	}

	for (let i = 0; i < pin_number-1; i++) {
		let pin_index = Math.floor(i*width/(pin_number-1))
		globals.vertex_holder[pin_index].fixed = true;
	}
	globals.vertex_holder[width-1].fixed = true;

    set_render_offsets_and_scale(globals);
}

export function set_up_event_listeners (globals, elements, constants, app) {

    elements.settings_close_button.onclick = function() { hide_element(elements.settings_overlay) };
    elements.settings_open_button.onclick = function() { show_element(elements.settings_overlay) };



    app.canvas.addEventListener("touchstart", event => {
        const touches = event.changedTouches;
        const last_touch = touches[touches.length -1];
        globals.mouse_position = {x:last_touch.clientX, y:last_touch.clientY}
        globals.drag_mode = true;
        globals.still_dragging = false;

    });

    app.canvas.addEventListener("touchend", event => {
        const touches = event.changedTouches;
        const last_touch = touches[touches.length -1];
        globals.mouse_position = {x:last_touch.clientX, y:last_touch.clientY}
        globals.drag_mode = false
        globals.still_dragging = false;
        if (globals.chosen_dragging_vertex != null) {
            globals.chosen_dragging_vertex.grabbed = false;
        }

    });

    app.canvas.addEventListener("touchcancel", event => {
        const touches = event.changedTouches;
        const last_touch = touches[touches.length -1];
        globals.mouse_position = {x:last_touch.clientX, y:last_touch.clientY}
        globals.drag_mode = false
        globals.still_dragging = false;
        if (globals.chosen_dragging_vertex != null) {
            globals.chosen_dragging_vertex.grabbed = false;
        }

    });

    app.canvas.addEventListener("touchmove", event => {
        const touches = event.changedTouches;
        const last_touch = touches[touches.length -1];
        globals.mouse_position = {x:last_touch.clientX, y:last_touch.clientY}

    });


    elements.menu_toggle_button.onclick = function() {
        if (elements.menu_holder.classList.contains("hide-menu")) {
            elements.menu_holder.classList.remove("hide-menu");
            elements.up_arrow.classList.remove("hidden");
            elements.down_arrow.classList.add("hidden");

        } else {
            elements.menu_holder.classList.add("hide-menu");
            elements.up_arrow.classList.add("hidden");
            elements.down_arrow.classList.remove("hidden");
        }
    };


    app.canvas.addEventListener('contextmenu', event => event.preventDefault());

    app.canvas.addEventListener("mousedown", (event) => {

        if (event.button == globals.drag_button) {
            globals.drag_mode = true;
            globals.still_dragging = false;
        }
        
        if (event.button == globals.grav_button) {
            globals.grav_modifier = 10;
        }

        if (event.button == globals.cut_button) {
            globals.cut_mode = true;
        }
    });


    window.addEventListener("resize", (event) => {
        set_render_offsets_and_scale(globals)

        if ( window.innerWidth < 800 ) {
            globals.all_lines_graphics.setStrokeStyle({ color: 0x000000, width: 1  });
        } else {
            globals.all_lines_graphics.setStrokeStyle({ color: 0x000000, width: Math.max(parseInt(globals.line_length/8), 1)  });

        }
    });

    app.canvas.addEventListener("mousemove", (event) => {
        globals.mouse_position = {x:event.clientX, y:event.clientY}
    });

    app.canvas.addEventListener("mouseup", (event) => {

        if (event.button == globals.drag_button) {
            globals.drag_mode = false
            globals.still_dragging = false;
            if (globals.chosen_dragging_vertex != null) {
                globals.chosen_dragging_vertex.grabbed = false;
            }
        }
        
        if (event.button == globals.grav_button) {
            globals.grav_modifier = 1;
        }

        if (event.button == globals.cut_button) {
            globals.cut_mode = false;
        }
    });

    elements.tearing_checkbox.addEventListener('change', function() {
        if (this.checked) {
            globals.tearing = true;
        } else {
            globals.tearing = false;
        }
    });

    elements.tearing_input.value = globals.tearing_ratio;
    elements.tearing_input.addEventListener('change', function() {
        globals.tearing_ratio = this.value;
    });

    elements.columns_input.value = constants.DEFAULT_COLUMNS;

    elements.rows_input.value = constants.DEFAULT_ROWS;

    elements.pins_input.value = constants.DEFAULT_PINS;

    elements.build_button.onclick = function() {
        let columns = parseInt(elements.columns_input.value);
        let rows = parseInt(elements.rows_input.value);
        let pins = parseInt(elements.pins_input.value);
        setup(globals, app, columns, rows, pins);
    };

    elements.constraint_itterations_input.value = 10;
    elements.constraint_itterations_input.addEventListener('change', function() {
        globals.constraint_itterations = this.value;
    });

    elements.show_fps_checkbox.addEventListener('change', function() {
        if (this.checked) {
            elements.fps_counter.classList.remove('hidden');
        } else {
            elements.fps_counter.classList.add('hidden');
        }
    });

    elements.cut_button_selection_dropdown.addEventListener('change', function() {
        //console.log("cut_button_selection_dropdown:", this.value)
        if ( this.value == "left-click" ) {
            globals.cut_button = 0;
        } else if ( this.value == "middle-click" ) {
            globals.cut_button = 1;
        } else if ( this.value == "right-click" ) {
            globals.cut_button = 2;
        }
    });

    elements.grav_button_selection_dropdown.addEventListener('change', function() {
        //console.log("grav_button_selection_dropdown:", this.value)
        if ( this.value == "left-click" ) {
            globals.grav_button = 0;
        } else if ( this.value == "middle-click" ) {
            globals.grav_button = 1;
        } else if ( this.value == "right-click" ) {
            globals.grav_button = 2;
        }
    });

    elements.drag_button_selection_dropdown.addEventListener('change', function() {
        //console.log("drag_button_selection_dropdown:", this.value)
        if ( this.value == "left-click" ) {
            globals.drag_button = 0;
        } else if ( this.value == "middle-click" ) {
            globals.drag_button = 1;
        } else if ( this.value == "right-click" ) {
            globals.drag_button = 2;
        }
    });

    function threshold_input_field(){

        if (elements.columns_input.value > 250) {
            elements.columns_input.value = 250
        }
        if (elements.rows_input.value > 250) {
            elements.rows_input.value = 250
        }
        if (elements.pins_input.value > 250) {
            elements.pins_input.value = 250
        }
    }

    elements.columns_input.onkeydown = function(event){
        if(event.key === 'Enter'){
            let columns = parseInt(elements.columns_input.value);
            let rows = parseInt(elements.rows_input.value);
            let pins = parseInt(elements.pins_input.value);
            setup(globals, app, columns, rows, pins);
            threshold_input_field()
        }
    };

    elements.rows_input.onkeydown = function(event){
        if(event.key === 'Enter'){
            let columns = parseInt(elements.columns_input.value);
            let rows = parseInt(elements.rows_input.value);
            let pins = parseInt(elements.pins_input.value);
            setup(globals, app, columns, rows, pins);
            threshold_input_field()
        }
    };

    elements.pins_input.onkeydown = function(event){
        if(event.key === 'Enter'){
            let columns = parseInt(elements.columns_input.value);
            let rows = parseInt(elements.rows_input.value);
            let pins = parseInt(elements.pins_input.value);
            setup(globals, app, columns, rows, pins);
            threshold_input_field()
        }
    };


}