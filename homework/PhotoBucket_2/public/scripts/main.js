/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

rhit.FB_COLLECTION_PHOTO = "Photo";
rhit.FB_KEY_URL = "URL";
rhit.FB_KEY_CAPTION = "Caption";
rhit.FB_KEY_LAST_TOUCHED = "last Touch";
rhit.fbPhotoBucketManager = null;

rhit.ListPageController = class{
	constructor(){
		console.log("Create the list page controller");
	}
	updateList(){

	}

}
rhit.PhotoBucket = class{
	constructor(id,url,caption) {
		this.id = id;
		this.url = url;
		this.caption = caption;
	}
}
rhit.FBPhotoBucketManager = class{
	constructor() {
		console.log("Create PhotoBucket Manager");
		this.__documentSnapshots = [];
		this.__ref = firebase.firestore().collection(rhit.FB_COLLECTION_PHOTO);
	}
	add(url,caption){}
	beginListening(changeListener){}
	stopListening(){}

	get length(){}
	getPhotoBucketAtIndex(index){}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	if(document.querySelector("#listPage")){
		console.log("You are on the list page");
		rhit.fbPhotoBucketManager = new rhit.FBPhotoBucketManager();
		new rhit.ListPageController();
	}
	if(document.querySelector("#detailPage")){
		console.log("You are on the detail page");
	}
	
	
};

rhit.main();
