# vanillavideoboxer
This is the user interface for a service that will allow users to "watch" certain
regions of a livestreaming video for certain items or people, then be notified via an IFTTT trigger when 
the thing appears in the right spot. The purpose of this tool is to allow users to define these regions graphically 
using resizable "frames", then enter the lists of objects to search for in each region.

To try it out, visit https://millanp.github.io/vanillavideoboxer/ and enter a valid YouTube URL 
(a URL that leads to a video watch page on youtube.com) The video will appear, with one frame
already set up to watch the entire scene. Double click the video and a new frame will show up, 
accompanied by a numbered textbox below.
This frame is draggable and resizable, and will never extend beyond the borders of the video.
To get rid of it, click the X button, and the frame and associated textbox will disappear.

That's all it does for now, but eventually it will be backed by a server that actually does the 
watching and the triggering. 
