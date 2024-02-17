/**
* Copyright \(c\) 2020-2024, CaffeinatedRat.
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

(function () {

    const IMAGE_STATES = {
        UNLOADED: 0,
        LOADING: 1,
        COMPLETE: 2,
        ERROR: 3
    };

    /**
     * This class represents an image extension wrapper that provides helper methods for handling image manipulation and canvas creation.
     */
    hamonengine.graphics.imageext = class {
        constructor(options = {}) {
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.imageext) {
                options = {
                    //Copy the raw image that will be unmodified.
                    image: options._image,
                }
            }

            this._image = options.image ?? new Image();
            this._state = IMAGE_STATES.UNLOADED;

            //Internal data buffer (canvas) that replace the _image once pixel data is manipulated since the _image is immutable a canvas must be used instead.
            this._internalBufferResource = null;
            this._internalBufferCtx = null;
            this._dirty = true;

            hamonengine.debug && hamonengine.verbose && console.debug(`[hamonengine.graphics.imageext.constructor] Starting State: ${this._state}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the image's src.
         */
        get src() {
            return this._image.src;
        }
        /**
         * Returns true if the image has completed loading.
         */
        get complete() {
            return this._image.complete;
        }
        /**
         * Determines if the imageext is ready.
         */
        get isLoaded() {
            return this._state === IMAGE_STATES.COMPLETE;
        }
        /**
         * Returns the current image resource.
         */
        get image() {
            return this._internalBufferResource ? this._internalBufferResource : this._image;
        }
        /**
         * Returns the raw image.
         */
        get rawImage() {
            return this._image;
        }
        /**
         * Returns the full width of the image.
         */
        get width() {
            return this.image.width;
        }
        /**
         * Returns the full height of the image.
         */
        get height() {
            return this.image.height;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the imageext.
         */
        clone() {
            return new hamonengine.graphics.imageext(this);
        }
        /**
         * Attempts to load the image based on the url provided.
         * @param {string} src url of the image.
         * @return {Object} a promise to complete loading.
         */
        async load(src = '') {
            //Handle statically loaded image; those the DOM may have already loaded.
            if (src !== '') {
                this._image.src = src;
            }

            this._state = IMAGE_STATES.LOADING;
            return new Promise((resolve, reject) => {
                if (!this.complete) {

                    const loadCompleted = () => {
                        this._state = IMAGE_STATES.COMPLETE;
                        this.image.removeEventListener('load', loadCompleted, false);
                        hamonengine.debug && console.debug(`[hamonengine.graphics.imageext.load] Image '${src}' has loaded successfully.`);
                        resolve();
                    };

                    //Handle a successful loading event and resolve the promise.
                    this.image.addEventListener('load', loadCompleted, false);

                    const handleError = (error) => {
                        this._state = IMAGE_STATES.ERROR;
                        const imagePath = error?.path && error?.path.length > 0 && error?.path[0].src || error?.currentTarget?.src || '';
                        const errorMsg = `The image '${imagePath}' could not be loaded.`;
                        this.image.removeEventListener('error', error => handleError(error), false);
                        reject(errorMsg);
                    };

                    //Handle errors and reject the promise.
                    this.image.addEventListener('error', error => handleError(error), false);
                }
                else {
                    this._state = IMAGE_STATES.COMPLETE;
                    resolve();
                }
            });
        }
        /**
         * Gets the image data of our raw image.
         * @param {Object} region of the raw image to get.
         * @returns {Object} ImageData of our raw image.
         */
        getImageData(region) {
            //Create a new canvas if this is the first time we're blending.
            this._internalBufferResource = this._internalBufferResource ?? hamonengine.graphics.layer.createNewCanvas(this.rawImage.width, this.rawImage.height, {isOffscreen: true});

            //Draw the raw image to our modified canvas.
            this._internalBufferCtx = this._internalBufferCtx ?? this._internalBufferResource.getContext('2d', {
                willReadFrequently: true
            });

            if (this._dirty) {
                this._internalBufferCtx.drawImage(this.rawImage, 0, 0);
                this._dirty = false;
            }

            //Normalize the dimensions.
            region = region ?? new hamonengine.geometry.rect();

            //Gather the source.
            return this._internalBufferCtx.getImageData(region.x, region.y, region.width ?? this.rawImage.width, region.height ?? this.rawImage.height);
        }
        /**
         * Blends the image with the color supplied, for the region supplied.
         * NOTE: This method is mutable!
         * @param {number} r red channel ranging from 0-255.
         * @param {number} g green channel ranging from 0-255.
         * @param {number} b blue channel ranging from 0-255.
         * @param {number} a alpha channel ranging from 0-255.
         * @param {Object} region (hamonengine.geometry.rect) dimension to blend.
         * @param {number} blendingOps (BLENDING_OPS) blending operation to perform.
         */
        blendColorRegion(r = 0, g = 0, b = 0, a = 0, region = null, blendingOps = BLENDING_OPS.REPLACE) {
            if (this.complete) {
                //Gather the source.
                const sourceData = this.getImageData(region);
                const data = sourceData.data;
                //Length caching for large date sets.
                const length = data.length;

                //Get the blending method.
                let blendingMethod = (s, d) => (s > 0) ? s : d;
                switch (blendingOps) {
                    case BLENDING_OPS.ADD:
                        blendingMethod = (s, d) => (s > 0) ? Math.min(s + d, 255) : d;
                        break;

                    case BLENDING_OPS.MULTIPLY:
                        blendingMethod = (s, d) => (s > 0) ? Math.min(s * d, 255) : d;
                        break;

                    case BLENDING_OPS.AND:
                        blendingMethod = (s, d) => (s > 0) ? Math.min(s & d, 255) : d;
                        break;

                    case BLENDING_OPS.OR:
                        blendingMethod = (s, d) => (s > 0) ? Math.min(s | d, 255) : d;
                        break;

                    case BLENDING_OPS.XOR:
                        blendingMethod = (s, d) => (s > 0) ? Math.min(s ^ d, 255) : d;
                        break;

                    case BLENDING_OPS.DIFFERENCE:
                        blendingMethod = (s, d) => (s > 0) ? Math.min(s - d, 255) : d;
                        break;
                }

                //Blend the colors.
                for (let i = 0; i < length; i += 4) {
                    data[i] = blendingMethod(r, data[i]);  //Red
                    data[i + 1] = blendingMethod(g, data[i + 1]);//Green
                    data[i + 2] = blendingMethod(b, data[i + 2]);//Blue
                    data[i + 3] = blendingMethod(a, data[i + 3]);//Alpha
                }

                //Render the blending into the internal buffer.
                this._internalBufferCtx.putImageData(sourceData, region.x, region.y);
                this._dirty = true;
            }
        }
        /**
         * Adjusts the channels for each color.
         * NOTE: This method is mutable!
         * @param {number} r red channel ranging from 0.0-1.0.
         * @param {number} g green channel ranging from 0.0-1.0.
         * @param {number} b blue channel ranging from 0.0-1.0.
         * @param {number} a alpha channel ranging from 0.0-1.0.
         * @param {Object} region (hamonengine.geometry.rect) dimension to blend.
         */
        adjustColorChannel(r = 1.0, g = 1.0, b = 1.0, a = 1.0, region = null) {
            if (this.complete) {
                //Gather the source.
                const sourceData = this.getImageData(region);
                const data = sourceData.data;
                //Length caching for large date sets.
                const length = data.length;

                //Adjust the colors.
                for (let i = 0; i < length; i += 4) {
                    data[i] = Math.bitRound(data[i] * r); //Red
                    data[i + 1] = Math.bitRound(data[i + 1] * g); //Green
                    data[i + 2] = Math.bitRound(data[i + 2] * b); //Blue
                    data[i + 3] = Math.bitRound(data[i + 3] * a); //Alpha
                }

                //Render the blending into the internal buffer.
                this._internalBufferCtx.putImageData(sourceData, region.x, region.y, region.x, region.y, region.width, region.height);
                this._dirty = true;
            }
        }
        /**
         * Performs a bitblit between two images where this is the destination and the source image is passed in.
         * NOTE: This method is mutable!
         * WARNING: This operation is expensive.
         * @param {Object} imageData to bitblit with.
         * @param {Object} srcRegion the area to bitblit from.
         * @param {Object} destRegion the area to bitblit onto.
         * @param {number} transparency the intensity of the pixel's transparency. 0.0 - 1.0 where 0 is transparent and 1 is opaque.
         */
        bitblit(imageData, srcRegion, destRegion, transparency = 1.0) {
            if (this.complete && imageData.complete) {
                //Normalize the image.
                if (imageData instanceof hamonengine.graphics.imageext) {
                    imageData = imageData.rawImage;
                }

                //Normalize the transparency.
                transparency = Math.max(Math.min(transparency, 1.0), 0.0);

                //Get the destination.
                const destImageData = this.getImageData(destRegion);

                //Get the canvas and source.
                const targetCanavs = hamonengine.graphics.layer.createNewCanvas(imageData.width, imageData.height, {isOffscreen: true});
                const targetCtx = targetCanavs.getContext('2d');
                targetCtx.drawImage(imageData, 0, 0);
                const srcImageData = targetCtx.getImageData(srcRegion.x, srcRegion.y, srcRegion.width, srcRegion.height);

                //Get data references.
                const destData = destImageData.data;
                const srcData = srcImageData.data;

                //Iterate through each row, then column.
                for (let row = 0; row < destRegion.height; row++) {
                    //Break bitblit if we've exceeded the source's height.
                    if (row >= srcRegion.height) {
                        break;
                    }

                    const destWidth = row * destRegion.width;
                    const srcWidth = row * srcRegion.width;

                    for (let col = 0; col < destRegion.width; col++) {
                        //Break bitblit if we've exceeded the source's width.
                        if (col >= srcRegion.width) {
                            break;
                        }

                        const destIndex = (destWidth + col) * 4;
                        const srcIndex = (srcWidth + col) * 4;

                        //Calculate the complement, as long as the alpha channel is not transparent.
                        const transparencyComplement = (srcData[srcIndex + 3] > 0) ? (1.0 - transparency) : 1.0;
                        destData[destIndex] = Math.bitRound(destData[destIndex] * transparencyComplement + srcData[srcIndex] * transparency);
                        destData[destIndex + 1] = Math.bitRound(destData[destIndex + 1] * transparencyComplement + srcData[srcIndex + 1] * transparency);
                        destData[destIndex + 2] = Math.bitRound(destData[destIndex + 2] * transparencyComplement + srcData[srcIndex + 2] * transparency);

                        //Blend the alpha channel so that the source & destination's alpha channels are preserved.
                        //destData[destIndex+3] = Math.bitRound(destData[destIndex+3] * (1.0 - transparency) + srcData[srcIndex+3] * transparency);
                    }
                }

                //Render the bitblit image.
                this._internalBufferCtx.putImageData(destImageData, destRegion.x, destRegion.y);
                this._dirty = true;
            }
        }
        /**
         * Draws the imageext at the specific location with the current width & height.
         * @param {Object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the optional width of the sprite to scale.
         * @param {number} height the option height of the sprite to scale.
         */
        draw(layer, elapsedTimeInMilliseconds, x, y, width = this.width, height = this.height) {
            layer.drawImage(this, x, y, this.width, this.height, x, y, width, height);
        }
        /**
         * Releases resources.
         */
        release() {
            if (this._internalBufferCtx) {
                delete this._internalBufferCtx;
            }

            if (this._internalBufferResource) {
                this._internalBufferResource.release();
                delete this._internalBufferResource;
            }

            delete this._image;
        }
    }
})();