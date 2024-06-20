document.addEventListener('DOMContentLoaded', function() {
    let selectedVial = null;
    let done = ()=>false;
    let colorNum = 5;

    const generate =(seed)=>{
        let rng = new Math.seedrandom(seed);
        const container = document.getElementById('vialContainer');
        while (container.firstChild) {
            container.removeChild(container.lastChild);
        }
        let vialNum = 14;
        colorNum = 5;
        let vialHeight = 140;
        let vialWidth = 40;

        let colors = palette('mpn65', vialNum-2).reduce((a,i)=>a.concat(Array(colorNum).fill(i)),[]);

        for (let i = 0; i < vialNum; i++) {
            const vial = document.createElement('div');
            vial.style.height = vialHeight+"px";
            vial.style.width = vialWidth+"px";
            vial.classList.add('vial');

            if(i<vialNum-2)
            for (let j = 0; j < colorNum; j++) {
                const colorSegment = document.createElement('div');
                colorSegment.classList.add('color-segment');
                const colorIndex = Math.floor(rng() * colors.length);
                const randomColor = "#"+colors[colorIndex];
                colors = colors.filter((c,i)=>i!==colorIndex);
                colorSegment.style.backgroundColor = randomColor;
                colorSegment.style.maxHeight = (vialHeight/colorNum)+"px";
                vial.appendChild(colorSegment);
            }

            vial.addEventListener('click', function() {
                if (selectedVial === null) {
                    vial.classList.add('move-up');
                    selectedVial = vial;
                } else if (selectedVial === vial) {
                    vial.classList.remove('move-up');
                    selectedVial = null;
                } else {
                    if(vial.children.length<colorNum && 
                    (!vial.lastChild || 
                        vial.lastChild.style.backgroundColor === selectedVial.lastChild.style.backgroundColor)){
                        moveAndRotateVial(selectedVial, vial);
                        selectedVial.classList.remove('move-up');
                        selectedVial = null;
                    }
                }
            });

            container.appendChild(vial);
        }
        document.getElementById("nextBtn").style.display = "none";
        done = () => [...document.getElementsByClassName('vial')]
            .every(f=>f.children.lenght === colorNum && allEqual([...f.children].map(c=>c.style.backgroundColor)))
    }

    const allEqual = arr => arr.every(val => val === arr[0]);

    function moveBackVial(vial){
        vial.style.zIndex = 0;
        vial.style.transition = 'transform 0.5s';
        vial.style.transform = `translate(0, 0) rotate(0deg)`;
        
        if(done()){
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
              document.getElementById("nextBtn").style.display = "block";
        }
    }

    function moveTopColor(fromVial, toVial){
        let toRemove = fromVial.lastChild;
        let toAdd =  fromVial.lastChild.cloneNode(true)
        toAdd.classList.add('adding');
        toRemove.classList.add('removing');
        let fromPromise = new Promise((resolve)=>{
            toAdd.addEventListener("animationend", (event) => {
                resolve()
            });
        });
        let toPromise = new Promise((resolve)=>{
            toRemove.addEventListener("animationend", (event) => {
                resolve()
            });
        });
        Promise.all([fromPromise,toPromise]).then(()=>{
            toAdd.removeEventListener("animationend",()=>{})
            toRemove.removeEventListener("animationend",()=>{})
            toAdd.classList.remove('adding');
            toRemove.classList.remove('removing');
            fromVial.removeChild(fromVial.lastChild);
            if(fromVial.lastChild && 
                toVial.children.length<colorNum && 
                fromVial.lastChild.style.backgroundColor === toAdd.style.backgroundColor){
                moveTopColor(fromVial, toVial)
            }else{
                moveBackVial(fromVial)
            }
        })
        toVial.appendChild(toAdd);
    }

    function moveAndRotateVial(fromVial, toVial) {
        const fromRect = fromVial.getBoundingClientRect();
        const toRect = toVial.getBoundingClientRect();
        const translateX = toRect.left - fromRect.left - fromRect.width/2;
        const translateY = toRect.top - fromRect.top - fromRect.width - (translateX > 0 ? 0: (fromRect.height/2)) - (Math.random()-0.5)*20;
        const direction = translateX < 0 ? 'counterclockwise' : 'clockwise';
        
        fromVial.style.zIndex = 1000;
        fromVial.style.transition = 'transform 1s';
        fromVial.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${direction === 'clockwise' ? 90 : -90}deg)`;
        fromVial.style.transformOrigin = "100% 0%";

        setTimeout(() => {
            moveTopColor(fromVial, toVial)
        },1000);
    }

    // Function to set a cookie
    function setCookie(name, value, ns="color-sort", days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = ns+"-"+name + "=" + (value || "") + expires + "; path=/";
    }

    // Function to get a cookie
    function getCookie(name, ns="color-sort") {
        const nameEQ = ns+"-"+name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    
      if(!getCookie("level")){
        setCookie("level",1);
      }
    generate(parseInt(getCookie("level")));
    document.getElementById("nextBtn").addEventListener("click",()=>{
        let level = parseInt(getCookie("level"));
        level++;
        setCookie("level",level)
        generate(level);
    })
});
