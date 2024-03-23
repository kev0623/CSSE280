// /**
//  * @fileoverview
//  * Provides interactions for all pages in the UI.
//  *
//  * @author 
//  */

// /** namespace. */
// var rh = rh || {};

// /** globals */
// rh.variableName = "";

// /** function and class syntax examples */
// rh.functionName = function () {
// 	/** function body */
// };

// rh.ClassName = class {
// 	/** constructor */
// 	constructor() {

// 	}
// 	methodName() {

// 	}
// };

// /* Main */
// $(document).ready(() => {
//     console.log("Ready");
// });
var counter = 0;
var colorRectangleStyle;
function main(){
    console.log("Ready");
    document.querySelector("#decButton").onclick =(event) => {
        console.log("Decrement");
        counter = counter -1;
        updateView();
    }
    document.querySelector("#resetButton").onclick =(event) => {
        console.log("Reset");
        counter = 0;
        updateView();
    }
    document.querySelector("#addButton").onclick =(event) => {
        console.log("Increment");
        counter = counter +1;
        updateView();
    }
	document.querySelector("#blueButton").onclick = (event) => {
		console.log("Change color");
		document.querySelector("#colorRectangle").style.background = "blue";
		document.querySelector("#colorRectangle").innerText = "Blue";
	}
	document.querySelector("#greenButton").onclick = (event) => {
		console.log("Change color");
		document.querySelector("#colorRectangle").style.background = "green";
		document.querySelector("#colorRectangle").innerText = "Green";
	}
	document.querySelector("#redButton").onclick = (event) => {
		console.log("Change color");
		document.querySelector("#colorRectangle").style.background = "red";
		document.querySelector("#colorRectangle").innerText = "Red";
	}
	document.querySelector("#purpleButton").onclick = (event) => {
		console.log("Change color");
		document.querySelector("#colorRectangle").style.background = "purple";
		document.querySelector("#colorRectangle").innerText = "Purple";
	}

}

function updateView(){
    // document.querySelector("#countText").innerHTML = "Count = "+counter;
    document.querySelector("#favoriteNumber").innerHTML = `${counter}`;

}
function updateColor(){
	// colorRectangleStyle=
	// colorRectangleStyle.background
}
main();
