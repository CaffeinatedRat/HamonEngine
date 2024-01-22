Hamon (波紋) Engine 
===========

Hamon (or ripple) engine is a simple experimental game engine, still in early development that provides wrapper classes and utilities for building simple 2d game using many ES6 and HTML5 features.

* Bugs/Suggestions: CaffeinatedRat at gmail dot com

NOTES
-----------

* In development
* Some of the engines features can be found demoed at: [http://demos.caffeinatedrat.com/hamon/]

Compilation
-----------

This project is minimized and obscured by the [Google Closure Compiler](https://developers.google.com/closure/compiler/).  To compile the library, you'll need to supply a few arguments when running the compiler.jar, as shown below.
\
\
Compilation Notes:
* There are object dependencies so the order of compilation is important.
* The later versions of the closure compiler require Java SE 21 (JDK21).

<pre>
java -jar "tools/closure-compiler-v20231112.jar" --output_manifest "build/manifest.MF"^
 --charset UTF-8 --language_in=ES_2020^
 --compilation_level=SIMPLE^
 --js_output_file="build/hamonengine.min.js" --js="src/global.js"^
 --js="src/util/*.js"^
 --js="src/math/*.js" --js="src/math/datastructures/*.js"^
 --js="src/geometry/*.js"^
 --js="src/audio/*.js"^
 --js="src/graphics/type.js" --js="src/graphics/imageext.js" --js="src/graphics/layer.js" --js="src/graphics/sprite.js" --js="src/graphics/animsprite.js" --js="src/graphics/spritesheet.js"^
 --js="src/entities/type.js" --js="src/entities/object2d.js" --js="src/entities/spriteObject.js" --js="src/entities/shapeObject.js" --js="src/entities/cell.js"^
 --js="src/events/*.js"^
 --js="src/resources/splashscreen.js"^
 --js="src/hamon-engine.js"
</pre>
 

Coding and Pull Request Conventions
-----------

A set of standards I borrowed from the [https://github.com/Bukkit/CraftBukkit] (bukkit) project, since it seems to apply generally to everything.

* No tabs; use 4 spaces instead.
* No trailing whitespaces.
* ~No CRLF line endings, LF only, put your gits 'core.autocrlf' on 'true'~
* No 80 column limit or 'weird' midstatement newlines.
* The pull request must contain code that builds without errors.
* The pull request must contain code that has been unit tested to some degree as to not fail on runtime.
* The description of your pull request should provide detailed information on the pull along with justification of the changes where applicable.

Change Log
-----------

#### 1.1.2
* Added onScreenResize event that is triggered when the screen (canvas element) changes size. This resize event is now propagated all layers within the screen and all frames within the storyboard.
* Added onUpdateEvent added to the frame class to support generic update events.

#### 1.1.1
Screen class
* Added several new screen class methods such toLayer, removeLayers, swapLayers, & pruneLayers.
* Added additional parameters, such as disabling the FPSCounter, to the screen class methods beginPainting & endPainting.

Frame class
* Added an additional event onFrameInitiating to the frame class for one time initialization of that frame.
* Added the parameter lastFrame to retrieve the last active frame for the frame events onFrameInitiating, onFrameStarting, onFrame, onFrameStopping, & onProcessingFrame.

Main Engine Class
* Added logic to await on webfont resources.

Layer Class
* Added the layer method fillLayerColor.
* Added the layer method getTextRect to retrieve text metrics in the form of a rect object.
* Added metaproperties for other classes to store their specific information in a layer, unfortunately, coupling the classes.

Misc
* Fixed a deep cloning issue with the frame, tree, storyboard & screen classes.
* Fixed an issue with the sprite dimensions during cloning.

#### 1.1.0
* Added the screen class, which is an extension of a layer, to support layer chaining.  This removes the burden of layer ordering logic from the user.
* The HamonEngine.PrimaryLayer property is now a screen and has been renamed PrimaryScreen.  All layer references in the main engine have been updated to reflect the new screen mechanism.

#### 1.0.3
* Added the property center to the class hamonengine.geometry.rect to allow pre-computation for things like centering drawing on the viewport.
* Added logic to return and accept text metrics object from drawText to improve performance.  Text metrics can also be disabled; however, the textOffset & verticalTextOffset properties are disabled.
* Added a helper method drawFPSCounter to the hamonengine.graphics.layer class using consistent parameters and disabled metrics.
* Updated the drawText method to ignore the invert axis properties if metrics are disabled.  The text cannot be drawn properly with inverted axis if metrics cannot be retrieved.
* Updated the beginPainting method to only call fillRect if a backgroundColor is provided.  This is to support the future screen class.

#### 1.0.2
* Removed the release methods from the Object2d class and modified the hold methods to accept a state parameter to toggle holding a direction.

#### 1.0.1
* Improved the touch click events when capturing touch events as mouse events.

#### 1.0.0
* Initial Beta Release that contains a fundamental working engine.

#### 0.1.0
* Initial Alpha Release.  1st unstable release.

