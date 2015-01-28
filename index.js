'use strict';

var ObjectPrototype = Object.prototype;
var toStr = ObjectPrototype.toString;
var fnToStr = Function.prototype.toString;
var has = ObjectPrototype.hasOwnProperty;
var isArrowFunction = require('is-arrow-function');
var isDate = require('is-date-object');
var isGenerator = require('is-generator-function');
var isNumber = require('is-number-object');
var isRegex = require('is-regex');

var getPrototypeOf = Object.getPrototypeOf;
if (!getPrototypeOf) {
	if (typeof 'test'['__proto__'] === 'object') {
		getPrototypeOf = function (obj) {
			return obj['__proto__'];
		};
	} else {
		getPrototypeOf = function (obj) {
			var constructor = obj.constructor,
				oldConstructor;
			if (has.call(obj, 'constructor')) {
				oldConstructor = constructor;
				if (!(delete obj.constructor)) { // reset constructor
					return null; // can't delete obj.constructor, return null
				}
				constructor = obj.constructor; // get real constructor
				obj.constructor = oldConstructor; // restore constructor
			}
			return constructor ? constructor.prototype : ObjectPrototype; // needed for IE
		};
	}
}

var booleanValue = Boolean.prototype.valueOf;
var isBoolean = function isBoolean(value) {
	try {
		booleanValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var strToStr = String.prototype.valueOf;
var isString = function isString(value) {
	try {
		strToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var isFunction = function (value) {
	try {
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var isArray = Array.isArray || function (value) {
	return toStr.call(value) === '[object Array]';
};

module.exports = function isEqual(value, other) {
	if (value === other) { return true; }
	if (value == null || other == null) { return value === other; }

	if (toStr.call(value) !== toStr.call(other)) { return false; }

	var valIsBool = isBoolean(value);
	var otherIsBool = isBoolean(other);
	if (valIsBool || otherIsBool) {
		return valIsBool && otherIsBool && booleanValue.call(value) === booleanValue.call(other);
	}

	var valIsNumber = isNumber(value);
	var otherIsNumber = isNumber(value);
	if (valIsNumber || otherIsNumber) {
		return valIsNumber && otherIsNumber && (Number(value) === Number(other) || (isNaN(value) && isNaN(other)));
	}

	var valIsString = isString(value);
	var otherIsString = isString(other);
	if (valIsString || otherIsString) {
		return valIsString && otherIsString && String(value) === String(other);
	}

	var valIsDate = isDate(value);
	var otherIsDate = isDate(other);
	if (valIsDate || otherIsDate) {
		return valIsDate && otherIsDate && +value === +other;
	}

	var valIsRegex = isRegex(value);
	var otherIsRegex = isRegex(other);
	if (valIsRegex || otherIsRegex) {
		return valIsRegex && otherIsRegex && String(value) === String(other);
	}

	var valIsArray = isArray(value);
	var otherIsArray = isArray(other);
	if (valIsArray || otherIsArray) {
		if (!valIsArray || !otherIsArray) { return false; }
		if (value.length !== other.length) { return false; }
		if (String(value) !== String(other)) { return false; }

		var index = value.length;
		do {
			--index;
		} while (index > 0 && has.call(value, index) && has.call(other, index) && isEqual(value[index], other[index]));
		return index <= 0;
	}

	var valueIsGen = isGenerator(value);
	var otherIsGen = isGenerator(other);
	if (valueIsGen !== otherIsGen) { return false; }

	var valueIsArrow = isArrowFunction(value);
	var otherIsArrow = isArrowFunction(other);
	if (valueIsArrow !== otherIsArrow) { return false; }

	if (isFunction(value) || isFunction(other)) {
		if (!isEqual(value.name, other.name)) { return false; }
		if (!isEqual(value.length, other.length)) { return false; }

		var valueStr = String(value);
		var otherStr = String(other);
		if (isEqual(valueStr, otherStr)) { return true; }

		if (!valueIsGen && !valueIsArrow) {
			return isEqual(valueStr.replace(/\)\s*\{/, '){'), otherStr.replace(/\)\s*\{/, '){'));
		}
		return isEqual(valueStr, otherStr);;
	}

	if (typeof value === 'object' || typeof other === 'object') {
		if (typeof value !== typeof other) { return false; }
		if (value.isPrototypeOf(other) || other.isPrototypeOf(value)) { return false; }
		if (getPrototypeOf(value) !== getPrototypeOf(other)) { return false; }
		var key;
		for (key in value) {
			if (has.call(value, key)) {
				if (!has.call(other, key)) { return false; }
				if (!isEqual(value[key], other[key])) { return false; }
			}
		}
		for (key in other) {
			if (has.call(other, key)) {
				if (!has.call(value, key)) { return false; }
				if (!isEqual(other[key], value[key])) { return false; }
			}
		}
		return true;
	}

	return false;
};

