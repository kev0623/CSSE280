/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};


rhit.PageController = class {
	constructor() {
		
	}

	updateView() {

	}
};
//Semicolon is not neccessary 
rhit.Game = class {
	constructor() {
		//TODO: Make instance variables
	}

	pressedButtonAtIndex(buttonIndex) {

	}
	getMarkAtIndex(buttonIndex){
		return "X";
	}
	getState(){
		return "X's Turn";
	}

}
/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	new rhit.PageController();

};

rhit.main();
