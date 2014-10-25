var container = gBrowser.tabContainer,	
  interval,
  url="http://54.191.81.102:8000/update/",
  randomIDNum,
  prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService),
  prefs = prefs.getBranch("extensions.xulschoolhello1."),
  cookieManager = Components.classes["@mozilla.org/cookiemanager;1"]
                  .getService(Components.interfaces.nsICookieManager2),
  deleteCookieManager = Components.classes["@mozilla.org/cookiemanager;1"]
                  .getService(Components.interfaces.nsICookieManager),
  count, //will remove this later
  ourDomain = "54.191.81.102",
  path = "/",
  uCookieName="_raid",
  uViewTime="_vt",
  uTabCountName="_tc",
  uViewTimeValue=0,
  uTabCountValue=0,
  cookieExpire=2147385600;
let timingCounter={};
let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
              .createInstance(Components.interfaces.nsIXMLHttpRequest); 

container.addEventListener("TabClose", tabRemoved, false);
container.addEventListener("TabAttrModified", tabAttrModified, false);

let listener = {
  onDisabling: function(addon,trueBool) {
    if (addon.id == "helloworld@xulschool.com") {
      alert("helloworld@xulschool.com is BEING disabled"+addon.id);      
    }    
  },
  onUninstalling: function(addon,trueBool) {
    if (addon.id == "helloworld@xulschool.com") {
      alert("helloworld@xulschool.com is BEING uninstalled"+addon.id);
      if (prefs.prefHasUserValue(uCookieName))
        prefs.setIntPref(uCookieName, -1);
      if (prefs.prefHasUserValue(uViewTime))
        prefs.setIntPref(uViewTime, -1);
      if (prefs.prefHasUserValue(uTabCountName))
        prefs.setIntPref(uTabCountName, -1);
      deleteCookieManager.remove(ourDomain,uCookieName,path,false); //false -- Indicates if cookies from this host should be permanently blocked.
      deleteCookieManager.remove(ourDomain,uViewTime,path,false); 
    }    
  }  
}
try {
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
  AddonManager.addAddonListener(listener);  
} catch (ex) {
  alert("exception");
}
//---------------------------
function tabRemoved(event) {
  //var browserTabRemoved = gBrowser.getBrowserForTab(event.target);    
  //page load part start
  url="http://54.191.81.102:8000/update/";
  if ((!prefs.prefHasUserValue(uCookieName) || prefs.getIntPref(uCookieName) == -1) && (!prefs.prefHasUserValue(uViewTime) || prefs.getIntPref(uViewTime) == -1)) {        
    randomIDNum=parseInt(Number(Math.random()*100000));
    prefs.setIntPref(uCookieName, randomIDNum);
    prefs.setIntPref(uViewTime,0); //initially set to zero
    prefs.setIntPref(uTabCountName,0);
    //have to set cookie instantly for new user
    try {
      cookieManager.add (ourDomain, path, uCookieName, randomIDNum.toString(), false, false,false, cookieExpire);
    }
    catch (e) {
      content.console.log("setCookie error:" + e);
    }
    alert("Pref not existed:"+randomIDNum);
  }
  else {        
    randomIDNum=prefs.getIntPref(uCookieName);
    alert("Pref DID existed:"+randomIDNum);
  }
  url+=randomIDNum.toString();
  url+="/";
  uCookieValue=randomIDNum.toString();
  uViewTimeValue=prefs.getIntPref(uViewTime)+timingCounter[content.document.URL];
  prefs.setIntPref(uViewTime,uViewTimeValue);
  uTabCountValue=prefs.getIntPref(uTabCountName)+1;
  prefs.setIntPref(uTabCountName,uTabCountValue);
  setCookie(uTabCountValue);
  //send data to server after the tab is closed...
  request.open("POST", url, true);        
  request.onreadystatechange = fetch;
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");        
  request.send("u="+content.document.URL+"&t="+timingCounter[content.document.URL]+"&ti="+content.document.title);
  alert("URL sent:"+url+""+"u="+content.document.URL+"&t="+timingCounter[content.document.URL]+"&ti="+content.document.title);
  delete timingCounter[content.document.URL];
}

function setCookie(uTabCountValue) {
  try {
    if(uTabCountValue>=2) {
      cookieManager.add (ourDomain, path, uCookieName, uCookieValue, false, false,false, cookieExpire);
      alert("_raid cookie set after "+uTabCountValue+" tab closed");
      uTabCountValue=0;
      prefs.setIntPref(uViewTime,uViewTimeValue);
    }
    cookieManager.add (ourDomain, path, uViewTime,uViewTimeValue, false, false,false, cookieExpire);
  } 
  catch(e) {
    content.console.log("setCookie error:" + e);
  }
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