document.addEventListener("DOMContentLoaded", function () {
  let selectedVial = null;
  let done = () => false;
  const generate = (seed) => {
    let rng = new Math.seedrandom(seed);
    const container = document.getElementById("vialContainer");
    while (container.firstChild) {
      container.removeChild(container.lastChild);
    }
    let vialNum = 14;
    let colorNum = 5;
    let vialHeight = 140;
    let vialWidth = 40;
    let auxVialNum = 1;

    let colors = palette("mpn65", vialNum - 2).reduce(
      (a, i) => a.concat(Array(colorNum).fill(i)),
      []
    );

    for (let i = 0; i < vialNum + auxVialNum; i++) {
      const vial = document.createElement("div");
      vial.style.height = vialHeight + "px";
      vial.style.width = vialWidth + "px";
      vial.classList.add("vial");
      vial.dataset.cap = colorNum;
      vial.dataset.maxCap = colorNum;
      if (i >= vialNum) {
        vial.id = "aux-vial";
        vial.style.height = vialHeight / 5 + "px";
        vial.style.width = vialWidth + "px";
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
            vial.style.height = ((cap + 1) * vialHeight) / 5 + "px";
            vial.style.borderColor = "#000000";
            vial.style.backgroundColor = "transparent";
          });
        });
        container.appendChild(addButton);
      } else if (i < vialNum - 2) {
        for (let j = 0; j < colorNum; j++) {
          const colorSegment = document.createElement("div");
          colorSegment.classList.add("color-segment");
          const colorIndex = Math.floor(rng() * colors.length);
          const randomColor = "#" + colors[colorIndex];
          colors = colors.filter((c, i) => i !== colorIndex);
          colorSegment.style.backgroundColor = randomColor;
          colorSegment.style.maxHeight = vialHeight / colorNum + "px";
          vial.appendChild(colorSegment);
        }
      }

      vial.addEventListener("click", function () {
        if (selectedVial === null) {
          vial.classList.add("move-up");
          selectedVial = vial;
        } else if (selectedVial === vial) {
          vial.classList.remove("move-up");
          selectedVial = null;
        } else {
          if (
            vial.children.length < vial.dataset.cap &&
            (!vial.lastChild ||
              vial.lastChild.style.backgroundColor ===
                selectedVial.lastChild.style.backgroundColor)
          ) {
            moveAndRotateVial(selectedVial, vial);
            selectedVial.classList.remove("move-up");
            selectedVial = null;
          }
        }
      });

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
  };

  const allEqual = (arr) => arr.every((val) => val === arr[0]);

  function moveBackVial(vial) {
    vial.style.zIndex = 0;
    vial.style.transition = "transform 0.5s";
    vial.style.transform = `translate(0, 0) rotate(0deg)`;

    if (done()) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
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
        fromVial.lastChild.style.backgroundColor === toAdd.style.backgroundColor
      ) {
        moveTopColor(fromVial, toVial);
      } else {
        moveBackVial(fromVial);
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
  function setCookie(name, value, ns = "color-sort", days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
      ns + "-" + name + "=" + (value || "") + expires + "; path=/";
  }

  // Function to get a cookie
  function getCookie(name, ns = "color-sort") {
    const nameEQ = ns + "-" + name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  //landmark
  const isEyesClosed = (howlong, timeout) =>
    new Promise((resolve, reject) => {
      const videoElement = document.getElementsByClassName("input_video")[0];
      // const canvasElement = document.getElementsByClassName('output_canvas')[0];
      // const canvasCtx = canvasElement.getContext('2d');

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
        ).innerHTML = `eyes been closed for  ${
          totalTimeEyesClosed / 1000
        } seconds`;
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
      camera.start();
      setTimeout(() => resolve(), timeout * 1000);
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

  if (!getCookie("level")) {
    setCookie("level", 1);
  }
  generate(parseInt(getCookie("level")));
  document.getElementById("nextBtn").addEventListener("click", () => {
    checkEyeClosed().then(() => {
      let level = parseInt(getCookie("level"));
      level++;
      setCookie("level", level);
      generate(level);
    });
  });
});
