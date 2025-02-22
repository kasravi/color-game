import { solveGrid } from './solver.js';

document.addEventListener("DOMContentLoaded", function () {
  let selectedVial = null;
  let done = () => false;
  var game = null;
  var solution = null;

  //drawer
  document
    .getElementsByTagName("html")[0]
    .addEventListener("click", closeDrawer);
  var drawerBtn = document.getElementById("drawer-button");
  drawerBtn.addEventListener("click", toggleDrawer);

  document
    .getElementById("level-input")
    .addEventListener("change", (event) => {
      let level = parseInt(event.target.value);
      setValueInStorage("level", level);
      generate(level);
    });

    const wait = (s) => new Promise(res => setTimeout(res, s * 1000));

    document.getElementById("solve-button").addEventListener("click", async (event) => {
      if (!solution) return;
      await wait(1.5);
    
      for (let move of solution) {
        console.log(move)
        const srcVial = document.getElementById('vial-' + move[0]);
        const dstVial = document.getElementById('vial-' + move[1]);
        
        // Get the current visible (top) ball color from the source vial.
        let topBall = srcVial.lastElementChild;
        if (!topBall) continue; // if no ball is visible, skip
        const moveColor = topBall.style.backgroundColor;
        
        const waitForMoveFinished = async ()=>{
          for(let i =0;i<40;i++){
            if(([...document.getElementsByClassName("vial")].map(f=>f.dataset.moving)).some(f=>!!f)){
              await wait(0.1)
              continue
            }
            return true
          }
          return false
        }
        // Keep performing the move until the source vial's top ball changes.
        while (srcVial.lastElementChild && 
            srcVial.lastElementChild.style.backgroundColor === moveColor &&
            dstVial.children.length<5 ) {
          srcVial.click();
          dstVial.click();
          await waitForMoveFinished();
        }
      }
    });

  function toggleDrawer() {
    var drawer = document.getElementById("myDrawer");
    drawer.classList.toggle("open");
  }

  function closeDrawer(e) {
    var drawer = document.getElementById("myDrawer");

    var drawerBtn = document.getElementById("drawer-button");

    if (drawer.contains(e.target) || drawerBtn.contains(e.target)) return;
    drawer.classList.remove("open");
  }
  //

  //config
  let config = getValueFromStorage("config");
  document.getElementById("color-blind").checked = (config||{})["color-blind"];
  document.getElementById("color-blind").addEventListener("click", (e) => {
    const checked = e.target.checked;
    let config = getValueFromStorage("config")||{};
    config["color-blind"] = checked;
    setValueInStorage("config", config);
    
      [...document.getElementsByClassName("color-segment")].forEach((colorSegment)=>{
      if(checked){
        colorSegment.innerHTML = `<p class="color-segment-icon">${
          colorSegment.dataset.icon
        }</p>`;
      }else{
        colorSegment.innerHTML = ""
      }
    });
  })
  ///

  const isPrime = (num) => {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
      if (num % i === 0) return false;
    }
    return num > 1;
  };

  if (!Array.prototype.last) {
    Array.prototype.last = function () {
      return this[this.length - 1];
    };
  }

  const allEqual = (arr) => arr.every((val) => val === arr[0]);

  const moveVialCallback = (vial) => {
    if (selectedVial === null) {
      vial.classList.add("move-up");
      selectedVial = vial;
    } else if (selectedVial.id === vial.id) {
      vial.classList.remove("move-up");
      selectedVial = null;
    } else {
      if ((!selectedVial.dataset.moving || selectedVial.dataset.moving === "false") &&
        vial.children.length < vial.dataset.cap &&
        (!vial.lastChild ||
          (selectedVial.lastChild &&
            vial.lastChild.style.backgroundColor ===
              selectedVial.lastChild.style.backgroundColor))
      ) {
        selectedVial.dataset.moving = true;
        moveAndRotateVial(selectedVial, vial);
        selectedVial.classList.remove("move-up");
        selectedVial = null;
      }
    }
  };

  const generate = (seed) => {
    let rng = new Math.seedrandom(seed);
    const isColorBlind = document.getElementById("color-blind").checked;

    const isPrimeLevel = isPrime(seed);
    const container = document.getElementById("vialContainer");
    while (container.firstChild) {
      container.removeChild(container.lastChild);
    }
    let vialNum = 14;
    let colorNum = 5;
    let vialHeight = 9;
    let vialWidth = 2.5;
    let auxVialNum = 1;

    const icons = [
      "α",
      "β",
      "γ",
      "δ",
      "ε",
      "ζ",
      "η",
      "θ",
      "ι",
      "κ",
      "λ",
      "μ",
      "ν",
      "ξ",
      "ο",
      "π",
      "ρ",
      "σ",
      "τ",
      "υ",
      "φ",
      "χ",
      "ψ",
      "ω",
    ];
    let colorPalette = palette("mpn65", vialNum - 2);
    let colors = colorPalette.reduce(
      (a, i) => a.concat(Array(colorNum).fill(i)),
      []
    );
    let test = [];
    for (let i = 0; i < vialNum + auxVialNum; i++) {
      const vial = document.createElement("div");
      vial.id = `vial-${i}`;
      vial.style.height = vialHeight + "rem";
      vial.style.width = vialWidth + "rem";
      vial.classList.add("vial");
      vial.dataset.cap = colorNum;
      vial.dataset.maxCap = colorNum;
      if (i >= vialNum) {
        vial.id = "aux-vial";
        vial.style.height = vialHeight / 5 + "rem";
        vial.style.width = vialWidth + "rem";
        vial.style.borderColor = "#737373";
        vial.style.backgroundColor = "#737373";
        vial.dataset.cap = 0;
        const addButton = document.createElement("button");
        addButton.innerHTML = "+";
        addButton.classList.add("auxVialButton");
        addButton.addEventListener("click", () => {
          checkEyeClosed().then(() => {
            let cap = parseInt(vial.dataset.cap);
            if (cap >= colorNum) {
              return;
            }
            vial.dataset.cap = cap + 1;
            vial.style.height = ((cap + 1) * vialHeight) / 5 + "rem";
            vial.style.borderColor = "#000000";
            vial.style.backgroundColor = "transparent";
          });
        });
        container.appendChild(addButton);
      } else if (i < vialNum - 2) {
        test.push([]);
        for (let j = 0; j < colorNum; j++) {
          const colorSegment = document.createElement("div");
          colorSegment.classList.add("color-segment");
          const colorIndex = Math.floor(rng() * colors.length);
          const randomColor = colors[colorIndex];
          colors = colors.filter((c, i) => i !== colorIndex);
          colorSegment.style.backgroundColor = "#" + randomColor;
          test.last().push(randomColor);
          colorSegment.style.maxHeight = vialHeight / colorNum + "rem";
          colorSegment.dataset.rev = isPrimeLevel ? j === colorNum - 1 : true;
          colorSegment.dataset.icon = icons[colorPalette.indexOf(randomColor)];
          if (isColorBlind) {
            colorSegment.innerHTML = `<p class="color-segment-icon">${
              icons[colorPalette.indexOf(randomColor)]
            }</p>`;
          }
          vial.appendChild(colorSegment);
        }
      } else if (i >= vialNum - 2 && i < vialNum) {
        test.push([]);
      }

      vial.addEventListener("click", () => moveVialCallback(vial), false);

      container.appendChild(vial);

    }

    document.getElementById("levelP").innerHTML = seed;
    document.getElementById("nextBtn").style.display = "none";
    done = () =>
      [...document.getElementsByClassName("vial")]
        .filter((f) => f.dataset.cap == colorNum && f.children.length > 0)
        .every(
          (f) =>
            f.children.length === colorNum &&
            allEqual([...f.children].map((c) => c.style.backgroundColor))
        );
    
    solve(test).then(f=>{
      solution = f
    })
  };

  function moveBackVial(vial) {
    vial.style.zIndex = 0;
    vial.style.transition = "transform 0.5s";
    vial.style.transform = `translate(0, 0) rotate(0deg)`;
    vial.dataset.moving = false;

    if (done()) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      let level = getValueFromStorage("level");
      level++;
      setValueInStorage("level", level);
      document.getElementById("nextBtn").style.display = "block";
    }
  }

  function moveTopColor(fromVial, toVial) {
    let toRemove = fromVial.lastChild;
    let toAdd = fromVial.lastChild.cloneNode(true);
    toAdd.classList.add("adding");
    toRemove.classList.add("removing");
    let fromPromise = new Promise((resolve) => {
      toAdd.addEventListener("animationend", (event) => {
        resolve();
      });
    });
    let toPromise = new Promise((resolve) => {
      toRemove.addEventListener("animationend", (event) => {
        resolve();
      });
    });
    Promise.all([fromPromise, toPromise]).then(() => {
      toAdd.removeEventListener("animationend", () => {});
      toRemove.removeEventListener("animationend", () => {});
      toAdd.classList.remove("adding");
      toRemove.classList.remove("removing");
      fromVial.removeChild(fromVial.lastChild);
      if (
        fromVial.lastChild &&
        toVial.children.length < toVial.dataset.cap &&
        fromVial.lastChild.dataset.rev === "true" &&
        fromVial.lastChild.style.backgroundColor === toAdd.style.backgroundColor
      ) {
        moveTopColor(fromVial, toVial);
      } else {
        if (fromVial.lastChild) {
          fromVial.lastChild.dataset.rev = true;
        }
        moveBackVial(fromVial, toVial);
      }
    });
    toVial.appendChild(toAdd);
  }

  function moveAndRotateVial(fromVial, toVial) {
    const fromRect = fromVial.getBoundingClientRect();
    const toRect = toVial.getBoundingClientRect();
    const translateX = toRect.left - fromRect.left - fromRect.width / 2;
    const translateY =
      toRect.top -
      fromRect.top -
      fromRect.width -
      (translateX > 0 ? 0 : fromRect.height / 2) -
      (Math.random() - 0.5) * 20;
    const direction = translateX < 0 ? "counterclockwise" : "clockwise";

    fromVial.style.zIndex = 1000;
    fromVial.style.transition = "transform 1s";
    fromVial.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${
      direction === "clockwise" ? 90 : -90
    }deg)`;
    fromVial.style.transformOrigin = "100% 0%";

    setTimeout(() => {
      moveTopColor(fromVial, toVial);
    }, 1000);
  }

  // Function to set a cookie
  function setValueInStorage(name, value, ns = "color-sort") {
    localStorage.setItem(`${ns}-${name}`, JSON.stringify(value));
  }

  // Function to get a cookie
  function getValueFromStorage(name, ns = "color-sort") {
    return JSON.parse(localStorage.getItem(`${ns}-${name}`));
  }

  //landmark

  function toggleEyeState(w, o) {
    const eye = document.getElementById(w + "eye");
    if (o) eye.classList.remove("closed");
    else {
      eye.classList.add("closed");
    }
  }

  const isEyesClosed = (howlong, timeout) =>
    new Promise((resolve, reject) => {
      document.getElementById("closed-for").innerHTML = ``;
      try {
        const videoElement = document.getElementsByClassName("input_video")[0];

        let eyeClosedStart = null;
        let eyeOpenStart = null;
        let totalTimeEyesClosed = 0;
        let totalTimeEyesOpen = 0;

        function onResults(results) {
          if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
              const leftEye = [landmarks[159], landmarks[145]];
              const rightEye = [landmarks[386], landmarks[374]];

              const leftEyeOpen = calculateEyeOpenness(leftEye);
              const rightEyeOpen = calculateEyeOpenness(rightEye);

              toggleEyeState("l", leftEyeOpen);
              toggleEyeState("r", rightEyeOpen);

              if (leftEyeOpen && rightEyeOpen) {
                if (eyeClosedStart) {
                  totalTimeEyesClosed += Date.now() - eyeClosedStart;
                  eyeClosedStart = null;
                }
                if (!eyeOpenStart) {
                  eyeOpenStart = Date.now();
                }
              } else {
                if (eyeOpenStart) {
                  totalTimeEyesOpen += Date.now() - eyeOpenStart;
                  eyeOpenStart = null;
                }
                if (!eyeClosedStart) {
                  eyeClosedStart = Date.now();
                }
              }
            }
          }
          if (totalTimeEyesClosed / 1000 > howlong) {
            camera.stop();
            resolve();
          }

          document.getElementById(
            "closed-for"
          ).innerHTML = `your eyes have been closed for  ${(
            totalTimeEyesClosed / 1000
          ).toFixed(2)} seconds`;
        }

        function calculateEyeOpenness(eyeLandmarks) {
          const verticalDist =
            Math.abs(eyeLandmarks[0].y - eyeLandmarks[1].y) * 100;
          return verticalDist > 1;
        }

        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        faceMesh.onResults(onResults);

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await faceMesh.send({ image: videoElement });
          },
          width: 1280,
          height: 720,
        });
        if (navigator.mediaDevices) {
          navigator.mediaDevices
            .getUserMedia({ video: true, facingMode: "user" })
            .then(() => {
              camera.start();
            })
            .catch(() => {
              console.log("no camera");
              setTimeout(() => {
                resolve();
              }, howlong * 1000);
            });
        }
        setTimeout(() => {
          camera.stop();
          resolve();
        }, timeout * 1000);
      } catch (e) {
        setTimeout(() => {
          resolve();
        }, howlong * 1000);
      }
    });

  //////
  const checkEyeClosed = async () => {
    let t = document.getElementById("modal");
    t.classList.remove("fade-out");
    t.classList.add("fade-in");
    await isEyesClosed(10, 20);
    t.classList.add("fade-out");
    t.classList.remove("fade-in");
  };

  if (!getValueFromStorage("level")) {
    setValueInStorage("level", 1);
  }
  document.getElementById("nextBtn").addEventListener("click", () => {
    checkEyeClosed().then(() => {
      let level = getValueFromStorage("level");
      generate(level);
    });
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    checkEyeClosed().then(() => {
      let level = getValueFromStorage("level");
      generate(level);
    });
  });

  const solve = async (ga) => {
    const moves = solveGrid(ga);
    // console.log(JSON.stringify(ga),moves)
    return moves;
  }

  generate(getValueFromStorage("level"));
});
