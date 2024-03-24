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

	static NUM_BUTTONS = 9;
	static Mark = {
		1: "1",
		0: "0",
	}

	static State = {
		START: "Make the buttons match",
		PLAYING: "You have taken 1 move so far",
		WIN: "You win in 5 moves"
	}
	/** constructor */
	constructor() {
		this.board = [];
		for (let k = 0; k < rh.Game.NUM_BUTTONS; k++) {
			var temp = Math.random();
			if (temp < 0.5) {
				this.board[k] = 1;
			} else {
				this.board[k] = 0;
			}

		}
		this.State = rh.Game.State.START;
	
	}

	pressedButtonAtIndex(buttonIndex) {
		// Controller is telling the Model to make a change
		
		
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
		// Check for a win
		const linesOf3 = []; 
		linesOf3.push(this.board[0] + this.board[1] + this.board[2] + this.board[3]
			 + this.board[4] + this.board[5] + this.board[6]);
		for (const line of linesOf3) {
			if (line == "000000" ||line =="111111") {
				console.log("hello");
				document.querySelector("#gameStateText").innerHTML = "Win the Game";
				this.state = rh.Game.State.WIN;
			} 
		}
		
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
	}
	updateView() {
		$("#gameStateText").html("Make the buttons match");
		$("#gameBoard>button").each((index, item) => {
			$(item).html(this.game.getMarkAtIndex(index));
		});
	}


}
/* Main */
$(document).ready(() => {
	console.log("Ready");
	new rh.PageController();
});