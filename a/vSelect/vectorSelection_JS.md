/*
```js
*/

function openMulti() {
  if (document.querySelector(".selectWrapper").style.pointerEvents == "all") {
    document.querySelector(".selectWrapper").style.opacity = 0;
    document.querySelector(".selectWrapper").style.pointerEvents = "none";
    resetAllMenus();
  } else {
    document.querySelector(".selectWrapper").style.opacity = 1;
    document.querySelector(".selectWrapper").style.pointerEvents = "all";
  }
}
function nextMenu(e) {
  menuIndex = eval(event.target.parentNode.id.slice(-1));
  document.querySelectorAll(".multiSelect")[menuIndex].style.transform =
    "translateX(-100%)";
  // document.querySelectorAll(".multiSelect")[menuIndex].style.clipPath = "polygon(0 0, 0 0, 0 100%, 0% 100%)";
  document.querySelectorAll(".multiSelect")[menuIndex].style.clipPath =
    "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
  document.querySelectorAll(".multiSelect")[menuIndex + 1].style.transform =
    "translateX(0)";
  document.querySelectorAll(".multiSelect")[menuIndex + 1].style.clipPath =
    "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
}
function prevMenu(e) {
  menuIndex = eval(event.target.parentNode.id.slice(-1));
  document.querySelectorAll(".multiSelect")[menuIndex].style.transform =
    "translateX(100%)";
  document.querySelectorAll(".multiSelect")[menuIndex].style.clipPath =
    "polygon(0 0, 0 0, 0 100%, 0% 100%)";
  document.querySelectorAll(".multiSelect")[menuIndex - 1].style.transform =
    "translateX(0)";
  document.querySelectorAll(".multiSelect")[menuIndex - 1].style.clipPath =
    "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
}
function resetAllMenus() {
  setTimeout(function () {
    var x = document.getElementsByClassName("multiSelect");
    var i;
    for (i = 1; i < x.length; i++) {
      x[i].style.transform = "translateX(100%)";
      x[i].style.clipPath = "polygon(0 0, 0 0, 0 100%, 0% 100%)";
    }
    document.querySelectorAll(".multiSelect")[0].style.transform =
      "translateX(0)";
    document.querySelectorAll(".multiSelect")[0].style.clipPath =
      "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
  }, 300);
}

const style = document.createElement('style');
style.textContent = `
:root {
  --bgColor: #0fddaf;
  --txtColor: #ffffff;
  --borColor: rgba(0, 0, 0, 0);
  --sizeVar: 8px;
  --textPrimary: #4b4760;
  --textSecondary: #7f7989;
  --borderColor: #cccccc;
}
body {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: calc(var(--sizeVar) * 1.75);
}
.flexDiv {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
  margin: 32px;
}
.selectWrapper {
  width: 100%;
  position: relative;
  opacity: 0;
  pointer-events: none;
  transition: opacity 100ms linear 0s;
  filter: drop-shadow(0 6px 26px rgba(0, 0, 0, 0.24));
  padding-top: calc(var(--sizeVar) / 2);
}
.multiSelect {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  border: 1px solid var(--borderColor);
  box-sizing: border-box;
  border-radius: calc(var(--sizeVar) / 2);
  position: absolute;
  width: auto;
  left: 0;
  right: 0;
  overflow: hidden;
  background: #ffffff;
  transition: transform 300ms ease-in-out 0s, clip-path 300ms ease-in-out 0s;
}
.multiSelect div {
  color: var(--textPrimary);
  padding: 16px;
  width: auto;
  cursor: pointer;
}
.multiSelect div:hover {
  background-color: #f6f6f6;
}
.bottomBorder {
  border-bottom: 1px solid var(--borderColor);
}
.topBorder {
  border-top: 1px solid var(--borderColor);
}
.iconDiv {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.noSpace {
  justify-content: flex-start;
  gap: 6px;
}
.titleDiv {
  pointer-events: none;
  font-weight: 700;
}
.justHover i {
  opacity: 0;
}
.justHover:hover i {
  opacity: 1;
}
.multiSelect .placeholder {
  color: var(--textSecondary);
  font-style: italic;
}
.multiSelect .narrow {
  padding-top: 10px;
  padding-bottom: 10px;
}
.multiSelect i {
  color: var(--textSecondary);
}
.multiSelect {
  transform: translateX(100%);
  clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}
.multiSelect:nth-of-type(1) {
  transform: translateX(0);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.sec_btn {
  --bgColor: #869cff;
}
button {
  font-family: "Roboto", sans-serif;
  font-size: calc(var(--sizeVar) * 1.75);
  font-weight: 500;
  border: none;
  outline: none;
  padding: var(--sizeVar) calc(var(--sizeVar) * 2);
  border-radius: calc(var(--sizeVar) / 2);
  cursor: pointer;
  background-color: var(--bgColor);
  color: var(--txtColor);
  box-shadow: 0 0 0 1px var(--borColor) inset;
}
button:focus {
  --borColor: rgba(0, 0, 0, 0.4);
}
button:hover {
  --bgColor: #1fcc9e;
}
.sec_btn:hover {
  --bgColor: #6279e7;
}
.tri_btn:hover {
  --bgColor: #f8f7f8;
}
button:active {
  --bgColor: #1db284;
}
.sec_btn:active {
  --bgColor: #5468c7;
}
.tri_btn:active {
  --bgColor: #e7e7e7;
}
`;
document.head.appendChild(style);

/*
```
*/