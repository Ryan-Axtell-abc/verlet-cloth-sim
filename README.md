# Cloth Simulation with Verlet Integration

A JavaScript-based cloth simulation using Verlet integration and constraints, rendered with [PixiJS](https://pixijs.com/).

![Cloth Simulation Screenshot](https://github.com/Ryan-Axtell-abc/verlet-cloth-sim/blob/main/assets/screenshot.png)

## Demo

[Live Demo Link](https://fabric.ryanaxtell.dev/)

# Controls

| Command          | Action         |
|------------------|----------------|
| **Left click**   | Drag cloth     |
| **Middle Click** | High grav mode |
| **Right click**  | Cut cloth      |

## Installation

### Prerequisites

- **Node.js** (v12 or higher recommended)
- **npm** (comes with Node.js)

### Clone the Repository

```bash
git clone https://github.com/Ryan-Axtell-abc/verlet-cloth-sim.git
cd verlet-cloth-sim
```

### Install Dependencies

```bash
npm install pixi.js stats.js
```

## Usage

### Running the Simulation

```bash
npm start
```

Open your web browser and navigate to `http://localhost:3000` to view the simulation.

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.