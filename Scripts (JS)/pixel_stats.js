/*
                           --==Pixel Stats v1.0 (JS)==--
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

var col = app.pixelColor;
var img = app.activeImage;
var colorData = [];
var pixelAmt = img.width*img.height;
var time = Date.now();

// Function is optimized to only process 1,2,4,5,6,7,8,9,0,space, and comma
function textWidth(str) {
	var w = 0;
	str = str+"";
	var sArray = str.split("");
	for (var i in sArray) {
		switch(sArray[i]) {
			case "1":
			case ",":
				w += 2;
			break;
			
			case " ":
				w += 3;
			break;
			
			default:
				w += 4;
		}
	}
	return w + str.length; // Adding string length for the spacing between letters
}

function createSpacer(str,maxstr) {
	var w = textWidth(str);
	var maxW = textWidth(maxstr);
	var calc = maxW-w;
	var spacer = "";
	while (calc > 1) {
		if (calc > 3) {
			spacer = " "+spacer;
			calc -= 4;
		} else {
			spacer = ":"+spacer;
			calc -= 2;
		}
	}
	return spacer;
}

// Get them pixel data!
for (var y=0; y<img.height; ++y) {
  for (var x=0; x<img.width; ++x) {
    var c = img.getPixel(x, y);
	var cStr = col.rgbaR(c)+","+col.rgbaG(c)+","+col.rgbaB(c);
	
	if (!(colorData[cStr] >= 0)) {
		colorData[cStr] = 1;
	} else {
		colorData[cStr]++;
	}
  }
}

// Sorts the data from highest to lowest
var pixelStuff = [];

for (var key in colorData) pixelStuff.push([key, colorData[key]]);

pixelStuff.sort(function(a,b) {
	a = a[1];
	b = b[1];
	return b-a;
});

// Outputs the data onto the screen
console.log("--==Image statistics==--");
console.log("Image size: "+img.width+"x"+img.height);
console.log("Total amount of pixels: "+pixelAmt);
console.log("Total amount of colors: "+pixelStuff.length);
console.log(" ");
console.log("--==Color statistics==--");

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
console.log(" ");
console.log("Took "+(Date.now()-time)+"ms to calculate");