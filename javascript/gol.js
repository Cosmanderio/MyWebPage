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
const keys = new Map();

positiveModulo = (number, divisor) => ((number % divisor) + divisor) % divisor;
XY2Int = (x, y) => y * WIDTH + x + HALF_WIDTH;
Int2X = value => positiveModulo(value, WIDTH) - HALF_WIDTH;
Int2Y = value => Math.floor(value / WIDTH);

function setZoom(value) {
    const cx = (scroll_x + screen.width/2) / 2**zoom;
    const cy = (scroll_y + screen.height/2) / 2**zoom;
    zoom = Math.max(value, 0);
    scroll_x = Math.round(cx * 2**zoom - screen.width/2);
    scroll_y = Math.round(cy * 2**zoom - screen.height/2);
    zoom_p.textContent = "x" + 2**zoom;
}

setZoom(4);

function refresh() {
    ctx.clearRect(0, 0, screen.width, screen.height);
    for (let cell of livings_cells) {
        ctx.fillRect(Int2X(cell)*2**zoom-scroll_x, Int2Y(cell)*2**zoom-scroll_y, 2**zoom, 2**zoom);
    }
}

screen.onmousedown = () => {
    mouse_clicked = true;
};

screen.onmouseup = () => mouse_clicked = false;

function addCell(event) {
    let x = Math.floor((event.offsetX / screen.clientWidth * screen.width + scroll_x) / 2**zoom);
    let y = Math.floor((event.offsetY / screen.clientHeight * screen.height + scroll_y) / 2**zoom);
    let position = XY2Int(x, y);
    livings_cells.add(position);
}

screen.addEventListener("click", event => {
    addCell(event);
});

screen.addEventListener("mousemove", event => {
    if (!mouse_clicked) return;
    addCell(event);
});

screen.addEventListener("wheel", event => {
    if (event.deltaY != 0) {
        event.preventDefault();  // On annule le scroll
        setZoom(zoom + (event.deltaY > 0 ? -1 : 1));
    }
})

document.addEventListener("keydown", event => {
    keys.set(event.key, 1);
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

function processKeys() {
    // On applique les effets liés aux touches
    if (keys.get("x") === 1 && keys.get("Control") > 0) {
        livings_cells.clear();
        scroll_x = 0;
        scroll_y = 0;
    }
    if (keys.get(" ") === 1 || keys.get("Enter") === 1) {
        simulating = !simulating;
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

function tick() {
    processKeys();
    if (simulating) {
        simulate();
    }
    refresh();
    setTimeout(tick, 40);
}

tick();