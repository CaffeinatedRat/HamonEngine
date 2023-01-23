REM A Windows Batch file that will minify the JS files to the proper location.
REM Order of compliation is important.

cd ..
java -jar "tools/closure-compiler-v20200719.jar" --output_manifest "build/manifest.MF"^
 --charset UTF-8 --language_in=ES_2020^
 --js_output_file="build/hamonengine.min.js" --js="src/global.js"^
 --js="src/util/*.js"^
 --js="src/math/*.js"^
 --js="src/audio/*.js"^
 --js="src/geometry/*.js"^
 --js="src/graphics/type.js" --js="src/graphics/imageext.js" --js="src/graphics/layer.js" --js="src/graphics/sprite.js" --js="src/graphics/animsprite.js" --js="src/graphics/spritesheet.js"^
 --js="src/entities/type.js" --js="src/entities/object2d.js" --js="src/entities/spriteObject.js" --js="src/entities/shapeObject.js" --js="src/entities/cell.js"^
 --js="src/events/*.js"^
 --js="src/hamon-engine.js"