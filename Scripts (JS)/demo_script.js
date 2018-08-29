/*
                 --==Demonstrating Aseprite's Scripting Feature (JS)==--
                              Scripting: Haloflooder

                                    Description
This script demonstrates what you can do with scripts and how stable/unstable scripts can be.
A document for the API is located here https://github.com/aseprite/api/tree/master/api

                                GUI.xml requirement
Need to have these tags inside of <menu text="Scripts"> in the gui.xml file.

          <item command="RunScript" text="Demo Script">
            <param name="filename" value="demo_script.js" />
          </item>
		  
		  
                               !!!!Before we get started!!!!
There is a HUGE chance that Aseprite will crash because of how unstable the scripting feature can get. Aseprite
expects the scripter (or programmer if that's your cup of tea) to handle everything on their own. Here's a list
of things that you should take a look at.

- If you make a miscalculation and draw outside of the canvas, Aseprite will crash.
- If you decide to draw outside of the canvas intentionally, Aseprite will crash. e.g. img.putPixel(img.width+1,img.height+1,col.rgba(0,0,0,255));
- If you need to check for the image's width and height. DO NOT reference the active sprite. Use the active image instead. For some
reason, if you have a blank canvas and draw a scribble on it. The active image will only consider the scribble and not the entire
canvas. I'm not sure if this intentional but I found out the annoying way.
- If the canvas is empty, the active image will be the same size as the active sprite. If the canvas have 1 pixel on it, the 
active image's size will be 1x1.
- The scripting feature on Aseprite does not have any way to get an input from the user. So it's pretty limiting with what you can 
do with scripts (for now)
- Drawing every other pixel makes the code execution slower compared to drawing on the entire canvas for some reason.
- Active image = the layer that's currently active. It doesn't mean the entire sprite so you should keep that in mind. There currently
isn't a way to select different layers since there isn't a function for that.
- While you're playing with scripts. For the best result, fill in the canvas with a color. Blue, Black, Red, or even Turquoise. It doesn't matter

*/

var col = app.pixelColor; // This allows you to create/get colors from Aseprite
var img = app.activeImage; // Gets the active image from the project (only gets the active/selected layer in the image)
var spr = app.activeSprite; // Gets the active sprite (project) the user is currently on
var sel = spr.selection; // Gets the selection the user selected with the selection tool in the project
var time = Date.now(); // Just gets the current time so we can time how long the script takes to execute

/* 
    This function is here just to help make some things easier. It checks to see if there
	is a selection available for us to use. If the user didn't make a selection in the project,
	then it will return a new selection of the entire image for the other scripts to use.
*/
function checkSelection(selection) {
	var bound = selection.bounds; // Gets the selection the user selected on the active image
	var newSelection = new Rectangle();
	
	if (bound.width == 0 && bound.height == 0) {
		return new Rectangle(0,0,img.width,img.height);
	} else {
		return bound;
	}
}

/*
    This function just converts HSV to RGB. I was too lazy to make the logic so I borrowed it from the INTERNET
*/
function HSV2RGB(h,s,v) {
	var r, g, b, i, f, p, q, t;
	
	h = h/255;
	s = s/255;
	v = v/255;
	
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return [
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255)
	];
}


/*
                                        ==================
									    | Demo Functions |
									    ==================
*/

/*
                                          Playing with rectangles

    This function demonstrates how to create a rectangle and manipulate it's properties. Rectangles are
	normally used with selections.
	
	This will create a rectangle, manipulate some stuff in it, then use it's properties with math to
	draw a rectangle on the canvas. You don't need to use a rectangle to do this but we're just using 
	it as an example of what you can do with it.
	
	Execution time with 14x11: 2ms (result depends on how fast your CPU is and how big the rectangle is)
*/
function rectDemo() {
	var rect1 = Rectangle(0,0,16,16); // Creates a rectangle with 0,0 as the x and y and 16x16 as the width and height.
	console.log("Rectangle 1's X is "+rect1.x+", Y is "+rect1.y+", Width is "+rect1.width+", and Height is "+rect1.height);
	rect1.x = 2; // Changes the x
	console.log("Now the X is "+rect1.x);
	rect1.y = 5; // Changes the y
	console.log("Look, I changed the Y to "+rect1,y)
	rect1.width = 14; // Changes the width
	console.log("Width is now "+rect1.width);
	rect1.height = 11; // Changes the height
	console.log("It is now as tall as the number "+rect1.height);
	
	// Lets draw pixels in the rectangle!
	var hue = 0;
	for (var x=rect1.x; x<rect1.x+rect1.width; ++x) {
		for (var y=rect1.y; y<rect1.y+rect1.height; ++y) {
			hue++;
			var h = HSV2RGB(hue%255,128,255); // This helps us convert numbers into a pretty rainbow
			var c = col.rgba(h[0],h[1],h[2],255);
			img.putPixel(x,y,c);
		}
	}
}

/*
                                          Playing with selections

    This function demonstrates how to manipulate selections in the canvas. Just a little heads up,
	if you change the selection in Aseprite. For some reason, Aseprite doesn't show the new highlight
	around the new selection. It's still there but it's just not shown by Aseprite.
	
	This will get the project's selection, manipulate it, get a rectangle from the selection, and draw
	using the data from the selection. Unfortunately, you can't select multiple things as the function
	only lets you selection 1 rectangle at a time. You also can't selectively deselect from the selection
	as well.
	
	Execution time with 128x128: 62ms (result depends on how fast your CPU is and how big the rectangle is)
	         Note: The script's execution time is 15ms without the fancy HSV to RGB function.
*/
function selectionDemo() {
	var rect = Rectangle(0,0,16,16);
	var spr = app.activeSprite; // Gets the active sprite from Aseprite
	var sel = spr.selection; // Gets the seleection from the active sprite
	sel.select(rect); // There should be a selection on the screen from 0,0 to 16,16.
	sel.select(Rectangle(16,16,32,32)); // Since we set a new selection, the previous one is gone
	sel.selectAll(); // Selects everything
	rect = sel.bounds; // Converts the selection into a rectangle
	
	// Lets draw pixels in the rectangle! Get REKT (sorry)
	var hue = 0;
	for (var x=rect.x; x<rect.x+rect.width; ++x) {
		for (var y=rect.y; y<rect.y+rect.height; ++y) {
			hue++;
			var h = HSV2RGB(hue%255,128,255); // This helps us convert numbers into a pretty rainbow
			var c = col.rgba(h[0],h[1],h[2],255);
			img.putPixel(x,y,c);
		}
	}
	sel.deselect(); // Deselects everything
	
	console.log("Remember, Aseprite doesn't render the highlight around the new selection we made! It's a bug, not a feature.");
}


/*
                                          Playing with colors

    This function demonstrates how to create colors and use them to draw on the image.
	
	This will create some colors, read the rgba values of said colors, then use them to draw on an image.
	
	Execution time with 128x128: 15ms (result depends on how fast your CPU is and how big the selection is)
*/
function colorDemo() {
	var pc = app.pixelColor; // Gets the color property from Aseprite so we can program with colors
	var box = app.activeSprite.selection.bounds; // Gets a rectangle from a selection
	if (box.width == 0 && box.height == 0) { // This checks if the selection is empty
		box.width = img.width; // If selection is empty, set new width
		box.height = img.height; // If selection is empty, set new height
	}
	var color1 = pc.rgba(255,0,0,255); // Creates the color red by inputting R, G, B, A (A is optional so you can also do pc.rgba(255,0,0);
	var color2 = pc.rgba(0,255,0,128); // Makes the color green but with half the transparency
	var color3 = pc.graya(128,255); // Creates a gray color for a grayscale image. If you use this on an RGB image, it will draw nothing
	
	/*
	  Puts the colors in an array so we can easily use them. Alternatively, we could've done
	  var colors = [];
	  colors.push(pc.rgba(255,0,0,255));
	  colors.push(pc.rgba(0,255,0,128));
	  colors.push(pc.graya(128,128));
	*/
	var colors = [color1, color2, color3];
	
	for (var i=0; i<colors.length; i++) {
		var r = pc.rgbaR(colors[i]); // Gets the red value from a color
		var g = pc.rgbaG(colors[i]); // Gets the green value from a color
		var b = pc.rgbaB(colors[i]); // Gets the blue value from a color
		var a = pc.rgbaA(colors[i]); // Gets the alpha value from a color
		// We can't use "pc.grayaG(colors[i])" because it's not available for RGB
		// There is no way to check if a color is in grayscale or rgb (yet)
		// There is also currently no way to get indexed colors as well.
		
		console.log("Colors (RGBA) "+i+": "+r+","+g+","+b+","+a); // Prints it out to console
	}
	
	// Render pixels onto the image!
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			img.putPixel(x,y,colors[(x+y)%3]);
		}
	}
	
}

/*
                               Playing with sprite and size

    This function demonstrates how to get the active sprite, get it's properties, and manipulate some of them.
	
	This will get the active sprite, get the width, height, selection, filename, and color mode. It will also
	resize the sprite and crop it. I disabled the save functions since I don't want the script to overwrite
	anything you might have.
	
	Execution time with 128x128: 2ms (result depends on how fast your CPU is and how big the sprite is)
*/
function spriteAndSizeDemo() {
	var spr = app.activeSprite; // Gets the active sprite from Aseprite
	var img = app.activeImage; // Gets the active image from Aseprite (from the currently selected layer only)
	var pc = app.pixelColor; // Gets the color property from Aseprite so we can program with colors
	
	var w = spr.width; // Get the width
	var h = spr.height; // Get the height
	var sel = spr.selection.bounds; // Get a rectangle from the selection from the active sprite
	var fn = spr.filename; // Get the active sprite's filename
	var cm = spr.colorMode; // Get the active sprite's color mode. Will return 0 for RGB, 1 for grayscale, and 2 for indexed.
	
	var cmTxt = "";
	switch (cm) {
		case ColorMode.RGB: cmTxt="RGB"; break;
		case ColorMode.GRAYSCALE: cmTxt="Grayscale"; break;
		case ColorMode.INDEXED: cmTxt="Indexed"; break;
		default: cmTxt="Unknown";
	}
	
	console.log("Sprite size "+w+"x"+h);
	console.log("Sprite selection "+sel.x+","+sel.y+" ("+sel.width+"x"+sel.height+")");
	console.log("Sprite filename: "+fn);
	console.log("Sprite color mode: "+cm+" ("+cmTxt+")");
	console.log(" ");
	
	spr.resize(256,256); // Resize sprite to 256x256
	console.log("Resized sprite!");
	console.log("New sprite size "+spr.width+"x"+spr.height);
	console.log(" ");
	
	spr.crop(sel); // Crop to the selection
	spr.selection.select(Rectangle(0,0,spr.width,spr.height)); // Correct the selection since Aseprite doesn't automatically do that for you
	console.log("Cropped sprite!");
	console.log("New sprite size "+spr.width+"x"+spr.height);
	

	/* WARNING: I have disabled this part of the code since I don't want the script to overwrite anything
	   you have might.
	*/
	/*
	spr.save(); // Saves the current sprite to a file if it already exists. If it doesn't exist, it will ask you to save it somewhere.
	spr.saveAs("Hello World"); // Shows a file dialog so you can save the sprite as a new file
	spr.saveCopyAs(""); // This is actually just an export function. You currently can't set the file name
	spr.loadPalette(); // This currently doesn't do anything. Giving it a name of palette from extension does nothing, giving it a file location does nothing. Doesn't open a file dialog either
	*/
}

/*
                               Playing with the Image

    This function demonstrates how to manipulate the image in the sprite document.
	
	This will create a rainbow in a selection the user made in the document but if there is no selection,
	it will create a rainbow on the entire image. At the end, it will get a pixel from the image and print
	out the RGB value of the pixel.
	
	NOTE: This is where things can get buggy. If the sprite document is empty, the image will return the sprite's
	width and height. If there is only 1 pixel on the image, it will return 1x1 as the width and height. If there are
	multiple layers in the sprite document but the selected layer is empty. Aseprite will crash if you try to get or put
	a pixel on the image. The layer must be fully filled with a color in order for Aseprite to not crash.
	
	Execution time with 128x128: 61ms (result depends on how fast your CPU is and how big the sprite is)
	         Note: The script's execution time is 11ms without the fancy HSV to RGB function.
*/
function imageDemo() {
	var spr = app.activeSprite; // Gets the active sprite from Aseprite
	var img = app.activeImage; // Gets the active image from Aseprite (from the currently selected layer only)
	var pc = app.pixelColor; // Gets the color property from Aseprite so we can program with colors
	var sel = spr.selection.bounds; // Gets the rectangle of the selection in the sprite
	
	var iw = img.width; // Gets the width of the image
	var ih = img.height; // Gets the height of the image
	var sw = spr.width; // Gets the width of the sprite
	var sh = spr.height; // Gets the height of the sprite
	
	// Check to see if the image width and height is the same as the sprite document
	if (iw != sw || ih != sh) {
		console.log("Hmmm... It looks like sprite is partially filled.");
		console.log("Canceled image demo execution because the code will most likely crash Aseprite.");
		console.log("The active layer that's selected have to be either completely empty or completely filled with a color");
		console.log("If the sprite document have multiple layers, the active layer must be completely filled with a color. Otherwise Aseprite will crash");
	} else {
		
		// Checks to see if there is a selection
		if (sel.width == 0 && sel.height == 0) {
			sel.width = img.width;
			sel.height = img.height;
		}
		
		var hue = 0;
		for (var y=sel.y; y<sel.y+sel.height; ++y) {
			for (var x=sel.x; x<sel.x+sel.width; ++x) {
				hue++;
				var h = HSV2RGB(hue%255,128,255); // This helps us convert numbers into a pretty rainbow
				var c = col.rgba(h[0],h[1],h[2],255);
				img.putPixel(x,y,c); // Renders a pixel onto the image
			}
		}
		
		var getColor = img.getPixel(sel.x+1, sel.y+1); // Gets a pixel from the image
		var r = pc.rgbaR(getColor);
		var g = pc.rgbaG(getColor);
		var b = pc.rgbaB(getColor);
		var a = pc.rgbaA(getColor);
		
		console.log("Color of pixel at "+(sel.x+1)+","+(sel.y+1)+" is "+r+","+g+","+b+","+a);
		
		console.log("Image demo executed!");
	}
	
}

/*
                                  Playing with the console

    This function demonstrates how to output to a console.
	
	This will output "Hello world!" with a new line at the end. The code block also checks to see if
	the new rectangle object was created properly. This should never give an error at any condition.
	
	Execution time: 1ms
*/
function consoleDemo() {
	console.log("Hello world!\n"); // Prints text onto the console. \n is an alternative way to create a new line
	console.log(" "); // Prints nothing onto the console. This is another way to create a new line
	
	// The code block below checks to see if rectangle was created properly. If there was a bug, the script will
	// stop executing and tell you the line of code where it stopped at so you can debug the issue.
	// The code block below should NOT have any problems.
	var rekt = Rectangle(1,2,3,4);
	console.assert(rekt.x === 1);
	console.assert(rekt.y === 2);
	console.assert(rekt.width === 3);
	console.assert(rekt.height === 4);
	
	console.log("Look like there was no error in the code!");
	
}

/*
                                       ===================
									   | Extra Functions |
									   ===================
*/

/*
                              Just Black
  
    This function demonstrates how fast scripts can run. Just rendering a full black
	box	is faster than rendering a checkerboard pattern. You would think a checkerboard 
	pattern should render twice as fast since you're only drawing half the amount of 
	pixels but it doesn't.
	
	This will just render a black image in a selection if there is one. If there is no 
	selection, it will just make the entire image black.
	
	Execution time with 128x128: 11ms (result depends on how fast your CPU is and how big the selection is)
*/
function blackBox(selection) {
	// Initializes the required variables for the script
	var box = selection; // Gets the selection the user selected on the active image
	var boxColor = col.rgba(0,0,0,255); // Creates the color black
	
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			img.putPixel(x,y, boxColor); // Renders a pixel onto the active image
		}
	}
	console.log("Executed Just Black");
}

/*
                           Checkerboard Pattern v1

    This function demonstrates how slow scripts can be by using inefficient code.
	It was originally quickly written just to put the idea out on the table but it shows
	how bad the code runs.
	
	This will create a checkerboard pattern in a selection if there is one. If there is no
	selection, it will make a checkerboard pattern on the entire image. The bigger the
	selection, the slower the script will run.
	
	Execution time with 128x128: 230ms (result depends on how fast your CPU is and how big the selection is)
*/
function checkerboardVersionOne(selection) {
	// Initialize the required variables for the script
	var dotx = true;
	var doty = true;
	var dotCol = col.rgba(0,0,0,255); // Creates the color black
	var box = selection; // Gets the selection the user selected on the active image
	
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			if (dotx) {
				img.putPixel(x,y, dotCol); // Renders a pixel onto the active image
				dotx = false;
			} else {
				dotx = true;
			}
		}
		if (doty) {
			doty = false;
			dotx = false;
		} else {
			doty = true;
			dotx = true;
		}
	}
	console.log("Executed Checkerboard v1");
}

/*
                           Checkerboard Pattern v2

    This function demonstrates how slow scripts can be even by using a more efficient code.
	
	This will create a checkerboard pattern in a selection if there is one. If there is no
	selection, it will make a checkerboard pattern on the entire image. The bigger the
	selection, the slower the script will run.
	
	Execution time with 128x128: 227ms (result depends on how fast your CPU is and how big the selection is)
*/
function checkerboardVersionTwo(selection) {
	// Initialize the required variables for the script
	var dotCol = col.rgba(0,0,0,255); // Creates the color black
	var box = selection; // Gets the selection the user selected on the active image
	
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x+(y%2); x<box.x+box.width; ++x) {
			img.putPixel(x,y, dotCol); // Renders a pixel onto the active image
			x++;
		}
	}
	console.log("Executed Checkerboard v2");
}

/*
                           Checkerboard Pattern v3

    This is a 3rd iteration of the checkerboard pattern code. It is obviously somewhat poorly
	written	but it's purpose is to just experiment with the speed of the script.
	
	This will create a checkerboard pattern in a selection if there is one. If there is no
	selection, it will make a checkerboard pattern on the entire image. The bigger the
	selection, the slower the script will run.
	
	Execution time with 128x128: 213ms (result depends on how fast your CPU is and how big the selection is)
*/
function checkerboardVersionThree(selection) {
	// Initialize the required variables for the script
	var dotCol = col.rgba(0,0,0,255); // Creates the color black
	var box = selection; // Gets the selection the user selected on the active image

	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			img.putPixel(x,y, dotCol); // Renders a pixel onto the active image
			x++;
		}
		y++;
	}
	var axe = box.x+1;
	var why = box.y+1;
	for (var y=why; y<box.y+box.height; ++y) {
		for (var x=axe; x<box.x+box.width; ++x) {
			img.putPixel(x,y, dotCol); // Renders a pixel onto the active image
			x++;
		}
		y++;
	}
	console.log("Executed Checkerboard v3");
}

/*
                           Checkerboard Pattern v4

    This function demonstrates how fast scripts can be when you think of wonky ways
	to fix how slow the script will run. This is just a combination of Checkerboard
	Pattern v2 and Checkerboard Pattern with White Background.
	
	This will create a checkerboard pattern in a selection if there is one. If there is no
	selection, it will make a checkerboard pattern on the entire image. The bigger the
	selection, the slower the script will run.
	
	Execution time with 128x128: 16ms (result depends on how fast your CPU is and how big the selection is)
*/
function checkerboardVersionFour(selection) {
	// Initialize the required variables for the script
	var dotCol = col.rgba(0,0,0,255); // Creates the color black
	var box = selection; // Gets the selection the user selected on the active image
	
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			if ((x+(y%2))%2 == 0) { // Some math to select every other pixel
				img.putPixel(x,y, dotCol); // Renders a pixel onto the active image
			} else {
				img.putPixel(x,y, img.getPixel(x,y)); // The wonky piece of code that magically fixes how slow the original code was
			}
		}
	}
	console.log("Executed Checkerboard v4");
}

/*
                        Checkerboard Pattern with White Background

    This function is just a modification of "Checkerboard Pattern v4" but it draws a white
	background instead.
	
	This will create a checkerboard pattern with a white background in a selection if there 
	is one. If there is no selection, it will make a checkerboard pattern on the entire image.
	The bigger the selection, the slower the script will run.
	
	Execution time with 128x128: 15ms (result depends on how fast your CPU is and how big the selection is)
*/
function checkerboardWhiteBlack(selection) {
	// Initialize the required variables for the script
	var blackDot = col.rgba(0,0,0,255); // Creates the color black
	var whiteDot = col.rgba(255,255,255,255); // Creates the color white
	var box = selection; // Gets the selection the user selected on the image
	
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			if ((x+(y%2))%2 == 0) {
				img.putPixel(x,y, blackDot); // Renders a pixel onto the active image
			} else {
				img.putPixel(x,y, whiteDot); // Renders a pixel onto the active image
			}
		}
	}
	console.log("Executed Checkerboard White & Black");
}

/*
                        Checkerboard Pattern with Arguments!

    This function demonstrates how you can make a function flexible with arguments!
	
	This will create a checkerboard pattern with a color you pick on top of a background with
	a color that you can also pick. There is also an option to not draw a background color.
	If there is no selection, it will make a checkerboard pattern on the entire image.
	The bigger the selection, the slower the script will run.
	
	Execution time with 128x128: 15ms for both with or without a background color (result depends on how fast your CPU is and how big the selection is)
*/
function flexibleCheckerboard(selection, dotCol, drawBack, backCol) {
	if (drawBack != true) { // Normally, you would use "if (!drawBack)" but this is just to double check if drawBack is a bool and not a different variable type
		drawBack = false;
	}
	
	var box = selection;
	
	for (var y=box.y; y<box.y+box.height; ++y) {
		for (var x=box.x; x<box.x+box.width; ++x) {
			if ((x+(y%2))%2 == 0) {
				img.putPixel(x,y, dotCol); // Renders a pixel onto the active image
			} else {
				if (drawBack) {
					img.putPixel(x,y, backCol); // Renders a pixel onto the active image
				} else {
					img.putPixel(x,y, img.getPixel(x,y)); // Gets the pixel from the x & y and re-renders it because it makes the script run faster for some reason
				}
			}
		}
	}
	console.log("Executed Flexible Checkerboard!");
}

/*
                                      Selection Tiler

    This function demonstrates how you can check what kind of selection the user made on their project.
	
	This will take the user's selection and repeat the selection onto the entire image. If there is no
	selection, it will let the user know. If they selected the entire image, it will also let them know.
	
	Execution time with 128x128: 33ms (result depends on how fast your CPU is and how big the image is)
*/
function selectionTiler(selection) {
	var msg = "";
	if (sel.bounds.width == 0 && sel.bounds.height == 0) {
		msg = "You need to make a selection!\n"
	} else if (sel.bounds.x != 0 && sel.bounds.y != 0) {
		msg = "You need to make a selection starting from the top left!";
	} else if (sel.bounds.width == img.width && sel.bounds.height == img.height) {
		msg = "You cannot select the entire image for this tool! You can only select a portion of an image for this tool";
	} else {
		var box = selection;
		
		for (var x=0; x<img.width; ++x) {
			for (var y=0; y<img.height; ++y) {
				var c = img.getPixel(x%box.width,y%box.height);
				if (col.rgbaA(c) != 0) { // Checks the pixel if it's transparent so we don't draw over anything.
					img.putPixel(x,y,c);
				}
			}
		}
		
		msg = "Executed Selection Tiler!";
	}
	console.log(msg);
}

/*
                                  Copy from a Different File

    This function demonstrates how you can get Aseprite to open a different file and copy the contents
	from it! This can be extremely buggy but it was an interesting experiment to work on. I suggest that
	you create a new empty file instead of trying it out on a project with stuff drawn on it.
	
	This will ask the user to open a file and the script will copy the contents to the current project
	they're on. It will also ignore pixels that is transparent so it won't draw over the background color
	
	Execution time with 128x128: "The amount of time it takes to open a file"ms (result depends on how fast your CPU is and how big the image is)
*/
function copyFromFile() {
	app.open(""); // Asks user to open a file
	var newImg = app.activeImage; // Gets the active image from the opened file
	var newSpr = app.activeSprite; // Gets the active sprite from the opened file
	
	for (var x=0; x<newImg.width; ++x) {
		for (var y=0; y<newImg.height; ++y) {
			var c = newImg.getPixel(x,y);
			if (col.rgbaA(c) != 0 && (x < img.width && y < img.height)) { // Ignores transparent pixels and prevents Aseprite from crashing by not drawing outside of the canvas
				img.putPixel(x,y,newImg.getPixel(x,y)); // Draws onto the previous image
			}
		}
	}
}

function intro() {
	console.log("Hello! This is a demonstration script that shows you how to execute certain functions with Aseprite.");
	console.log("You can open the script file and mess with it's contents with notepad++, atom, sublime, or whatever you want to use.");
	console.log("For the best result, create a new sprite document and fill in the empty canvas with any color of your liking!");
	console.log("If you create a new layer, make sure to fill in the empty layer with a color so Aseprite doesn't crash!");
}

// Execute the functions here

intro();

//rectDemo();
//selectionDemo();
//colorDemo();
//spriteAndSizeDemo();
//imageDemo();
//consoleDemo();

//blackBox(checkSelection(sel));
//checkerboardVersionOne(checkSelection(sel));
//checkerboardVersionTwo(checkSelection(sel));
//checkerboardVersionThree(checkSelection(sel));
//checkerboardVersionFour(checkSelection(sel));
//checkerboardWhiteBlack(checkSelection(sel));
//flexibleCheckerboard(checkSelection(sel), col.rgba(0,148,255,255), 1, col.rgba(112,112,112,255));
//selectionTiler(checkSelection(sel));
//copyFromFile();

console.log(" ");
console.log("This version of Aseprite is "+app.version+"!\n"); // Get Aseprite's version. \n mean "newline". You can alternatively do this instead of console.log(" ");

var cMode = "";
switch (spr.colorMode) { // Get the project's color mode and prints it to console
	case ColorMode.RGB: cMode = "RGB"; break;
	case ColorMode.GRAYSCALE: cMode = "Grayscale"; break;
	case ColorMode.INDEXED: cMode = "Indexed"; break;
	default: cMode = "Unknown";
}
console.log("This sprite's color mode is "+cMode);
console.log("The sprite size is "+spr.width+"x"+spr.height);
console.log("The image size is "+img.width+"x"+img.height);
console.log(" ");
if ((sel.bounds.width == 0 && sel.bounds.height == 0)) { // Checks to see if user made a selection
	console.log("No selection detected!");
} else {
	console.log("Selection Coord: X:"+sel.bounds.x+" Y:"+sel.bounds.y);
	console.log("Selection size: "+sel.bounds.width+"x"+sel.bounds.height);
}
console.log(" ");
console.log("Took "+(Date.now()-time)+"ms to execute");

