import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix
enum Direction {
    NORTH,
    WEST,
    SOUTH,
    EAST
}

type Cell = {
    tileX: number,
    tileY: number
    collapsed: boolean,
    options: number // especially a binary number
    //options: boolean[]
}


const k = kaplay();
const GRID_WIDTH_NO = 8;
const GRID_HEIGHT_NO = 8;
const CELL_SIZE = 48;
const grid: Cell[] = [];

enum EST {
    G = "grass", R = "road", GDF0 = "grassDot_f0", GDF1 = "grassDot_f1"
}

const tileSets = {
    edgeType: ["grass", "road", "grassDot_f0", "grassDot_f1"],
    spriteKeys: [
        "grass 0",
        "grasscorner 0", "grasscorner 1", "grasscorner 2", "grasscorner 3",
        "roadturn 0", "roadturn 1", "roadturn 2", "roadturn 3",
        "road 0", "road 1", "road 2", "road 3",
    ],
    edgeSockets: [
        [EST.G, EST.G, EST.G, EST.G],
        [EST.GDF0, EST.GDF1, EST.R, EST.R],
        [EST.GDF1, EST.R, EST.R, EST.GDF0],
        [EST.R, EST.R, EST.GDF0, EST.GDF1],
        [EST.R, EST.GDF0, EST.GDF1, EST.R],
    ],
    neighbors: []

}

function changeOptions(input: number, index: number, isAdd: boolean) {
    if (isAdd === true) {
        return input | Math.pow(2, index)
    } else {
        k.debug.log(Number(input & Math.pow(2, index)).toString(2))
        if ((input & Math.pow(2, index)) == 0) {
            k.debug.error("cant remove that bit as it is not 1")
            return input
        } else {
            return input ^ Math.pow(2, index)
        }
    }
}

function initGrid() {
    for (let y = 0; y < GRID_HEIGHT_NO; y++) {
        for (let x = 0; x < GRID_WIDTH_NO; x++) {
            grid.push({
                tileX: x,
                tileY: y,
                collapsed: false,
                options: Math.pow(2, tileSets.spriteKeys.length) - 1
                //options: allOptionsinBool
            })
        }
    }
}

function updateGridSprite() {
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].collapsed) continue

        let p = Math.log2(grid[i].options)
        if (p === Math.floor(p)) {
            gridContain.children[i].sprite = tileSets.spriteKeys[p]
            grid[i].collapsed = true
        }
    }
}


k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");
for (let names of tileSets.spriteKeys) {
    k.loadSprite(names, "Summer/" + names + ".png")
}

const gridContain = k.add([
    k.pos(100, 50)
])

for (let j = 0; j < GRID_HEIGHT_NO; j++) {
    for (let i = 0; i < GRID_WIDTH_NO; i++) {
        gridContain.add([
            k.pos(0 + i * (CELL_SIZE * 2 + 10), 0 + j * (CELL_SIZE * 2 + 10)),
            k.sprite(tileSets.spriteKeys[0]),
            k.scale(2)
        ])
    }
}

k.add([k.pos(120, 80), k.sprite("bean")]);

initGrid()

// grid[28].options = 16 update grid is working

k.onUpdate(() => {
    updateGridSprite()
})

k.onClick(() => k.addKaboom(k.mousePos()));
