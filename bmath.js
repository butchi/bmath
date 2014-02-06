"use strict";
/* 
 * 現在2次元配列を想定
 */
function arrayQ(arr) {
	var i;
	var tmpLen=arr[0].length;
	for(i=1; i<arr.length; i++) {
		if(arr[i].length !==tmpLen) return false;
		tmpLen = arr[i].length;
	}
	return true;
}

/*
 * プリミティブ型および配列が同じかどうか比較
 */
function sameQ(arg1, arg2) {
	if(arg1 === arg2) {
		return true;
	}
	if(arg1 instanceof Array && arg2 instanceof Array) {
		var len = arg1.length;
		if(len !== arg2.length) {
			return false;
		}
		var i;
		for(i=0; i<len; i++) {
			if(!sameQ(arg1[i], arg2[i])) {
				return false;
			}
		}
		return true;
	} else {
		return false;
	}
}

function first(arr) {
	return arr[0];
}

function last(arr) {
	return arr[arr.length-1];
}

function rest(arr) {
	return arr.slice(1);
}

function most(arr) {
	return 	arr.slice(0, arr.length-1);
}

function take(arr, n) {
	if(n>=0) {
		return arr.slice(0, n);
	} else {
		return arr.slice(n);
	}
}

function drop(arr, n) {
	if(n>=0) {
		return arr.slice(n);
	} else {
		if(-n>arr.length) {
			return [];
		} else {
			return arr.slice(0,arr.length+n);
		}
	}
}


function constantArray(c, len) {
	var retArr = new Array(len);
	var i;
	for(i=0; i<len; i++) {
		retArr[i] = c;
	}
	return retArr;
}

function range(n) {
	var ret = [];
	var i;
	for(i=0; i<n; i++) {
		ret.push(i);
	}
	return ret;
}

function table() {
}

function append() {
}

function prepend() {
}

function insert() {
}

function delete_() {
}

function appendTo() {
}

function prependTo() {
}

function position(arr, x) {
	var ret = [];
	var len = arr.length;
	var i;
	for(i=0; i<len; i++) {
		if(sameQ(arr[i], x)) {
			ret.push(i);
		}
	}
	return ret;
}

function length(arr) {
	return arr.length;
}

/*
 * 現在1次元～2次元配列を想定
 */
function dimensions(arr) {
	if(arrayQ(arr)) {
		if(arr.length==0) {
			return [0];
		} else if(!(arr[0] instanceof Array)) {
			return [arr.length, 1]
		} else {
			var x = arr[0].length;
			var y = arr.length;
			return [x, y];
		}
	} else {
		return false;
	}
}

function select() {
}

function cases() {
}

function pick() {
}

function binLists() {
}

function flatten(arr) {
	if(arr instanceof Array) {
		var ret = [];
		var len = arr.length;
		var i;
		for(i=0; i<len; i++) {
			ret = ret.concat(flatten(arr[i]));
		}
		return ret;
	} else {
		return arr;
	}
}

function arrayFlatten() {
}

function join(arr1, arr2) {
	return [].concat.apply([], arguments);
}

/*
 * リスト list を一連の同一要素からなるサブリストに分割する．
 */
function split() {
}

/**
 * from http://code.jquery.com/jquery-1.8.2.js Sizzle.uniqueSort
 */
function union(results) {
	var elem,
		i = 1;
	
	//hasDuplicate = baseHasDuplicate;
	//results.sort( sortOrder );
	results.sort( function(a,b) {return a-b} );
	
	//if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				results.splice( i--, 1 );
			}
		}
	//}
	
	return results;
}

function deleteDuplicates() {
}

/*
 * Mathematica: list を重複しない長さ n のサブリストに分割する．
 */
function partition(arr, n) {
}

function replacePart() {
}

function total(arr) {
	// 数値の配列という前提
	var i;
	var len = arr.length;
	var ret = 0;
	for(i=0; i<len; i++) {
		ret += arr[i]
	}
	return ret;
}

function accumulate(arr) {
	// 数値の配列という前提
	var i;
	var len = arr.length;
	var ret = new Array(len);
	ret[0] = arr[0];
	for(i=1; i<len; i++) {
		ret[i] = ret[i-1] + arr[i];
	}
	return ret;
}

function differences(arr) {
	// 数値の配列という前提
	var i;
	var len = arr.length;
	var ret = new Array(len-1);
	for(i=0; i<len-1; i++) {
		ret[i] = arr[i+1] - arr[i];
	}
	return ret;
}

function max(arr) {
	// 数値の配列という前提
	return Math.max.apply(null, arr);
}

function min(arr) {
	// 数値の配列という前提
	return Math.min.apply(null, arr);
}

function mean(arr) {
	// 数値の配列という前提
	return total(arr)/arr.length;
}

function sort() {
}

function riffle() {
}

function padRight(arr, n, c) {
	if(typeof c == "undefined") {
		c = 0;
	}
	if(n>=arr.length) {
		return arr.concat(constantArray(c, n-arr.length));
	} else {
		return arr.slice(0, n);
	}
}

function padLeft(arr, n, c) {
	if(typeof c == "undefined") {
		c = 0;
	}
	if(n>=arr.length) {
		return constantArray(c, n-arr.length).concat(arr);
	} else {
		return arr.slice(-n);
	}
}

function rotateRight(arr, n) {
	if(typeof n == "undefined") {
		n = 1;
	}
	if(n<0) {
		return rotateLeft(arr, -n);
	}
	n = n % arr.length
	return arr.slice(-n).concat(arr.slice(0,arr.length-n));
}

function rotateLeft(arr, n) {
	if(typeof n == "undefined") {
		n = 1;
	}
	if(n<0) {
		return rotateRight(arr, -n);
	}
	n = n % arr.length
	return arr.slice(n).concat(arr.slice(0,n));
}

/*
[
  [1,2,3],
  [4,5,6]
]
*/

function transpose(arr) {
	/*
	var i, j;
	for(i=0; i<arr.length; i++) {
		var tmp = arr[i];
		for(j=0; j<arr[i].length; j++) {
			if(j==0) var retArr = new Array();
		}
	}
	*/
}

function map(f, arr) {
	var ret = [];
	var len = arr.length;
	var i;
	if(arr instanceof Array) {
		for(i=0; i<len; i++) {
			ret.push(f(arr[i]));
		}
	}
	return ret;
}

function mapAll(f, arr) {
	var ret = [];
	var len = arr.length;
	var i;
	if(arr instanceof Array) {
		for(i=0; i<len; i++) {
			if(arr[i] instanceof Array) {
				ret.push(mapAll(f, arr[i]));
			} else {
				ret.push(f(arr[i]));
			}
		}
	}
	return ret;
}
