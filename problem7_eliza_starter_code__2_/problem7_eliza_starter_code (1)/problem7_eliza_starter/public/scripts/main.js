const apiURL = "http://localhost:3000/ElizaAPI"
var rhit = rhit || {};
rhit.conversation = [];

function main() {
  console.log("Ready");
  //get initial greeting from server and display in conversation
  getElizaInitialGreeting();

  document.querySelector("#askEliza").onclick = (event) => {
    askEliza();
    //clear the message textfield when send message button is clicked
    document.querySelector("#inputStatement").value = "";
  };

}

function updateView() {
  htmlContent = "";
  rhit.conversation.forEach(  (item, index) => {
    htmlContent += item + "<br>";
  });
  document.querySelector("#displayConversation").innerHTML = htmlContent;
}

/////////////////////////////////////////////////////////////////
//   YOU SHOULD NOT NEED TO CHANGE ANYTHING ABOVE THIS LINE    //
/////////////////////////////////////////////////////////////////


// This method should, instead of providing the default text, instead contact the 
// server with a GET request to  http://localhost:3000/ElizaAPI/getInitial
// then use the response to start the conversation as specified with the starting code.
function getElizaInitialGreeting() {
  fetch('http://localhost:3000/ElizaAPI/getInitial')
    .then(response => response.text())
    .then(data => {
      rhit.conversation.push("Eliza: " + data);
      updateView();
    })
    .catch(error => console.error('Error:', error));
    updateView();
}


function askEliza() {
  let statement = document.querySelector("#inputStatement").value;
  rhit.conversation.push("Me: " + statement);

  fetch('http://localhost:3000/ElizaAPI/getResponse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statement: statement }),
  })
    .then(response => response.text())
    .then(data => {
      rhit.conversation.push("Eliza: " + data);
      updateView();
    })
    .catch(error => console.error('Error:', error));
    updateView();
}

main();
