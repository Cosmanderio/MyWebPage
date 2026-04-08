const screen = document.querySelector("#screen");
const ctx = screen.getContext("2d");
const zoom_p = document.querySelector("#zoom_p");
let zoom = 0;
const livings_cells = new Set();
const WIDTH = 2**20;
const HALF_WIDTH = Math.round(WIDTH/2);
let mouse_clicked;
const NEIGHBORS = [-WIDTH-1, -WIDTH, -WIDTH+1, -1, 1, WIDTH-1, WIDTH, WIDTH+1];
let scroll_x = 0;
let scroll_y = 0;
let simulating = false;
const speed_range = document.querySelector("#speed");
const speed_label = document.querySelector("#speed_label");
let simulation_speed = speed_range.value ?? 5;
speed_label.textContent = simulation_speed + " ticks/s";
const start_pause_button = document.querySelector("#start_pause");
const start_pause_img = start_pause_button.querySelector("img");
const keys = new Map();
let brush = false;

positiveModulo = (number, divisor) => ((number % divisor) + divisor) % divisor;
XY2Int = (x, y) => y * WIDTH + x + HALF_WIDTH;
Int2X = value => positiveModulo(value, WIDTH) - HALF_WIDTH;
Int2Y = value => Math.floor(value / WIDTH);

document.querySelectorAll(".nokeypress").forEach(element => {
    // On désactive la réaction de l'élément aux touches pressées
    element.onkeydown = () => false;
});

function setZoom(value) {
    const cx = (scroll_x + screen.width/2) / 2**zoom;
    const cy = (scroll_y + screen.height/2) / 2**zoom;
    zoom = Math.min(Math.max(value, 0), 8);
    scroll_x = Math.round(cx * 2**zoom - screen.width/2);
    scroll_y = Math.round(cy * 2**zoom - screen.height/2);
    zoom_p.textContent = "x" + 2**zoom;
}

function setSimulating(value) {
    simulating = value;
    start_pause_img.src = "../images/" + (simulating ? "pause.png" : "start.png");
}

setZoom(4);

function refresh() {
    ctx.clearRect(0, 0, screen.width, screen.height);
    for (let cell of livings_cells) {
        ctx.fillRect(Int2X(cell)*2**zoom-scroll_x, Int2Y(cell)*2**zoom-scroll_y, 2**zoom, 2**zoom);
    }
}

screen.onmousedown = event => {
    brush = !livings_cells.has(clickEventToPosition(event));
    mouse_clicked = true;
    clickOnCell(event);
};

screen.onmouseup = () => mouse_clicked = false;

function clickEventToPosition(event) {
    let x = Math.floor((event.offsetX / screen.clientWidth * screen.width + scroll_x) / 2**zoom);
    let y = Math.floor((event.offsetY / screen.clientHeight * screen.height + scroll_y) / 2**zoom);
    return XY2Int(x, y);
}

function clickOnCell(event) {
    let position = clickEventToPosition(event);
    if (brush) {
        livings_cells.add(position);
    } else {
        livings_cells.delete(position);
    }
}

screen.addEventListener("mousemove", event => {
    if (!mouse_clicked) return;
    clickOnCell(event);
});

screen.addEventListener("wheel", event => {
    if (event.deltaY != 0) {
        event.preventDefault();  // On annule le scroll
        setZoom(zoom + (event.deltaY > 0 ? -1 : 1));
    }
})

document.addEventListener("keydown", event => {
    if ((keys.get(event.key) ?? 0) < 1) {
        keys.set(event.key, 1);
    }
});

document.addEventListener("keyup", event => {
    keys.set(event.key, 0);
});

document.querySelector("#zoom_minus").addEventListener("click", () => {
    setZoom(zoom - 1);
});

document.querySelector("#zoom_plus").addEventListener("click", () => {
    setZoom(zoom + 1);
});

start_pause_button.addEventListener("click", event => {
    setSimulating(!simulating);
})

speed_range.addEventListener("input", event => {
    simulation_speed = parseInt(event.currentTarget.value);
    speed_label.textContent = simulation_speed + " ticks/s";
});

function processKeys() {
    // On applique les effets liés aux touches
    if (keys.get("x") === 1 && keys.get("Control") > 0) {
        livings_cells.clear();
        scroll_x = 0;
        scroll_y = 0;
    }
    if (keys.get(" ") === 1 || keys.get("Enter") === 1) {
        setSimulating(!simulating);
    }
    scroll_x += (keys.get("ArrowRight") > 0) * 10;
    scroll_x += (keys.get("ArrowLeft") > 0) * -10;
    scroll_y += (keys.get("ArrowUp") > 0) * -10;
    scroll_y += (keys.get("ArrowDown") > 0) * 10;

    // On incrémente la durée de pression des touches enfoncées
    keys.forEach((value, key) => {
        if (value) {
            keys.set(key, value+1);
        }
    });
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

function main() {
    processKeys();
    refresh();
    setTimeout(main, 40);
}

function tick() {
    if (simulating) {
        simulate();
    }
    setTimeout(tick, Math.round(1000/simulation_speed))
}

main();
tick();