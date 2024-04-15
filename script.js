let card = document.querySelector(".card");
let boxBoundingRect = card.getBoundingClientRect();
let boxCenter=  boxBoundingRect.left + boxBoundingRect.width/2

let card_blick = document.querySelectorAll(".card-blick");

function changeBorderColor(border, value) {
  let b = document.querySelectorAll(`.card-thick-${border}`);
  b.forEach(e => {
    e.style.setProperty('background-position', `0 ${value}%`);
  })
}

document.addEventListener("mousemove", e => {
    let angle = Math.max(Math.min(21, Math.atan2((e.pageX - boxCenter) * 0.002, (Math.PI) )*(180 / Math.PI)), -21);     
    card.style.transform = `rotateY(${angle}deg) rotateZ(9deg)`;
    
    card_blick.forEach(e => {
      e.style.left = `-${200 + ((angle - 1) * 10)}%`
    })
    let pos = 50 + (angle / 21 * 50);
    changeBorderColor('left', pos);
    changeBorderColor('right', pos)
})