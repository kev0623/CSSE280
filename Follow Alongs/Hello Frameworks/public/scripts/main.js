/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Kai Chun Lin
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.counter = 0;

/** function and class syntax examples */


// rhit.ClassName = class {
// 	constructor() {

// 	}

// 	methodName() {

// 	}
// }

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	const buttons = document.querySelectorAll("#counterButton button");
	// for(let i=0;i<buttons.length;i++){
	// 	const button = buttons[i];
	// 	// const button = buttons[i];
	// 	// const button = buttons[i];
	// 	// const button = buttons[i];
	// 	button.onclick = (event) => {
	// 		console.log(`You pressed:`, button);
	// 	}
	// }
	for(const button of buttons){
		button.onclick = (event) => {
		const dataAmount = parseInt(button.dataset.amount);
		const dataIsMultiplication = button.dataset.isMultiplication=="true";
		console.log(`Amount: ${dataAmount}`);
		console.log(`Is mut: ${dataIsMultiplication}`);
		rhit.updateCounter(dataAmount,dataIsMultiplication);
		}
		
	}

	// buttons.forEach((button) => {
	// 	button.onclick = (event) => {
	// 		console.log(`You pressed: `, button);
	// 	}
	// });
};


rhit.updateCounter = function (amount, isMultiplication) {
	if(isMultiplication){
		rhit.counter = rhit.counter*amount;
	}else{
		rhit.counter+=amount;
	}
	document.querySelector("#counter-text").innerHTML=`Count = ${rhit.counter}`;
};
rhit.main();
