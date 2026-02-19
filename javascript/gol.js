const screen = document.querySelector("#screen");
const ctx = screen.getContext("2d");

screen.addEventListener("click", event => {
    let x = Math.round(event.offsetX / screen.clientWidth * screen.width);
    let y = Math.round(event.offsetY / screen.clientHeight * screen.height);
    ctx.fillRect(x, y, 1, 1);
});