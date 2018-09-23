--[[
                           --==Pixel Stats v1.2 (LUA)==--
                              Scripting: Haloflooder
                                  Idea: CopherNeue

                                    Description
Counts the pixels and prints out the rgb value of all the colors along with the percentage!

									Requirements
The only thing you need to do is click "Open Scripts Folder" in File > Scripts and drag the script
into the folder that pops up.

]]

local execTime = os.clock();

-- If the image have more than the set value, the script will stop running to prevent Aseprite from crashing
-- You can change the number to a higher number if your image have more than 500 colors
-- BUT BE WARNED!!! Any value that's greater than 1000 will freeze Aseprite for a long time!!!
local maxColors = 500;

-- Change this value to false if you want the script to run a lot faster
-- If set to false, the script won't show you the group of colors the pixels are in (red, orange, etc)
local showGroupedColors = true;

-- Change these values to whatever you think is the minimum value to white
-- example: I personally think anything that's lower than 16 (16,16,16) is black!
-- Example: Well I think anything that's higher than 239 (239,239,239) is white!
local considerBlack = 16;
local considerWhite = 239;

-- Shows more info about the code execution
local debug = false;
local initTime, imageTime, finalTime, groupTime, sortTime;


-- Let the gibberish code begin!

local pc = app.pixelColor;
local img = app.activeImage;
local spr = app.activeSprite;
local sel = spr.selection;
local selected = true;
local box = sel.bounds;
if (box.width == 0 and box.height == 0) then
	box = Rectangle(0,0,img.width,img.height);
	selected = false;
end

local colorData = {};
local pixelAmt = box.width*box.height;

local hsvData = {};
local hsvColors = {
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
};
local justGray = 0;
local justWhite = 0;
local justBlack = 0;

for i=1, #hsvColors do
	hsvData[i] = 0;
end

-- Random functions start here
-- RGB to HSV converter
-- Credit: http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function rgb2hsv(r, g, b) 
	r,g,b = r/255, g/255, b/255;

	local max = math.max(r, g, b);
	local min = math.min(r, g, b);
	local h,s,v
	v = max;

	local d = max-min;

	if max == 0 then s = 0 else s = d/max end

	if (max == min) then
		h = 0;
	else
		if (max == r) then
			h = (g-b)/d
			if (g < b) then h = h+6 end
		elseif (max == g) then h = (b-r)/d+2
		elseif (max == b) then h = (r-g)/d+4
		end
		h = h/6;
	end

	return {
		h * 255, 
		s * 255, 
		v * 255
	};
end

-- LUA doesn't have round... lmao
function round(n)
	return n%1 >= 0.5 and math.ceil(n) or math.floor(n)
end

-- Oh boy... This was annoying to make but it'll be useful for other scripts
-- This is to help get the text width
-- Please forgive me for the "one" line of arrays
local charCodes = {};
for i=0, 128 do
	charCodes[i] = 5;
end
charCodes[32] = 4;charCodes[33] = 2;charCodes[34] = 4;charCodes[35] = 6;charCodes[36] = 6;charCodes[37] = 6;charCodes[38] = 6;charCodes[39] = 3;charCodes[40] = 3;charCodes[41] = 3;charCodes[42] = 6;charCodes[43] = 6;charCodes[44] = 6;charCodes[45] = 4;charCodes[46] = 2;charCodes[47] = 4;charCodes[49] = 3;charCodes[58] = 2;charCodes[59] = 2;charCodes[60] = 4;charCodes[62] = 4;charCodes[63] = 4;charCodes[64] = 9;charCodes[73] = 2;charCodes[74] = 3;charCodes[77] = 6;charCodes[79] = 6;charCodes[81] = 6;charCodes[84] = 6;charCodes[86] = 6;charCodes[87] = 8;charCodes[88] = 6;charCodes[89] = 6;charCodes[91] = 3;charCodes[92] = 4;charCodes[93] = 3;charCodes[94] = 6;charCodes[95] = 6;charCodes[96] = 4;charCodes[102] = 4;charCodes[105] = 2;charCodes[106] = 3;charCodes[108] = 2;charCodes[109] = 8;charCodes[114] = 4;charCodes[115] = 4;charCodes[116] = 3;charCodes[119] = 6;charCodes[120] = 6;charCodes[123] = 4;charCodes[124] = 2;charCodes[125] = 4;


-- This function counts the amount of pixels in the Aseprite text. This heavily
-- relies on the default font Aseprite uses for the UI.
function textWidth(str)
	local w = 0;
	str = str.."";
	for i=1, str:len() do
		w = w+charCodes[string.byte(string.sub(str,i,i))]
	end
	return w; -- Returns the width
end

-- Unfortunately, the only way we create a spacer for smaller pixels is to fill it in with colons
function createSpacer(str,maxstr)
	local spacer = "";
	--if (not speedMeUp) then
		local w = textWidth(str);
		local maxW = textWidth(maxstr);
		local calc = (maxW-w)/4;
		
		local repeater = math.floor(calc);
		
		for i=0, repeater do
			spacer = spacer.." ";
		end

		if (calc-repeater >= .5) then
			spacer = ":"..spacer;
		end
	--end
	return spacer;
end

if (debug) then
	print(" ");
	print("[DEBUG] Took script "..(os.clock()-execTime).."ms to initialize");
	print(" ");
	initTime = os.clock();
end

-- Now the real party begins!

-- Detects if the sprite document have more than 1 layer
local multiLayers = false;
if (#spr.layers > 1) then
	multiLayers = true;
end
-- Asks the user if they want to anaylze the layer or the image as a whole (flatten all the visible layers!)
local flattenLayers = false;
local cancel = false;
if (multiLayers) then
	local question = app.alert{
		title="[Pixel Stats v1.2]",
		text={
			"Pixel Stats detected multiple layers in the document!","",
			"Do you want Pixel Stats to flatten the layers then anaylze the image as a whole",
			"or do you want to anaylze the single layer that's currently selected?"
		},
		buttons={"Anaylze Entire Image","Analyze Single Layer","Cancel"}
	}
	if (question == 1) then
		flattenLayers = true;
		app.command.FlattenLayers{visibleOnly=true}
		img = app.activeImage;
	elseif (question == 3 or question == 0) then
		cancel = true;
	end
end
-- Get them pixel data!
if (not cancel) then
	local hueDivide = 256/#hsvColors;
	local bigGroup = 0;
	local overMax = false;
	local totalColors = 0;
	for y=box.y, box.y+(box.height-1) do
		for x=box.x, box.x+(box.width-1) do
			local c = img:getPixel(x, y);
			local r = pc.rgbaR(c);
			local g = pc.rgbaG(c);
			local b = pc.rgbaB(c);
			local a = pc.rgbaA(c);

			local cStr = r..","..g..","..b; -- Lets not include the alpha
			if (a ~= 0) then -- Check if pixel is fully transparent
				if ((colorData[cStr] == nil)) then -- Check if color is already in the array
					colorData[cStr] = 1;
					totalColors = totalColors+1;
				else
					colorData[cStr] = colorData[cStr]+1;
				end

				if (maxColors <= totalColors) then
					overMax = true;
					break;
				end

				if (showGroupedColors) then -- Do we want to include the color groups?
					local h = rgb2hsv(r,g,b); -- Get that HSV!
					local calcHue = (round(h[1]/hueDivide) % #hsvColors)+1;
					if (r <= considerBlack and g <= considerBlack and b <= considerBlack) then -- Check for black
						justBlack = justBlack+1;
					elseif (r >= considerWhite and g >= considerWhite and b >= considerWhite) then -- Check for white
						justWhite = justWhite+1;
					elseif (r == g and g == b and r == b) then -- Check for gray
						justGray = justGray+1;
					else
						hsvData[calcHue] = hsvData[calcHue]+1;
					end
				end
			end
		end
		if (overMax) then
			break;
		end
	end
	if (debug) then
		print(" ");
		print("[DEBUG] Took script "..(os.clock()-initTime).."ms to gather the image data");
		print(" ");
		imageTime = os.clock();
	end

	-- Sorts the data from highest to lowest
	local pixelStuff = {};

	for key in pairs(colorData) do table.insert(pixelStuff,{key, colorData[key]}) end

	table.sort(pixelStuff, function(a,b)
		a = a[2];
		b = b[2];
		return a > b;
	end)
	if (debug) then
		print(" ");
		print("[DEBUG] Took script "..(os.clock()-imageTime).."ms to sort the color data");
		print(" ");
		sortTime = os.clock();
	end

	-- Analyze the data!

	-- Image stats
	print("--==Pixel Stats v1.2==--");
	print("");
	print("--==Image Statistics==--");
	if (selected) then
		print("Selection size: "..box.width.."x"..box.height);
	else
		print("Image size: "..img.width.."x"..img.height);
	end
	print("Total amount of pixels: "..pixelAmt);
	print("Total amount of colors: "..#pixelStuff);
	print(" ");

	-- If total anylzed colors reaches max colors, we show this warning message instead of the color data
	if (overMax) then
		print("====================")
		print("--==     ERROR     ==--")
		print("====================\n")
		print("The amount of colors in this image went over the limit")
		print("of "..maxColors.." colors so the script stopped so Aseprite won't crash.\n")
		print("If you want to change the max amount of colors to")
		print("anaylze, you can change thevalue of 'maxColors'")
		print("in the pixel_stats.lua script.")
		print("\n\n")
	else
		-- Grouped color stats
		if (showGroupedColors) then
			print("--==Grouped Color Statistics==--");
			for i=1, #hsvColors do
				local key = hsvColors[i];
				local value = hsvData[i];
				local spacer1 = createSpacer(key,"Blue Magenta"); -- Blue Magenta cuz it's the longest word in the list
				print(key..":"..spacer1.." "..value.."  ("..
					(round(((value/pixelAmt)*100)*1000)/1000).."%)"
				);
			end
			print("Black:"..createSpacer("Black:","Blue Magenta")..
				"  "..justBlack.."  ("..(round(((justBlack/pixelAmt)*100)*1000)/1000).."%)"
			);
			print("White:"..createSpacer("White:","Blue Magenta")..
				"  "..justWhite.."  ("..(round(((justWhite/pixelAmt)*100)*1000)/1000).."%)"
			);
			print("Gray:"..createSpacer("Gray:","Blue Magenta")..
				"  "..justGray.."  ("..(round(((justGray/pixelAmt)*100)*1000)/1000).."%)"
			);
			print(" ");
			if (debug) then
				print(" ");
				print("[DEBUG] Took script "..(os.clock()-sortTime).."ms to show the image and grouped color data");
				print(" ");
				groupTime = os.clock();
			end
		end

		-- Color stats
		print("--==Individual Color Statistics==--");
		for i=1, #pixelStuff do
			local key = pixelStuff[i][1];
			local value = pixelStuff[i][2];
			local spacer1 = createSpacer(key,"000,000,000");
			local spacer2 = createSpacer(value,pixelStuff[1][2].."");
			print(key..":"..spacer1.."  "..
				value..spacer2.." pixels  ("..
				(round(((value/pixelAmt)*100)*1000)/1000).."%)"
			);
		end
		if (debug) then
			print(" ");
			print("[DEBUG] Took script "..(os.clock()-groupTime).."ms to show the grouped color data");
			print(" ");
		end
	end
	if (flattenLayers) then
		app.command.Undo();
	end

	finalTime = os.clock()-execTime
	print(" ");
	print("Took "..(round(finalTime*1000)/1000).." seconds to calculate");
end