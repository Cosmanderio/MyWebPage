const screen = document.querySelector("#screen");
const ctx = screen.getContext("2d");
const zoom_p = document.querySelector("#zoom_p");
let zoom;
let livings_cells = new Set();
const WIDTH = 2**20;
let mouse_clicked;
const NEIGHBORS = [-WIDTH-1, -WIDTH, -WIDTH+1, -1, 1, WIDTH-1, WIDTH, WIDTH+1];

XY2Int = (x, y) => y * WIDTH + x;
Int2X = value => value % WIDTH;
Int2Y = value => Math.floor(value / WIDTH);

function setZoom(value) {
    zoom = value;
    zoom_p.textContent = "x" + 2**zoom;
}

setZoom(4);

function refresh() {
    ctx.clearRect(0, 0, screen.width, screen.height);
    for (let cell of livings_cells) {
        ctx.fillRect(Int2X(cell)*2**zoom, Int2Y(cell)*2**zoom, 2**zoom, 2**zoom);
    }
}

screen.onmousedown = () => {
    mouse_clicked = true;
};

screen.onmouseup = () => mouse_clicked = false;

function addCell(event) {
    let x = Math.floor(event.offsetX / screen.clientWidth * screen.width / 2**zoom);
    let y = Math.floor(event.offsetY / screen.clientHeight * screen.height / 2**zoom);
    let position = XY2Int(x, y);
    if (!livings_cells.has(position)) {
        livings_cells.add(position);
        ctx.fillRect(x*2**zoom, y*2**zoom, 2**zoom, 2**zoom);
    }
}

screen.addEventListener("click", event => {
    addCell(event);
});

screen.addEventListener("mousemove", event => {
    if (!mouse_clicked) return;
    addCell(event);
});

document.addEventListener("keydown", event => {
    if (event.ctrlKey && event.key === "x") {
        livings_cells.clear();
        refresh();
    } else if (event.key === " " || event.key === "Enter") {
        launchSimulation();
    }
});

document.querySelector("#zoom_minus").addEventListener("click", () => {
    setZoom(zoom - 1);
    refresh();
});

document.querySelector("#zoom_plus").addEventListener("click", () => {
    setZoom(zoom + 1);
    refresh();
});

function launchSimulation() {
    simulate();
    refresh();
    setTimeout(launchSimulation, 300);
}

function simulate() {
    let neighbors = new Map();
    let to_kill = [];
    let to_born = [];

    for (let cell of livings_cells) {
        for (let neighbor of NEIGHBORS) {
            let target = cell+neighbor;
            neighbors.set(target, (neighbors.get(target) ?? 0) + 1);
        }
    }

    for (let cell of livings_cells) {
        let neighbor = neighbors.get(cell) ?? 0;
        if (neighbor < 2 || neighbor > 3) {
            to_kill.push(cell);
        }
    }

    neighbors.forEach((value, cell) => {
        if (value == 3) {
            to_born.push(cell);
        }
    });

    for (let cell of to_kill) {
        livings_cells.delete(cell);
    }

    for (let cell of to_born) {
        livings_cells.add(cell);
    }
}