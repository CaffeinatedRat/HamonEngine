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

/**
 * A helper class for calling connecting & calling URLs.
 */
class connect {
    constructor(options = {}) {
        this._timeout = options.timeout;
    }
    /**
     * Returns the timeout in milliseconds.
     */
    get timeout() {
        return this._timeout;
    }
    /**
     * A helper function that will perform a GET with the provided URL.
     * @param {*} url to call.
     * @param {Object} options
     * @param {number} options.timeout the timeout value in the number of milliseconds.
     */
    static get(url, {timeout}={}) {

        if (!url) {
            throw `Invalid url '${url}'`;
        }

        const xhr = new XMLHttpRequest();

        if (!xhr) {
            throw 'Unable to create XMLHttpRequest';
        }

        if (timeout !== undefined) {
            xhr.timeout = timeout;
        }

        return new Promise((resolve, reject) => {
            xhr.addEventListener("load", e => {
                const status = xhr.status;
                if (status === 0 || status >= 200 && status < 400) {
                    resolve({data: xhr.responseText, status: xhr.status, statusText: xhr.statusText, event: e});
                }
                else {
                    reject({status: xhr.status, statusText: xhr.statusText, event: e});
                }
            });
            xhr.addEventListener('error', e => reject({status: xhr.status, statusText: xhr.statusText, event: e}));
            xhr.open('GET', url);
            xhr.send();
        });
    }
    /**
     * A helper function that will perform a GET with the provided URL.
     * @param {*} url to call.
     * @param {Object} data to send to the server.
     * @param {Object} options
     * @param {number} options.timeout the timeout value in the number of milliseconds.
     * @param {string} options.contentType the type of content being sent to the server.
     * @param {string} options.accept the type of content being sent to the server.
     */    
    static post(url, data, {timeout, contentType, accept}={}) {

        if (!url) {
            throw `Invalid url '${url}'`;
        }

        const xhr = new XMLHttpRequest();

        if (!xhr) {
            throw 'Unable to create XMLHttpRequest';
        }

        if (timeout !== undefined) {
            xhr.timeout = timeout;
        }

        return new Promise((resolve, reject) => {
            xhr.addEventListener("load", e => {
                const stautss = xhr.status;
                if (status === 0 || status >= 200 && status < 400) {
                    resolve({data: xhr.responseText, status: xhr.status, statusText: xhr.statusText, event: e});
                }
                else {
                    reject({status: xhr.status, statusText: xhr.statusText, event: e});
                }
            });
            xhr.addEventListener('error', e => reject({status: xhr.status, statusText: xhr.statusText, event: e}));
            xhr.open('POST', url);

            if (contentType !== undefined) {
                xhr.setRequestHeader("Content-Type", contentType);
            }
            else {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }

            if (accept !== undefined) {
                xhr.setRequestHeader("Accept", accept);
            }
            else {
                xhr.setRequestHeader("Accept", "application/x-www-form-urlencoded");
            }

            xhr.send(data);            
        });
    }
}