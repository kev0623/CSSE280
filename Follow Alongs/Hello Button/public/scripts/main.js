var counter = 0;


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
    document.querySelector("#incButton").onclick =(event) => {
        console.log("Increment");
        counter = counter +1;
        updateView();
    }
}

function updateView(){
    // document.querySelector("#countText").innerHTML = "Count = "+counter;
    document.querySelector("#countText").innerHTML = `Count = ${counter}`;

}

main();