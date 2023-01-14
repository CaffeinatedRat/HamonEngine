/**
* Copyright \(c\) 2020-2023, CaffeinatedRat.
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

/**
 * This class supports inline webworker functionality.
 * The concept is based on the work of Danny Blue.
 * //https://medium.com/@dee_bloo/make-multithreading-easier-with-inline-web-workers-a58723428a42
 */    
class worker {
    constructor(options={}) {
        //Handle copy-constructor operations.
        if (options instanceof worker) {
            options = {
                //Copy the raw image that will be unmodified.
                blob: options.blob,
                method: options.method
            }
        }

        if (!options.method) {
            console.error(`[worker.constructor] Unable to create a workert: options.method is undefined!`);
            throw 'Cannot create the worker';
        }

        this._method = options.method;
        this._blob = options.blob || new Blob([`onmessage = ${options.method.toString()};`], { type: 'text/javascript' });
        this._url = URL.createObjectURL(this._blob);
        this._worker = new Worker(this._url);
    }
    //--------------------------------------------------------
    // Properties
    //--------------------------------------------------------
    /**
     * Gets the worker's blob.
     */
    get blob() {
        return this._blob;
    }
    /**
     * Gets the worker's method.
     */
    get method() {
        return this._method;
    }
    /**
     * Gets the worker's url.
     */
    get url() {
        return this._url;
    }
    /**
     * Gets the worker.
     */
    get worker() {
        return this._worker;
    }      
    /**
     * Creates a new instance of worker.
     * @param {Function} method 
     */
    static create(method) {
        return new worker({ method });
    }
    /**
     * Runs the worker and returns a promise.
     * @param {*} data 
     * @returns a promise.
     */
    async run(data) {
        return new Promise((resolve, reject) => {
            this.worker.onmessage = (e) => {
                resolve(e.data);
                URL.revokeObjectURL(this.url);
            };

            this.worker.onerror = (e) => {
                reject(e);
                URL.revokeObjectURL(this.url); 
            }

            this.worker.postMessage(data);
        });
    }
}