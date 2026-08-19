window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-wallpaper",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region ../../../vendor/cosmokit/src/misc.ts
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/types.ts
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		let Binary;
		(function(_Binary) {
			_Binary.is = isArrayBufferLike;
			_Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			_Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			_Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			_Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			_Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			_Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
		function deepEqual(a, b, strict) {
			if (a === b) return true;
			if (!strict && isNullable(a) && isNullable(b)) return true;
			if (typeof a !== typeof b) return false;
			if (typeof a !== "object") return false;
			if (!a || !b) return false;
			function check(test, then) {
				return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
			}
			return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? Object.keys({
				...a,
				...b
			}).every((key) => deepEqual(a[key], b[key], strict));
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/time.ts
		let Time;
		(function(_Time) {
			_Time.millisecond = 1;
			const second = _Time.second = 1e3;
			const minute = _Time.minute = second * 60;
			const hour = _Time.hour = minute * 60;
			const day = _Time.day = hour * 24;
			const week = _Time.week = day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			_Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			_Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / minute - offset) / 1440);
			}
			_Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * minute);
			}
			_Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * week || 0) + (parseFloat(capture[2]) * day || 0) + (parseFloat(capture[3]) * hour || 0) + (parseFloat(capture[4]) * minute || 0) + (parseFloat(capture[5]) * second || 0);
			}
			_Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			_Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= day - hour / 2) return Math.round(ms / day) + "d";
				else if (abs >= hour - minute / 2) return Math.round(ms / hour) + "h";
				else if (abs >= minute - second / 2) return Math.round(ms / minute) + "m";
				else if (abs >= second) return Math.round(ms / second) + "s";
				return ms + "ms";
			}
			_Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			_Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			_Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/src/index.ts
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			options;
			name = "ValidationError";
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		const resolvers = {};
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region lib/types/wallpaper-settings.js
		/** Wallpaper preferences stored in the Host user-settings document. */
		/** Built-in wallpaper sources accepted at the registry and settings boundaries. */
		const WALLPAPER_MODES = [
			"none",
			"image",
			"url",
			"desktop"
		];
		/** Settings namespace owned by the wallpaper plugin. */
		const WALLPAPER_SETTINGS_NAMESPACE = "ui-wallpaper";
		/** Field names of the durable wallpaper section. */
		const WALLPAPER_SETTINGS_FIELDS = {
			MODE: "mode",
			VALUE: "value",
			BLUR: "blur",
			DIM: "dim",
			SURFACE_ALPHA: "surfaceAlpha",
			WE_KEY: "weKey",
			TEXT_FONT: "textFont",
			TEXT_WEIGHT: "textWeight",
			TEXT_COLOR: "textColor",
			TEXT_OPACITY: "textOpacity",
			TEXT_OUTLINE: "textOutline",
			CODE_BACKGROUND: "codeBackground"
		};
		/** Built-in chat font families (high-contrast, wallpaper-friendly). */
		const TEXT_FONTS = [
			"system",
			"serif",
			"mono",
			"rounded"
		];
		/** Chat font weight presets (400–800). */
		const TEXT_WEIGHTS = [
			400,
			500,
			600,
			700,
			800
		];
		/** Default wallpaper section when the user-settings document has no override. */
		const DEFAULT_WALLPAPER_SETTINGS = {
			mode: "none",
			value: "",
			blur: 0,
			dim: .35,
			surfaceAlpha: .82,
			weKey: "",
			textFont: "system",
			textWeight: 400,
			textColor: "ink",
			textOpacity: 100,
			textOutline: 2,
			codeBackground: true
		};
		const WALLPAPER_DIM_MAX = .8;
		const WALLPAPER_ALPHA_MIN = .5;
		Schema.object({
			[WALLPAPER_SETTINGS_FIELDS.MODE]: Schema.union([...WALLPAPER_MODES]).default(DEFAULT_WALLPAPER_SETTINGS.mode),
			[WALLPAPER_SETTINGS_FIELDS.VALUE]: Schema.string().default(DEFAULT_WALLPAPER_SETTINGS.value),
			[WALLPAPER_SETTINGS_FIELDS.BLUR]: Schema.number().min(0).max(40).default(DEFAULT_WALLPAPER_SETTINGS.blur),
			[WALLPAPER_SETTINGS_FIELDS.DIM]: Schema.number().min(0).max(WALLPAPER_DIM_MAX).default(DEFAULT_WALLPAPER_SETTINGS.dim),
			[WALLPAPER_SETTINGS_FIELDS.SURFACE_ALPHA]: Schema.number().min(WALLPAPER_ALPHA_MIN).max(1).default(DEFAULT_WALLPAPER_SETTINGS.surfaceAlpha),
			[WALLPAPER_SETTINGS_FIELDS.WE_KEY]: Schema.string().default(DEFAULT_WALLPAPER_SETTINGS.weKey),
			[WALLPAPER_SETTINGS_FIELDS.TEXT_FONT]: Schema.union([...TEXT_FONTS]).default(DEFAULT_WALLPAPER_SETTINGS.textFont),
			[WALLPAPER_SETTINGS_FIELDS.TEXT_WEIGHT]: Schema.union([...TEXT_WEIGHTS]).default(DEFAULT_WALLPAPER_SETTINGS.textWeight),
			[WALLPAPER_SETTINGS_FIELDS.TEXT_COLOR]: Schema.string().default(DEFAULT_WALLPAPER_SETTINGS.textColor),
			[WALLPAPER_SETTINGS_FIELDS.TEXT_OPACITY]: Schema.number().min(0).max(100).default(DEFAULT_WALLPAPER_SETTINGS.textOpacity),
			[WALLPAPER_SETTINGS_FIELDS.TEXT_OUTLINE]: Schema.number().min(0).max(5).default(DEFAULT_WALLPAPER_SETTINGS.textOutline),
			[WALLPAPER_SETTINGS_FIELDS.CODE_BACKGROUND]: Schema.boolean().default(DEFAULT_WALLPAPER_SETTINGS.codeBackground)
		});
		/**
		* Narrow one wire or registry value to a persistable wallpaper source.
		* @param value - value crossing the settings or registry boundary.
		* @returns whether the value is a built-in wallpaper mode.
		*/
		function isWallpaperMode(value) {
			return WALLPAPER_MODES.some((mode) => mode === value);
		}
		/**
		* Narrow one wire or registry value to a built-in chat font preset.
		* @param value - value crossing the settings or registry boundary.
		* @returns whether the value is a built-in font preset.
		*/
		function isTextFont(value) {
			return TEXT_FONTS.some((font) => font === value);
		}
		/**
		* Narrow one wire or registry value to a built-in chat font weight.
		* @param value - value crossing the settings or registry boundary.
		* @returns whether the value is a built-in font weight.
		*/
		function isTextWeight(value) {
			return TEXT_WEIGHTS.some((weight) => weight === value);
		}
		/**
		* Clamp a numeric wallpaper field to its schema range.
		* @param field - the numeric field being written.
		* @param value - raw caller value.
		* @returns the value clamped to the field's documented bounds.
		*/
		function clampWallpaperNumber(field, value) {
			switch (field) {
				case "blur": return Math.min(Math.max(value, 0), 40);
				case "dim": return Math.min(Math.max(value, 0), WALLPAPER_DIM_MAX);
				case "surfaceAlpha": return Math.min(Math.max(value, WALLPAPER_ALPHA_MIN), 1);
				case "textOutline": return Math.min(Math.max(value, 0), 5);
				case "textOpacity": return Math.min(Math.max(value, 0), 100);
			}
		}
		//#endregion
		//#region lib/types/client/image.js
		/**
		* Browser image pipeline for the wallpaper plugin: decode a user-chosen file
		* and downscale it to a bounded data URL for durable settings storage.
		*/
		/** Hard cap for user-uploaded wallpaper files (rejected before reading). */
		const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
		/** Longest edge after downscaling (settings document stays lean). */
		const IMAGE_MAX_EDGE = 1920;
		/** JPEG quality for the downscaled data URL. */
		const IMAGE_QUALITY = .85;
		/**
		* Turn a user-picked file into a bounded JPEG data URL.
		* @param file - the picked image file.
		* @param maxBytes - file-size cap; oversize files are rejected before reading.
		* @returns the data URL, or a structured failure reason.
		*/
		async function applyImageFile(file, maxBytes = IMAGE_MAX_BYTES) {
			if (file.size > maxBytes) return {
				ok: false,
				reason: "too-large"
			};
			try {
				return {
					ok: true,
					dataUrl: downscaleToDataUrl(await loadImageSource(file))
				};
			} catch {
				return {
					ok: false,
					reason: "decode-failed"
				};
			}
		}
		/**
		* Load an image from a Blob/File or a URL/data URL string.
		* @param source - blob or addressable image source.
		* @returns the decoded image element.
		*/
		function loadImageSource(source) {
			return new Promise((resolve, reject) => {
				const image = new Image();
				const url = typeof source === "string" ? source : URL.createObjectURL(source);
				const cleanup = () => {
					if (typeof source !== "string") URL.revokeObjectURL(url);
				};
				image.onload = () => {
					cleanup();
					resolve(image);
				};
				image.onerror = () => {
					cleanup();
					reject(/* @__PURE__ */ new Error("image decode failed"));
				};
				image.src = url;
			});
		}
		/**
		* Downscale an image to a bounded JPEG data URL, preserving aspect ratio.
		* @param image - decoded source image.
		* @param maxEdge - longest edge after downscaling.
		* @param quality - JPEG quality.
		* @returns the data URL.
		*/
		function downscaleToDataUrl(image, maxEdge = IMAGE_MAX_EDGE, quality = IMAGE_QUALITY) {
			const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
			const width = Math.max(1, Math.round(image.naturalWidth * scale));
			const height = Math.max(1, Math.round(image.naturalHeight * scale));
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext("2d");
			if (context === null) throw new Error("canvas 2d context unavailable");
			context.drawImage(image, 0, 0, width, height);
			return canvas.toDataURL("image/jpeg", quality);
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `settings.wallpaper` namespace dictionaries (row + panel copy). */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"title": "聊天背景",
			"mode.none": "关闭",
			"mode.image": "本地图片",
			"mode.url": "图片链接",
			"mode.desktop": "桌面透明",
			"upload": "上传图片",
			"uploadHint": "PNG / JPG，最大 10 MB，会自动压缩到 1920px",
			"urlPlaceholder": "https://…",
			"apply": "应用",
			"blur": "虚化",
			"dim": "暗化",
			"translucency": "表面半透明",
			"opacity": "透明度",
			"outline": "描边",
			"codeBackground.on": "代码背景开",
			"codeBackground.off": "代码背景关",
			"color.ink": "墨黑",
			"color.snow": "雪白",
			"color.silver": "银灰",
			"color.rosegold": "玫瑰金",
			"color.champagne": "香槟",
			"color.azure": "天蓝",
			"color.violet": "紫罗兰",
			"color.mint": "薄荷",
			"color.coral": "珊瑚",
			"color.lemon": "柠檬黄",
			"color.seablue": "海蓝",
			"color.blossom": "樱花粉",
			"color.grape": "葡萄紫",
			"font": "字体",
			"font.system": "系统",
			"font.serif": "衬线",
			"font.mono": "等宽",
			"font.rounded": "圆体",
			"turnOff": "关闭壁纸",
			"switch": "切换壁纸",
			"error.tooLarge": "文件过大（最大 10 MB）",
			"error.decode": "无法读取该图片，请换一张",
			"we.title": "壁纸引擎",
			"we.loading": "加载中…",
			"we.error": "无法加载壁纸引擎壁纸库",
			"we.empty": "未找到壁纸引擎壁纸",
			"we.applying": "切换中…",
			"desktop.hint": "不显示壁纸层，透过透明窗口显示桌面（配合透明窗口使用，桌面实时渲染直接透出）",
			"desktop.transparent": "透明桌面（透出桌面壁纸）",
			"clearScreen": "清屏",
			"window.controls": "窗口控制",
			"window.minimize": "最小化",
			"window.maximize": "最大化",
			"window.restore": "还原",
			"window.close": "关闭"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"title": "Chat background",
			"mode.none": "Off",
			"mode.image": "Image",
			"mode.url": "URL",
			"mode.desktop": "Desktop",
			"upload": "Upload image",
			"uploadHint": "PNG / JPG, max 10 MB, downscaled to 1920px",
			"urlPlaceholder": "https://…",
			"apply": "Apply",
			"blur": "Blur",
			"dim": "Dim",
			"translucency": "Surface translucency",
			"opacity": "Opacity",
			"outline": "Outline",
			"codeBackground.on": "Code bg: on",
			"codeBackground.off": "Code bg: off",
			"color.ink": "Ink",
			"color.snow": "Snow",
			"color.silver": "Silver",
			"color.rosegold": "Rose gold",
			"color.champagne": "Champagne",
			"color.azure": "Azure",
			"color.violet": "Violet",
			"color.mint": "Mint",
			"color.coral": "Coral",
			"color.lemon": "Lemon",
			"color.seablue": "Sea blue",
			"color.blossom": "Blossom",
			"color.grape": "Grape",
			"font": "Font",
			"font.system": "System",
			"font.serif": "Serif",
			"font.mono": "Mono",
			"font.rounded": "Rounded",
			"turnOff": "Turn off wallpaper",
			"switch": "Switch wallpaper",
			"error.tooLarge": "File too large (max 10 MB)",
			"error.decode": "Could not read that image, please pick another",
			"we.title": "Wallpaper Engine",
			"we.loading": "Loading…",
			"we.error": "Could not load the Wallpaper Engine library",
			"we.empty": "No Wallpaper Engine wallpapers found",
			"we.applying": "Switching…",
			"desktop.hint": "No wallpaper layer: the OS desktop shows through the transparent window (pair with the transparent chat shell; the desktop renders live behind it)",
			"desktop.transparent": "Transparent desktop (show the desktop wallpaper through the chat)",
			"clearScreen": "Clear screen",
			"window.controls": "Window controls",
			"window.minimize": "Minimize",
			"window.maximize": "Maximize",
			"window.restore": "Restore",
			"window.close": "Close"
		};
		//#endregion
		//#region lib/types/text-colors.js
		/**
		* Chat text color palette: a curated set of stylish, high-contrast ink colors
		* for the manual text-color picker. Each color is chosen to stay legible on
		* both light and dark wallpapers (mid-saturation, tuned luminance). Used only
		* when the automatic per-surface adaptation is turned off.
		*/
		/** Shipped text colors in display order. */
		const TEXT_COLORS = Object.freeze([
			Object.freeze({
				id: "ink",
				nameKey: "color.ink",
				css: "#1f2430"
			}),
			Object.freeze({
				id: "snow",
				nameKey: "color.snow",
				css: "#f5f6fa"
			}),
			Object.freeze({
				id: "silver",
				nameKey: "color.silver",
				css: "#c0c7d1"
			}),
			Object.freeze({
				id: "rosegold",
				nameKey: "color.rosegold",
				css: "#e0a98f"
			}),
			Object.freeze({
				id: "champagne",
				nameKey: "color.champagne",
				css: "#e8d5a8"
			}),
			Object.freeze({
				id: "azure",
				nameKey: "color.azure",
				css: "#5ea8f0"
			}),
			Object.freeze({
				id: "violet",
				nameKey: "color.violet",
				css: "#a78bfa"
			}),
			Object.freeze({
				id: "mint",
				nameKey: "color.mint",
				css: "#5fd6a8"
			}),
			Object.freeze({
				id: "coral",
				nameKey: "color.coral",
				css: "#ff7f6b"
			}),
			Object.freeze({
				id: "lemon",
				nameKey: "color.lemon",
				css: "#f2d94e"
			}),
			Object.freeze({
				id: "seablue",
				nameKey: "color.seablue",
				css: "#46c6d8"
			}),
			Object.freeze({
				id: "blossom",
				nameKey: "color.blossom",
				css: "#f3a7c2"
			}),
			Object.freeze({
				id: "grape",
				nameKey: "color.grape",
				css: "#b06ad9"
			})
		]);
		/**
		* Resolve one text color by id.
		* @param id - color id stored in settings.
		* @returns the color option, or undefined for an unknown id.
		*/
		function textColorById(id) {
			return TEXT_COLORS.find((color) => color.id === id);
		}
		//#endregion
		//#region lib/types/client/we.js
		/**
		* Browser-side Wallpaper Engine surface: loads the host-scanned wallpaper list
		* and decides whether a wallpaper URL is a video (rendered in the video layer
		* instead of the image layer).
		*/
		/** Video extensions the presenter renders in the wallpaper video layer. */
		const VIDEO_EXTENSION = /\.(mp4|webm|m4v)(\?|#|$)/i;
		/**
		* Whether a wallpaper value is a video URL (render in the video layer).
		* @param value - the wallpaper settings value (a URL for image/url modes).
		* @returns whether the value points at a playable video.
		*/
		function isVideoUrl(value) {
			return VIDEO_EXTENSION.test(value);
		}
		/**
		* Load the host-scanned Wallpaper Engine library.
		* @returns the browseable wallpaper list.
		*/
		async function loadWeList() {
			const response = await fetch("/wallpaper-engine/list", { cache: "no-store" });
			if (!response.ok) throw new Error(`wallpaper-engine list failed: ${response.status}`);
			const payload = await response.json();
			if (!Array.isArray(payload.items)) throw new Error("wallpaper-engine list malformed");
			return payload.items;
		}
		/**
		* Ask the host to apply one wallpaper through Wallpaper Engine (the live
		* desktop wallpaper switches; the transparent chat shell shows it through).
		* @param key - the browseable item key (`workshop/<id>` or `project/<name>`).
		* @returns the apply result from the host.
		*/
		async function applyWeWallpaper(key) {
			const response = await fetch("/wallpaper-engine/apply", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ key })
			});
			if (!response.ok) return {
				ok: false,
				reason: `apply-failed:${response.status}`
			};
			const payload = await response.json().catch(() => null);
			if (payload === null || typeof payload.ok !== "boolean") return {
				ok: false,
				reason: "apply-malformed"
			};
			return payload;
		}
		//#endregion
		//#region lib/types/client/presenter.js
		/** Surface tokens made translucent over the wallpaper. */
		const SURFACE_TOKENS = [
			"--dsw-alias-bg-base",
			"--dsw-specific-sidebar-fill",
			"--dsw-alias-bg-layer-1",
			"--dsw-alias-bg-layer-2",
			"--dsw-alias-bg-overlay",
			"--dsw-specific-bubble",
			"--dsw-specific-input-major",
			"--dsw-alias-button-elevated-fill",
			"--dsw-alias-button-floating-hover"
		];
		/** Built-in chat font stacks (high-contrast, wallpaper-friendly). */
		const TEXT_FONT_STACKS = {
			system: "inherit",
			serif: "Georgia, \"Times New Roman\", \"Songti SC\", \"SimSun\", serif",
			mono: "\"Cascadia Code\", Consolas, \"JetBrains Mono\", \"Sarasa Mono SC\", monospace",
			rounded: "\"Segoe UI\", \"Microsoft YaHei UI\", \"PingFang SC\", \"HarmonyOS Sans SC\", \"MiSans\", system-ui, sans-serif"
		};
		/** Override-layer source identity (also names the layer's origin for inspection). */
		const OVERRIDE_SOURCE = "ui-wallpaper";
		/** Body attribute selecting the dark base palette in the token stylesheets. */
		const DARK_ATTRIBUTE = "data-ds-dark-theme";
		/** Body attribute this presenter owns (paint mode for styling/debugging). */
		/** Blur bleed compensation: scaling hides the transparent margin blur draws at edges. */
		const BLUR_SCALE = 1.2;
		/** Fully transparent surface value for desktop-transparent mode. */
		const TRANSPARENT = "rgba(0, 0, 0, 0)";
		/**
		* Read the pure surface token bases for both palettes from the live cascade:
		* the current palette as-is, the other palette by briefly toggling the dark
		* attribute (synchronous reads; the browser cannot paint mid-function, so the
		* probe is invisible).
		* @returns token bases keyed by palette.
		*/
		function defaultReadTokenBase() {
			const body = document.body;
			const read = () => {
				const computed = getComputedStyle(body);
				const out = {};
				for (const name of SURFACE_TOKENS) out[name] = computed.getPropertyValue(name).trim();
				return out;
			};
			const wasDark = body.hasAttribute(DARK_ATTRIBUTE);
			const current = read();
			let other;
			if (wasDark) {
				body.removeAttribute(DARK_ATTRIBUTE);
				try {
					other = read();
				} finally {
					body.setAttribute(DARK_ATTRIBUTE, "");
				}
			} else {
				body.setAttribute(DARK_ATTRIBUTE, "");
				try {
					other = read();
				} finally {
					body.removeAttribute(DARK_ATTRIBUTE);
				}
			}
			return wasDark ? {
				light: other,
				dark: current
			} : {
				light: current,
				dark: other
			};
		}
		/**
		* Applies wallpaper snapshots to the document; one instance per plugin fiber.
		*/
		var WallpaperPresenter = class {
			theme;
			layer;
			videoLayer;
			dimLayer;
			readTokenBase;
			overrideDisposer;
			appliedThemeRevision;
			current;
			handlingThemeChange = false;
			ownsBodyBackground = false;
			textStyleTag = null;
			/**
			* @param theme - theme service face (overrideTokens + getTheme).
			* @param options - injectable seams for specs.
			*/
			constructor(theme, options = {}) {
				this.theme = theme;
				this.readTokenBase = options.readTokenBase ?? defaultReadTokenBase;
				this.layer = createLayer("image");
				this.videoLayer = createVideoLayer();
				this.dimLayer = createLayer("dim");
			}
			/**
			* Project a wallpaper snapshot onto the document: show/hide the layers,
			* apply blur/dim, force the body background transparent, and push the
			* surface/color override layer through the theme service.
			* @param wallpaper - resolved wallpaper snapshot from ctx.wallpaper.
			* @param theme - current theme snapshot from ctx.theme.
			*/
			apply(wallpaper, theme) {
				this.current = {
					wallpaper,
					theme
				};
				const settings = wallpaper.settings;
				this.applyText(settings.textFont, settings.textWeight, settings.textColor, settings.textOpacity, settings.textOutline);
				document.body.dataset.dswCodeBg = settings.codeBackground ? "on" : "off";
				if (settings.mode === "none" || settings.mode === "desktop" && !this.inShell()) {
					this.hideLayers();
					this.releaseOverride();
					return;
				}
				this.showLayers(settings);
				this.releaseOverride();
				this.pushOverride(settings);
			}
			/**
			* Recompute the override layer after a palette switch (theme/change). Drops
			* the stale layer, re-reads the pure bases, and pushes a fresh layer.
			* Self-echo publishes (from this presenter's own overrideTokens) and
			* re-entrant cascades are skipped.
			* @param snapshot - the theme snapshot that changed.
			*/
			onThemeChange(snapshot) {
				if (this.current === void 0 || this.handlingThemeChange) return;
				if (snapshot.revision === this.appliedThemeRevision) return;
				this.handlingThemeChange = true;
				try {
					this.releaseOverride();
					const mode = this.current.wallpaper.settings.mode;
					if (mode === "none" || mode === "desktop" && !this.inShell()) return;
					this.pushOverride(this.current.wallpaper.settings);
				} finally {
					this.handlingThemeChange = false;
				}
			}
			/**
			* Whether the page runs inside the transparent Electron shell (the preload
			* bridge is only injected there). Used to scope desktop-transparent surface
			* handling to the shell: a regular browser window has no transparent
			* background, so `desktop` mode must not fully-transparentize the surfaces.
			*/
			inShell() {
				return typeof window !== "undefined" && window.desktopShell !== void 0;
			}
			/** Retract every DOM write this presenter made. */
			dispose() {
				this.layer.remove();
				this.videoLayer.remove();
				this.dimLayer.remove();
				this.releaseOverride();
				delete document.body.dataset.wallpaperMode;
				delete document.body.dataset.dswOutline;
				delete document.body.dataset.dswCodeBg;
				const root = document.documentElement;
				root.style.removeProperty("--dsw-font-family");
				root.style.removeProperty("--dsw-font-weight-chat");
				root.style.removeProperty("--dsw-text-ink");
				root.style.removeProperty("--dsw-text-opacity");
				root.style.removeProperty("--dsw-text-outline");
				root.style.removeProperty("--dsw-text-halo");
				if (this.textStyleTag !== null) {
					this.textStyleTag.remove();
					this.textStyleTag = null;
				}
				if (this.ownsBodyBackground) {
					document.body.style.removeProperty("background");
					this.ownsBodyBackground = false;
				}
			}
			showLayers(settings) {
				const layer = this.layer;
				const video = this.videoLayer;
				if (!layer.isConnected) document.body.append(layer, video, this.dimLayer);
				if (settings.mode === "desktop") {
					layer.style.visibility = "hidden";
					video.style.visibility = "hidden";
					this.pauseVideo();
					this.dimLayer.style.visibility = "hidden";
				} else if (isVideoUrl(settings.value)) {
					layer.style.visibility = "hidden";
					video.style.visibility = "visible";
					if (video.getAttribute("src") !== settings.value) {
						video.setAttribute("src", settings.value);
						try {
							video.play().catch(() => {});
						} catch {}
					}
					this.applyMediaEffects(video, settings);
					this.dimLayer.style.backgroundColor = `rgba(0, 0, 0, ${settings.dim})`;
					this.dimLayer.style.visibility = "visible";
				} else {
					layer.style.visibility = "visible";
					video.style.visibility = "hidden";
					this.pauseVideo();
					layer.style.background = `url("${settings.value}") center / cover no-repeat`;
					this.applyMediaEffects(layer, settings);
					this.dimLayer.style.backgroundColor = `rgba(0, 0, 0, ${settings.dim})`;
					this.dimLayer.style.visibility = "visible";
				}
				document.body.style.background = "transparent";
				this.ownsBodyBackground = true;
				document.body.dataset.wallpaperMode = settings.mode;
			}
			/** Blur/scale the active media layer (blur bleeds at edges; scale hides the margin). */
			applyMediaEffects(element, settings) {
				if (settings.blur > 0) {
					element.style.filter = `blur(${settings.blur}px)`;
					element.style.transform = `scale(${BLUR_SCALE})`;
				} else {
					element.style.filter = "";
					element.style.transform = "";
				}
			}
			hideLayers() {
				this.layer.style.visibility = "hidden";
				this.videoLayer.style.visibility = "hidden";
				this.pauseVideo();
				this.dimLayer.style.visibility = "hidden";
				delete document.body.dataset.wallpaperMode;
			}
			/** Stop playback and release the source (stops the network stream). */
			pauseVideo() {
				const video = this.videoLayer;
				if (video.getAttribute("src") === null) return;
				try {
					video.pause();
					video.removeAttribute("src");
					video.load();
				} catch {
					video.removeAttribute("src");
				}
			}
			pushOverride(settings) {
				const base = this.readTokenBase();
				const alpha = settings.surfaceAlpha;
				const tokens = {};
				if (settings.mode === "desktop") {
					if (!this.inShell()) return;
					for (const name of SURFACE_TOKENS) {
						const light = base.light[name];
						const dark = base.dark[name];
						if (light === void 0 || light === "" || dark === void 0 || dark === "") continue;
						tokens[name] = {
							light: TRANSPARENT,
							dark: TRANSPARENT
						};
					}
				} else for (const name of SURFACE_TOKENS) {
					const light = base.light[name];
					const dark = base.dark[name];
					if (light === void 0 || light === "" || dark === void 0 || dark === "") continue;
					tokens[name] = {
						light: mix(light, alpha),
						dark: mix(dark, alpha)
					};
				}
				this.overrideDisposer = this.theme.overrideTokens(OVERRIDE_SOURCE, tokens);
				this.appliedThemeRevision = this.theme.getTheme().revision;
			}
			/**
			* Apply the chat typography on the document root: font family through the
			* theme's --dsw-font-family variable (so EVERY text node — historical and
			* new — inherits it) plus the chosen weight, and the label color policy.
			*
			* The chosen palette color becomes --dsw-text-ink and every label tier
			* derives from it (whole-app, both palettes), so the text color applies
			* globally; the opacity (--dsw-text-opacity, 0–1) fades the ink AND its
			* white outline together toward transparent. The outline is only rendered
			* while body[data-dsw-outline] is set to a non-zero value, so thickness 0
			* leaves no shadow at all (a zero-offset shadow would still hint at the
			* glyph edges through antialiasing).
			*
			* Inside the transparent shell the palette color is used (legibility over
			* the wallpaper is the point of the white outline); outside it (the regular
			* chat window after leaving desktop mode) the ink is forced to the default
			* black so the chat reads normally on the browser's own background.
			*/
			applyText(font, weight, textColor, opacity, outline) {
				const root = document.documentElement;
				const stack = TEXT_FONT_STACKS[font];
				if (stack === "inherit") root.style.removeProperty("--dsw-font-family");
				else root.style.setProperty("--dsw-font-family", stack);
				root.style.setProperty("--dsw-font-weight-chat", String(weight));
				const ink = ((typeof window !== "undefined" ? window.desktopShell : void 0) !== void 0 ? textColorById(textColor) : void 0)?.css ?? "#1f2430";
				root.style.setProperty("--dsw-text-ink", ink);
				root.style.setProperty("--dsw-text-opacity", String(opacity / 100));
				root.style.setProperty("--dsw-text-outline", String(outline));
				document.body.dataset.dswOutline = String(outline);
				if (this.textStyleTag === null) {
					const tag = document.createElement("style");
					tag.dataset.plugin = OVERRIDE_SOURCE;
					tag.dataset.pluginCss = "ui-wallpaper-text";
					tag.textContent = [
						":root {",
						"  --dsw-font-weight-chat: 400;",
						"}",
						"body, body * {",
						"  font-weight: var(--dsw-font-weight-chat) !important;",
						"}",
						"body strong, body b, body th, body h1, body h2, body h3, body h4 {",
						"  font-weight: min(calc(var(--dsw-font-weight-chat) + 200), 900) !important;",
						"}",
						"body, body[data-ds-dark-theme] {",
						"  --dsw-alias-label-primary: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 100%), transparent);",
						"  --dsw-alias-label-secondary: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 72%), transparent);",
						"  --dsw-alias-label-primary-dimmed: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 72%), transparent);",
						"  --dsw-alias-label-tertiary: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 55%), transparent);",
						"  --dsw-alias-label-caption: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 55%), transparent);",
						"  --dsw-alias-label-dimmed: color-mix(in srgb, var(--dsw-text-ink, #1f2430) calc(var(--dsw-text-opacity, 1) * 40%), transparent);",
						"}",
						"body[data-dsw-outline]:not([data-dsw-outline=\"0\"]) {",
						"  -webkit-text-stroke: calc(var(--dsw-text-outline, 1) * 0.3px) rgba(255, 255, 255, var(--dsw-text-opacity, 1));",
						"}",
						"body code, body pre, body kbd, body samp, body mark {",
						"  -webkit-text-stroke: 0;",
						"}",
						"body[data-dsw-code-bg=\"off\"] {",
						"  --dsw-alias-markdown-inline-code: transparent;",
						"  --dsw-alias-markdown-code-block: transparent;",
						"  --dsw-alias-markdown-code-block-banner: transparent;",
						"}"
					].join("\n");
					document.head.appendChild(tag);
					this.textStyleTag = tag;
				}
			}
			releaseOverride() {
				if (this.overrideDisposer === void 0) return;
				this.overrideDisposer();
				this.overrideDisposer = void 0;
				this.appliedThemeRevision = void 0;
			}
		};
		/** One translucent surface value: the base color at the given alpha. */
		function mix(color, alpha) {
			if (alpha >= 1) return color;
			return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
		}
		/** Create one presenter-owned fixed layer (hidden until first apply). */
		function createLayer(kind) {
			const element = document.createElement("div");
			element.dataset.wallpaperLayer = kind;
			element.style.position = "fixed";
			element.style.inset = "0";
			element.style.zIndex = "-1";
			element.style.pointerEvents = "none";
			element.style.visibility = "hidden";
			return element;
		}
		/** Create the presenter-owned wallpaper video layer (muted looped autoplay, cover-fit). */
		function createVideoLayer() {
			const element = document.createElement("video");
			element.dataset.wallpaperLayer = "video";
			element.style.position = "fixed";
			element.style.inset = "0";
			element.style.zIndex = "-1";
			element.style.pointerEvents = "none";
			element.style.visibility = "hidden";
			element.style.objectFit = "cover";
			element.style.width = "100%";
			element.style.height = "100%";
			element.muted = true;
			element.loop = true;
			element.autoplay = true;
			element.playsInline = true;
			element.preload = "auto";
			return element;
		}
		//#endregion
		//#region lib/types/client/runtime.js
		/**
		* Wallpaper preference owner. Reads go through {@link getWallpaper}; writes
		* only through the typed setters; continuous sync only through the
		* `wallpaper/change` event. Every write routes through the settings scope
		* (durable in the Host settings document; process-local for remote browsers).
		*/
		var WallpaperRuntime = class {
			ctx;
			host;
			settings;
			revision = 0;
			snapshot;
			/**
			* @param ctx - owning context (change events are emitted on it; the scope
			* listener is released through ctx.effect on dispose).
			* @param host - durable settings scope owned by the same plugin.
			*/
			constructor(ctx, host) {
				this.ctx = ctx;
				this.host = host;
				this.settings = { ...DEFAULT_WALLPAPER_SETTINGS };
				this.snapshot = this.buildSnapshot();
				ctx.effect(() => host.subscribe(() => {
					this.adopt();
				}), "ui-wallpaper: settings scope adoption");
				this.adopt();
			}
			/**
			* Read the current immutable wallpaper snapshot.
			* @returns the current snapshot (stable reference until the next change).
			*/
			getWallpaper() {
				return this.snapshot;
			}
			/** Select the wallpaper source; unknown modes fall back to `none`.
			* @param mode - the wallpaper source to select. */
			setMode(mode) {
				this.write(WALLPAPER_SETTINGS_FIELDS.MODE, isWallpaperMode(mode) ? mode : DEFAULT_WALLPAPER_SETTINGS.mode);
			}
			/** Set the source value (image data URL / remote URL).
			* @param value - the source value to persist. */
			setValue(value) {
				this.write(WALLPAPER_SETTINGS_FIELDS.VALUE, value);
			}
			/** Set the wallpaper blur in pixels (clamped 0–40).
			* @param blur - blur magnitude in pixels. */
			setBlur(blur) {
				this.write(WALLPAPER_SETTINGS_FIELDS.BLUR, clampWallpaperNumber("blur", blur));
			}
			/** Set the dim overlay opacity (clamped 0–0.8).
			* @param dim - overlay opacity to apply. */
			setDim(dim) {
				this.write(WALLPAPER_SETTINGS_FIELDS.DIM, clampWallpaperNumber("dim", dim));
			}
			/** Set the surface translucency (clamped 0.5–1; 1 = opaque surfaces).
			* @param alpha - surface opacity against the wallpaper. */
			setSurfaceAlpha(alpha) {
				this.write(WALLPAPER_SETTINGS_FIELDS.SURFACE_ALPHA, clampWallpaperNumber("surfaceAlpha", alpha));
			}
			/** Remember the live Wallpaper Engine wallpaper key (gallery selection).
			* @param key - the WE item key, or '' to forget it. */
			setWeKey(key) {
				this.write(WALLPAPER_SETTINGS_FIELDS.WE_KEY, typeof key === "string" ? key : DEFAULT_WALLPAPER_SETTINGS.weKey);
			}
			/** Set the chat font family preset; unknown fonts fall back to `system`.
			* @param font - the font preset id to select. */
			setTextFont(font) {
				this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_FONT, isTextFont(font) ? font : DEFAULT_WALLPAPER_SETTINGS.textFont);
			}
			/** Set the chat font weight; unknown weights fall back to 400.
			* @param weight - the font weight to select. */
			setTextWeight(weight) {
				this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_WEIGHT, isTextWeight(weight) ? weight : DEFAULT_WALLPAPER_SETTINGS.textWeight);
			}
			/** Set the manual text color id.
			* @param color - the text-color palette id to select. */
			setTextColor(color) {
				this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_COLOR, typeof color === "string" ? color : DEFAULT_WALLPAPER_SETTINGS.textColor);
			}
			/** Set the text opacity in percent (clamped 0–100; 0 = fully transparent).
			* @param opacity - text opacity as a percent. */
			setTextOpacity(opacity) {
				this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_OPACITY, clampWallpaperNumber("textOpacity", opacity));
			}
			/** Set the white text-outline thickness (clamped 0–3; 0 = off).
			* @param thickness - outline thickness in steps. */
			setTextOutline(thickness) {
				this.write(WALLPAPER_SETTINGS_FIELDS.TEXT_OUTLINE, clampWallpaperNumber("textOutline", thickness));
			}
			/** Show or hide the markdown code chip/block backgrounds.
			* @param on - true to show code backgrounds, false to make them transparent. */
			setCodeBackground(on) {
				this.write(WALLPAPER_SETTINGS_FIELDS.CODE_BACKGROUND, on);
			}
			/**
			* Apply several fields in one gesture (the mode+value pair from an image
			* pick). Fields are clamped/narrowed individually; unchanged fields are not
			* written.
			* @param draft - partial settings to apply.
			*/
			setWallpaper(draft) {
				const next = { ...this.settings };
				let changed = false;
				if (draft.mode !== void 0 && isWallpaperMode(draft.mode)) {
					next.mode = draft.mode;
					changed = true;
				}
				if (draft.value !== void 0 && typeof draft.value === "string") {
					next.value = draft.value;
					changed = true;
				}
				if (draft.blur !== void 0) {
					next.blur = clampWallpaperNumber("blur", draft.blur);
					changed = true;
				}
				if (draft.dim !== void 0) {
					next.dim = clampWallpaperNumber("dim", draft.dim);
					changed = true;
				}
				if (draft.surfaceAlpha !== void 0) {
					next.surfaceAlpha = clampWallpaperNumber("surfaceAlpha", draft.surfaceAlpha);
					changed = true;
				}
				if (draft.weKey !== void 0 && typeof draft.weKey === "string") {
					next.weKey = draft.weKey;
					changed = true;
				}
				if (draft.textFont !== void 0 && isTextFont(draft.textFont)) {
					next.textFont = draft.textFont;
					changed = true;
				}
				if (draft.textWeight !== void 0 && isTextWeight(draft.textWeight)) {
					next.textWeight = draft.textWeight;
					changed = true;
				}
				if (draft.textColor !== void 0 && typeof draft.textColor === "string") {
					next.textColor = draft.textColor;
					changed = true;
				}
				if (draft.textOpacity !== void 0) {
					next.textOpacity = clampWallpaperNumber("textOpacity", draft.textOpacity);
					changed = true;
				}
				if (draft.textOutline !== void 0) {
					next.textOutline = clampWallpaperNumber("textOutline", draft.textOutline);
					changed = true;
				}
				if (draft.codeBackground !== void 0) {
					next.codeBackground = draft.codeBackground;
					changed = true;
				}
				if (!changed) return;
				const previous = this.settings;
				this.settings = next;
				for (const field of Object.values(WALLPAPER_SETTINGS_FIELDS)) if (next[field] !== previous[field]) this.host.set(field, next[field]);
				this.publish();
			}
			/** Adopt the scope's accepted durable section without writing it back. */
			adopt() {
				const section = this.host.getSnapshot().value;
				if (section === void 0 || sameSettings(section, this.settings)) return;
				this.settings = sanitizeSettings(section);
				this.publish();
			}
			write(field, value) {
				if (this.settings[field] === value) return;
				this.settings = {
					...this.settings,
					[field]: value
				};
				this.host.set(field, value);
				this.publish();
			}
			buildSnapshot() {
				return Object.freeze({
					settings: Object.freeze({ ...this.settings }),
					revision: this.revision
				});
			}
			publish() {
				this.revision += 1;
				this.snapshot = this.buildSnapshot();
				this.ctx.emit("wallpaper/change", this.snapshot);
			}
		};
		/** Defensive re-validation of a wire section before adoption. */
		function sanitizeSettings(section) {
			return {
				mode: isWallpaperMode(section.mode) ? section.mode : DEFAULT_WALLPAPER_SETTINGS.mode,
				value: typeof section.value === "string" ? section.value : DEFAULT_WALLPAPER_SETTINGS.value,
				blur: clampWallpaperNumber("blur", typeof section.blur === "number" ? section.blur : DEFAULT_WALLPAPER_SETTINGS.blur),
				dim: clampWallpaperNumber("dim", typeof section.dim === "number" ? section.dim : DEFAULT_WALLPAPER_SETTINGS.dim),
				surfaceAlpha: clampWallpaperNumber("surfaceAlpha", typeof section.surfaceAlpha === "number" ? section.surfaceAlpha : DEFAULT_WALLPAPER_SETTINGS.surfaceAlpha),
				weKey: typeof section.weKey === "string" ? section.weKey : DEFAULT_WALLPAPER_SETTINGS.weKey,
				textFont: isTextFont(section.textFont) ? section.textFont : DEFAULT_WALLPAPER_SETTINGS.textFont,
				textWeight: isTextWeight(section.textWeight) ? section.textWeight : DEFAULT_WALLPAPER_SETTINGS.textWeight,
				textColor: typeof section.textColor === "string" ? section.textColor : DEFAULT_WALLPAPER_SETTINGS.textColor,
				textOpacity: clampWallpaperNumber("textOpacity", typeof section.textOpacity === "number" ? section.textOpacity : DEFAULT_WALLPAPER_SETTINGS.textOpacity),
				textOutline: clampWallpaperNumber("textOutline", typeof section.textOutline === "number" ? section.textOutline : DEFAULT_WALLPAPER_SETTINGS.textOutline),
				codeBackground: typeof section.codeBackground === "boolean" ? section.codeBackground : DEFAULT_WALLPAPER_SETTINGS.codeBackground
			};
		}
		function sameSettings(left, right) {
			return left.mode === right.mode && left.value === right.value && left.blur === right.blur && left.dim === right.dim && left.surfaceAlpha === right.surfaceAlpha && left.weKey === right.weKey && left.textFont === right.textFont && left.textWeight === right.textWeight && left.textColor === right.textColor && left.textOpacity === right.textOpacity && left.textOutline === right.textOutline && left.codeBackground === right.codeBackground;
		}
		//#endregion
		//#region lib/types/client/store.js
		/**
		* Wallpaper row/panel slot store: a mirror of the wallpaper service snapshot.
		* The plugin's apply-world change listener is the only writer; components read
		* via props.useStore.
		*/
		/**
		* Declares the wallpaper row/panel state and write surface.
		* @returns the store handle.
		*/
		function createWallpaperStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					settings: { ...DEFAULT_WALLPAPER_SETTINGS },
					revision: -1
				}),
				actions: { sync: (d, settings, revision) => {
					if (revision <= d.revision) return;
					d.settings = settings;
					d.revision = revision;
				} }
			});
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:C:\Users\OOBY\deepseek-harness\packages\client\ui-wallpaper\src\client\WeGallery.module.css.mjs
		const css$4 = ".EpvNEa_status{color:var(--dsw-alias-label-secondary);padding:4px 0;font-size:12px;line-height:18px}.EpvNEa_grid{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;display:grid}.EpvNEa_cell{border:1px solid var(--dsw-alias-border-l2);font:inherit;cursor:pointer;background:0 0;border-radius:9px;flex-direction:column;align-items:stretch;gap:3px;padding:3px;display:flex;position:relative}.EpvNEa_cell:hover:not(.EpvNEa_cellSelected):not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.EpvNEa_cellSelected{border-color:var(--dsw-static-neutral-bluish-400)}.EpvNEa_cell:disabled{opacity:.45;cursor:not-allowed}.EpvNEa_thumb{background-color:var(--dsw-alias-bg-layer-2);background-position:50%;background-repeat:no-repeat;background-size:cover;border-radius:6px;height:48px}.EpvNEa_videoBadge{color:#fff;background:#0000008c;border-radius:4px;justify-content:center;align-items:center;width:16px;height:16px;font-size:9px;line-height:1;display:inline-flex;position:absolute;top:6px;right:6px}.EpvNEa_title{color:var(--dsw-alias-label-secondary);text-align:center;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;overflow:hidden}";
		const tagId$4 = "@deepseek-ai/dsh-client-ui-wallpaper/WeGallery.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-wallpaper";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var WeGallery_module_css_default = {
			"thumb": "EpvNEa_thumb",
			"status": "EpvNEa_status",
			"cell": "EpvNEa_cell",
			"videoBadge": "EpvNEa_videoBadge",
			"cellSelected": "EpvNEa_cellSelected",
			"grid": "EpvNEa_grid",
			"title": "EpvNEa_title"
		};
		//#endregion
		//#region lib/types/client/WeGallery.js
		/**
		* Wallpaper Engine gallery: loads the host-scanned local library and renders a
		* thumbnail grid. Picking an item asks the host to switch the LIVE Wallpaper
		* Engine wallpaper (`/wallpaper-engine/apply`); the transparent chat shell then
		* shows the engine's real-time rendering through. Every item is selectable —
		* scene/web wallpapers included, since they render in the engine, not in the
		* browser. The busy state disables the grid while a switch is in flight.
		*/
		/**
		* Render the Wallpaper Engine gallery.
		* @param props - copy, apply callback, current key.
		* @returns the gallery element tree.
		*/
		function WeGallery({ t, onApply, currentKey }) {
			const [state, setState] = (0, react.useState)({ status: "loading" });
			const [busyKey, setBusyKey] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				let alive = true;
				loadWeList().then((items) => {
					if (alive) setState({
						status: "ready",
						items
					});
				}).catch(() => {
					if (alive) setState({ status: "error" });
				});
				return () => {
					alive = false;
				};
			}, []);
			if (state.status === "loading") return (0, react_jsx_runtime.jsx)("div", {
				className: WeGallery_module_css_default.status,
				children: t("we.loading")
			});
			if (state.status === "error") return (0, react_jsx_runtime.jsx)("div", {
				className: WeGallery_module_css_default.status,
				children: t("we.error")
			});
			if (state.items.length === 0) return (0, react_jsx_runtime.jsx)("div", {
				className: WeGallery_module_css_default.status,
				children: t("we.empty")
			});
			return (0, react_jsx_runtime.jsx)("div", {
				className: WeGallery_module_css_default.grid,
				children: state.items.map((item) => {
					const selected = currentKey !== void 0 && item.key === currentKey;
					return (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: clsx(WeGallery_module_css_default.cell, selected && WeGallery_module_css_default.cellSelected),
						"aria-pressed": selected,
						disabled: busyKey !== void 0,
						title: item.title,
						onClick: () => {
							setBusyKey(item.key);
							onApply(item.key).finally(() => {
								setBusyKey(void 0);
							});
						},
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: WeGallery_module_css_default.thumb,
								style: item.previewUrl === "" ? void 0 : { backgroundImage: `url("${item.previewUrl}")` }
							}),
							item.type === "video" && (0, react_jsx_runtime.jsx)("span", {
								className: WeGallery_module_css_default.videoBadge,
								children: "▶"
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: WeGallery_module_css_default.title,
								children: busyKey === item.key ? t("we.applying") : item.title
							})
						]
					}, item.key);
				})
			});
		}
		//#endregion
		//#region lib/types/client/wallpaper-controls.js
		/**
		* Shared controls for the wallpaper settings surfaces (the General row and the
		* header popover): the labeled range slider, the font chips, and the weight
		* chips. Both surfaces render the same controls, so the definitions live here
		* instead of being duplicated per surface. The slider receives its CSS module
		* class map as a prop because each surface styles its own copy.
		*/
		/** One labeled range slider bound to a numeric wallpaper field. While the
		*  user drags, the thumb and readout follow the pointer directly (a local
		*  draft), so the control never snaps back against the async settings write;
		*  on release it settles onto the persisted value. Continuous by default
		*  (step 'any'); values are rounded to 0.01 to avoid float noise. */
		function Slider(props) {
			const css = props.css;
			const [draft, setDraft] = (0, react.useState)(null);
			const step = props.step ?? "any";
			const shown = draft ?? props.value;
			const commit = (raw) => {
				const value = step === "any" ? Math.round(raw * 100) / 100 : raw;
				setDraft(value);
				props.onChange(value);
			};
			const settle = () => {
				setDraft(null);
			};
			return (0, react_jsx_runtime.jsxs)("label", {
				className: css.sliderRow,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: css.sliderLabel,
						children: props.label
					}),
					(0, react_jsx_runtime.jsx)("input", {
						type: "range",
						className: css.slider,
						min: props.min,
						max: props.max,
						step,
						value: shown,
						onChange: (event) => {
							commit(Number(event.target.value));
						},
						onPointerUp: settle,
						onPointerCancel: settle,
						onBlur: settle
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: css.sliderValue,
						children: shown
					})
				]
			});
		}
		/** Chat font family presets in display order. */
		const FONT_TIERS = TEXT_FONTS.map((id) => ({
			id,
			labelKey: `font.${id}`
		}));
		/** Chat font weights in display order (higher = more legible). */
		const WEIGHT_TIERS = TEXT_WEIGHTS.map((weight) => ({
			id: weight,
			labelKey: String(weight)
		}));
		//#endregion
		//#region \0dsh-css:C:\Users\OOBY\deepseek-harness\packages\client\ui-wallpaper\src\client\WallpaperPanel.module.css.mjs
		const css$3 = ".BbXpIa_backdrop{z-index:60;background:0 0;position:fixed;inset:0}.BbXpIa_panel{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);border-radius:14px;flex-direction:column;gap:10px;width:264px;max-height:calc(100vh - 72px);padding:12px;display:flex;position:absolute;top:52px;right:16px;overflow-y:auto;box-shadow:0 8px 24px #0000002e}.BbXpIa_header{justify-content:space-between;align-items:center;gap:8px;display:flex}.BbXpIa_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px}.BbXpIa_close{width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;padding:0;display:inline-flex}.BbXpIa_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.BbXpIa_swatchGrid{grid-template-columns:repeat(3,1fr);gap:8px;display:grid}.BbXpIa_swatch{border:1px solid var(--dsw-alias-border-l2);font:inherit;cursor:pointer;background:0 0;border-radius:9px;flex-direction:column;align-items:stretch;gap:3px;padding:3px;display:flex}.BbXpIa_swatch:hover:not(.BbXpIa_swatchSelected){background:var(--dsw-alias-interactive-bg-hover)}.BbXpIa_swatchSelected{border-color:var(--dsw-static-neutral-bluish-400)}.BbXpIa_swatchColor{background-position:50%;background-repeat:no-repeat;background-size:cover;border-radius:6px;height:34px}.BbXpIa_swatchName{color:var(--dsw-alias-label-secondary);text-align:center;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;overflow:hidden}.BbXpIa_weBlock{flex-direction:column;gap:8px;display:flex}.BbXpIa_weTitle{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:500;line-height:18px}.BbXpIa_sliderGroup{flex-direction:column;gap:8px;display:flex}.BbXpIa_sliderRow{grid-template-columns:76px 1fr 36px;align-items:center;gap:8px;display:grid}.BbXpIa_sliderLabel{color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px}.BbXpIa_slider{accent-color:var(--dsw-alias-brand-primary)}.BbXpIa_sliderValue{color:var(--dsw-alias-label-secondary);text-align:right;font-variant-numeric:tabular-nums;font-size:11px;line-height:16px}.BbXpIa_tierRow{gap:6px;display:flex}.BbXpIa_tier{border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border-radius:8px;flex:1;padding:5px 8px;font-size:12px;line-height:18px}.BbXpIa_tier:hover:not(.BbXpIa_tierSelected){background:var(--dsw-alias-interactive-bg-hover)}.BbXpIa_tierSelected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}.BbXpIa_turnOff{border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-state-error-primary);cursor:pointer;background:0 0;border-radius:8px;align-self:flex-start;padding:5px 12px;font-size:12px;line-height:18px}.BbXpIa_turnOff:hover{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId$3 = "@deepseek-ai/dsh-client-ui-wallpaper/WallpaperPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-wallpaper";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var WallpaperPanel_module_css_default = {
			"panel": "BbXpIa_panel",
			"swatchGrid": "BbXpIa_swatchGrid",
			"sliderValue": "BbXpIa_sliderValue",
			"sliderLabel": "BbXpIa_sliderLabel",
			"close": "BbXpIa_close",
			"turnOff": "BbXpIa_turnOff",
			"sliderGroup": "BbXpIa_sliderGroup",
			"weTitle": "BbXpIa_weTitle",
			"swatchColor": "BbXpIa_swatchColor",
			"backdrop": "BbXpIa_backdrop",
			"tierSelected": "BbXpIa_tierSelected",
			"swatchName": "BbXpIa_swatchName",
			"slider": "BbXpIa_slider",
			"header": "BbXpIa_header",
			"weBlock": "BbXpIa_weBlock",
			"title": "BbXpIa_title",
			"swatchSelected": "BbXpIa_swatchSelected",
			"swatch": "BbXpIa_swatch",
			"tierRow": "BbXpIa_tierRow",
			"sliderRow": "BbXpIa_sliderRow",
			"tier": "BbXpIa_tier"
		};
		//#endregion
		//#region lib/types/client/WallpaperPanel.js
		/**
		* Compact wallpaper popover for the header quick switch: the Wallpaper Engine
		* gallery, the wallpaper-layer sliders, and the chat typography controls
		* (text color palette, font family, weight). Rendered in a portal over a
		* transparent backdrop; closes on backdrop click or Escape.
		*/
		/**
		* Render the wallpaper popover.
		* @param props - composed slot props plus close callback.
		* @returns the popover element tree.
		*/
		function WallpaperPanel({ t, useStore, onClose, setMode, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyWeWallpaper, setWeKey }) {
			const settings = useStore((state) => state.settings);
			const backdrop = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const onKeyDown = (event) => {
					if (event.key === "Escape") onClose();
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [onClose]);
			const active = settings.mode !== "none";
			return (0, react_jsx_runtime.jsx)("div", {
				ref: backdrop,
				className: WallpaperPanel_module_css_default.backdrop,
				onMouseDown: (event) => {
					if (event.target === backdrop.current) onClose();
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: WallpaperPanel_module_css_default.panel,
					role: "dialog",
					"aria-label": t("title"),
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperPanel_module_css_default.header,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: WallpaperPanel_module_css_default.title,
								children: t("title")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: WallpaperPanel_module_css_default.close,
								"aria-label": "Close",
								onClick: onClose,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperPanel_module_css_default.weBlock,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: WallpaperPanel_module_css_default.weTitle,
								children: t("we.title")
							}), (0, react_jsx_runtime.jsx)(WeGallery, {
								t,
								currentKey: settings.weKey,
								onApply: async (key) => {
									if (!await applyWeWallpaper(key)) return;
									setWeKey(key);
									setMode("desktop");
								}
							})]
						}),
						active && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							settings.mode !== "desktop" && (0, react_jsx_runtime.jsxs)("div", {
								className: WallpaperPanel_module_css_default.sliderGroup,
								children: [
									(0, react_jsx_runtime.jsx)(Slider, {
										css: WallpaperPanel_module_css_default,
										label: t("blur"),
										min: 0,
										max: 40,
										value: settings.blur,
										onChange: setBlur
									}),
									(0, react_jsx_runtime.jsx)(Slider, {
										css: WallpaperPanel_module_css_default,
										label: t("dim"),
										min: 0,
										max: .8,
										value: settings.dim,
										onChange: setDim
									}),
									(0, react_jsx_runtime.jsx)(Slider, {
										css: WallpaperPanel_module_css_default,
										label: t("translucency"),
										min: .5,
										max: 1,
										value: settings.surfaceAlpha,
										onChange: setSurfaceAlpha
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: WallpaperPanel_module_css_default.swatchGrid,
								children: TEXT_COLORS.map((entry) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: clsx(WallpaperPanel_module_css_default.swatch, settings.textColor === entry.id && WallpaperPanel_module_css_default.swatchSelected),
									"aria-pressed": settings.textColor === entry.id,
									title: t(entry.nameKey),
									onClick: () => {
										setTextColor(entry.id);
									},
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: WallpaperPanel_module_css_default.swatchColor,
										style: { background: entry.css }
									}), (0, react_jsx_runtime.jsx)("span", {
										className: WallpaperPanel_module_css_default.swatchName,
										children: t(entry.nameKey)
									})]
								}, entry.id))
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: WallpaperPanel_module_css_default.sliderGroup,
								children: [(0, react_jsx_runtime.jsx)(Slider, {
									css: WallpaperPanel_module_css_default,
									label: t("opacity"),
									min: 0,
									max: 100,
									value: settings.textOpacity,
									onChange: setTextOpacity
								}), (0, react_jsx_runtime.jsx)(Slider, {
									css: WallpaperPanel_module_css_default,
									label: t("outline"),
									min: 0,
									max: 5,
									value: settings.textOutline,
									onChange: setTextOutline
								})]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: WallpaperPanel_module_css_default.tierRow,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(WallpaperPanel_module_css_default.tier, settings.codeBackground && WallpaperPanel_module_css_default.tierSelected),
									"aria-pressed": settings.codeBackground,
									onClick: () => {
										setCodeBackground(!settings.codeBackground);
									},
									children: t(settings.codeBackground ? "codeBackground.on" : "codeBackground.off")
								})
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: WallpaperPanel_module_css_default.tierRow,
								children: FONT_TIERS.map(({ id, labelKey }) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(WallpaperPanel_module_css_default.tier, settings.textFont === id && WallpaperPanel_module_css_default.tierSelected),
									"aria-pressed": settings.textFont === id,
									onClick: () => {
										setTextFont(id);
									},
									children: t(labelKey)
								}, id))
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: WallpaperPanel_module_css_default.tierRow,
								children: WEIGHT_TIERS.map(({ id, labelKey }) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(WallpaperPanel_module_css_default.tier, settings.textWeight === id && WallpaperPanel_module_css_default.tierSelected),
									"aria-pressed": settings.textWeight === id,
									onClick: () => {
										setTextWeight(id);
									},
									children: labelKey
								}, id))
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: WallpaperPanel_module_css_default.tierRow,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(WallpaperPanel_module_css_default.tier, settings.mode === "desktop" && WallpaperPanel_module_css_default.tierSelected),
									"aria-pressed": settings.mode === "desktop",
									onClick: () => {
										setMode(settings.mode === "desktop" ? "none" : "desktop");
									},
									children: t("mode.desktop")
								})
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: WallpaperPanel_module_css_default.turnOff,
								onClick: () => {
									setMode("none");
								},
								children: t("turnOff")
							})
						] })
					]
				})
			});
		}
		//#endregion
		//#region \0dsh-css:C:\Users\OOBY\deepseek-harness\packages\client\ui-wallpaper\src\client\WallpaperButton.module.css.mjs
		const css$2 = ".jnw0EW_button{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;justify-content:center;align-items:center;padding:0;display:inline-flex}.jnw0EW_button:hover,.jnw0EW_button[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}";
		const tagId$2 = "@deepseek-ai/dsh-client-ui-wallpaper/WallpaperButton.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-wallpaper";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var WallpaperButton_module_css_default = { "button": "jnw0EW_button" };
		//#endregion
		//#region lib/types/client/WallpaperButton.js
		/**
		* Session-header wallpaper quick switch: an icon button in the right-aligned
		* header utilities row that toggles a compact wallpaper panel (WE gallery,
		* readability sliders, text color, turn-off). The full source management
		* (upload / URL) lives in the General-settings row; this is the fast path.
		*/
		/**
		* Render the header quick-switch button and its panel.
		* @param props - composed slot props.
		* @returns the button (plus the portaled panel while open).
		*/
		function WallpaperButton(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const close = () => {
				setOpen(false);
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: WallpaperButton_module_css_default.button,
				title: props.t("switch"),
				"aria-label": props.t("switch"),
				"aria-expanded": open,
				onClick: () => {
					setOpen((current) => !current);
				},
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFullscreenOutline16, { size: 16 })
			}), open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)(WallpaperPanel, {
				...props,
				onClose: close
			}), document.body)] });
		}
		//#endregion
		//#region \0dsh-css:C:\Users\OOBY\deepseek-harness\packages\client\ui-wallpaper\src\client\WallpaperRow.module.css.mjs
		const css$1 = ".eZG6vW_group{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:10px;padding:16px 0;display:flex}.eZG6vW_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.eZG6vW_modeRow{flex-wrap:wrap;align-items:stretch;gap:8px;display:flex}.eZG6vW_chip{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap;background:0 0;border-radius:10px;flex:96px;padding:6px 12px;font-size:13px;line-height:20px}.eZG6vW_chip:hover:not(.eZG6vW_chipSelected){background:var(--dsw-alias-interactive-bg-hover)}.eZG6vW_chipSelected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}.eZG6vW_preview{border:1px solid var(--dsw-alias-border-l2);background-color:var(--dsw-alias-bg-layer-2);background-position:50%;background-repeat:no-repeat;background-size:cover;border-radius:12px;height:72px}.eZG6vW_swatchGrid{grid-template-columns:repeat(3,1fr);gap:8px;display:grid}.eZG6vW_swatch{border:1px solid var(--dsw-alias-border-l2);font:inherit;cursor:pointer;background:0 0;border-radius:10px;flex-direction:column;align-items:stretch;gap:4px;padding:4px;display:flex}.eZG6vW_swatch:hover:not(.eZG6vW_swatchSelected){background:var(--dsw-alias-interactive-bg-hover)}.eZG6vW_swatchSelected{border-color:var(--dsw-static-neutral-bluish-400)}.eZG6vW_swatchColor{background-position:50%;background-repeat:no-repeat;background-size:cover;border-radius:6px;height:40px}.eZG6vW_swatchName{color:var(--dsw-alias-label-secondary);text-align:center;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.eZG6vW_sourceRow{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.eZG6vW_sourceButton{border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border-radius:10px;padding:6px 14px;font-size:13px;line-height:20px}.eZG6vW_sourceButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.eZG6vW_textInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:10px;flex:180px;padding:6px 10px;font-size:13px;line-height:20px}.eZG6vW_hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.eZG6vW_weBlock{flex-direction:column;gap:8px;display:flex}.eZG6vW_weTitle{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}.eZG6vW_error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}.eZG6vW_sliderGroup{flex-direction:column;gap:8px;display:flex}.eZG6vW_sliderRow{grid-template-columns:88px 1fr 40px;align-items:center;gap:10px;display:grid}.eZG6vW_sliderLabel{color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}.eZG6vW_slider{accent-color:var(--dsw-alias-brand-primary)}.eZG6vW_sliderValue{color:var(--dsw-alias-label-secondary);text-align:right;font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}.eZG6vW_turnOff{border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-state-error-primary);cursor:pointer;background:0 0;border-radius:10px;align-self:flex-start;padding:6px 14px;font-size:13px;line-height:20px}.eZG6vW_turnOff:hover{background:var(--dsw-alias-interactive-bg-hover)}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-wallpaper/WallpaperRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-wallpaper";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var WallpaperRow_module_css_default = {
			"swatchName": "eZG6vW_swatchName",
			"textInput": "eZG6vW_textInput",
			"title": "eZG6vW_title",
			"group": "eZG6vW_group",
			"sliderLabel": "eZG6vW_sliderLabel",
			"chipSelected": "eZG6vW_chipSelected",
			"slider": "eZG6vW_slider",
			"weTitle": "eZG6vW_weTitle",
			"hint": "eZG6vW_hint",
			"swatchGrid": "eZG6vW_swatchGrid",
			"swatch": "eZG6vW_swatch",
			"sliderRow": "eZG6vW_sliderRow",
			"swatchColor": "eZG6vW_swatchColor",
			"error": "eZG6vW_error",
			"modeRow": "eZG6vW_modeRow",
			"chip": "eZG6vW_chip",
			"sliderValue": "eZG6vW_sliderValue",
			"swatchSelected": "eZG6vW_swatchSelected",
			"sourceButton": "eZG6vW_sourceButton",
			"preview": "eZG6vW_preview",
			"turnOff": "eZG6vW_turnOff",
			"sliderGroup": "eZG6vW_sliderGroup",
			"sourceRow": "eZG6vW_sourceRow",
			"weBlock": "eZG6vW_weBlock"
		};
		//#endregion
		//#region lib/types/client/WallpaperRow.js
		/**
		* Chat-background row registered into the General section item slot: source
		* mode control (off / image / URL / desktop), upload and URL fields, the
		* wallpaper-layer sliders, and the chat typography controls (text color
		* palette, font family, weight). Registered by this package — the
		* wallpaper feature owns its settings surface. Selection follows the
		* persisted settings, never a local draft.
		*/
		/** Mode chips in display order. */
		const MODES = [
			{
				id: "none",
				labelKey: "mode.none"
			},
			{
				id: "image",
				labelKey: "mode.image"
			},
			{
				id: "url",
				labelKey: "mode.url"
			},
			{
				id: "desktop",
				labelKey: "mode.desktop"
			}
		];
		/**
		* Render the Chat-background row.
		* @param props - composed slot props.
		* @returns the row element tree.
		*/
		function WallpaperRow({ t, useStore, setMode, setValue, setBlur, setDim, setSurfaceAlpha, setTextFont, setTextWeight, setTextColor, setTextOpacity, setTextOutline, setCodeBackground, applyImageFile, applyWeWallpaper, setWeKey }) {
			const settings = useStore((state) => state.settings);
			const [urlDraft, setUrlDraft] = (0, react.useState)("");
			const [imageError, setImageError] = (0, react.useState)(null);
			const fileInput = (0, react.useRef)(null);
			const active = settings.mode !== "none";
			const pickFile = async (file) => {
				if (file === void 0) return;
				const result = await applyImageFile(file);
				if (result.ok) {
					setImageError(null);
					setValue(result.dataUrl);
					setMode("image");
				} else setImageError(result.reason === "too-large" ? "error.tooLarge" : "error.decode");
				if (fileInput.current !== null) fileInput.current.value = "";
			};
			const applyUrl = () => {
				const value = urlDraft.trim();
				if (value === "") return;
				setValue(value);
				setMode("url");
			};
			/** Switch the live Wallpaper Engine wallpaper and show it through the
			*  transparent chat shell (desktop mode). */
			const applyWe = async (key) => {
				if (!await applyWeWallpaper(key)) return;
				setWeKey(key);
				setMode("desktop");
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: WallpaperRow_module_css_default.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: WallpaperRow_module_css_default.title,
						children: t("title")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: WallpaperRow_module_css_default.modeRow,
						children: MODES.map(({ id, labelKey }) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: clsx(WallpaperRow_module_css_default.chip, settings.mode === id && WallpaperRow_module_css_default.chipSelected),
							"aria-pressed": settings.mode === id,
							onClick: () => {
								setMode(id);
							},
							children: t(labelKey)
						}, id))
					}),
					active && settings.mode === "desktop" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
						className: WallpaperRow_module_css_default.hint,
						children: t("desktop.hint")
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: WallpaperRow_module_css_default.turnOff,
						onClick: () => {
							setMode("none");
						},
						children: t("turnOff")
					})] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("div", {
							className: WallpaperRow_module_css_default.preview,
							role: "img",
							"aria-label": t("title"),
							style: previewStyle(settings)
						}),
						settings.mode === "image" && (0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperRow_module_css_default.sourceRow,
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: WallpaperRow_module_css_default.sourceButton,
									onClick: () => {
										fileInput.current?.click();
									},
									children: t("upload")
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: WallpaperRow_module_css_default.hint,
									children: t("uploadHint")
								}),
								(0, react_jsx_runtime.jsx)("input", {
									ref: fileInput,
									type: "file",
									accept: "image/*",
									hidden: true,
									onChange: (event) => {
										pickFile(event.target.files?.[0]);
									}
								}),
								imageError !== null && (0, react_jsx_runtime.jsx)("span", {
									className: WallpaperRow_module_css_default.error,
									children: t(imageError)
								})
							]
						}),
						settings.mode === "url" && (0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperRow_module_css_default.sourceRow,
							children: [(0, react_jsx_runtime.jsx)("input", {
								type: "text",
								className: WallpaperRow_module_css_default.textInput,
								placeholder: t("urlPlaceholder"),
								value: urlDraft,
								onChange: (event) => {
									setUrlDraft(event.target.value);
								},
								onKeyDown: (event) => {
									if (event.key === "Enter") applyUrl();
								}
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: WallpaperRow_module_css_default.sourceButton,
								onClick: applyUrl,
								children: t("apply")
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperRow_module_css_default.weBlock,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: WallpaperRow_module_css_default.weTitle,
								children: t("we.title")
							}), (0, react_jsx_runtime.jsx)(WeGallery, {
								t,
								currentKey: settings.weKey,
								onApply: applyWe
							})]
						}),
						settings.mode !== "desktop" && (0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperRow_module_css_default.sliderGroup,
							children: [
								(0, react_jsx_runtime.jsx)(Slider, {
									css: WallpaperRow_module_css_default,
									label: t("blur"),
									min: 0,
									max: 40,
									value: settings.blur,
									onChange: setBlur
								}),
								(0, react_jsx_runtime.jsx)(Slider, {
									css: WallpaperRow_module_css_default,
									label: t("dim"),
									min: 0,
									max: .8,
									value: settings.dim,
									onChange: setDim
								}),
								(0, react_jsx_runtime.jsx)(Slider, {
									css: WallpaperRow_module_css_default,
									label: t("translucency"),
									min: .5,
									max: 1,
									value: settings.surfaceAlpha,
									onChange: setSurfaceAlpha
								})
							]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: WallpaperRow_module_css_default.swatchGrid,
							children: TEXT_COLORS.map((entry) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: clsx(WallpaperRow_module_css_default.swatch, settings.textColor === entry.id && WallpaperRow_module_css_default.swatchSelected),
								"aria-pressed": settings.textColor === entry.id,
								title: t(entry.nameKey),
								onClick: () => {
									setTextColor(entry.id);
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: WallpaperRow_module_css_default.swatchColor,
									style: { background: entry.css }
								}), (0, react_jsx_runtime.jsx)("span", {
									className: WallpaperRow_module_css_default.swatchName,
									children: t(entry.nameKey)
								})]
							}, entry.id))
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: WallpaperRow_module_css_default.sliderGroup,
							children: [(0, react_jsx_runtime.jsx)(Slider, {
								css: WallpaperRow_module_css_default,
								label: t("opacity"),
								min: 0,
								max: 100,
								value: settings.textOpacity,
								onChange: setTextOpacity
							}), (0, react_jsx_runtime.jsx)(Slider, {
								css: WallpaperRow_module_css_default,
								label: t("outline"),
								min: 0,
								max: 5,
								value: settings.textOutline,
								onChange: setTextOutline
							})]
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: WallpaperRow_module_css_default.modeRow,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(WallpaperRow_module_css_default.chip, settings.codeBackground && WallpaperRow_module_css_default.chipSelected),
								"aria-pressed": settings.codeBackground,
								onClick: () => {
									setCodeBackground(!settings.codeBackground);
								},
								children: t(settings.codeBackground ? "codeBackground.on" : "codeBackground.off")
							})
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: WallpaperRow_module_css_default.modeRow,
							children: FONT_TIERS.map(({ id, labelKey }) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(WallpaperRow_module_css_default.chip, settings.textFont === id && WallpaperRow_module_css_default.chipSelected),
								"aria-pressed": settings.textFont === id,
								onClick: () => {
									setTextFont(id);
								},
								children: t(labelKey)
							}, id))
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: WallpaperRow_module_css_default.modeRow,
							children: WEIGHT_TIERS.map(({ id, labelKey }) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(WallpaperRow_module_css_default.chip, settings.textWeight === id && WallpaperRow_module_css_default.chipSelected),
								"aria-pressed": settings.textWeight === id,
								onClick: () => {
									setTextWeight(id);
								},
								children: labelKey
							}, id))
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: WallpaperRow_module_css_default.turnOff,
							onClick: () => {
								setMode("none");
							},
							children: t("turnOff")
						})
					] })
				]
			});
		}
		/** CSS background value of the current wallpaper for the preview box. */
		function previewStyle(settings) {
			if (settings.mode === "image" || settings.mode === "url") return { background: `url("${settings.value}") center / cover no-repeat` };
			return {};
		}
		//#endregion
		//#region lib/types/client/TransparentDesktopButton.js
		/**
		* Transparent-desktop toggle in the session header's right-aligned utilities
		* row: one click spawns the transparent Electron shell and switches the
		* wallpaper to Desktop-transparent mode (the OS desktop shows through the
		* chat); clicking again closes the shell and turns the mode off. The shell is
		* managed by the host's /chat-desktop routes, so this feels like a plain
		* plugin toggle.
		*/
		/**
		* Render the transparent-desktop toggle button.
		* @param props - composed slot props.
		* @returns the button element.
		*/
		function TransparentDesktopButton({ t, useStore, setMode }) {
			const settings = useStore((state) => state.settings);
			const [busy, setBusy] = (0, react.useState)(false);
			const active = settings.mode === "desktop";
			const toggle = async () => {
				if (busy) return;
				setBusy(true);
				try {
					if (active) {
						await fetch("/chat-desktop/close", { method: "POST" });
						setMode("none");
					} else if ((await (await fetch("/chat-desktop/open", { method: "POST" })).json().catch(() => null))?.ok !== false) setMode("desktop");
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: WallpaperButton_module_css_default.button,
				title: t("desktop.transparent"),
				"aria-label": t("desktop.transparent"),
				"aria-pressed": active,
				onClick: () => {
					toggle();
				},
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, { size: 16 })
			});
		}
		//#endregion
		//#region \0dsh-css:C:\Users\OOBY\deepseek-harness\packages\client\ui-wallpaper\src\client\WindowControls.module.css.mjs
		const css = ".jILhJG_group{border-left:1px solid var(--dsw-alias-border-l2);align-items:center;gap:2px;padding-left:6px;display:inline-flex}.jILhJG_button,.jILhJG_close{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;justify-content:center;align-items:center;padding:0;display:inline-flex}.jILhJG_button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.jILhJG_close:hover{background:color-mix(in srgb, var(--dsw-alias-state-danger-primary) 14%, transparent);color:var(--dsw-alias-state-danger-primary)}";
		const tagId = "@deepseek-ai/dsh-client-ui-wallpaper/WindowControls.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-wallpaper";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WindowControls_module_css_default = {
			"group": "jILhJG_group",
			"button": "jILhJG_button",
			"close": "jILhJG_close"
		};
		//#endregion
		//#region lib/types/client/WindowControls.js
		/**
		* Browser-style window controls for the transparent chat shell: clear-screen,
		* minimize / maximize-restore / close buttons rendered in the session header
		* utilities row, exactly where a normal browser puts them. The controls only
		* exist when the page runs inside the Electron shell (window.desktopShell,
		* injected by the shell's preload bridge) — a regular browser tab never sees
		* them. The clear-screen button re-runs the shell's one-click clear (hides
		* windows opened since the last clear, e.g. apps summoned mid-chat); the
		* close button routes through the shell's close path, which restores the
		* desktop chat window before quitting.
		*/
		/** Minimize glyph: a single horizontal bar. */
		function MinimizeGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 14 14",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M3 7h8",
					stroke: "currentColor",
					strokeWidth: 1.4,
					strokeLinecap: "round"
				})
			});
		}
		/** Clear-screen glyph: a window with a down arrow — tuck the windows away. */
		function ClearScreenGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 14 14",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: 2.5,
						y: 2.5,
						width: 9,
						height: 9,
						fill: "none",
						stroke: "currentColor",
						strokeWidth: 1.4,
						rx: 1.5
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M7 5v3.2",
						stroke: "currentColor",
						strokeWidth: 1.4,
						strokeLinecap: "round"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "m5.4 7.2 1.6 1.6 1.6-1.6",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: 1.4,
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				]
			});
		}
		/** Maximize glyph: an empty square. */
		function MaximizeGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 14 14",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("rect", {
					x: 3,
					y: 3,
					width: 8,
					height: 8,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.4,
					rx: 1.5
				})
			});
		}
		/** Restore glyph: two overlapping squares (the lower one filled). */
		function RestoreGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 14 14",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("path", {
					d: "M5 6h3.5A2.5 2.5 0 0 1 11 8.5V12H8.5A2.5 2.5 0 0 1 6 9.5V6Z",
					fill: "currentColor",
					opacity: .45
				}), (0, react_jsx_runtime.jsx)("rect", {
					x: 3,
					y: 3,
					width: 7,
					height: 7,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.4,
					rx: 1.5
				})]
			});
		}
		/**
		* Render the window control buttons (shell environment only).
		* @param props - composed slot props.
		* @returns the button group, or null outside the transparent shell.
		*/
		function WindowControls({ t, setMode }) {
			const shell = typeof window !== "undefined" ? window.desktopShell : void 0;
			const [maximized, setMaximized] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (shell === void 0) return;
				let alive = true;
				shell.isMaximized().then((value) => {
					if (alive) setMaximized(value);
				}).catch(() => {});
				const unsubscribe = shell.onMaximizedChange((value) => {
					if (alive) setMaximized(value);
				});
				return () => {
					alive = false;
					unsubscribe();
				};
			}, [shell]);
			if (shell === void 0) return null;
			const close = () => {
				setMode?.("none");
				shell.close();
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: WindowControls_module_css_default.group,
				role: "group",
				"aria-label": t("window.controls"),
				children: [
					typeof shell.clearDesktop === "function" && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: WindowControls_module_css_default.button,
						title: t("clearScreen"),
						"aria-label": t("clearScreen"),
						onClick: () => {
							shell.clearDesktop?.();
						},
						children: (0, react_jsx_runtime.jsx)(ClearScreenGlyph, {})
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: WindowControls_module_css_default.button,
						title: t("window.minimize"),
						"aria-label": t("window.minimize"),
						onClick: () => {
							shell.minimize();
						},
						children: (0, react_jsx_runtime.jsx)(MinimizeGlyph, {})
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: WindowControls_module_css_default.button,
						title: maximized ? t("window.restore") : t("window.maximize"),
						"aria-label": maximized ? t("window.restore") : t("window.maximize"),
						onClick: () => {
							shell.toggleMaximize();
						},
						children: maximized ? (0, react_jsx_runtime.jsx)(RestoreGlyph, {}) : (0, react_jsx_runtime.jsx)(MaximizeGlyph, {})
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: WindowControls_module_css_default.close,
						title: t("window.close"),
						"aria-label": t("window.close"),
						onClick: close,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 })
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Namespace owning this feature's settings-row copy. */
		const SETTINGS_NS = "settings.wallpaper";
		/**
		* Required services: settings transport, slots/locale/theme, plus the
		* forwarded settings invalidation that `bindSettingsScope` subscribes to on
		* this context.
		*/
		const inject = [
			"slots",
			"locale",
			"theme",
			"connection",
			"remote",
			"settingsScope"
		];
		/**
		* Client plugin body: provide the wallpaper service, drive the presenter, and
		* register the feature-owned settings row and header quick-switch button.
		* @param ctx - client cordis context.
		*/
		function apply(ctx) {
			const wallpaper = new WallpaperRuntime(ctx, ctx.settingsScope.bind({ namespace: WALLPAPER_SETTINGS_NAMESPACE }));
			ctx.provide("wallpaper", wallpaper);
			const presenter = new WallpaperPresenter(ctx.theme);
			const applySnapshot = (snapshot) => {
				presenter.apply(snapshot, ctx.theme.getTheme());
			};
			ctx.on("wallpaper/change", applySnapshot);
			ctx.on("theme/change", (snapshot) => {
				presenter.onThemeChange(snapshot);
			});
			applySnapshot(wallpaper.getWallpaper());
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh,
				en
			}), "ui-wallpaper: settings dictionaries");
			const rowStore = createWallpaperStore();
			const headerStore = createWallpaperStore();
			let rowBound;
			let headerBound;
			const sync = (snapshot) => {
				rowBound?.sync(snapshot.settings, snapshot.revision);
				headerBound?.sync(snapshot.settings, snapshot.revision);
			};
			ctx.on("wallpaper/change", sync);
			const face = () => ({
				setMode: (mode) => {
					wallpaper.setMode(mode);
				},
				setValue: (value) => {
					wallpaper.setValue(value);
				},
				setBlur: (value) => {
					wallpaper.setBlur(value);
				},
				setDim: (value) => {
					wallpaper.setDim(value);
				},
				setSurfaceAlpha: (value) => {
					wallpaper.setSurfaceAlpha(value);
				},
				setTextFont: (font) => {
					wallpaper.setTextFont(font);
				},
				setTextWeight: (weight) => {
					wallpaper.setTextWeight(weight);
				},
				setTextColor: (color) => {
					wallpaper.setTextColor(color);
				},
				setTextOpacity: (opacity) => {
					wallpaper.setTextOpacity(opacity);
				},
				setTextOutline: (outline) => {
					wallpaper.setTextOutline(outline);
				},
				setCodeBackground: (on) => {
					wallpaper.setCodeBackground(on);
				},
				applyImageFile: (file) => applyImageFile(file),
				applyWeWallpaper: (key) => applyWeWallpaper(key).then((result) => result.ok),
				setWeKey: (key) => {
					wallpaper.setWeKey(key);
				}
			});
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "wallpaper",
				order: 30,
				store: rowStore,
				locale: SETTINGS_NS,
				inject: (actions) => {
					rowBound = actions;
					sync(wallpaper.getWallpaper());
					return face();
				}
			}, WallpaperRow));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "wallpaper",
				order: 30,
				store: headerStore,
				locale: SETTINGS_NS,
				inject: (_sessionId, actions) => {
					headerBound = actions;
					sync(wallpaper.getWallpaper());
					return face();
				}
			}, WallpaperButton));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "transparent-desktop",
				order: 31,
				store: headerStore,
				locale: SETTINGS_NS,
				inject: (_sessionId, actions) => {
					headerBound = actions;
					sync(wallpaper.getWallpaper());
					return { setMode: (mode) => {
						wallpaper.setMode(mode);
					} };
				}
			}, TransparentDesktopButton));
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "window-controls",
				order: 32,
				store: headerStore,
				locale: SETTINGS_NS,
				inject: (_sessionId, actions) => {
					headerBound = actions;
					sync(wallpaper.getWallpaper());
					return { setMode: (mode) => {
						wallpaper.setMode(mode);
					} };
				}
			}, WindowControls));
			ctx.effect(() => () => {
				presenter.dispose();
			}, "ui-wallpaper: presenter disposal");
		}
		//#endregion
		exports.SETTINGS_NS = SETTINGS_NS;
		exports.WallpaperPresenter = WallpaperPresenter;
		exports.WallpaperRuntime = WallpaperRuntime;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map