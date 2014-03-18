// IDs needed ——— ADD NEW BUTTONS HERE
var helpBtn = document.getElementById("btn-help");
var helpBtn = document.getElementById("btn-help");
var theOverlay = document.getElementById("overlay");
var btnShowTools = document.getElementById("show-tools");

var startBtn = document.getElementById("btn-start");
var cancelBtn = document.getElementById("btn-cancel");

// the steps
var blockOne = document.getElementById("step-one");
var blockTwo = document.getElementById("step-two");

// guides
var howtoTools = document.getElementById("howto-tools");

// initiate help
helpBtn.onclick = startWizard;
btnShowTools.onclick = guideTools;


function startWizard() {

  console.log("Starting the guide");

  theOverlay.className = 'on';
  blockOne.className = "guide-block on";

	startBtn.onclick = function() {
		stepTwo();
	}

// setup all the clicks
	cancelBtn.onclick = killGuide;

  helpBtn.className = "icomatic off";
  howtoTools.className = "coachmark off";
}

function stepTwo() {
  blockOne.className = "guide-block fall";
	blockTwo.className = "guide-block on";
  howtoTools.className = "coachmark off";
theOverlay.className = "on";
}

function guideTools() {
  console.log("Showing you how to use tools.");
  howtoTools.className = "coachmark on";
  blockTwo.className = "guide-block off";
  theOverlay.className = "on reveal-timeline";
}

function killGuide() {
	theOverlay.className = "off";
  helpBtn.className = "icomatic on";

  blockOne.className = "guide-block fall off";
  blockTwo.className = "guide-block fall off";
}

window.onload = startWizard;
