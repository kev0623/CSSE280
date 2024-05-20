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
  //TODO: modify this method to contact the server instead of using default text
  //HINT: be sure to call updateView() AFTER you get a response from the server


  // fetch('http://localhost:3000/ElizaAPI/getInitial')
  // .then(response => response.text())
  // .then(data => {
  //   rhit.conversation.push("Eliza: " + data);
  //   updateView();
  // })
  // .catch(error => console.error('Error:', error));

  // let serverResponse = "Some text that should come from the server";
  // rhit.conversation.push(  "Eliza: " + serverResponse );
  // updateView();


  fetch('http://localhost:3000/ElizaAPI/getInitial')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // assuming the response is plain text
    })
    .then(serverResponse => {
      // Use the server response to start the conversation
      rhit.conversation.push("Eliza: " + serverResponse);
      updateView();
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      // Fallback to default text in case of error
      let serverResponse = "Sorry, I couldn't connect to the server.";
      rhit.conversation.push("Eliza: " + serverResponse);
      updateView();
    });

}


function askEliza() {
  //The next two lines of code should not need to be modified
  let statement = document.querySelector("#inputStatement").value;
  rhit.conversation.push( "Me: " + statement );

  //TODO: complete this method
  //HINT: be sure to call updateView() AFTER you get a response from the server
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
  
  updateView();

}



main();
