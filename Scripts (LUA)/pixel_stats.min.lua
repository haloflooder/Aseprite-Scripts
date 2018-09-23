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
local a=app.pixelColor;local b=app.activeImage;local c=app.activeSprite;local d=c.selection;local e=true;local f=d.bounds;if f.width==0 and f.height==0 then f=Rectangle(0,0,b.width,b.height)e=false end;local g={}local h=f.width*f.height;local i={}local j={"Red","Orange","Yellow","Yellow Green","Green","Green Cyan","Cyan","Blue Cyan","Blue","Blue Magenta","Magenta","Red Magenta"}local k=0;local l=0;local m=0;for n=1,#j do i[n]=0 end;function rgb2hsv(o,p,q)o,p,q=o/255,p/255,q/255;local r=math.max(o,p,q)local s=math.min(o,p,q)local t,u,v;v=r;local w=r-s;if r==0 then u=0 else u=w/r end;if r==s then t=0 else if r==o then t=(p-q)/w;if p<q then t=t+6 end elseif r==p then t=(q-o)/w+2 elseif r==q then t=(o-p)/w+4 end;t=t/6 end;return{t*255,u*255,v*255}end;function round(x)return x%1>=0.5 and math.ceil(x)or math.floor(x)end;local y={}for n=0,128 do y[n]=5 end;y[32]=4;y[33]=2;y[34]=4;y[35]=6;y[36]=6;y[37]=6;y[38]=6;y[39]=3;y[40]=3;y[41]=3;y[42]=6;y[43]=6;y[44]=6;y[45]=4;y[46]=2;y[47]=4;y[49]=3;y[58]=2;y[59]=2;y[60]=4;y[62]=4;y[63]=4;y[64]=9;y[73]=2;y[74]=3;y[77]=6;y[79]=6;y[81]=6;y[84]=6;y[86]=6;y[87]=8;y[88]=6;y[89]=6;y[91]=3;y[92]=4;y[93]=3;y[94]=6;y[95]=6;y[96]=4;y[102]=4;y[105]=2;y[106]=3;y[108]=2;y[109]=8;y[114]=4;y[115]=4;y[116]=3;y[119]=6;y[120]=6;y[123]=4;y[124]=2;y[125]=4;function textWidth(z)local A=0;z=z..""for n=1,z:len()do A=A+y[string.byte(string.sub(z,n,n))]end;return A end;function createSpacer(z,B)local C=""local A=textWidth(z)local D=textWidth(B)local E=(D-A)/4;local F=math.floor(E)for n=0,F do C=C.." "end;if E-F>=.5 then C=":"..C end;return C end;if debug then print(" ")print("[DEBUG] Took script "..os.clock()-execTime.."ms to initialize")print(" ")initTime=os.clock()end;local G=false;if#c.layers>1 then G=true end;local H=false;local I=false;if G then local J=app.alert{title="[Pixel Stats v1.2]",text={"Pixel Stats detected multiple layers in the document!","","Do you want Pixel Stats to flatten the layers then anaylze the image as a whole","or do you want to anaylze the single layer that's currently selected?"},buttons={"Anaylze Entire Image","Analyze Single Layer","Cancel"}}if J==1 then H=true;app.command.FlattenLayers{visibleOnly=true}b=app.activeImage elseif J==3 or J==0 then I=true end end;if not I then local K=256/#j;local L=0;local M=false;local N=0;for O=f.y,f.y+f.height-1 do for P=f.x,f.x+f.width-1 do local Q=b:getPixel(P,O)local o=a.rgbaR(Q)local p=a.rgbaG(Q)local q=a.rgbaB(Q)local R=a.rgbaA(Q)local S=o..","..p..","..q;if R~=0 then if g[S]==nil then g[S]=1;N=N+1 else g[S]=g[S]+1 end;if maxColors<=N then M=true;break end;if showGroupedColors then local t=rgb2hsv(o,p,q)local T=round(t[1]/K)%#j+1;if o<=considerBlack and p<=considerBlack and q<=considerBlack then m=m+1 elseif o>=considerWhite and p>=considerWhite and q>=considerWhite then l=l+1 elseif o==p and p==q and o==q then k=k+1 else i[T]=i[T]+1 end end end end;if M then break end end;if debug then print(" ")print("[DEBUG] Took script "..os.clock()-initTime.."ms to gather the image data")print(" ")imageTime=os.clock()end;local U={}for V in pairs(g)do table.insert(U,{V,g[V]})end;table.sort(U,function(R,q)R=R[2]q=q[2]return R>q end)if debug then print(" ")print("[DEBUG] Took script "..os.clock()-imageTime.."ms to sort the color data")print(" ")sortTime=os.clock()end;print("--==Pixel Stats v1.2==--")print("")print("--==Image Statistics==--")if e then print("Selection size: "..f.width.."x"..f.height)else print("Image size: "..b.width.."x"..b.height)end;print("Total amount of pixels: "..h)print("Total amount of colors: "..#U)print(" ")if M then print("====================")print("--==     ERROR     ==--")print("====================\n")print("The amount of colors in this image went over the limit")print("of "..maxColors.." colors so the script stopped so Aseprite won't crash.\n")print("If you want to change the max amount of colors to")print("anaylze, you can change thevalue of 'maxColors'")print("in the pixel_stats.lua script.")print("\n\n")else if showGroupedColors then print("--==Grouped Color Statistics==--")for n=1,#j do local V=j[n]local W=i[n]local X=createSpacer(V,"Blue Magenta")print(V..":"..X.." "..W.."  ("..round(W/h*100*1000)/1000 .."%)")end;print("Black:"..createSpacer("Black:","Blue Magenta").."  "..m.."  ("..round(m/h*100*1000)/1000 .."%)")print("White:"..createSpacer("White:","Blue Magenta").."  "..l.."  ("..round(l/h*100*1000)/1000 .."%)")print("Gray:"..createSpacer("Gray:","Blue Magenta").."  "..k.."  ("..round(k/h*100*1000)/1000 .."%)")print(" ")if debug then print(" ")print("[DEBUG] Took script "..os.clock()-sortTime.."ms to show the image and grouped color data")print(" ")groupTime=os.clock()end end;print("--==Individual Color Statistics==--")for n=1,#U do local V=U[n][1]local W=U[n][2]local X=createSpacer(V,"000,000,000")local Y=createSpacer(W,U[1][2].."")print(V..":"..X.."  "..W..Y.." pixels  ("..round(W/h*100*1000)/1000 .."%)")end;if debug then print(" ")print("[DEBUG] Took script "..os.clock()-groupTime.."ms to show the grouped color data")print(" ")end end;if H then app.command.Undo()end;finalTime=os.clock()-execTime;print(" ")print("Took "..round(finalTime*1000)/1000 .." seconds to calculate")end