/*
                           --==Pixel Stats v1.1 (JS)==--
                              Scripting: Haloflooder
                                  Idea: CopherNeue

                                    Description
Counts the pixels and prints out the rgb value of all the colors along with the percentage!

                                GUI.xml requirement
Need to have these tags inside of <menu text="Scripts"> in the gui.xml file.

          <item command="RunScript" text="Image/Pixel statistics">
            <param name="filename" value="pixel_stats.js" />
          </item>

*/
var execTime = Date.now();

// Change this value to true if you want the script to run a tad bit faster
// If set to true, the console output won't be pretty
var speedMeUp = false;

// Change this value to false if you want the script to run a lot faster
// If set to false, the script won't show you the group of colors the pixels are in (red, orange, etc)
var showGroupedColors = true;

// Change these values to whatever you think is the minimum value to white
// example: I personally think anything that's lower than 16 (16,16,16) is black!
// Example: Well I think anything that's higher than 239 (239,239,239) is white!
var considerBlack = 16;
var considerWhite = 239;

// Shows more info about the code execution
var debug = false;


// Let the gibberish code begin!

var pc = app.pixelColor;
var img = app.activeImage;
var sel = app.activeSprite.selection
var selected = true;
var box = sel.bounds;
if (box.width == 0 && box.height == 0) {
	box = Rectangle(0,0,img.width,img.height);
	selected = false;
}

var colorData = [];
var pixelAmt = box.width*box.height;

var hsvData = [];
var hsvColors = [
	"Red",
	"Orange",
	"Yellow",
	"Yellow Green",
	"Green",
	"Green Cyan",
	"Cyan",
	"Blue Cyan",
	"Blue",
	"Blue Magenta",
	"Magenta",
	"Red Magenta",
];
var justGray = 0;
var justWhite = 0;
var justBlack = 0;

for (var i=0; i<hsvColors.length; i++) {
	hsvData[i] = 0;
}

// Random functions start here
// RGB to HSV converter
function rgb2hsv(r, g, b) { 
	r /= 255, g /= 255, b /= 255;

	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max == 0 ? 0 : d / max;

	if (max == min) {
		h = 0;
	} else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [ 
		h * 255, 
		s * 255, 
		v * 255
	];
}

// Oh boy... This was annoying to make but it'll be useful for other scripts
// This is to help get the text width
// Please forgive me for the "one" line of arrays

var charCodes = [];
for (var i=0; i<128; i++) {
	charCodes[i] = 5;
}
charCodes[32] = 4;charCodes[33] = 2;charCodes[34] = 4;charCodes[35] = 6;charCodes[36] = 6;charCodes[37] = 6;charCodes[38] = 6;charCodes[39] = 3;charCodes[40] = 3;charCodes[41] = 3;charCodes[42] = 6;charCodes[43] = 6;charCodes[44] = 6;charCodes[45] = 4;charCodes[46] = 2;charCodes[47] = 4;charCodes[49] = 3;charCodes[58] = 2;charCodes[59] = 2;charCodes[60] = 4;charCodes[62] = 4;charCodes[63] = 4;charCodes[64] = 9;charCodes[73] = 2;charCodes[74] = 3;charCodes[77] = 6;charCodes[79] = 6;charCodes[81] = 6;charCodes[84] = 6;charCodes[86] = 6;charCodes[87] = 8;charCodes[88] = 6;charCodes[89] = 6;charCodes[91] = 3;charCodes[92] = 4;charCodes[93] = 3;charCodes[94] = 6;charCodes[95] = 6;charCodes[96] = 4;charCodes[102] = 4;charCodes[105] = 2;charCodes[106] = 3;charCodes[108] = 2;charCodes[109] = 8;charCodes[114] = 4;charCodes[115] = 4;charCodes[116] = 3;charCodes[119] = 6;charCodes[120] = 6;charCodes[123] = 4;charCodes[124] = 2;charCodes[125] = 4;


// This function counts the amount of pixels in the Aseprite text. This heavily
// relies on the default font Aseprite uses for the UI.
function textWidth(str) {
	var w = 0;
	str = str+"";
	for (var i=0; i<str.length; i++) {
		w += charCodes[str.charCodeAt(i)];
	}
	return w; // Returns the width
}

// Unfortunately, the only way we create a spacer for smaller pixels is to fill it in with colons
function createSpacer(str,maxstr) {
	var spacer = "";
	if (!speedMeUp) {
		var w = textWidth(str);
		var maxW = textWidth(maxstr);
		var calc = (maxW-w)/4;
		
		var repeater = Math.floor(calc);
		
		for (var i=0; i<repeater; i++) {
			spacer = spacer+" ";
		}
		if (calc-repeater >= .5) {
			spacer = ":"+spacer;
		}
	}
	return spacer;
}

if (debug) {
	console.log(" ");
	console.log("[DEBUG] Took script "+(Date.now()-execTime)+"ms to initialize");
	console.log(" ");
	var initTime = Date.now();
}

// Now the real party begins!

// Get them pixel data!
var hueDivide = 256/hsvColors.length;
var bigGroup = 0;
for (var y=box.y; y<box.y+box.height; ++y) {
	for (var x=box.x; x<box.x+box.width; ++x) {
		var c = img.getPixel(x, y);
		var r = pc.rgbaR(c);
		var g = pc.rgbaG(c);
		var b = pc.rgbaB(c);
		var a = pc.rgbaA(c);

		var cStr = r+","+g+","+b; // Lets not include the alpha
		if (a != 0) { // Check if pixel is fully transparent
			if (!(colorData[cStr] >= 0)) { // Check if color is already in the array
				colorData[cStr] = 1;
			} else {
				colorData[cStr]++;
			}

			if (showGroupedColors) { // Do we want to include the color groups?
				var h = rgb2hsv(r,g,b); // Get that HSV!
				var calcHue = Math.round(h[0]/hueDivide)%hsvColors.length;
				if (r <= considerBlack && g <= considerBlack && b <= considerBlack) { // Check for black
					justBlack++;
				} else if (r >= considerWhite && g >= considerWhite && b >= considerWhite) { // Check for white
					justWhite++;
				} else if (r == g && g == b && r == b) { // Check for gray
					justGray++;
				} else {
					hsvData[calcHue]++;
				}
			}
		}
	}
}
if (debug) {
	console.log(" ");
	console.log("[DEBUG] Took script "+(Date.now()-initTime)+"ms to gather the image data");
	console.log(" ");
	var imageTime = Date.now();
}

// Sorts the data from highest to lowest
var pixelStuff = [];

for (var key in colorData) pixelStuff.push([key, colorData[key]]);

pixelStuff.sort(function(a,b) {
	a = a[1];
	b = b[1];
	return b-a;
});
if (debug) {
	console.log(" ");
	console.log("[DEBUG] Took script "+(Date.now()-imageTime)+"ms to sort the color data");
	console.log(" ");
	var sortTime = Date.now();
}

// Analyze the data!

// Image stats
console.log("--==Pixel Stats v1.1==--");
console.log("");
console.log("--==Image Statistics==--");
if (selected) {
	console.log("Selection size: "+box.width+"x"+box.height);
} else {
	console.log("Image size: "+img.width+"x"+img.height);
}
console.log("Total amount of pixels: "+pixelAmt);
console.log("Total amount of colors: "+pixelStuff.length);
console.log(" ");

// Grouped color stats
if (showGroupedColors) {
	console.log("--==Grouped Color Statistics==--");
	for (var i=0; i<hsvColors.length; i++) {
		var key = hsvColors[i];
		var value = hsvData[i];
		var spacer1 = createSpacer(key,"Blue Magenta"); // Blue Magenta cuz it's the longest word in the list
		console.log(key+":"+spacer1+" "+value+"  ("+
			(Math.round(((value/pixelAmt)*100)*1000)/1000)+"%)"
		);
	}
	console.log("Black:"+createSpacer("Black:","Blue Magenta")+
		"  "+justBlack+"  ("+(Math.round(((justBlack/pixelAmt)*100)*1000)/1000)+"%)"
	);
	console.log("White:"+createSpacer("White:","Blue Magenta")+
		"  "+justWhite+"  ("+(Math.round(((justWhite/pixelAmt)*100)*1000)/1000)+"%)"
	);
	console.log("Gray:"+createSpacer("Gray:","Blue Magenta")+
		"  "+justGray)+"  ("+(Math.round(((justGray/pixelAmt)*100)*1000)/1000)+"%)"
	console.log(" ");
	if (debug) {
		console.log(" ");
		console.log("[DEBUG] Took script "+(Date.now()-sortTime)+"ms to show the image and grouped color data");
		console.log(" ");
		var groupTime = Date.now();
	}
}

// Color stats
console.log("--==Individual Color Statistics==--");
for (var i=0; i<pixelStuff.length; i++) {
	var key = pixelStuff[i][0];
	var value = pixelStuff[i][1];
	var spacer1 = createSpacer(key,"000,000,000");
	var spacer2 = createSpacer(value,pixelStuff[0][1]+"");
	console.log(key+":"+spacer1+"  "+
		value+spacer2+" pixels  ("+
		(Math.round(((value/pixelAmt)*100)*1000)/1000)+"%)"
	);
}
if (debug) {
	console.log(" ");
	console.log("[DEBUG] Took script "+(Date.now()-groupTime)+"ms to show the grouped color data");
	console.log(" ");
}

var finalTime = Date.now()-execTime
console.log(" ");
console.log("Took "+(finalTime/1000)+" seconds to calculate");