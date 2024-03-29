REM A Windows Batch file that will minify the JS files to the proper location.
REM Order of compliation is important.

cd ..
java -jar "tools/closure-compiler-v20231112.jar" --output_manifest "build/manifest.MF"^
 --charset UTF-8 --debug --language_in=ES_2020 --formatting="PRETTY_PRINT" --create_source_map "build/source-map.js"^
 --js_output_file="build/hamonengine.min.js" --js="src/debug-global.js"^
 --js="src/util/*.js"^
 --js="src/math/*.js" --js="src/math/datastructures/*.js"^
 --js="src/geometry/*.js"^
 --js="src/audio/*.js"^
 --js="src/graphics/type.js" --js="src/graphics/imageext.js" --js="src/graphics/layer.js" --js="src/graphics/screen.js"^
 --js="src/graphics/sprites/sprite.js" --js="src/graphics/sprites/animsprite.js" --js="src/graphics/sprites/spritesheet.js"^
 --js="src/entities/type.js" --js="src/entities/object2d.js" --js="src/entities/spriteObject.js" --js="src/entities/shapeObject.js" --js="src/entities/cell.js"^
 --js="src/events/*.js"^
 --js="src/resources/splashscreen.js"^
 --js="src/hamon-engine.js"