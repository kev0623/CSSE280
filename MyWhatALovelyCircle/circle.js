

function colorShow(colorList) {
   console.log("The color show is starting!");
   // TODO: Fill in the rest of this function
   // REMEMBER:  This is all about using closures and asynchronous programming.

   const circle = document.querySelector("#circle");

   let index = 0;

   function changeColor() {
      circle.style.backgroundColor = colorList[index];

      index = (index + 1) % colorList.length;

      setTimeout(changeColor, 1500);
   }

   // Start the color changing process
   changeColor();

}

// Do not modify the code below

window.addEventListener("DOMContentLoaded", function () {
   document.querySelector("#colorShowButton").addEventListener("click", () => {
      colorShow(["#ff0000", "#ffa500", "#ffff00", "#008000", "#0000ff", "#4b0082", "#ee82ee"])
   });
});