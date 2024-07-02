var seedrandom = require('seedrandom');

function cleanGrid(grid) {
  for (let idx = 0; idx < grid.length; idx++) {
    if (grid[idx].length === 0) {
      grid[idx] = Array(grid[0].length).fill(null);
    }
  }
  return grid.map(line => line.map(ball => (ball === "" || ball === " ") ? null : ball));
}

function makeMove(grid, moveFrom, moveTo) {
  if (moveFrom === moveTo) {
    return null;
  }

  function getLastBall(testTube) {
    for (let idx = 0; idx < testTube.length; idx++) {
      if (testTube[idx]) {
        return [idx, testTube[idx]];
      }
    }
    return [null, null];
  }

  function getEmptySlot(testTube) {
    for (let idx = testTube.length - 1; idx >= 0; idx--) {
      if (testTube[idx] === null) {
        return idx;
      }
    }
    return null;
  }

  function isMoveRedundant(testTubeFrom, testTubeTo, fromBall) {
    const colorsTestTubeFrom = testTubeFrom.filter(i => i !== null);
    const colorsTestTubeTo = testTubeTo.filter(i => i !== null);

    if (new Set(colorsTestTubeFrom).size === 1 && new Set(colorsTestTubeTo).size === 1) {
      return colorsTestTubeFrom.length > colorsTestTubeTo.length;
    } else if (new Set(colorsTestTubeFrom).size === 1) {
      return testTubeTo.every(slot => slot === null);
    }
    return false;
  }

  try {
    const fromTestTube = [...grid[moveFrom]];
    const toTestTube = [...grid[moveTo]];

    const [fromIdx, fromBall] = getLastBall(fromTestTube);

    if (!isMoveRedundant(fromTestTube, toTestTube, fromBall)) {
      const [, toBall] = getLastBall(toTestTube);
      const emptySlot = getEmptySlot(toTestTube);

      if (fromBall && emptySlot !== null && (fromBall === toBall || toBall === null)) {
        fromTestTube[fromIdx] = null;
        toTestTube[emptySlot] = fromBall;

        const newGrid = [...grid];
        newGrid[moveFrom] = fromTestTube;
        newGrid[moveTo] = toTestTube;
        return newGrid;
      }
      return null;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function checkVictory(grid) {
  return grid.every(testTube => new Set(testTube).size === 1);
}

function solveGrid(grid, minMoves = false) {
  let gridHistory = [cleanGrid(grid)];
  let moves = [];
  const allGridStates = [];

  function iterOverGrid(level = 0) {
    for (let testTubeFromIdx = 0; testTubeFromIdx < gridHistory[level].length; testTubeFromIdx++) {
      for (let testTubeToIdx = 0; testTubeToIdx < gridHistory[level].length; testTubeToIdx++) {
        if (checkVictory(gridHistory[gridHistory.length - 1])) {
          return;
        }

        gridHistory = gridHistory.slice(0, level + 1);
        moves = moves.slice(0, level + 1);

        const gridMove = makeMove(gridHistory[level], testTubeFromIdx, testTubeToIdx);

        if (gridMove && !allGridStates.some(state => JSON.stringify(state) === JSON.stringify(gridMove))) {
          if (level === 0) {
            allGridStates.length = 0; 
          }

          moves.push([testTubeFromIdx, testTubeToIdx]);
          gridHistory.push(gridMove);
          allGridStates.push(gridMove);
          iterOverGrid(level + 1);
        }
      }
    }
  }

  iterOverGrid();
  return [gridHistory, moves];
}


if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
  };

const generate = (seed) => {
    let rng = new seedrandom(seed);
    let vialNum = 14;
    let colorNum = 5;
    let vialHeight = 140;
    let vialWidth = 40;
    let auxVialNum = 1;

      
    let colors = [...Array(vialNum - 2).keys()].reduce(
      (a, i) => a.concat(Array(colorNum).fill(i)),
      []
    );
      let test = [];
    for (let i = 0; i < vialNum + auxVialNum; i++) {
      
      if (i >= vialNum) {
        
       
      } else if (i < vialNum - 2) {
        test.push([])
        for (let j = 0; j < colorNum; j++) {

          const colorIndex = Math.floor(rng() * colors.length);
          const randomColor = "#" + colors[colorIndex];
          colors = colors.filter((c, i) => i !== colorIndex);
          test.last().push(randomColor)
        }
      } else if (i >= vialNum - 2 && i < vialNum) {
        test.push([])
      }

    }

    return test;
  };

  // Example usage

  [...Array(1000).keys()].forEach(async kk=>{
  game = generate(kk);
const [g,moves] = solveGrid(game.map(arr => arr.reverse()));
console.log(kk, moves.length);
})