/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author 
 */

/** namespace. */
var rh = rh || {};

/** globals */
rh.variableName = "";

/** function and class syntax examples */
rh.functionName = function () {
	/** function body */
};

rh.Game = class {

	static NUM_BUTTONS = 7;
	static Mark = {
		1: "1",
		0: "0",
	}

	static State = {
		START: "Make the buttons match",
		PLAYING: "You have taken 1 move so far",
		WIN: "You win in  move"
	}
	/** constructor */
	constructor() {
		this.board = [];
		this.count = 0;
		for (let k = 0; k < rh.Game.NUM_BUTTONS; k++) {
			var temp = Math.random();
			if (temp < 0.5) {
				this.board[k] = 1;
			} else {
				this.board[k] = 0;
			}

		}
		this.State = rh.Game.State.START;
		document.querySelector("#gameStateText").textContent = `Make the buttons match`;
	}

	pressedButtonAtIndex(buttonIndex) {
		// Controller is telling the Model to make a change
		if (this.isGameWon()) {
			return;
		}
		this.count++;
		document.querySelector("#gameStateText").textContent = `You have taken ${this.count} moves so far`;
		if(buttonIndex==0){
			if(this.board[0]==0){
				this.board[0]=1;
				
			}else if(this.board[0]==1){
				this.board[0]=0;
			}
			if(this.board[1]==0){
				this.board[1]=1;
			}else if(this.board[1]==1){
				this.board[1]=0;
			}
		}
		if(buttonIndex>=1 && buttonIndex<=6){
			if(this.board[buttonIndex]==0){
				this.board[buttonIndex]=1;
				
			}else if(this.board[buttonIndex]==1){
				this.board[buttonIndex]=0;
			}
			if(this.board[buttonIndex+1]==0){
				this.board[buttonIndex+1]=1;
			}else if(this.board[buttonIndex+1]==1){
				this.board[buttonIndex+1]=0;
			}
			if(this.board[buttonIndex-1]==0){
				this.board[buttonIndex-1]=1;
			}else if(this.board[buttonIndex-1]==1){
				this.board[buttonIndex-1]=0;
			}
		}
     if(this.isGameWon()==true){
		document.querySelector("#gameStateText").textContent = `You win in ${this.count} moves`;
		 this.State = rh.Game.State.WIN;
	 }
	}
	isGameWon() {
		// Check for a win
		console.log(this.board);
		let base = this.board[0]
		for (let i = 1; i < this.board.length; i++) {
			if (base != this.board[i]) {
				return false;
			}
		}
		return true;
	}
	getMarkAtIndex(buttonIndex) {
		// Returns "1", "0".
		return this.board[buttonIndex];
	}

}

rh.PageController = class {
	constructor() {
		this.game = new rh.Game();
		this.updateView();
		$("#gameBoard>button").click((event) => {
			// const buttonId = this.id.substring(6);
			const buttonId = $(event.target).data("id");
			console.log(buttonId);
			this.game.pressedButtonAtIndex(buttonId);
			this.updateView();
		});
		document.querySelector("#newGameButton").onclick = (event) => {
			this.game = new rh.Game();
			document.querySelector("#gameStateText").textContent = `Make the buttons match`;
			this.updateView();
		}
		// $("#newGameButton").click((event) => {
		// 	for (let k = 0; k < rh.Game.NUM_BUTTONS; k++) {
		// 		var temp = Math.random();
		// 		if (temp < 0.5) {
		// 			this.board[k] = 1;
		// 		} else {
		// 			this.board[k] = 0;
		// 		}
	
		// 	}
		// 	this.updateView();
		// });
	}
	updateView() {
		if(this.game.State== "WIN"){
			document.querySelector("#gameStateText").textContent = `You win in ${this.count} moves`;
		}
		if(this.game.State== "START"){
			document.querySelector("#gameStateText").textContent = `Make the buttons match`;
		}

		$("#gameBoard>button").each((index, item) => {
			$(item).html(this.game.getMarkAtIndex(index));
		});
		for(var i=0;i<7;i++){
			if(this.game.getMarkAtIndex(i)==1){
				$("#gameBoard>button").eq(i).css("background-color","orange");
			}else{
				$("#gameBoard>button").eq(i).css("background-color","grey");
			}
		} 
	}


}
/* Main */
$(document).ready(() => {
	console.log("Ready");
	new rh.PageController();
});