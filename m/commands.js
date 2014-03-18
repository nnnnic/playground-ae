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
var _timelineDuration;
var _selectedComp = [];
var _framesPerSecond;

secondsToPixels = function(seconds) {
    var multiplicationFactor = parseFloat(Commands.getTimelineWidth() / Commands.getTimelineDuration());
    //console.log(multiplicationFactor * seconds)
    return (multiplicationFactor * seconds);
}

frameToSeconds = function(frames) {

    return(frames / Commands.getFrameRate());

}

oneFrame = function() {
    var multiplicationFactor = (parseFloat(_timelineDuration) / _framesPerSecond) / 10;
    return multiplicationFactor;
}

logslider = function(position) {
  // position will be between 0 and 100
  var minp = oneFrame();
  var maxp = Commands.getTimelineDuration();
  console.log(maxp)
  // The result should be between 100 an 10000000
  var minv = Math.log(secondsToPixels(oneFrame()));
  var maxv = Math.log(secondsToPixels(Commands.getTimelineDuration()));
  console.log(maxv)
  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);
  console.log(scale)
  console.log(minv + scale*(position-minp));
  return Math.exp(minv + scale*position-minp);
}

Commands = {
    setViewerZoom: function(scale) {
        AE.executeExtendScript("app.activeViewer.views[0].options.zoom = " + scale);
    },

    setClassic: function() {},

    initView: function() {
        Commands.getFramesPerSecond();
        Commands.displayLayersFromComp();
        Commands.setCompName();
        Commands.setTimelinePosition(Commands.getTimelinePosition());
    },

    setPlay: function() {

        AE.executeExtendScript("app.executeCommand(app.findMenuCommandId(\"RAM Preview\"))");

    },

    setFrameBack: function() {

        var currentFrame = AE.activeItem.frame;
        if (currentFrame > 1) {
            AE.activeItem.frame = Math.round(currentFrame - 1);
            Commands.setTimelinePosition(frameToSeconds(AE.activeItem.frame));
            //console.log(AE.activeItem.frame)
            Commands.getTimelinePosition();
        }

    },

    setFrameForward: function() {
        var currentFrame = AE.activeItem.frame;
        if (currentFrame < (_selectedComp[0].duration * _framesPerSecond)) {
            AE.activeItem.frame = Math.round(currentFrame + 1);
            Commands.setTimelinePosition(frameToSeconds(AE.activeItem.frame));
            Commands.getTimelinePosition();
        }
    },

    setPositionToBeginning: function() {

        Commands.setTimelinePosition(0);
        Commands.getTimelinePosition();

    },

    setPositionToEnd: function() {

        Commands.setTimelinePosition(_selectedComp[0].duration);
        Commands.getTimelinePosition();

    },

    setCompName: function() {
        var compDimensions = Commands.getCompDimensions();
        document.getElementById("info-composition").innerText = Commands.getCompName() + " " + compDimensions.width + "x" + compDimensions.height;
    },

    setTimelinePosition: function(time) {
        AE.executeExtendScript("app.project.selection[0].time = " + time);
        document.getElementById("frameSeek").value = time;
        document.getElementById("marker-time").innerHTML = Commands.displayFrames(time);
        document.getElementById("playhead").style.left = secondsToPixels(Math.floor(time))+"px";

    },

    getFramesPerSecond: function() {
        _framesPerSecond = AE.executeExtendScript("app.project.selection[0].frameRate")[0];
        return _framesPerSecond;

    },

    getTimelinePosition: function() {
        Commands.getTimelineDuration()
        var positionInSeconds = parseFloat(AE.executeExtendScript("app.project.selection[0].time"));
        document.getElementById("marker-time").innerHTML = Commands.displayFrames(positionInSeconds);
        document.getElementById("playhead").style.left = (secondsToPixels(positionInSeconds)*.89)+"px";
        return positionInSeconds;

    },

    getTimelineWidth: function() {
        _timelinePixelWidth = document.getElementById("timeline-animation-width").offsetWidth;
        // console.log(_timelinePixelWidth)
        return _timelinePixelWidth;
    },

    getTimelineDuration: function() {
        _timelineDuration = _selectedComp[0].duration;
        _framesPerSecond = _selectedComp[0].frameRate;
        document.getElementById("frameSeek").max = Math.round(_timelineDuration);
        document.getElementById("frameSeek").step = (_timelineDuration/_framesPerSecond) / 25;
        //document.getElementById("frameSeek").step = _timelineDuration/_framesPerSecond;
        return _timelineDuration;
    },

    getFrameRate: function() {

        return _selectedComp[0].frameRate;

    },

    getCompName: function() {

        return _selectedComp[0].name;
    },

    getLayerDimensions: function(layerIndex) {
        var dimensions = {
                            width: _layersObject[layerIndex].width,
                            height: _layersObject[layerIndex].height
                        };
        return dimensions;
    },

    getCompDimensions: function() {
        var dimensions = {
                            width: _selectedComp[0].width,
                            height: _selectedComp[0].height
                        };
        return dimensions;
    },

    getSelectedLayerInfo: function() {

        var selectedLayersLength = parseInt(AE.executeExtendScript("app.project.selection[0].selectedLayers.length")[0]);
        var selectedLayers = [];
        for (i=0; i<selectedLayersLength; i++) {
            var layerIndex = parseInt(AE.executeExtendScript("app.project.selection[0].selectedLayers[" + i + "].index")[0]);
            //offset index because our _layersObject starts counting at 0 and AEs layers begin at 1
            selectedLayers.push(_layersObject[layerIndex-1]);
        }

        return selectedLayers;

    },

    getBinData: function() {
        _selectedComp = [];
        if (AE.executeExtendScript("app.project.activeItem")[0] !== "null") {
            switch (AE.executeExtendScript("app.project.selection[0].typeName")[0])
            {
                case "Composition":
                _selectedComp.push({
                                    name: AE.executeExtendScript("app.project.selection[0].name")[0],
                                    duration: parseFloat(AE.executeExtendScript("app.project.selection[0].duration")[0]),
                                    frameRate: parseFloat(AE.executeExtendScript("app.project.selection[0].frameRate")[0]),
                                    layerNum: parseInt(AE.executeExtendScript("app.project.selection[0].layers.length")[0]),
                                    type: AE.executeExtendScript("app.project.selection[0].typeName")[0],
                                    width: AE.executeExtendScript("app.project.selection[0].width")[0],
                                    height: AE.executeExtendScript("app.project.selection[0].height")[0],
                                    });
                //console.log(_selectedComp[0].type === "Composition")
                break;
                case "Footage":
                _selectedComp.push({
                                    name: AE.executeExtendScript("app.project.selection[0].name")[0],
                                    duration: parseFloat(AE.executeExtendScript("app.project.selection[0].duration")[0]),
                                    frameRate: parseFloat(AE.executeExtendScript("app.project.selection[0].frameRate")[0]),
                                    type: AE.executeExtendScript("app.project.selection[0].typeName")[0],
                                    });
                break;
                case "Folder":
                _selectedComp.push({
                                    name: AE.executeExtendScript("app.project.selection[0].name")[0],
                                    type: AE.executeExtendScript("app.project.selection[0].typeName")[0],
                                    items: AE.executeExtendScript("app.project.selection[0].numItems")[0],
                                    });
                break;
                default:
                _selectedComp.push({
                                    name: AE.executeExtendScript("app.project.selection[0].name")[0],
                                    type: AE.executeExtendScript("app.project.selection[0].typeName")[0],
                                    });
            }
            return _selectedComp;
        } else { console.log("Nothing selected in Bin") }
    },

    getLayersFromComp: function() {
        // Only try this if we're dealing with a Composition, duh
        Commands.getBinData();
        //set first element in _layersObject to be null, so that we can use AE indexes to call layers
        _layersObject = [];
        if (_selectedComp[0] && (_selectedComp[0].type === "Composition")) {
            //console.log(AE.executeExtendScript("app.project.selection[0].layers[1]")[0]);
            var numLayers = _selectedComp[0].layerNum;
            for(var i=0; i < numLayers; i++ ) {
                //AE layers start counting at 1, need to offset
                var AEindex = i + 1;
                switch (AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"]")[0])
                {
                    case "[object ShapeLayer]":
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
                                    width: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].width")[0],
                                    height: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].height")[0],
                                    audioActive: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].audioActive")[0],
                                    blendMode: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].blendingMode")[0],
                                    fill: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].property(2).property(1).property(2).property(3).color.value")[0],
                                    stroke: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].property(2).property(1).property(2).property(2).color.value")[0],
                                    });
                    break;
                    case "[object CameraLayer]":
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
                                    audioActive: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].audioActive")[0],
                                    blendMode: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].blendingMode")[0],
                                    });
                    break;
                    default:
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
                                    width: parseInt(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].width")[0]),
                                    height: parseInt(AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].height")[0]),
                                    audioActive: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].audioActive")[0],
                                    blendMode: AE.executeExtendScript("app.project.selection[0].layers["+AEindex+"].blendingMode")[0],
                                    });
                };

            };
            return _layersObject;
        } else { return null };
    },

    displayLayersFromComp: function() {

        if (Commands.getLayersFromComp()) {
            var textBuffer = [];
            for(var i = 0; i < _layersObject.length; i++) {
                var layer = _layersObject[i];
                if(layer === "null") { continue };
                textBuffer.push("<li class=\"timeline-layer\">");
                textBuffer.push("<header class=\"timeline-title\">"+layer.name+"</header>");
                textBuffer.push("<div ondragenter=\"return dragEnter(event)\" ondrop=\"return dragDrop(event)\" ondragover=\"return dragOver(event)\" class=\"timeline-animation\" id=\"timeline-animation-width\">");
                textBuffer.push("<div draggable = \"true\" class=\"timeline-animation-element\" style=\"left: " + secondsToPixels(layer.inPoint) + "px; width: " + secondsToPixels(layer.clipDuration) + "px;\"></div>");
                textBuffer.push("<div draggable = \"true\" class=\"icon-keyframe\" style=\"left: " + (secondsToPixels(layer.outPoint) - 20) + "px\"></div>");
                textBuffer.push("<div draggable = \"true\" class=\"icon-keyframe\" style=\"left: " + secondsToPixels(layer.inPoint) + "px\"></div>");
                textBuffer.push("</div>");
                textBuffer.push("</div>");
                textBuffer.push("</li>");
            }
            //console.log(textBuffer)
            var text = String(textBuffer.join(""));
            document.getElementById("t-object").innerHTML = text;
            Commands.getTimelinePosition();
        }
    },

    displayFrames: function(inputInSeconds) {
        var sec_num = parseInt(inputInSeconds, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var frames;

        if ((inputInSeconds *_framesPerSecond)  < _framesPerSecond) {

            frames = Math.floor(inputInSeconds * _framesPerSecond);
            
        } else { 

            frames = Math.floor((inputInSeconds * _framesPerSecond) % (seconds * _framesPerSecond)); 
        }

        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        if (frames < 10) {frames = "0"+frames;}
        if (frames < 1) {frames = "00";}
        var time    = hours+':'+minutes+':'+seconds+':'+frames;
        return time;
    }


}
