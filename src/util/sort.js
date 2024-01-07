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

hamonengine.util = hamonengine.util || {};
hamonengine.util.sort = class {
    constructor(options = {}) {
        //Default to the ascending comparison function if one is not supplied.
        if (!options.compareFunc)
            this._compareFunc = hamonengine.util.sort.sort.ascending;
        else
            this._compareFunc = options.compareFunc;
    }
    //--------------------------------------------------------
    // Methods
    //--------------------------------------------------------
    quickSort(arr) {
        //TODO: Add an immutable sort option to preserve the original array.
        hamonengine.util.sort.iquicksort(this._compareFunc, arr, 0, arr.length - 1);
    }
    /**
     * An ascending comparison function that uses the comparison operators.
     * @param {*} a 
     * @param {*} b 
     * @return {number} 0 if a==b, -1 if a is less than b, and 1 if a is greater than b.
     */
    static ascending(a, b) {
        return a === b ? 0 : (a < b ? -1 : 1);
    }
    /**
     * An descending comparison function that uses the comparison operators.
     * @param {*} a 
     * @param {*} b 
     * @return {number} 0 if a==b, -1 if a is less than b, and 1 if a is greater than b.
     */
    static descending(a, b) {
        return a === b ? 0 : (a < b ? 1 : -1);
    }
    /**
     * Performs an internal quicksort based on the array supplied and the left & right position within that array.
     * @param {Function} compareFunction the comparison function.
     * @param {*} arr An array of values to sort.
     * @param {*} left The left location to start with.
     * @param {*} right The right location to start with.
     */
    static iquicksort(compareFunction, arr, left, right) {
        let i = left;
        let j = right;
        const pivot = arr[Math.truncate((left + right) / 2)];

        /* partition */
        while (i <= j) {
            while (compareFunction(arr[i], pivot) < 0) i++;
            while (compareFunction(arr[j], pivot) > 0) j--;
            if (i <= j) {
                let tmp = arr[i];
                arr[i] = arr[j];
                arr[j] = tmp;
                i++;
                j--;
            }
        };

        /* recursion */
        if (left < j) {
            hamonengine.util.sort.iquicksort(compareFunction, arr, left, j);
        }

        if (i < right) {
            hamonengine.util.sort.iquicksort(compareFunction, arr, i, right);
        }
    }
}
