export function solveGrid(initialGrid) {
  const capacity = 5;
  const visited = new Set();
  let solution = null;

  // Convert the grid state to a unique string for memoization.
  function stateToString(state) {
    return state.map(tube => tube.join(",")).join("|");
  }

  // Check if a state is solved: every non-empty tube is full and contains only one color.
  function isSolved(state) {
    for (const tube of state) {
      if (tube.length === 0) continue;
      if (tube.length !== capacity) return false;
      if (!tube.every(color => color === tube[0])) return false;
    }
    return true;
  }

  // Depth-first search recursive solver.
  function dfs(state, moves) {
    if (isSolved(state)) {
      solution = [...moves];
      return true;
    }
    const stateKey = stateToString(state);
    if (visited.has(stateKey)) return false;
    visited.add(stateKey);

    // Try every possible move: from tube i (source) to tube j (destination)
    for (let i = 0; i < state.length; i++) {
      const src = state[i];
      if (src.length === 0) continue;
      // Optional: Skip if source is already solved (full and uniform)
      if (src.length === capacity && src.every(color => color === src[0])) continue;

      // Determine the contiguous group of same-colored balls at the top of the source.
      const movingColor = src[src.length - 1];
      let count = 1;
      for (let k = src.length - 2; k >= 0; k--) {
        if (src[k] === movingColor) count++;
        else break;
      }

      for (let j = 0; j < state.length; j++) {
        if (i === j) continue;
        const dst = state[j];
        if (dst.length === capacity) continue; // no capacity
        // Valid move only if destination is empty or its top color matches the moving color.
        if (dst.length > 0 && dst[dst.length - 1] !== movingColor) continue;

        const emptySpace = capacity - dst.length;
        if (emptySpace === 0) continue; // redundant check but safe

        // Determine how many balls to pour (cannot pour more than available contiguous balls or empty spaces)
        const numToMove = Math.min(count, emptySpace);

        // Create a new state that reflects the move.
        const newState = state.map((tube, index) => {
          if (index === i) {
            return tube.slice(0, tube.length - numToMove);
          } else if (index === j) {
            return tube.concat(Array(numToMove).fill(movingColor));
          } else {
            return tube.slice(); // clone to avoid mutation
          }
        });

        moves.push([i, j]);
        if (dfs(newState, moves)) return true;
        moves.pop();
      }
    }
    return false;
  }

  dfs(initialGrid, []);
  return solution;
}

// ----------------------
// Example usage:

// const game = [
//   ["377eb8", "7f80cd", "af8d00", "66a61e", "66a61e"],
//   ["984ea3", "b3e900", "7f80cd", "b3e900", "af8d00"],
//   ["66a61e", "f781bf", "984ea3", "b3e900", "ff7f00"],
//   ["a65628", "f781bf", "a65628", "377eb8", "377eb8"],
//   ["ff7f00", "b3e900", "377eb8", "c42e60", "ff0029"],
//   ["ff7f00", "af8d00", "ff7f00", "00d2d5", "ff0029"],
//   ["7f80cd", "00d2d5", "a65628", "984ea3", "00d2d5"],
//   ["f781bf", "377eb8", "984ea3", "ff0029", "ff7f00"],
//   ["b3e900", "c42e60", "ff0029", "a65628", "00d2d5"],
//   ["f781bf", "c42e60", "af8d00", "7f80cd", "a65628"],
//   ["ff0029", "c42e60", "984ea3", "00d2d5", "66a61e"],
//   ["f781bf", "af8d00", "7f80cd", "c42e60", "66a61e"],
//   [], // first empty tube
//   []  // second empty tube
// ];

// const solution = solveGrid(game);
// console.log(solution);
// The output is an array of moves, for example: [ [0,12], [1,13], ... ]
