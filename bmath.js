(function() {
  'use strict';
  window.bMath = window.bMath || {};
  /* 
   * 現在2次元配列を想定
   */
  bMath.arrayQ = function(arr) {
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
  bMath.sameQ = function(arg1, arg2) {
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
        if(!bMath.sameQ(arg1[i], arg2[i])) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  bMath.first = function(arr) {
    return arr[0];
  }

  bMath.last = function(arr) {
    return arr[arr.length-1];
  }

  bMath.rest = function(arr) {
    return arr.slice(1);
  }

  bMath.most = function(arr) {
    return arr.slice(0, arr.length-1);
  }

  bMath.take = function(arr, n) {
    if(n>=0) {
      return arr.slice(0, n);
    } else {
      return arr.slice(n);
    }
  }

  bMath.drop = function(arr, n) {
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


  bMath.constantArray = function(c, len) {
    var i,
        d,
        lenArr,
        lastLen,
        retArr;

    if(typeof len === 'number') {
      retArr = new Array(len);
      for(i = 0; i < len; i++) {
        retArr[i] = c;
      }
      return retArr;
    } else if(len instanceof Array) {
      lenArr = len;
      lastLen = lenArr.pop();
      retArr = new Array(lastLen);
      if(lenArr.length === 0) {
        retArr = bMath.constantArray(c, lastLen);
      } else {
        for(i = 0; i < lastLen; i++) {
          retArr[i] = bMath.constantArray(c, bMath.cloneArray(lenArr));
        }
      }

      return retArr;
    }
  };

  bMath.cloneArray = function(arr) {
    var i,
        len,
        ret;
    if(typeof arr === 'number') {
      return arr;
    } else if(arr instanceof Array) {
      len = arr.length;
      ret = new Array(len);
      for(i = 0; i < len; i++) {
        ret[i] = bMath.cloneArray(arr[i]);
      }
      return ret;
    }
  };

  bMath.range = function(n) {
    var ret = [];
    var i;
    for(i=0; i<n; i++) {
      ret.push(i);
    }
    return ret;
  }

  /*
  bMath.table = function() {
  }

  bMath.append = function() {
  }

  bMath.prepend = function() {
  }

  bMath.insert = function() {
  }

  bMath.delete = function() {
  }

  bMath.appendTo = function() {
  }

  bMath.prependTo = function() {
  }
  */

  bMath.position = function(arr, x) {
    var ret = [];
    var len = arr.length;
    var i;
    for(i=0; i<len; i++) {
      if(bMath.sameQ(arr[i], x)) {
        ret.push(i);
      }
    }
    return ret;
  }

  bMath.length = function(arr) {
    return arr.length;
  }

  /*
   * 現在1次元～2次元配列を想定
   */
  bMath.dimensions = function(arr) {
    if(bMath.arrayQ(arr)) {
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

  /*
  bMath.select = function() {
  }

  bMath.cases = function() {
  }

  bMath.pick = function() {
  }

  bMath.binLists = function() {
  }
  */

  bMath.flatten = function(arr) {
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

  /*
   *  内部配列の最大サイズを元に平坦配列を構成
   */
  // Example: 
  // bMath.arrayFlatten(
  //   [
  //     [
  //       [
  //         [1,2,3],[4,5,6]
  //       ],[
  //         [7,8,9],[10,11,12]
  //       ]
  //     ],
  //     [
  //       [
  //         [13,14,15],[16,17,18]
  //       ],[
  //         [19,20,21],[22,23,24]
  //       ]
  //     ]
  //   ]
  // );
  bMath.arrayFlatten = function(arr) {
    var x, y, d, tableD, tableW, tableH, cellWMax, cellHMax, w, h, flattenArr, ret;

    tableD = bMath.dimensions(arr);
    tableW = tableD[0];
    tableH = tableD[1];
    cellWMax = 0;
    cellHMax = 0;
    if(bMath.arrayQ(arr)) {
      // 内部配列の最大次元を求める
      for(y = 0; y < arr.length; y++) {
        for(x = 0; x < arr[y].length; x++) {
          d = bMath.dimensions(arr[y][x]);
          cellWMax = Math.max(cellWMax, d[0]);
          cellHMax = Math.max(cellHMax, d[1]);
        }
      }

      w = tableW * cellWMax;
      h = tableH * cellHMax;

      flattenArr = bMath.constantArray(undefined, [w, h]);

      for(y = 0; y < h; y++) {
        for(x = 0; x < w; x++) {
          flattenArr[y][x] = arr[Math.floor(y / cellHMax)][Math.floor(x / cellWMax)][y % cellHMax][x % cellWMax];
        }
      }

      ret = flattenArr;
      return ret;
    }
  };

  bMath.join = function(arr1, arr2) {
    return [].concat.apply([], arguments);
  }

  /*
   * リスト list を一連の同一要素からなるサブリストに分割する．
   */
   /*
  bMath.split = function() {
  }
  */

  /**
   * from http://code.jquery.com/jquery-1.8.2.js Sizzle.uniqueSort
   */
  bMath.union = function(results) {
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

  bMath.deleteDuplicates = function() {
  }

  /*
   * Mathematica: list を重複しない長さ n のサブリストに分割する．
   */
   /*
  bMath.partition = function(arr, n) {
  }
  */

  /*
  bMath.replacePart = function() {
  }
  */

  bMath.total = function(arr) {
    // 数値の配列という前提
    var i;
    var len = arr.length;
    var ret = 0;
    for(i=0; i<len; i++) {
      ret += arr[i]
    }
    return ret;
  }

  bMath.accumulate = function(arr) {
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

  bMath.differences = function(arr) {
    // 数値の配列という前提
    var i;
    var len = arr.length;
    var ret = new Array(len-1);
    for(i=0; i<len-1; i++) {
      ret[i] = arr[i+1] - arr[i];
    }
    return ret;
  }

  bMath.max = function(arr) {
    // 数値の配列という前提
    return Math.max.apply(null, arr);
  }

  bMath.min = function(arr) {
    // 数値の配列という前提
    return Math.min.apply(null, arr);
  }

  bMath.mean = function(arr) {
    // 数値の配列という前提
    return bMath.total(arr)/arr.length;
  }

  /*
  bMath.sort = function() {
  }

  bMath.riffle = function() {
  }
  */

  bMath.padRight = function(arr, n, c) {
    if(typeof c == 'undefined') {
      c = 0;
    }
    if(n>=arr.length) {
      return arr.concat(constantArray(c, n-arr.length));
    } else {
      return arr.slice(0, n);
    }
  }

  bMath.padLeft = function(arr, n, c) {
    if(typeof c == 'undefined') {
      c = 0;
    }
    if(n>=arr.length) {
      return bMath.constantArray(c, n-arr.length).concat(arr);
    } else {
      return arr.slice(-n);
    }
  }

  bMath.rotateRight = function(arr, n) {
    if(typeof n == 'undefined') {
      n = 1;
    }
    if(n<0) {
      return bMath.rotateLeft(arr, -n);
    }
    n = n % arr.length;
    return arr.slice(-n).concat(arr.slice(0,arr.length-n));
  }

  bMath.rotateLeft = function(arr, n) {
    if(typeof n == 'undefined') {
      n = 1;
    }
    if(n<0) {
      return bMath.rotateRight(arr, -n);
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
  /*
  bMath.transpose = function(arr) {
    var i, j;
    for(i=0; i<arr.length; i++) {
      var tmp = arr[i];
      for(j=0; j<arr[i].length; j++) {
        if(j==0) var retArr = new Array();
      }
    }
  }
  */

  bMath.map = function(f, arr) {
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

  bMath.mapAll = function(f, arr) {
    var ret = [];
    var len = arr.length;
    var i;
    if(arr instanceof Array) {
      for(i=0; i<len; i++) {
        if(arr[i] instanceof Array) {
          ret.push(bMath.mapAll(f, arr[i]));
        } else {
          ret.push(f(arr[i]));
        }
      }
    }
    return ret;
  }

  /*
  bMath.fourier = function(arr) {
  }
  */
}());