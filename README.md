Hamon (波紋) Engine 
===========

Hamon (or ripple) engine is a simple experimental game engine, still in early development that provides wrapper classes and utilities for building simple 2d game using many ES6 and HTML5 features.

* Bugs/Suggestions: CaffeinatedRat at gmail dot com

NOTES
-----------

* In development

Compilation
-----------

This project is minimized and obscured by the [Google Closure Compiler](https://developers.google.com/closure/compiler/).  To compile the library, you'll need to supply a few arguments when running the compiler.jar, as shown below.  NOTE: There are object dependencies so the order of compilation is important.

<pre>
java -jar "tools/closure-compiler-v20170626.jar" --js_output_file="build/hamonengine.min.js" --js="src/global.js"^
 --js="src/util/util.js"^
 --js="src/math/util.js" --js="src/math/sort.js" --js="src/math/LCGRandom.js"^
 --js="src/geometry/*.js"^
 --js="src/graphics/layer.js" --js="src/graphics/sprite.js" --js="src/graphics/animsprite.js" --js="src/graphics/spritesheet.js"^
 --js="src/entities/object2d.js"^
 --js="src/hamon-engine.js"^
 --output_manifest "build/manifest.MF"
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

* Initial Release.
