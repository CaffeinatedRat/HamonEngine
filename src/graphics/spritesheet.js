/**
* Copyright (c) 2020, CaffeinatedRat.
* All rights reserved.
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE AUTHOR AND CONTRIBUTORS BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//波紋
'use strict';

hamonengine.graphics = hamonengine.graphics || {};

(function() {

    const IMAGE_STATES = {
        UNLOADED: 0,
        LOADING: 1,
        COMPLETE: 2,
        ERROR: 3
    };

    hamonengine.graphics.spritesheet = class {
        constructor(options) {
            options = options || {};

            //Sprites sheet and sprites.
            this._imageResource = new Image();
            this._sprites = {};
            this._spriteIndex = [];
            this._state = IMAGE_STATES.UNLOADED;
        }
        /**
         * Returns the number of sprites in the sheet.
         */
        get length () {
            return this._spriteIndex.length;
        }
        /**
         * Determines if the spritesheet is ready.
         */
        get isLoaded() {
            return this._state === IMAGE_STATES.COMPLETE;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Loads teh spritesheet based on the provided metadata.
         * @param {*} spriteSheetMetadata metadata.
         */
        load(spriteSheetMetadata) {
            
            return new Promise((resolve, reject) => {
                this._imageResource.src = spriteSheetMetadata.spritesheetUrl;
                this._state = IMAGE_STATES.LOADING;
                
                //Handle a successful loading event and resolve the promise.
                this._imageResource.addEventListener('load', () => {
                    this._state = IMAGE_STATES.COMPLETE;
                    resolve();
                }, false);

                //Handle errors and reject the promise.
                this._imageResource.addEventListener('error', (error) => {
                    this._state = IMAGE_STATES.ERROR;
                    let imagePath = error && error.path && error.path.length > 0 && error.path[0].src || '';
                    let errorMsg = `The image '${imagePath}' could not be loaded.`;
                    reject(errorMsg, error);
                }, false);

                //Load all of the static sprites from the metadata.
                spriteSheetMetadata.sprites.forEach((spriteMetadata) => {
                    this._spriteIndex.push(spriteMetadata.name);
                    this._sprites[spriteMetadata.name] = new hamonengine.graphics.sprite({
                        image: this._imageResource,
                        name: spriteMetadata.name,
                        dimensions: new hamonengine.geometry.rect({
                            x: spriteMetadata.x,
                            y: spriteMetadata.y,
                            width: spriteMetadata.width,
                            height: spriteMetadata.height
                        })
                    });
                });

                //Load all of the animated sprites from the metadata.
                spriteSheetMetadata.animSprites.forEach(animSpriteMetadata => {
                    let animatedSprite = new hamonengine.graphics.animsprite({
                        animationRate: animSpriteMetadata.animationRate,
                    });

                    //Load all of the frames from this animated sprite.
                    animSpriteMetadata.frames.forEach(frameMetadata => {
                        animatedSprite.addFrame(new hamonengine.graphics.sprite({
                            image: this._imageResource,
                            name: frameMetadata.name,
                            dimensions: new hamonengine.geometry.rect({
                                x: frameMetadata.x,
                                y: frameMetadata.y,
                                width: frameMetadata.width,
                                height: frameMetadata.height
                            })
                        }));
                    });
                    this._spriteIndex.push(animSpriteMetadata.name);
                    this._sprites[animSpriteMetadata.name] = animatedSprite;
                });
            });
        }
        /**
         * Returns the sprite based on the name.
         * @param {string} spriteName of sprite to return.
         */
        getSprite(spriteName) {
            return this._sprites[spriteName].copy();
        }
        /**
         * Returns the sprite based on the ordinal value.
         * @param {number} index of the sprite to return.
         */
        getSpriteByOrdinal(index) {
            return this._sprites[this._spriteIndex[index]];
        }
    }
})();