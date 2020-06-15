REM A Windows Batch file that will minify the JS files to the proper location.
REM Order of compliation is important.

cd ..
java -jar "tools/closure-compiler-v20170626.jar" --output_manifest "build/manifest.MF"^
 --charset UTF-8 --debug --formatting="PRETTY_PRINT" --create_source_map "build/source-map.js"^
 --js_output_file="build/hamonengine.min.js" --js="src/debug-global.js"^
 --js="src/util/*.js"^
 --js="src/math/util.js" --js="src/math/sort.js" --js="src/math/LCGRandom.js"^
 --js="src/geometry/*.js"^
 --js="src/graphics/type.js" --js="src/graphics/imageext.js" --js="src/graphics/layer.js" --js="src/graphics/sprite.js" --js="src/graphics/animsprite.js" --js="src/graphics/spritesheet.js"^
 --js="src/entities/object2d.js" --js="src/entities/cell.js"^
 --js="src/hamon-engine.js"