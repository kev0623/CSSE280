const apiURL = "http://localhost:3000/api/"

function main() {
  console.log("Ready");

  if (document.querySelector("#createButton")) {
    document.querySelector("#createButton").onclick = (event) => {
      createCharacter();
    };
  }

  if (document.querySelector("#updateButton")) {
    //load content into textfields when viewing the update page
    loadCharacter();
    
    document.querySelector("#updateButton").onclick = (event) => {
      //NOTE must complete this method (can be found below)
      updateCharacter();
    };
  }

  if (document.querySelector("#displayCharacters") ){
    loadCharacters(); //get the data from server and populate our page
  }

  if (document.querySelector("#randomizeButton")) {
    document.querySelector("#randomizeButton").onclick = (event) => {
      //NOTE must complete this method (can be found below)
      loadRandomCharacter();
    };
  }

/////////////////////////////////////////////////////////////////
//   YOU SHOULD NOT NEED TO CHANGE ANYTHING ABOVE THIS LINE    //
/////////////////////////////////////////////////////////////////


}




function loadRandomCharacter() {
  console.log("loadRandomCharacter() called");
  //TODO - complete this method
  // Load a random character using a  GET api/randomCharacter  ENDPOINT
  // Should update the textfields but NOT actually create a character
  // UNTIL the user clicks the CREATE character button

}


function updateCharacter( ) {
  console.log("updateCharacter() called");
  //TODO complete this method
  // You should attempt to update the character
  // which is presently loaded on the page
  
}

// This method MAY need to be updated if you add DELETE buttons 
// on the main inex.html page
function loadCharacters() {

  document.querySelector("#displayCharacters").innerHTML ="";
  let allEntries = fetch( apiURL )
    .then( response => response.json() )
    .then( data => {
      for (let i=0; i< data.length; i++) {
        console.log( "character id: "+ data[i]._id );
        document.querySelector("#displayCharacters").innerHTML += 
        `<button onclick=editCharacter('${ data[i]._id }');   >Edit</button>` +
        `<label>${data[i].name}` +
        ` (${data[i].level})</label><br>`;
      }
    });
}



/////////////////////////////////////////////////////////////////
//   YOU SHOULD NOT NEED TO CHANGE ANYTHING BELOW THIS LINE    //
/////////////////////////////////////////////////////////////////

function editCharacter( id ) {
  sessionStorage["selected_id"] = id;
  window.location.href = "update.html";
}

function loadCharacter( ) {
  let id = sessionStorage["selected_id"];
  
  fetch( apiURL + "id/" + id)
  .then( response => response.json() )
  .then( data => {
    document.querySelector("#inputName").value = data.name;
    document.querySelector("#inputHouse").value = data.house;
    document.querySelector("#inputLevel").value = data.level;
    
  })
  .catch( err => {
    console.log(err);
  });
}

function createCharacter() {

  let name = document.querySelector("#inputName").value;
  let house = document.querySelector("#inputHouse").value;
  let level = document.querySelector("#inputLevel").value;
  let data ={  "name":name, "house":house, "level": level };

  fetch( apiURL, {
    method: "POST",
    headers: { "Content-Type": 'application/json'},
    body: JSON.stringify( data )
  } )
    .then( data => {

      if (data.status == 201) {
        //redirect to view index page
        window.location.href="index.html";
      }
    })
    .catch(  (err) => {
      console.log(err);
    });
}


main();
