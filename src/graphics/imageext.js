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
    
    hamonengine.graphics.imageext = class {
        constructor(options) {
            options = options || {}
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.imageext) {
                options = {
                    //Copy the raw image that will be unmodified.
                    image: options._image,
                }
            }

            this._image = options.image || new Image();
            this._state = IMAGE_STATES.UNLOADED;
            
            //Internal data.
            this._backbufferResource = null;
            this._backbufferCtx = null;

            hamonengine.util.logger.debug(`[hamonengine.graphics.imageext.constructor] Starting State: {${this._state}}`);
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
         * Assigns the image's src.
         */
        set src(v) {
            this._image.src = v;
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
            return this._backbufferResource ? this._backbufferResource : this._image;
        }
        /**
         * Returns the raw image.
         */
        get rawImage() {
            return this._image;
        } 
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a copy of the imageext.
         */
        copy() {
            return new hamonengine.graphics.imageext(this);
        }
        /**
         * Attempts to load the image based on the url provided.
         * @param {string} src url of the image.
         * @return {object} a promise to complete loading.
         */
        load(src) {
            this.src = src;
            this._state = IMAGE_STATES.LOADING;
            return new Promise((resolve, reject) => {
                //Handle a successful loading event and resolve the promise.
                this.image.addEventListener('load', () => {
                    this._state = IMAGE_STATES.COMPLETE;
                    resolve();
                }, false);

                //Handle errors and reject the promise.
                this.image.addEventListener('error', (error) => {
                    this._state = IMAGE_STATES.ERROR;
                    let imagePath = error && error.path && error.path.length > 0 && error.path[0].src || '';
                    let errorMsg = `The image '${imagePath}' could not be loaded.`;
                    reject(errorMsg, error);
                }, false);
            });
        }
        /**
         * Creates a new canvas.
         * @param {number} width of the canvas.
         * @param {number} height of the canvas.
         * @param {string} id the name of the canvas.
         * @returns {object} a newly created canvas
         */
        static createNewCanvas(width, height, id) {
            let canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            if (id) {
                canvas.setAttribute('id', id);
            }
            return canvas;
        }
        /**
         * Gets the image data of our raw image.
         * @param {object} region of the raw image to get.
         * @returns {object} ImageData of our raw image.
         */
        getImageData(region) {
                //Create a new canvas if this is the first time we're blending.
                this._backbufferResource = this._backbufferResource || hamonengine.graphics.imageext.createNewCanvas(this.rawImage.width, this.rawImage.height);
                
                //Draw the raw image to our modified canvas.
                this._backbufferCtx = this._backbufferCtx || this._backbufferResource.getContext('2d');
                this._backbufferCtx.drawImage(this.rawImage, 0, 0);

                //Normalize the dimensions.
                region = region || new hamonengine.geometry.rect();

                //Gather the source.
                return this._backbufferCtx.getImageData(region.x, region.y, region.width || this.rawImage.width, region.height || this.rawImage.height);
        }
        /**
         * Blends the image with the color supplied, for the region supplied.
         * @param {number} r red channel ranging from 0-255.
         * @param {number} g green channel ranging from 0-255.
         * @param {number} b blue channel ranging from 0-255.
         * @param {number} a alpha channel ranging from 0-255.
         * @param {object} region (hamonengine.geometry.rect) dimension to blend.
         * @param {number} blendingOps (BLENDING_OPS) blending operation to perform.
         */
        blendColorRegion(r=0, g=0, b=0, a=0, region, blendingOps) {
 
            if (this.complete) {

                //Gather the source.
                let sourceData = this.getImageData(region);

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
                let data = sourceData.data;
                for (let i = 0; i < data.length; i += 4) {
                    data[i]     = blendingMethod(r, data[i]);  //Red
                    data[i + 1] = blendingMethod(g, data[i+1]);//Green
                    data[i + 2] = blendingMethod(b, data[i+2]);//Blue
                    data[i + 3] = blendingMethod(a, data[i+3]);//Alpha
                }

                //Render the blending into the backbuffer.
                this._backbufferCtx.putImageData(sourceData, region.x, region.y);
            }
        }
        /**
         * Adjusts the channels for each color.
         * @param {number} r red channel ranging from 0.0-1.0.
         * @param {number} g green channel ranging from 0.0-1.0.
         * @param {number} b blue channel ranging from 0.0-1.0.
         * @param {number} a alpha channel ranging from 0.0-1.0.
         * @param {object} region (hamonengine.geometry.rect) dimension to blend.
         */
        adjustColorChannel(r=1.0, g=1.0, b=1.0, a=1.0, region) {
 
            if (this.complete) {

                //Gather the source.
                let sourceData = this.getImageData(region);

                //Adjust the colors.
                let data = sourceData.data;
                for (let i = 0; i < data.length; i += 4) {
                    data[i]   = Math.bitRound(data[i] * r); //Red
                    data[i+1] = Math.bitRound(data[i+1] * g); //Green
                    data[i+2] = Math.bitRound(data[i+2] * b); //Blue
                    data[i+3] = Math.bitRound(data[i+3] * a); //Alpha
                }

                //Render the blending into the backbuffer.
                this._backbufferCtx.putImageData(sourceData, region.x, region.y);
            }
        }
        /**
         * Performs a bitblit between two images where this is the destination and the source image is passed in.
         * @param {*} imageData to bitblit with.
         * @param {*} srcRegion the area to bitblit from.
         * @param {*} destRegion the area to bitblit onto.
         * @param {number} transparency the intensity of the pixel's transparency. 0.0 - 1.0 where 0 is transparent and 1 is opaque.
         */
        bitblit(imageData, srcRegion, destRegion, transparency=1.0) {
            if (this.complete) {

                //Normalize the image.
                if (imageData instanceof hamonengine.graphics.imageext) {
                    imageData = imageData.rawImage;
                }

                //Normalize the transparency.
                transparency = Math.max(Math.min(transparency, 1.0), 0.0);

                //Get the destination.
                let destImageData = this.getImageData(destRegion);

                //Get the canvas and source.
                let targetCanavs = hamonengine.graphics.imageext.createNewCanvas(imageData.width, imageData.height);
                let targetCtx = targetCanavs.getContext('2d');
                targetCtx.drawImage(imageData, 0, 0);
                let srcImageData = targetCtx.getImageData(srcRegion.x, srcRegion.y, srcRegion.width, srcRegion.height);

                //Get data references.
                let destData = destImageData.data;
                let srcData = srcImageData.data;

                //Always iterate through the shortest width & height.
                let minHeight = Math.max(srcRegion.height, destRegion.height);
                let minWidth = Math.max(srcRegion.width, destRegion.width);

                //Iterate through each row, then column.
                for (let row = 0; row < minHeight; row++) {
                    for (let col = 0; col < minWidth; col++) {
                        let destIndex = (row * destRegion.width + col) * 4;
                        let srcIndex = (row * srcRegion.width + col) * 4;
                        
                        //Calculate the complement, as long as the alpha channel is not transparent.
                        let transparencyComplement = (srcData[srcIndex+3] > 0) ? (1.0 - transparency) : 1.0;
                        destData[destIndex] = Math.bitRound(destData[destIndex] * transparencyComplement + srcData[srcIndex] * transparency);
                        destData[destIndex+1] = Math.bitRound(destData[destIndex+1] * transparencyComplement + srcData[srcIndex+1] * transparency);
                        destData[destIndex+2] = Math.bitRound(destData[destIndex+2] * transparencyComplement + srcData[srcIndex+2] * transparency);
                        //Always enforce opaque pixels during a bitblit.
                        destData[destIndex+3] = 255;
                    }
                }

                //Render the bitblit image.
                this._backbufferCtx.putImageData(destImageData, destRegion.x, destRegion.y);
            }
        }
    }
})();