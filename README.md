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

#### 0.1.0
* Initial Alpha Release.  1st unstable release.

#### 1.0.0
* Initial Beta Release that contains a fundamental working engine.

#### 1.0.1
* Improved the touch click events when capturing touch events as mouse events.

#### 1.0.2
* Removed the release methods from the Object2d class and modified the hold methods to accept a state parameter to toggle holding a direction.

#### 1.0.3
* Added the property center to the class hamonengine.geometry.rect to allow pre-computation for things like centering drawing on the viewport.
