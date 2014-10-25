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
  url="http://54.191.81.102:8000/update/",
  randomIDNum,
  prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService),
  prefs = prefs.getBranch("extensions.xulschoolhello1."),
  cookieManager = Components.classes["@mozilla.org/cookiemanager;1"]
                  .getService(Components.interfaces.nsICookieManager2),
  count;
  //url="http://cs-server.usc.edu:12211/examples/servlet/StockXML1?symbol=goog";
  // cookieUri = Components.classes["@mozilla.org/network/io-service;1"]
  //   .getService(Components.interfaces.nsIIOService)
  //   .newURI(url, null, null),
  // cookieString,
  // ourDomain="http://54.191.81.102:8001",
let timingCounter={};
let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
              .createInstance(Components.interfaces.nsIXMLHttpRequest); 

container.addEventListener("TabOpen", tabAdded, false);
container.addEventListener("TabClose", tabRemoved, false);
container.addEventListener("TabAttrModified", tabAttrModified, false);

let listener = {
  onDisabling: function(addon,trueBool) {
    if (addon.id == "helloworld@xulschool.com") {
      alert("helloworld@xulschool.com is BEING disabled"+addon.id);
    }    
  },
  onDisabled: function(addon) {
    if (addon.id == "helloworld@xulschool.com") {
      alert("helloworld@xulschool.com is disabled"+addon.id);
    }    
  },
  onUninstalling: function(addon,trueBool) {
    if (addon.id == "helloworld@xulschool.com") {
      alert("helloworld@xulschool.com is BEING uninstalled"+addon.id);
    }    
  }  
}
try {
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
  AddonManager.addAddonListener(listener);  
} catch (ex) {
  alert("exception");
}
function pageLoad(event) {
  if (event.originalTarget instanceof Components.interfaces.nsIDOMHTMLDocument) {
    var win = event.originalTarget.defaultView;    
    if (win.frameElement) {      
       return;
    }
    else {         
      url="http://54.191.81.102:8000/update/";
      if (!prefs.prefHasUserValue("xyz")) {        
        randomIDNum=parseInt(Number(Math.random()*100000));
        prefs.setIntPref("xyz", randomIDNum);        
        alert("Pref not existed:"+randomIDNum);
      }
      else {        
        randomIDNum=prefs.getIntPref("xyz");
        alert("Pref DID existed:"+randomIDNum);
      }
      url+=randomIDNum.toString();
      url+="/";      
      // cookieString="uniqueID="+randomIDNum.toString()+";domain="+ourDomain+";path=/";
      // Components.classes["@mozilla.org/cookieService;1"]
      //           .getService(Components.interfaces.nsICookieService)
      //           .setCookieString(cookieUri, null, cookieString, null);
      //alert("Cookie set to"+cookieString);
      // Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).add(encodeURI("monil.com"),encodeURI("/"),"x1","y",false,false,true,3600);
      // Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2).add(encodeURI("monil.com"),encodeURI("/"),"a1","b",false,false,true,3600);
      //second cookie way      
      //alert(count.length);
      //alert(cookieManager.countCookiesFromHost("facebook.com"));
      //alert(cookieManager.countCookiesFromHost("bing.com"));      
      var domainn = "54.191.81.102"
      var pathn = "/";
      var cookienamen="randomID";
      var cookievaluen=randomIDNum.toString();
      var cookieexpiren=2147385600;
      try {
        var obj = Components.classes["@mozilla.org/cookiemanager;1"].
            getService(Components.interfaces.nsICookieManager2);
        obj.add (domainn, pathn, cookienamen, cookievaluen, false, false,false, cookieexpiren);
      } 
      catch(e) {
          content.console.log("setCookie error:" + e);
        }
      count= cookieManager.getCookiesFromHost("54.191.81.102");
      while (count.hasMoreElements()){
        var cookie = count.getNext();       
        if (cookie instanceof Ci.nsICookie){ //Components.interfaces
            content.console.log(cookie.host);
            content.console.log(cookie.name);
            content.console.log(cookie.value);
        }
      } //check cookie from domain working well            
    }
  }
}
//---------------------------
function tabAdded(event) {
  var browserNewTab = gBrowser.getBrowserForTab(event.target);
  content.console.log("New tab added");  
  browserNewTab.addEventListener("load", pageLoad, true);
}
function tabRemoved(event) {
  var browserTabRemoved = gBrowser.getBrowserForTab(event.target);    
  //send data to server after the tab is closed...
  request.open("POST", url, true);        
  request.onreadystatechange = fetch;
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");        
  request.send("u="+content.document.URL+"&t="+timingCounter[content.document.URL]+"&ti="+content.document.title);
  alert("URL sent:"+url+""+"u="+content.document.URL+"&t="+timingCounter[content.document.URL]+"&ti="+content.document.title);
  delete timingCounter[content.document.URL];
}
function tabAttrModified(event) {
  var tab = event.target;
  content.console.log(tab.selected);
  if(tab.selected && content.document.URL!="about:blank" && content.document.URL!="about:addons" && content.document.URL!="about:newtab") {
    if(timingCounter[content.document.URL]==undefined)      
        timingCounter[content.document.URL]=0;
  	clearInterval(interval);
  	content.console.log("Resumed/started at : "+timingCounter[content.document.URL]+" URL:"+content.document.URL);
  	interval=setInterval(function(){
  		timingCounter[content.document.URL]++;
  		content.console.log("Inside tabAttrModified "+timingCounter[content.document.URL]+" URL:"+content.document.URL);
  		if(timingCounter[content.document.URL]%20==0) {
  		  content.console.log("--------------Logging start-----------------");
  			for(var propertyName in timingCounter) {			   
			   content.console.log(timingCounter[propertyName]+" URL:"+propertyName);
			}
			  content.console.log("--------------Logging End-----------------");
  		}
  	},1000);
  }
  else {
  	clearInterval(interval);
  	//content.console.log("Stopped at : "+timingCounter[content.document.URL]+" URL:"+content.document.URL);
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