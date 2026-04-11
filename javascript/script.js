const summary_items = new Map();
const nav = document.querySelector("nav");
document.querySelectorAll("section, #intro, #structures").forEach(item => {
    for (let nav_item of nav.querySelectorAll("a")) {
        if (nav_item.getAttribute("href").slice(1) === item.id) {
            summary_items.set(item, nav_item);
            break;
        }
    }
});
let closest;

function onScroll() {
    if (closest) {
        closest.classList.remove("onscreen");
    }
    let centery;
    let rect;
    let distance;
    let min_distance = Infinity;
    summary_items.forEach((nav_item, item) => {
        rect = item.getBoundingClientRect();
        centery = rect.top + rect.height/2;
        distance = Math.abs(centery - window.innerHeight/4);
        if (distance < min_distance) {
            min_distance = distance;
            closest = nav_item;
        }
    });
    if (closest) {
        closest.classList.add("onscreen");
    }
}

document.addEventListener("scroll", onScroll);
onScroll();