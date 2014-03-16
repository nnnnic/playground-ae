/*
if(!PS) {
    PS = {}
    PS.call = function() {}
    PS.log = function(txt) { console.log(txt);}
    PS.get = function() { return {msg:"PS not connected"}};
    PS.simpleGet = PS.get;
}
*/

try {PS.log("we have been called!");} catch(e) {}

var makeMapWithFn = function(arr,fn) {
    var rval = {}
    forEach(arr,function(elt) {
        console.log("'",elt,"'")
     rval[fn(elt)] = elt    
    })
    return rval
}

var forEach = function(arrayLike,fn) {
    for(var i = 0; i < arrayLike.length; i++)
        fn(arrayLike[i],i,arrayLike)
}

var filter = function(arrayLike,fn) {
    var rval = []
    for(var i = 0; i < arrayLike.length; i++) {
        var elt = arrayLike[i];
        if(fn(elt,i,arrayLike))
            rval.push(elt)
            }
    return rval
}

var map = function(arrayLike,fn) {
    var rval = []
    for(var i = 0; i < arrayLike.length; i++) {
        var elt = arrayLike[i];
        rval.push(fn(elt,i,arrayLike))
    }
    return rval
}

var getExtension = function(str) {
    console.log(str)
    return str.substring(str.lastIndexOf('.')+1)   
}
var allExtensions = function(arr) {

    return makeMapWithFn(arr, getExtension)  
}

var imgtypes = {png:1, svg:1, jpg:1}
var isImagePath = function(path) {
    return getExtension(path) in imgtypes 
}
var isCSSLink = function(link) { return link.rel === "stylesheet"}

onFilesChanged = function(arr) {
    console.log("!!!")
    console.log(arr.length, "filesChanged")
    var types = allExtensions(arr)
   console.log(types)
   if(types.js) {
        console.log("js changed. time to reload")
        location.reload();  
        console.log("do we still get called?")
        console.log("yes, yes we do")
   } else if (types.png || types.svg || types.jpg) {
       console.log("image changed")
       reloadImages(arr.filter(isImagePath))
   } else if (types.css) {
       reloadCSS(arr)
   }
}

//var keyFromUrl = function(url) {
// for(var key in url) {
//     console.log("url",url)
//    return key
// }
//}


var stripMunge = function(str) {
 var idx = str.indexOf('?')
 return idx == -1 ? str : str.substring(0,idx) + ')'
}
var mungeCounter = 0
var mungeUrl = function(str) {
    mungeCounter++
    return str.substring(0,str.length-1) + '?'+mungeCounter+ ')';
     
}

var reloadImages = function (arr) {
    console.log("input",arr)
    var urlMap = makeMapWithFn(arr, function(elt) { return "url(file://"+elt+")"})
    console.log(urlMap)

    
    
//    forEach(document.styleSheets,function(sheet) {
//        forEach(sheet.cssRules, function(rule){
//            var img = rule.style.backgroundImage
//            if(img.lenth > 0)
//                console.log(rule)
//        })
//    })

  //  console.log(document.all.length)
    forEach(document.all, function(elt) {
 //       console.log(elt.tagName, elt.style)
//        var img = keyFromUrl(elt.style.backgroundImage)
      var img = elt.style.backgroundImage + ""
      if(img.length == 0) img = window.getComputedStyle(elt).backgroundImage + ""
      if(img.length == 0 || img == "none")
          return
        
          
        img = stripMunge(img)
          console.log(img)
        
        if(img in urlMap) {
    //    if(urls.indexOf(img) != -1) {
            console.log("found it")
            // elt.style.setProperty("backgroundImage",)
            elt.style.backgroundImage  = mungeUrl(img)  
            console.log("ELT",elt)
            console.log("STYLE",elt.style)
            console.log("CSS",elt.style.cssText)
            console.log(" elt.style.backgroundImage  = '"+newImage+"'")
          //  elt.style.cssText = "backgroundImage:"+ newImage + ';'
            console.log(elt.style.backgroundImage)
        }
    })
    
//    reloadCSS(arr)   // cheap but slow -- should just run through and update the styles
}

reloadCSS = function(arr) {
    var links = document.getElementsByTagName("link")
    var cssLinks = filter(links,isCSSLink)
    var log = console.log
    var cb = function(link) { 
        console.log(link)
        var temp = link.href
        link.href = ""
        link.href = temp + "?"
    }
    console.log(links)
    forEach(cssLinks,cb)
}

var _layersObject = [];
var _timelinePixelWidth;

secondsToPixels = function(seconds) {
    var multiplicationFactor = parseFloat(Commands.getTimelineWidth()/Commands.getTimelineDuration());
    console.log("x = " + multiplicationFactor);
    console.log("seconds = " + seconds);

    return (multiplicationFactor * seconds);
}

Commands = {
    setViewerZoom: function(scale) {
        AE.executeExtendScript("app.activeViewer.views[0].options.zoom = " + scale);
    },

    setClassic: function() {},

    setTimelinePosition: function(time) {
        AE.executeExtendScript("app.project.selection[0].time = " + time);
        document.getElementById("frameSeek").value = time;

    },

    getTimelinePosition: function(time) {
        var position = parseFloat(AE.executeExtendScript("app.project.selection[0].time")).toFixed(2);
        document.getElementById("marker-time").innerHTML = position;

    },

    getTimelineWidth: function() {
        _timelinePixelWidth = document.getElementById("timeline-animation-width").offsetWidth;
        // console.log(_timelinePixelWidth)
        return _timelinePixelWidth;
    },

    getTimelineDuration: function() {
        var compDuration = parseFloat(AE.executeExtendScript("app.project.selection[0].duration")[0]);
        //var compFrameRate = AE.executeExtendScript("app.project.selection[0].frameRate")[0];
        document.getElementById("frameSeek").max = Math.round(compDuration);
        //document.getElementById("frameSeek").step = compDuration/compFrameRate;
        return compDuration;
    },

    getLayersFromComp: function() {
        // Only try this if we're dealing with a Composition, duh
        _layersObject = [];
        if (AE.executeExtendScript("app.project.selection[0].typeName")[0] == "Composition") {
            //console.log(AE.executeExtendScript("app.project.selection[0].layers[1]")[0]); 
            var numLayers = AE.executeExtendScript("app.project.selection[0].layers.length")[0];
            for(var i=0; i < numLayers; i++ ) {
                //AE layers start counting at 1, need to offset
                var AEindex = i + 1;
                if (AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"]")[0] == "[object ShapeLayer]") {
                    _layersObject.push({
                                    name: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].name")[0],
                                    type: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"]")[0],
                                    startTime: parseFloat(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].startTime")[0]),
                                    inPoint: parseFloat(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].inPoint")[0]),
                                    outPoint: parseFloat(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].outPoint")[0]),
                                    clipDuration: (AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].outPoint")[0] - AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].inPoint")[0]),
                                    locked: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].locked")[0],
                                    selected: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].selected")[0],
                                    visible: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].enabled")[0],
                                    fill: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].property(2).property(1).property(2).property(3).color.value")[0],
                                    stroke: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].property(2).property(1).property(2).property(2).color.value")[0],
                                    }); 
                } else {
                    _layersObject.push({
                                    name: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].name")[0],
                                    type: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"]")[0],
                                    startTime: parseFloat(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].startTime")[0]),
                                    inPoint: parseFloat(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].inPoint")[0]),
                                    outPoint: parseFloat(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].outPoint")[0]),
                                    clipDuration: (AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].outPoint")[0] - AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].inPoint")[0]),
                                    locked: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].locked")[0],
                                    selected: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].selected")[0],
                                    visible: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].enabled")[0],
                                    }); 
                };

            };
            return _layersObject;
        };
    },

    displayLayersFromComp: function() {
        Commands.getLayersFromComp();
        var textBuffer = [];
        for(var i = 0; i < _layersObject.length; i++) {
            var layer = _layersObject[i];
            textBuffer.push("<div class=\"timeline-title\">"+layer.name+"</div>");
            textBuffer.push("<div class=\"timeline-animation\" id=\"timeline-animation-width\">");
            textBuffer.push("<div class=\"timeline-animation-element ui-draggable\" style=\"left: " + secondsToPixels(layer.startTime) + "px; width: " + secondsToPixels(layer.clipDuration) + "px;\"></div>");
            textBuffer.push("<div class=\"icon-keyframe ui-draggable\" style=\"left: " + (secondsToPixels(layer.outPoint) - 20) + "px\"></div>");
            textBuffer.push("<div class=\"icon-keyframe ui-draggable\" style=\"left: " + secondsToPixels(layer.inPoint) + "px\"></div>");
            textBuffer.push("</div>");
            textBuffer.push("<div class=\"timeline-scrollspace\"></div>");
            textBuffer.push("</div>");
            console.log(secondsToPixels(layer.startTime))
        }
        //console.log(textBuffer)
        var text = String(textBuffer.join(""));
        document.getElementById("t-ObjectA").innerHTML = text;
    }


}
