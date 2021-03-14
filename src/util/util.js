/**
* Copyright (c) 2020-2021, CaffeinatedRat.
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

const LOG_TYPE = {
    DISABLED: 0,
    INFO: 1,
    WARNING: 2,
    CRITICAL: 4,
    DEBUG: 8,
    ALL: 15
}

hamonengine.util = hamonengine.util || {
    loggerlevel: LOG_TYPE.DISABLED
};

(function () {
    /*
    hamonengine.util.logger = class {
        / **
         * Writes a message to the log if debugging is enabled.
         * @param {*} message 
         * /
        static debug(message, style) {
            if ((hamonengine.util.loggerlevel & LOG_TYPE.DEBUG) === LOG_TYPE.DEBUG) {
                if(style) {
                    console.log(message, style);
                } 
                else {
                    console.log(message);
                }
            }
        }
        / **
         * Writes a message to the info log if enabled.
         * @param {*} message 
         * /
        static info(message, style) {
            if ((hamonengine.util.loggerlevel & LOG_TYPE.INFO) === LOG_TYPE.INFO) {
                if(style) {
                    console.info(message, style);
                } 
                else {
                    console.info(message);
                }
            }
        }
        / **
         * Writes a message to the warning log if enabled.
         * @param {*} message 
         * /
        static warning(message, style) {
            if ((hamonengine.util.loggerlevel & LOG_TYPE.WARNING) === LOG_TYPE.WARNING) {
                if(style) {
                    console.warn(message, style);
                } 
                else {
                    console.warn(message);
                }                
            }
        }
    }
    */

    /**
     * Use the ES6 constructs instead.
     * Object.entries iterator construct.
     * Object.entries to get an iterative key-value pair.
     * Object.values to get an array of values on the object.
     */

    /**
     * Iterates through each object
     */
    /*
    Object.prototype.forEach = function (f) {
        if (f) {
            Object.keys(this).forEach(key => {
                if (this.hasOwnProperty(key)) {
                    f(key, this[key]);
                }
            });
        }
    };
    */

    /**
     * Returns an array of all object values.
    */
   /*
    Object.prototype.toArray = function () {
        let array = [];
        Object.keys(this).forEach(key => {
            if (this.hasOwnProperty(key)) {
                array.push(this[key]);
            }
        });
        return array;
    };
    */
    /**
     * Returns an array of all keys (property names).
    */
   /*
    Object.prototype.toKeyArray = function () {
        let keys = [];
        Object.keys(this).forEach(key => {
            if (this.hasOwnProperty(key)) {
                keys.push(key);
            }
        });
        return keys;
    };
    */
})();
