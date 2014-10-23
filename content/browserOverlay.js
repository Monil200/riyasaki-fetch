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
  }
};

var container = gBrowser.tabContainer,	
  interval,
  url="http://54.191.81.102:8000/update/123"
  //url="http://127.0.0.1/riyasaki/receive.php";
  //url="http://cs-server.usc.edu:12211/examples/servlet/StockXML1?symbol=goog";
let timingCounter={};
let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
              .createInstance(Components.interfaces.nsIXMLHttpRequest);

let myFile;

container.addEventListener("TabOpen", tabAdded, false);
container.addEventListener("TabSelect", tabSelected, false);
container.addEventListener("TabClose", tabRemoved, false);
container.addEventListener("TabAttrModified", tabAttrModified, false);

function getLocalDirectory() {
  let directoryService =
    Cc["@mozilla.org/file/directory_service;1"].
      getService(Ci.nsIProperties);
  // this is a reference to the profile dir (ProfD) now.
  let localDir = directoryService.get("ProfD", Ci.nsIFile);
  localDir.append("XULSchoolNew");
  if (!localDir.exists() || !localDir.isDirectory()) {
    // read and write permissions to owner and group, read-only for others.
    localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
  }

  return localDir;
  }
function pageLoad(event) {
  if (event.originalTarget instanceof Components.interfaces.nsIDOMHTMLDocument) {
    var win = event.originalTarget.defaultView;    
    if (win.frameElement) {      
       return;
    }
    else {
      // if(timingCounter[content.document.URL]==undefined)      
      //   timingCounter[content.document.URL]=0;    
      myFile = getLocalDirectory();
      myFile.append("/abc.txt");
      //content.console.log("File created @ "+File(myFile.path));
      content.console.log("URL added :"+content.document.URL+" value:"+timingCounter[content.document.URL]);

    }
  }
}
//---------------------------
function tabAdded(event) {
  var browserNewTab = gBrowser.getBrowserForTab(event.target);
  content.console.log("New tab added");  
  browserNewTab.addEventListener("load", pageLoad, true);
}
function tabSelected(event) {
  var browserTabSelected = gBrowser.selectedBrowser;
  //alert(browser.currentURI.spec+" Tab selected");
}
function tabRemoved(event) {
  var browserTabRemoved = gBrowser.getBrowserForTab(event.target);  
  alert("The tab :"+content.document.URL+" was opened for "+timingCounter[content.document.URL]);
  //send data to server after the tab is closed...

  request.open("POST", url, true);        
  request.onreadystatechange = fetch;
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");        
  request.send("u="+content.document.URL+"&t="+timingCounter[content.document.URL]+"&ti="+content.document.title);

  content.console.log("Deleted from obj : "+content.document.URL);
  delete timingCounter[content.document.URL];
}
function tabAttrModified(event) {
  var tab = event.target; 
  content.console.log(tab.selected);
  if(timingCounter[content.document.URL]==undefined)      
        timingCounter[content.document.URL]=0;
  if(tab.selected && content.document.URL!="about:blank" && content.document.URL!="about:addons" && content.document.URL!="about:newtab") {    	
  	clearInterval(interval);
  	content.console.log("Resumed/started at : "+timingCounter[content.document.URL]+" URL:"+content.document.URL);
  	interval=setInterval(function(){
  		timingCounter[content.document.URL]++;
  		content.console.log("Inside tabAttrModified "+timingCounter[content.document.URL]+" URL:"+content.document.URL);
  		if(timingCounter[content.document.URL]%20==0) {        
  		  content.console.log("--------------Logging start-----------------");
        // request.open("POST", url, true);        
        // request.onreadystatechange = fetch;
        // request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");        
        // request.send("u="+content.document.URL+"&t="+timingCounter[content.document.URL]);
        //request.send(null);
  			for(var propertyName in timingCounter) {			   
			   content.console.log(timingCounter[propertyName]+" URL:"+propertyName);
			}
			  content.console.log("--------------Logging End-----------------");        
  		}
  	},1000);
  }
  else {
  	clearInterval(interval);
  	content.console.log("Stopped at : "+timingCounter[content.document.URL]+" URL:"+content.document.URL);
  }
}
function fetch() {
  if(request.status==200 && request.readyState==4) {
    try {
      //content.console.log("Received Data:"+JSON.stringify(JSON.parse(request.responseText)));
      content.console.log("Received Data:"+(request.responseText));
    }
    catch (e) {
    }
  }
}