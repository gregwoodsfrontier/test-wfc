import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix
enum Direction {
    NORTH,
    WEST,
    SOUTH,
    EAST
}
enum TileName {
    G0,
    C0, C1, C2, C3,
    CC0, CC1, CC2, CC3,
    CT0, CT1, CT2, CT3
}
enum EdgeSocketType {
    GRASS,
    CLIFF_RIGHT_BOT,
    CLIFF_RIGHT_TOP,
    CLIFF_LEFT_BOT,
    CLIFF_LEFT_TOP,
    CLIFF_WIDE,
    CLIFF_NARR
}
type TileData = {
    key: string,
    edgeSocket: EdgeSocketType[],
    neighbors: number[]
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
const spriteNames = [
    "grass 0",
    "cliff 0", "cliff 1", "cliff 2", "cliff 3",
    "cliffcorner 0", "cliffcorner 1", "cliffcorner 2", "cliffcorner 3",
    "cliffturn 0", "cliffturn 1", "cliffturn 2", "cliffturn 3",
]
const allOptionsinBool = []
for (let i = 0; i < spriteNames.length; i++) {
    allOptionsinBool.push(true)
}
enum EST {
    G = "grass", R = "road", GDF0 = "grassDot_f0", GDF1 = "grassDot_f1"
}
const tileSetsA = {
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
    ]

}

const TileSets: TileData[] = [
    {
        key: spriteNames[0],
        edgeSocket: [EdgeSocketType.GRASS, EdgeSocketType.GRASS, EdgeSocketType.GRASS, EdgeSocketType.GRASS],
        neighbors: [0, 0, 0, 0],
    },
    {
        key: spriteNames[TileName.C0],
        edgeSocket: [
            EdgeSocketType.GRASS,
            EdgeSocketType.CLIFF_WIDE,
            EdgeSocketType.GRASS,
            EdgeSocketType.CLIFF_WIDE,
        ],
        neighbors: [0, 0, 0, 0],
    }
]

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
                options: Math.pow(2, spriteNames.length) - 1
                //options: allOptionsinBool
            })
        }
    }
}


k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");
for (let names of spriteNames) {
    k.loadSprite(names, "Summer/" + names + ".png")
}

const gridContain = k.add([
    k.pos(100, 50)
])

for (let j = 0; j < GRID_HEIGHT_NO; j++) {
    for (let i = 0; i < GRID_WIDTH_NO; i++) {
        gridContain.add([
            k.pos(0 + i * (CELL_SIZE * 2 + 10), 0 + j * (CELL_SIZE * 2 + 10)),
            k.sprite(spriteNames[TileName.G0]),
            k.scale(2)
        ])
    }
}

gridContain.children[4 * GRID_WIDTH_NO + 4].sprite = spriteNames[TileName.C1]
gridContain.children[3 * GRID_WIDTH_NO + 4].sprite = spriteNames[TileName.CT2]
gridContain.children[5 * GRID_WIDTH_NO + 4].sprite = spriteNames[TileName.CC1]
//gridContain.children[4 * GRID_WIDTH_NO + 4].sprite = spriteNames[TileName.C1]



k.add([k.pos(120, 80), k.sprite("bean")]);

initGrid()

k.debug.log("oh hhi")
k.debug.log("1100 add 0100: ", Number(changeOptions(0b1100, 2, true)).toString(2))
k.debug.log("1000 sub 0100: ", Number(changeOptions(0b1000, 2, false)).toString(2))

k.onClick(() => k.addKaboom(k.mousePos()));
