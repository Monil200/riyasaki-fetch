/**
 * XULSchoolChrome namespace.
 */
if ("undefined" == typeof(XULSchoolChrome)) {
  var XULSchoolChrome = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
XULSchoolChrome.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */

  sayHello : function(aEvent) {
    let stringBundle = document.getElementById("xulschoolhello-string-bundle");
    let message = stringBundle.getString("xulschoolhello.greeting.label");

    window.alert(content.document.URL);
    //gBrowser.addTab("http://www.google.com/");
  }
};

// window.addEventListener("load", function () {
//   // Add a callback to be run every time a document loads.
//   // note that this includes frames/iframes within the document
// 	 gBrowser.addEventListener("load", pageLoad, true);
// }, false);
var container = gBrowser.tabContainer,
	oldTime=0,
	newTime=0,
	counterSeconds=0,
	interval; //times in ms since epoh

container.addEventListener("TabOpen", tabAdded, false);
container.addEventListener("TabSelect", tabSelected, false);
container.addEventListener("TabClose", tabRemoved, false);
container.addEventListener("TabAttrModified", tabAttrModified, false);

let timingCounter={};

function pageLoad(event) {
  if (event.originalTarget instanceof Components.interfaces.nsIDOMHTMLDocument) {
    var win = event.originalTarget.defaultView;
    if (win.frameElement) {      
       return;
    }
    else {
    	window.alert(content.document.URL);    	    	
    	if(timingCounter[content.document.URL]==undefined)    	
    		timingCounter[content.document.URL]=0;    
    }
  }
}
//---------------------------
function tabAdded(event) {
  var browserNewTab = gBrowser.getBrowserForTab(event.target);
  // browser is the XUL element of the browser that's been added  
  browserNewTab.addEventListener("load", pageLoad, true);
}
function tabSelected(event) {
  var browserTabSelected = gBrowser.selectedBrowser;
  //alert(browser.currentURI.spec+" Tab selected");
}
function tabRemoved(event) {
  var browserTabRemoved = gBrowser.getBrowserForTab(event.target);
  // browser is the XUL element of the browser that's been removed
  //newTime=(new Date()).getTime()
  timingCounter[content.document.URL]=counterSeconds;
  alert("The tab :"+content.document.URL+" was opened for "+timingCounter[content.document.URL]);

}
function tabAttrModified(event) {
  var tab = event.target;

  // Now you can check what's changed on the tab
  content.console.log(tab.selected);
  //oldTime=(new Date()).getTime();
  if(tab.selected) {    	
  	clearInterval(interval);
  	content.console.log("Resumed/started at : "+counterSeconds+" URL:"+content.document.URL);
  	interval=setInterval(function(){
  		counterSeconds++;
  		content.console.log(counterSeconds+" URL:"+content.document.URL)
  	},1000);
  }
  else {
  	clearInterval(interval);
  	content.console.log("Stopped at : "+counterSeconds+" URL:"+content.document.URL);
  }
}
