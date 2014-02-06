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

function sameQ() {
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
	return 	arr.slice(0,arr.length-1);
}

function take() {
}

function drop() {
}


function constantArray(c, len) {
	var retArr = new Array(len);
	var i;
	for(i=0; i<len; i++) {
		retArr[i] = c;
	}
	return retArr;
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

function position() {
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

function select_() {
}

function cases() {
}

function pick() {
}

function binLists() {
}

function flatten() {
}

function join() {
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

/*
 * Mathematica: list を重複しない長さ n のサブリストに分割する．
 */
function partition(arr, n) {
}

function replacePart() {
}

function total() {
}

function accumulate() {
}

function differences() {
}

function max_() {
}

function min_() {
}

function sort_() {
}

function riffle() {
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
