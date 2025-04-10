import kaplay from "kaplay";
import { tile } from "kaplay/dist/declaration/components";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix
enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

type Cell = {
  tileX: number;
  tileY: number;
  collapsed: boolean;
  options: number; // especially a binary number
  //options: boolean[]
};

const k = kaplay();
const GRID_WIDTH_NO = 8;
const GRID_HEIGHT_NO = 8;
const CELL_SIZE = 48;
const grid: Cell[] = [];

enum EST {
  G = "grass",
  R = "road",
  GDF0 = "grassDot_f0", // ground grass-dot
  GDF1 = "grassDot_f1", // grass-dot ground
}

enum TSET {
  G,
  GC0,
  GC1,
  GC2,
  GC3,
  RT0,
  RT1,
  RT2,
  RT3,
  R0,
  R1,
  R2,
  R3,
}

const tileSets = {
  edgeType: ["grass", "road", "grassDot_f0", "grassDot_f1"],
  spriteKeys: [
    "grass 0",
    "grasscorner 0",
    "grasscorner 1",
    "grasscorner 2",
    "grasscorner 3",
    "roadturn 0",
    "roadturn 1",
    "roadturn 2",
    "roadturn 3",
    "road 0",
    "road 1",
    "road 2",
    "road 3",
  ],
  edgeSockets: [
    [EST.G, EST.G, EST.G, EST.G],
    [EST.GDF0, EST.GDF1, EST.R, EST.R],
    [EST.GDF1, EST.R, EST.R, EST.GDF0],
    [EST.R, EST.R, EST.GDF0, EST.GDF1],
    [EST.R, EST.GDF0, EST.GDF1, EST.R],
    [EST.GDF1, EST.GDF0, EST.G, EST.G],
    [EST.GDF0, EST.G, EST.G, EST.GDF1],
    [EST.G, EST.G, EST.GDF1, EST.GDF0],
    [EST.G, EST.GDF1, EST.GDF0, EST.G],
    [EST.R, EST.R, EST.G, EST.R],
    [EST.R, EST.G, EST.R, EST.R],
    [EST.G, EST.R, EST.R, EST.R],
    [EST.R, EST.R, EST.R, EST.G],
  ],
  neighbors: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

function changeOptions(input: number, index: number, isAdd: boolean) {
  if (isAdd === true) {
    return input | Math.pow(2, index);
  } else {
    k.debug.log(Number(input & Math.pow(2, index)).toString(2));
    if ((input & Math.pow(2, index)) == 0) {
      k.debug.error("cant remove that bit as it is not 1");
      return input;
    } else {
      return input ^ Math.pow(2, index);
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
        options: Math.pow(2, tileSets.spriteKeys.length) - 1,
        //options: allOptionsinBool
      });
    }
  }
}

function updateGridSprite() {
  for (let i = 0; i < grid.length; i++) {
    // if (grid[i].collapsed) continue;

    let p = Math.log2(grid[i].options);
    if (p === Math.floor(p)) {
      gridContain.children[i].sprite = tileSets.spriteKeys[p];
      grid[i].collapsed = true;
    }
  }
}

function pickRandomCell() {
  grid[28].options = 1;
  grid[28].collapsed = true;
}

function dec2binString(input: number) {
  return Number(input).toString(2);
}

function compareEdges(edgeDir: Direction, idxA: number, idxB: number) {
  const { edgeSockets } = tileSets;
  if (
    edgeSockets[idxA][edgeDir] != EST.GDF0 &&
    edgeSockets[idxA][edgeDir] != EST.GDF1
  ) {
    return edgeSockets[idxA][edgeDir] === edgeSockets[idxB][(edgeDir + 2) % 4];
  } else if (edgeSockets[idxA][edgeDir] == EST.GDF0) {
    return edgeSockets[idxB][(edgeDir + 2) % 4] == EST.GDF1;
  } else {
    return edgeSockets[idxB][(edgeDir + 2) % 4] == EST.GDF0;
  }
}

function calcNeighborTilesForEachTile() {
  for (let i = 0; i < tileSets.spriteKeys.length; i++) {
    //if(i>1) continue
    let IdxToLookAt = i;
    for (let j = 0; j < 4; j++) {
      // let directionToLook = j, north for example
      // console.log("current dir: ", j);
      for (let k = 0; k < tileSets.spriteKeys.length; k++) {
        // it can compare with the same tile
        let IdxToCheckWith = k;
        if (compareEdges(j, IdxToLookAt, IdxToCheckWith)) {
          tileSets.neighbors[i][j] = changeOptions(
            tileSets.neighbors[i][j],
            k,
            true
          );
          // console.log(
          //   "added tile ",
          //   tileSets.spriteKeys[k],
          //   " to tile ",
          //   tileSets.spriteKeys[i],
          //   " in direction ",
          //   j
          // );
        } else {
          // console.log("not matching");
          continue;
        }
      }
    }
  }
}

function encodeOptions(arr: TSET[]) {
  let a = 0;
  for (let el of arr) {
    a += Math.pow(2, el);
  }
  return a;
}

function decodeOptionsInt(_x: number): number[] {
  if (_x > Math.pow(2, tileSets.spriteKeys.length) - 1) {
    console.error("number cannot exceed the number of tilesets available");
    return [-1];
  } else {
    let ans = [];
    let ab = dec2binString(_x);
    let alen = ab.length;
    for (let i = alen - 1; i >= 0; i--) {
      if (ab[i] == "1") {
        ans.push(alen - 1 - i);
      }
    }
    return ans;
  }
}

function decodeOptions(_x: string) {
  let ans = [];
  let alen = _x.length;
  for (let i = alen - 1; i >= 0; i--) {
    if (_x[i] == "1") {
      ans.push(alen - 1 - i);
    }
  }
  return ans;
}

function reduceEntrophy() {
  const collapsedCells = grid.filter((e) => e.collapsed === true);
  for (let element of collapsedCells) {
    const { tileX, tileY, options } = element;
    const tileIdx = Math.log2(options);
    for (let dir = 0; dir < 4; dir++) {
      const deltaTile = { x: 0, y: 0, msg: "" };
      switch (dir) {
        case Direction.NORTH: {
          deltaTile.x = 0;
          deltaTile.y = -1;
          deltaTile.msg = "north";
          break;
        }
        case Direction.EAST: {
          deltaTile.x = 1;
          deltaTile.y = 0;
          deltaTile.msg = "east";
          break;
        }
        case Direction.SOUTH: {
          deltaTile.x = 0;
          deltaTile.y = 1;
          deltaTile.msg = "south";
          break;
        }
        case Direction.WEST: {
          deltaTile.x = -1;
          deltaTile.y = 0;
          deltaTile.msg = "west";
          break;
        }
      }
      if (
        tileY + deltaTile.y < 0 ||
        tileY + deltaTile.y >= GRID_HEIGHT_NO ||
        tileX + deltaTile.x < 0 ||
        tileX + deltaTile.x >= GRID_WIDTH_NO
      ) {
        console.error(`No valid cells on the ${deltaTile.msg}`);
        continue;
      }
      const cg = grid.filter(
        (e) => e.tileX == tileX + deltaTile.x && e.tileY == tileY + deltaTile.y
      );
      const cellToCheck = cg[0];
      if (cellToCheck.collapsed) {
        console.info("cell is collapased. Skipping it.");
      }
      console.log(tileIdx);
      const neighborOption = tileSets.neighbors[tileIdx][dir]; // in integers
      if (!neighborOption) {
        console.error(
          "no options in tileIdx: ",
          tileIdx,
          " in ",
          deltaTile.msg
        );
        continue;
      }
      const neighborTileIdxGp = decodeOptionsInt(neighborOption);
      if (neighborTileIdxGp[0] < 0) {
        console.error(
          "number cannot exceed the number of tilesets available OR no options left."
        );
        continue;
      }
      // this code should remove the options that are not available with the one in neighbors
      cellToCheck.options = cellToCheck.options & neighborOption;
      console.log("dir: ", deltaTile.msg);
      console.log("current encode options: ", cellToCheck.options);
      console.log("array: ", neighborTileIdxGp);
      // if (cellToCheck.options < Math.pow(2, tileSets.spriteKeys.length) - 1) {
      //   for (let el of neighborTileIdxGp) {
      //     cellToCheck.options = changeOptions(cellToCheck.options, el, true);
      //   }
      // }
    }

    // check North. it is working. Make it into a loop
    // if (tileY - 1 < 0) {
    //   console.log("No valid cells on the north");
    // } else {
    //   let northCell = grid.filter(
    //     (e) => e.tileY == tileY - 1 && e.tileX == tileX
    //   );
    //   let northNeighborOptionBit = dec2binString(
    //     tileSets.neighbors[tileIdx][Direction.NORTH]
    //   );
    //   console.log(northNeighborOptionBit);
    //   let northOptIdx = decodeOptions(northNeighborOptionBit);
    //   const chosenIdx = k.choose(northOptIdx);
    //   console.table(northOptIdx);
    //   console.log("north chosen Idx: ", chosenIdx);
    //   northCell[0].options = Math.pow(2, chosenIdx);
    // }
  }
}

function collapseLeastEntrophy() {
  const sortedGridByLeastEntrophy = grid
    .filter((el) => !el.collapsed)
    .toSorted((e1, e2) => {
      if (decodeOptionsInt(e1.options)[0] < -1) {
        console.error("e1 has no valid options!");
        return 0;
      }
      if (decodeOptionsInt(e2.options)[0] < -1) {
        console.error("e2 has no valid options!");
        return 0;
      }
      const e1l = decodeOptionsInt(e1.options).length;
      const e2l = decodeOptionsInt(e2.options).length;
      return e1l - e2l;
    });
  console.log(sortedGridByLeastEntrophy);
  const cellToCollapse = sortedGridByLeastEntrophy[0];
  const indices = decodeOptionsInt(cellToCollapse.options);
  const chooseIdx = k.choose(indices);
  cellToCollapse.options = Math.pow(2, chooseIdx);
  cellToCollapse.collapsed = true;
}

k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("w", "Circles/w.png");
for (let names of tileSets.spriteKeys) {
  k.loadSprite(names, "Summer/" + names + ".png");
}

const gridContain = k.add([k.pos(100, 50)]);

for (let j = 0; j < GRID_HEIGHT_NO; j++) {
  for (let i = 0; i < GRID_WIDTH_NO; i++) {
    gridContain.add([
      k.pos(0 + i * (CELL_SIZE * 2 + 10), 0 + j * (CELL_SIZE * 2 + 10)),
      k.sprite("w"),
      k.scale(2),
    ]);
  }
}

// k.add([k.pos(120, 80), k.sprite("bean")]);

initGrid();

calcNeighborTilesForEachTile();

console.log(tileSets);

pickRandomCell();

for (let i = 0; i < 10; i++) {
  reduceEntrophy();

  collapseLeastEntrophy();
}

//  update grid is working
//  in update, it should pick a random cell. If there are updated cells, pick from those cells
//  collapse that cell into a single option
//  update the neighbor or entrophy of adjacent cell
//  pick from the cells of the least entrophy
//  repeat collapse

k.onUpdate(() => {
  updateGridSprite();
});

k.onClick(() => k.addKaboom(k.mousePos()));
