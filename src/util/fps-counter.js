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

hamonengine.util = hamonengine.util || {};

(function() {
    const MILLISECONDS = 1000;

    hamonengine.util.fpscounter = class {
        constructor(options={}) {
            this._globalStartTime = 0;
            this._frameCounter=0;
            this._fps = 0;
            this._spf = 0;
            this._minFPS = MILLISECONDS;
            this._maxFPS = 0;
        }
        /**
         * Returns the seconds per frame.
         */
        get SPF() {
            return this._spf;
        }
        /**
         * Returns the frames per second.
         */
        get FPS() {
            return this._fps;
        }
        /**
         * Returns the minimum frames per second.
         */
        get minFPS() {
            return this._minFPS;
        }
        /**
         * Returns the maximum frames per second.
         */
        get maxFPS() {
            return this._maxFPS;
        }
        /**
         * Starts/Restarts the FPS counter.
         */
        start() {
            this._globalStartTime = Date.now();
            this._frameCounter=0;
            this._fps = 0;
            this._spf = 0;
            this._minFPS = MILLISECONDS;
            this._maxFPS = 0;
        }
        /**
         * Begins the recording the seconds per frame.
         * This is not required for calculating FPS only SFP.
         */
        begin () {
            this._frameStartTime = Date.now();
        }
        /**
         * Ends the recording of the SPF & FPS.
         */
        end () {
            if (this._startTime === 0) {
                throw "[hamonengine.util.fpsCounter.end] Begin was not called before end.";
            }

            let frameEndTime = Date.now();

            //Increment the frame counter.
            this._frameCounter++;

            //Record the number of seconds per frame.
            this._spf = (frameEndTime - this._frameStartTime) * MILLISECONDS;

            //If the frame end time is greater than the global start time by 1000ms then
            // a) Get the FPS.
            // b) Get the minimum FPS.
            // c) Get the maximum FPS.
            // d) Reset the global start time.
            // e) Reset the frame counter.
            if (frameEndTime > this._globalStartTime + MILLISECONDS) {
                this._fps = Math.round(MILLISECONDS * this._frameCounter / (frameEndTime - this._globalStartTime)),
                this._minFPS = Math.min(this._minFPS, this._fps); 
                this._maxFPS = Math.max(this._maxFPS, this._fps);
                this._globalStartTime = frameEndTime;
                this._frameCounter = 0;
            }
        }
    }
})();