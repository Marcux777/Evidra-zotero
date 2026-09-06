var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// validate-job-command.generated.js
var validate = validate20;
var validate_job_command_generated_default = validate20;
var pattern4 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern5 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
var pattern8 = new RegExp("^[a-f0-9]{32}$", "u");
var schema34 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "form_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Form Version Id", "type": "string" }, "field_keys": { "items": { "pattern": "^[a-z][a-z0-9_]{0,63}$", "type": "string" }, "maxItems": 30, "minItems": 1, "title": "Field Keys", "type": "array" }, "profile_id": { "pattern": "^[a-zA-Z0-9_-]{1,100}$", "title": "Profile Id", "type": "string" }, "method": { "enum": ["SEARCH", "FULL_SCAN"], "title": "Method", "type": "string" }, "max_chunks_per_unit": { "default": 500, "maximum": 1e4, "minimum": 1, "title": "Max Chunks Per Unit", "type": "integer" }, "context_tokens": { "default": 32768, "maximum": 1e6, "minimum": 1024, "title": "Context Tokens", "type": "integer" }, "max_output_tokens": { "default": 2048, "maximum": 32768, "minimum": 1, "title": "Max Output Tokens", "type": "integer" }, "ollama_options": { "anyOf": [{ "$ref": "#/$defs/OllamaOptions" }, { "type": "null" }], "default": null }, "force_new": { "default": false, "title": "Force New", "type": "boolean" } }, "required": ["idempotency_key", "form_version_id", "field_keys", "profile_id", "method"], "title": "JobWrite", "type": "object" };
var func1 = Object.prototype.hasOwnProperty;
var func2 = require_ucs2length().default;
var pattern9 = new RegExp("^[a-z][a-z0-9_]{0,63}$", "u");
var pattern10 = new RegExp("^[a-zA-Z0-9_-]{1,100}$", "u");
function validate22(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.form_version_id === void 0 && (missing0 = "form_version_id") || data.field_keys === void 0 && (missing0 = "field_keys") || data.profile_id === void 0 && (missing0 = "profile_id") || data.method === void 0 && (missing0 = "method")) {
        validate22.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func1.call(schema34.properties, key0)) {
            validate22.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.idempotency_key !== void 0) {
            let data0 = data.idempotency_key;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func2(data0) > 200) {
                  validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func2(data0) < 1) {
                    validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.form_version_id !== void 0) {
              let data1 = data.form_version_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern8.test(data1)) {
                    validate22.errors = [{ instancePath: instancePath + "/form_version_id", schemaPath: "#/properties/form_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                    return false;
                  }
                } else {
                  validate22.errors = [{ instancePath: instancePath + "/form_version_id", schemaPath: "#/properties/form_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.field_keys !== void 0) {
                let data2 = data.field_keys;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (Array.isArray(data2)) {
                    if (data2.length > 30) {
                      validate22.errors = [{ instancePath: instancePath + "/field_keys", schemaPath: "#/properties/field_keys/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                      return false;
                    } else {
                      if (data2.length < 1) {
                        validate22.errors = [{ instancePath: instancePath + "/field_keys", schemaPath: "#/properties/field_keys/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                        return false;
                      } else {
                        var valid1 = true;
                        const len0 = data2.length;
                        for (let i0 = 0; i0 < len0; i0++) {
                          let data3 = data2[i0];
                          const _errs8 = errors;
                          if (errors === _errs8) {
                            if (typeof data3 === "string") {
                              if (!pattern9.test(data3)) {
                                validate22.errors = [{ instancePath: instancePath + "/field_keys/" + i0, schemaPath: "#/properties/field_keys/items/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' }];
                                return false;
                              }
                            } else {
                              validate22.errors = [{ instancePath: instancePath + "/field_keys/" + i0, schemaPath: "#/properties/field_keys/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                          var valid1 = _errs8 === errors;
                          if (!valid1) {
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    validate22.errors = [{ instancePath: instancePath + "/field_keys", schemaPath: "#/properties/field_keys/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.profile_id !== void 0) {
                  let data4 = data.profile_id;
                  const _errs10 = errors;
                  if (errors === _errs10) {
                    if (typeof data4 === "string") {
                      if (!pattern10.test(data4)) {
                        validate22.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                        return false;
                      }
                    } else {
                      validate22.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs10 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.method !== void 0) {
                    let data5 = data.method;
                    const _errs12 = errors;
                    if (typeof data5 !== "string") {
                      validate22.errors = [{ instancePath: instancePath + "/method", schemaPath: "#/properties/method/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if (!(data5 === "SEARCH" || data5 === "FULL_SCAN")) {
                      validate22.errors = [{ instancePath: instancePath + "/method", schemaPath: "#/properties/method/enum", keyword: "enum", params: { allowedValues: schema34.properties.method.enum }, message: "must be equal to one of the allowed values" }];
                      return false;
                    }
                    var valid0 = _errs12 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.max_chunks_per_unit !== void 0) {
                      let data6 = data.max_chunks_per_unit;
                      const _errs14 = errors;
                      if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                        validate22.errors = [{ instancePath: instancePath + "/max_chunks_per_unit", schemaPath: "#/properties/max_chunks_per_unit/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                        return false;
                      }
                      if (errors === _errs14) {
                        if (typeof data6 == "number" && isFinite(data6)) {
                          if (data6 > 1e4 || isNaN(data6)) {
                            validate22.errors = [{ instancePath: instancePath + "/max_chunks_per_unit", schemaPath: "#/properties/max_chunks_per_unit/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e4 }, message: "must be <= 10000" }];
                            return false;
                          } else {
                            if (data6 < 1 || isNaN(data6)) {
                              validate22.errors = [{ instancePath: instancePath + "/max_chunks_per_unit", schemaPath: "#/properties/max_chunks_per_unit/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                              return false;
                            }
                          }
                        }
                      }
                      var valid0 = _errs14 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.context_tokens !== void 0) {
                        let data7 = data.context_tokens;
                        const _errs16 = errors;
                        if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                          validate22.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                          return false;
                        }
                        if (errors === _errs16) {
                          if (typeof data7 == "number" && isFinite(data7)) {
                            if (data7 > 1e6 || isNaN(data7)) {
                              validate22.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" }];
                              return false;
                            } else {
                              if (data7 < 1024 || isNaN(data7)) {
                                validate22.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1024 }, message: "must be >= 1024" }];
                                return false;
                              }
                            }
                          }
                        }
                        var valid0 = _errs16 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.max_output_tokens !== void 0) {
                          let data8 = data.max_output_tokens;
                          const _errs18 = errors;
                          if (!(typeof data8 == "number" && (!(data8 % 1) && !isNaN(data8)) && isFinite(data8))) {
                            validate22.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs18) {
                            if (typeof data8 == "number" && isFinite(data8)) {
                              if (data8 > 32768 || isNaN(data8)) {
                                validate22.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/maximum", keyword: "maximum", params: { comparison: "<=", limit: 32768 }, message: "must be <= 32768" }];
                                return false;
                              } else {
                                if (data8 < 1 || isNaN(data8)) {
                                  validate22.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                  return false;
                                }
                              }
                            }
                          }
                          var valid0 = _errs18 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.ollama_options !== void 0) {
                            let data9 = data.ollama_options;
                            const _errs20 = errors;
                            const _errs21 = errors;
                            let valid2 = false;
                            const _errs22 = errors;
                            const _errs23 = errors;
                            if (errors === _errs23) {
                              if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                                const _errs25 = errors;
                                for (const key1 in data9) {
                                  if (!(key1 === "num_ctx" || key1 === "temperature" || key1 === "seed" || key1 === "think")) {
                                    const err0 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/$defs/OllamaOptions/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                                    if (vErrors === null) {
                                      vErrors = [err0];
                                    } else {
                                      vErrors.push(err0);
                                    }
                                    errors++;
                                    break;
                                  }
                                }
                                if (_errs25 === errors) {
                                  if (data9.num_ctx !== void 0) {
                                    let data10 = data9.num_ctx;
                                    const _errs26 = errors;
                                    const _errs27 = errors;
                                    let valid5 = false;
                                    const _errs28 = errors;
                                    if (!(typeof data10 == "number" && (!(data10 % 1) && !isNaN(data10)) && isFinite(data10))) {
                                      const err1 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                      if (vErrors === null) {
                                        vErrors = [err1];
                                      } else {
                                        vErrors.push(err1);
                                      }
                                      errors++;
                                    }
                                    if (errors === _errs28) {
                                      if (typeof data10 == "number" && isFinite(data10)) {
                                        if (data10 <= 0 || isNaN(data10)) {
                                          const err2 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/0/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
                                          if (vErrors === null) {
                                            vErrors = [err2];
                                          } else {
                                            vErrors.push(err2);
                                          }
                                          errors++;
                                        }
                                      }
                                    }
                                    var _valid1 = _errs28 === errors;
                                    valid5 = valid5 || _valid1;
                                    const _errs30 = errors;
                                    if (data10 !== null) {
                                      const err3 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                      if (vErrors === null) {
                                        vErrors = [err3];
                                      } else {
                                        vErrors.push(err3);
                                      }
                                      errors++;
                                    }
                                    var _valid1 = _errs30 === errors;
                                    valid5 = valid5 || _valid1;
                                    if (!valid5) {
                                      const err4 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err4];
                                      } else {
                                        vErrors.push(err4);
                                      }
                                      errors++;
                                    } else {
                                      errors = _errs27;
                                      if (vErrors !== null) {
                                        if (_errs27) {
                                          vErrors.length = _errs27;
                                        } else {
                                          vErrors = null;
                                        }
                                      }
                                    }
                                    var valid4 = _errs26 === errors;
                                  } else {
                                    var valid4 = true;
                                  }
                                  if (valid4) {
                                    if (data9.temperature !== void 0) {
                                      let data11 = data9.temperature;
                                      const _errs32 = errors;
                                      const _errs33 = errors;
                                      let valid6 = false;
                                      const _errs34 = errors;
                                      if (errors === _errs34) {
                                        if (typeof data11 == "number" && isFinite(data11)) {
                                          if (data11 > 2 || isNaN(data11)) {
                                            const err5 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2 }, message: "must be <= 2" };
                                            if (vErrors === null) {
                                              vErrors = [err5];
                                            } else {
                                              vErrors.push(err5);
                                            }
                                            errors++;
                                          } else {
                                            if (data11 < 0 || isNaN(data11)) {
                                              const err6 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                              if (vErrors === null) {
                                                vErrors = [err6];
                                              } else {
                                                vErrors.push(err6);
                                              }
                                              errors++;
                                            }
                                          }
                                        } else {
                                          const err7 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                          if (vErrors === null) {
                                            vErrors = [err7];
                                          } else {
                                            vErrors.push(err7);
                                          }
                                          errors++;
                                        }
                                      }
                                      var _valid2 = _errs34 === errors;
                                      valid6 = valid6 || _valid2;
                                      const _errs36 = errors;
                                      if (data11 !== null) {
                                        const err8 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                        if (vErrors === null) {
                                          vErrors = [err8];
                                        } else {
                                          vErrors.push(err8);
                                        }
                                        errors++;
                                      }
                                      var _valid2 = _errs36 === errors;
                                      valid6 = valid6 || _valid2;
                                      if (!valid6) {
                                        const err9 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                        if (vErrors === null) {
                                          vErrors = [err9];
                                        } else {
                                          vErrors.push(err9);
                                        }
                                        errors++;
                                      } else {
                                        errors = _errs33;
                                        if (vErrors !== null) {
                                          if (_errs33) {
                                            vErrors.length = _errs33;
                                          } else {
                                            vErrors = null;
                                          }
                                        }
                                      }
                                      var valid4 = _errs32 === errors;
                                    } else {
                                      var valid4 = true;
                                    }
                                    if (valid4) {
                                      if (data9.seed !== void 0) {
                                        let data12 = data9.seed;
                                        const _errs38 = errors;
                                        const _errs39 = errors;
                                        let valid7 = false;
                                        const _errs40 = errors;
                                        if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12)) && isFinite(data12))) {
                                          const err10 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                          if (vErrors === null) {
                                            vErrors = [err10];
                                          } else {
                                            vErrors.push(err10);
                                          }
                                          errors++;
                                        }
                                        var _valid3 = _errs40 === errors;
                                        valid7 = valid7 || _valid3;
                                        const _errs42 = errors;
                                        if (data12 !== null) {
                                          const err11 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                          if (vErrors === null) {
                                            vErrors = [err11];
                                          } else {
                                            vErrors.push(err11);
                                          }
                                          errors++;
                                        }
                                        var _valid3 = _errs42 === errors;
                                        valid7 = valid7 || _valid3;
                                        if (!valid7) {
                                          const err12 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                          if (vErrors === null) {
                                            vErrors = [err12];
                                          } else {
                                            vErrors.push(err12);
                                          }
                                          errors++;
                                        } else {
                                          errors = _errs39;
                                          if (vErrors !== null) {
                                            if (_errs39) {
                                              vErrors.length = _errs39;
                                            } else {
                                              vErrors = null;
                                            }
                                          }
                                        }
                                        var valid4 = _errs38 === errors;
                                      } else {
                                        var valid4 = true;
                                      }
                                      if (valid4) {
                                        if (data9.think !== void 0) {
                                          let data13 = data9.think;
                                          const _errs44 = errors;
                                          const _errs45 = errors;
                                          let valid8 = false;
                                          const _errs46 = errors;
                                          if (typeof data13 !== "boolean") {
                                            const err13 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf/0/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                                            if (vErrors === null) {
                                              vErrors = [err13];
                                            } else {
                                              vErrors.push(err13);
                                            }
                                            errors++;
                                          }
                                          var _valid4 = _errs46 === errors;
                                          valid8 = valid8 || _valid4;
                                          const _errs48 = errors;
                                          if (data13 !== null) {
                                            const err14 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                            if (vErrors === null) {
                                              vErrors = [err14];
                                            } else {
                                              vErrors.push(err14);
                                            }
                                            errors++;
                                          }
                                          var _valid4 = _errs48 === errors;
                                          valid8 = valid8 || _valid4;
                                          if (!valid8) {
                                            const err15 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                            if (vErrors === null) {
                                              vErrors = [err15];
                                            } else {
                                              vErrors.push(err15);
                                            }
                                            errors++;
                                          } else {
                                            errors = _errs45;
                                            if (vErrors !== null) {
                                              if (_errs45) {
                                                vErrors.length = _errs45;
                                              } else {
                                                vErrors = null;
                                              }
                                            }
                                          }
                                          var valid4 = _errs44 === errors;
                                        } else {
                                          var valid4 = true;
                                        }
                                      }
                                    }
                                  }
                                }
                              } else {
                                const err16 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/$defs/OllamaOptions/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                                if (vErrors === null) {
                                  vErrors = [err16];
                                } else {
                                  vErrors.push(err16);
                                }
                                errors++;
                              }
                            }
                            var _valid0 = _errs22 === errors;
                            valid2 = valid2 || _valid0;
                            const _errs50 = errors;
                            if (data9 !== null) {
                              const err17 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/properties/ollama_options/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                              if (vErrors === null) {
                                vErrors = [err17];
                              } else {
                                vErrors.push(err17);
                              }
                              errors++;
                            }
                            var _valid0 = _errs50 === errors;
                            valid2 = valid2 || _valid0;
                            if (!valid2) {
                              const err18 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/properties/ollama_options/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                              if (vErrors === null) {
                                vErrors = [err18];
                              } else {
                                vErrors.push(err18);
                              }
                              errors++;
                              validate22.errors = vErrors;
                              return false;
                            } else {
                              errors = _errs21;
                              if (vErrors !== null) {
                                if (_errs21) {
                                  vErrors.length = _errs21;
                                } else {
                                  vErrors = null;
                                }
                              }
                            }
                            var valid0 = _errs20 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.force_new !== void 0) {
                              const _errs52 = errors;
                              if (typeof data.force_new !== "boolean") {
                                validate22.errors = [{ instancePath: instancePath + "/force_new", schemaPath: "#/properties/force_new/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                return false;
                              }
                              var valid0 = _errs52 === errors;
                            } else {
                              var valid0 = true;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate22.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate21(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.request === void 0 && (missing0 = "request")) {
        validate21.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate21.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.notebook_id !== void 0) {
            let data0 = data.notebook_id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (!pattern4.test(data0)) {
                  validate21.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate21.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.snapshot_id !== void 0) {
              let data1 = data.snapshot_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern5.test(data1)) {
                    validate21.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate21.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.op !== void 0) {
                let data2 = data.op;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("jobs.prepare" !== data2) {
                  validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "jobs.prepare" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  const _errs8 = errors;
                  if (!validate22(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
                    errors = vErrors.length;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
              }
            }
          }
        }
      }
    } else {
      validate21.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema41 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "action": { "enum": ["resume", "pause", "cancel", "skip_uncertain"], "title": "Action", "type": "string" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" } }, "required": ["idempotency_key", "action", "expected_revision"], "title": "JobControl", "type": "object" };
function validate25(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate25.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.job_id === void 0 && (missing0 = "job_id") || data.request === void 0 && (missing0 = "request")) {
        validate25.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "job_id" || key0 === "request")) {
            validate25.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.notebook_id !== void 0) {
            let data0 = data.notebook_id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (!pattern4.test(data0)) {
                  validate25.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate25.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.snapshot_id !== void 0) {
              let data1 = data.snapshot_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern5.test(data1)) {
                    validate25.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate25.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.op !== void 0) {
                let data2 = data.op;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate25.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("jobs.control" !== data2) {
                  validate25.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "jobs.control" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.job_id !== void 0) {
                  let data3 = data.job_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern8.test(data3)) {
                        validate25.errors = [{ instancePath: instancePath + "/job_id", schemaPath: "#/properties/job_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate25.errors = [{ instancePath: instancePath + "/job_id", schemaPath: "#/properties/job_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.request !== void 0) {
                    let data4 = data.request;
                    const _errs10 = errors;
                    const _errs11 = errors;
                    if (errors === _errs11) {
                      if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
                        let missing1;
                        if (data4.idempotency_key === void 0 && (missing1 = "idempotency_key") || data4.action === void 0 && (missing1 = "action") || data4.expected_revision === void 0 && (missing1 = "expected_revision")) {
                          validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/JobControl/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                          return false;
                        } else {
                          const _errs13 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "idempotency_key" || key1 === "action" || key1 === "expected_revision")) {
                              validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/JobControl/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                              return false;
                              break;
                            }
                          }
                          if (_errs13 === errors) {
                            if (data4.idempotency_key !== void 0) {
                              let data5 = data4.idempotency_key;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (func2(data5) > 200) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/JobControl/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                    return false;
                                  } else {
                                    if (func2(data5) < 1) {
                                      validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/JobControl/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                      return false;
                                    }
                                  }
                                } else {
                                  validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/JobControl/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data4.action !== void 0) {
                                let data6 = data4.action;
                                const _errs16 = errors;
                                if (typeof data6 !== "string") {
                                  validate25.errors = [{ instancePath: instancePath + "/request/action", schemaPath: "#/$defs/JobControl/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                                if (!(data6 === "resume" || data6 === "pause" || data6 === "cancel" || data6 === "skip_uncertain")) {
                                  validate25.errors = [{ instancePath: instancePath + "/request/action", schemaPath: "#/$defs/JobControl/properties/action/enum", keyword: "enum", params: { allowedValues: schema41.properties.action.enum }, message: "must be equal to one of the allowed values" }];
                                  return false;
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data4.expected_revision !== void 0) {
                                  let data7 = data4.expected_revision;
                                  const _errs18 = errors;
                                  if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/JobControl/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs18) {
                                    if (typeof data7 == "number" && isFinite(data7)) {
                                      if (data7 < 0 || isNaN(data7)) {
                                        validate25.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/JobControl/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                        return false;
                                      }
                                    }
                                  }
                                  var valid2 = _errs18 === errors;
                                } else {
                                  var valid2 = true;
                                }
                              }
                            }
                          }
                        }
                      } else {
                        validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/JobControl/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                        return false;
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      validate25.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate25.errors = vErrors;
  return errors === 0;
}
validate25.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  const _errs2 = errors;
  if (errors === _errs2) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.offset === void 0 && (missing0 = "offset")) {
        const err0 = { instancePath, schemaPath: "#/$defs/JobListCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      } else {
        const _errs4 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "offset")) {
            const err1 = { instancePath, schemaPath: "#/$defs/JobListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err1];
            } else {
              vErrors.push(err1);
            }
            errors++;
            break;
          }
        }
        if (_errs4 === errors) {
          if (data.notebook_id !== void 0) {
            let data0 = data.notebook_id;
            const _errs5 = errors;
            if (errors === _errs5) {
              if (typeof data0 === "string") {
                if (!pattern4.test(data0)) {
                  const err2 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobListCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobListCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            var valid2 = _errs5 === errors;
          } else {
            var valid2 = true;
          }
          if (valid2) {
            if (data.snapshot_id !== void 0) {
              let data1 = data.snapshot_id;
              const _errs7 = errors;
              if (errors === _errs7) {
                if (typeof data1 === "string") {
                  if (!pattern5.test(data1)) {
                    const err4 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobListCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                    if (vErrors === null) {
                      vErrors = [err4];
                    } else {
                      vErrors.push(err4);
                    }
                    errors++;
                  }
                } else {
                  const err5 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobListCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err5];
                  } else {
                    vErrors.push(err5);
                  }
                  errors++;
                }
              }
              var valid2 = _errs7 === errors;
            } else {
              var valid2 = true;
            }
            if (valid2) {
              if (data.op !== void 0) {
                let data2 = data.op;
                const _errs9 = errors;
                if (typeof data2 !== "string") {
                  const err6 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
                if ("jobs.list" !== data2) {
                  const err7 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobListCommand/properties/op/const", keyword: "const", params: { allowedValue: "jobs.list" }, message: "must be equal to constant" };
                  if (vErrors === null) {
                    vErrors = [err7];
                  } else {
                    vErrors.push(err7);
                  }
                  errors++;
                }
                var valid2 = _errs9 === errors;
              } else {
                var valid2 = true;
              }
              if (valid2) {
                if (data.offset !== void 0) {
                  let data3 = data.offset;
                  const _errs11 = errors;
                  if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                    const err8 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                      vErrors = [err8];
                    } else {
                      vErrors.push(err8);
                    }
                    errors++;
                  }
                  if (errors === _errs11) {
                    if (typeof data3 == "number" && isFinite(data3)) {
                      if (data3 > 1e6 || isNaN(data3)) {
                        const err9 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          const err10 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                          if (vErrors === null) {
                            vErrors = [err10];
                          } else {
                            vErrors.push(err10);
                          }
                          errors++;
                        }
                      }
                    }
                  }
                  var valid2 = _errs11 === errors;
                } else {
                  var valid2 = true;
                }
              }
            }
          }
        }
      }
    } else {
      const err11 = { instancePath, schemaPath: "#/$defs/JobListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
      if (vErrors === null) {
        vErrors = [err11];
      } else {
        vErrors.push(err11);
      }
      errors++;
    }
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs13 = errors;
  if (!validate21(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs13 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
    const _errs14 = errors;
    const _errs15 = errors;
    if (errors === _errs15) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing1;
        if (data.notebook_id === void 0 && (missing1 = "notebook_id") || data.snapshot_id === void 0 && (missing1 = "snapshot_id") || data.op === void 0 && (missing1 = "op") || data.job_id === void 0 && (missing1 = "job_id")) {
          const err12 = { instancePath, schemaPath: "#/$defs/JobReadCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        } else {
          const _errs17 = errors;
          for (const key1 in data) {
            if (!(key1 === "notebook_id" || key1 === "snapshot_id" || key1 === "op" || key1 === "job_id")) {
              const err13 = { instancePath, schemaPath: "#/$defs/JobReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
              break;
            }
          }
          if (_errs17 === errors) {
            if (data.notebook_id !== void 0) {
              let data4 = data.notebook_id;
              const _errs18 = errors;
              if (errors === _errs18) {
                if (typeof data4 === "string") {
                  if (!pattern4.test(data4)) {
                    const err14 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                    if (vErrors === null) {
                      vErrors = [err14];
                    } else {
                      vErrors.push(err14);
                    }
                    errors++;
                  }
                } else {
                  const err15 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
              }
              var valid4 = _errs18 === errors;
            } else {
              var valid4 = true;
            }
            if (valid4) {
              if (data.snapshot_id !== void 0) {
                let data5 = data.snapshot_id;
                const _errs20 = errors;
                if (errors === _errs20) {
                  if (typeof data5 === "string") {
                    if (!pattern5.test(data5)) {
                      const err16 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                      if (vErrors === null) {
                        vErrors = [err16];
                      } else {
                        vErrors.push(err16);
                      }
                      errors++;
                    }
                  } else {
                    const err17 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err17];
                    } else {
                      vErrors.push(err17);
                    }
                    errors++;
                  }
                }
                var valid4 = _errs20 === errors;
              } else {
                var valid4 = true;
              }
              if (valid4) {
                if (data.op !== void 0) {
                  let data6 = data.op;
                  const _errs22 = errors;
                  if (typeof data6 !== "string") {
                    const err18 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err18];
                    } else {
                      vErrors.push(err18);
                    }
                    errors++;
                  }
                  if ("jobs.read" !== data6) {
                    const err19 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "jobs.read" }, message: "must be equal to constant" };
                    if (vErrors === null) {
                      vErrors = [err19];
                    } else {
                      vErrors.push(err19);
                    }
                    errors++;
                  }
                  var valid4 = _errs22 === errors;
                } else {
                  var valid4 = true;
                }
                if (valid4) {
                  if (data.job_id !== void 0) {
                    let data7 = data.job_id;
                    const _errs24 = errors;
                    if (errors === _errs24) {
                      if (typeof data7 === "string") {
                        if (!pattern8.test(data7)) {
                          const err20 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobReadCommand/properties/job_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                          if (vErrors === null) {
                            vErrors = [err20];
                          } else {
                            vErrors.push(err20);
                          }
                          errors++;
                        }
                      } else {
                        const err21 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobReadCommand/properties/job_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err21];
                        } else {
                          vErrors.push(err21);
                        }
                        errors++;
                      }
                    }
                    var valid4 = _errs24 === errors;
                  } else {
                    var valid4 = true;
                  }
                }
              }
            }
          }
        }
      } else {
        const err22 = { instancePath, schemaPath: "#/$defs/JobReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    var _valid0 = _errs14 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = true;
        }
      }
      const _errs26 = errors;
      const _errs27 = errors;
      if (errors === _errs27) {
        if (data && typeof data == "object" && !Array.isArray(data)) {
          let missing2;
          if (data.notebook_id === void 0 && (missing2 = "notebook_id") || data.snapshot_id === void 0 && (missing2 = "snapshot_id") || data.op === void 0 && (missing2 = "op") || data.job_id === void 0 && (missing2 = "job_id")) {
            const err23 = { instancePath, schemaPath: "#/$defs/JobAccessCommand/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          } else {
            const _errs29 = errors;
            for (const key2 in data) {
              if (!(key2 === "notebook_id" || key2 === "snapshot_id" || key2 === "op" || key2 === "job_id" || key2 === "offset")) {
                const err24 = { instancePath, schemaPath: "#/$defs/JobAccessCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
                break;
              }
            }
            if (_errs29 === errors) {
              if (data.notebook_id !== void 0) {
                let data8 = data.notebook_id;
                const _errs30 = errors;
                if (errors === _errs30) {
                  if (typeof data8 === "string") {
                    if (!pattern4.test(data8)) {
                      const err25 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobAccessCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                      if (vErrors === null) {
                        vErrors = [err25];
                      } else {
                        vErrors.push(err25);
                      }
                      errors++;
                    }
                  } else {
                    const err26 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobAccessCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err26];
                    } else {
                      vErrors.push(err26);
                    }
                    errors++;
                  }
                }
                var valid6 = _errs30 === errors;
              } else {
                var valid6 = true;
              }
              if (valid6) {
                if (data.snapshot_id !== void 0) {
                  let data9 = data.snapshot_id;
                  const _errs32 = errors;
                  if (errors === _errs32) {
                    if (typeof data9 === "string") {
                      if (!pattern5.test(data9)) {
                        const err27 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobAccessCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                        if (vErrors === null) {
                          vErrors = [err27];
                        } else {
                          vErrors.push(err27);
                        }
                        errors++;
                      }
                    } else {
                      const err28 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobAccessCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err28];
                      } else {
                        vErrors.push(err28);
                      }
                      errors++;
                    }
                  }
                  var valid6 = _errs32 === errors;
                } else {
                  var valid6 = true;
                }
                if (valid6) {
                  if (data.op !== void 0) {
                    let data10 = data.op;
                    const _errs34 = errors;
                    if (typeof data10 !== "string") {
                      const err29 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobAccessCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err29];
                      } else {
                        vErrors.push(err29);
                      }
                      errors++;
                    }
                    if ("jobs.access" !== data10) {
                      const err30 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobAccessCommand/properties/op/const", keyword: "const", params: { allowedValue: "jobs.access" }, message: "must be equal to constant" };
                      if (vErrors === null) {
                        vErrors = [err30];
                      } else {
                        vErrors.push(err30);
                      }
                      errors++;
                    }
                    var valid6 = _errs34 === errors;
                  } else {
                    var valid6 = true;
                  }
                  if (valid6) {
                    if (data.job_id !== void 0) {
                      let data11 = data.job_id;
                      const _errs36 = errors;
                      if (errors === _errs36) {
                        if (typeof data11 === "string") {
                          if (!pattern8.test(data11)) {
                            const err31 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobAccessCommand/properties/job_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                            if (vErrors === null) {
                              vErrors = [err31];
                            } else {
                              vErrors.push(err31);
                            }
                            errors++;
                          }
                        } else {
                          const err32 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobAccessCommand/properties/job_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err32];
                          } else {
                            vErrors.push(err32);
                          }
                          errors++;
                        }
                      }
                      var valid6 = _errs36 === errors;
                    } else {
                      var valid6 = true;
                    }
                    if (valid6) {
                      if (data.offset !== void 0) {
                        let data12 = data.offset;
                        const _errs38 = errors;
                        if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12)) && isFinite(data12))) {
                          const err33 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobAccessCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                          if (vErrors === null) {
                            vErrors = [err33];
                          } else {
                            vErrors.push(err33);
                          }
                          errors++;
                        }
                        if (errors === _errs38) {
                          if (typeof data12 == "number" && isFinite(data12)) {
                            if (data12 > 1e6 || isNaN(data12)) {
                              const err34 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobAccessCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                              if (vErrors === null) {
                                vErrors = [err34];
                              } else {
                                vErrors.push(err34);
                              }
                              errors++;
                            } else {
                              if (data12 < 0 || isNaN(data12)) {
                                const err35 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobAccessCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                if (vErrors === null) {
                                  vErrors = [err35];
                                } else {
                                  vErrors.push(err35);
                                }
                                errors++;
                              }
                            }
                          }
                        }
                        var valid6 = _errs38 === errors;
                      } else {
                        var valid6 = true;
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          const err36 = { instancePath, schemaPath: "#/$defs/JobAccessCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
      }
      var _valid0 = _errs26 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = true;
          }
        }
        const _errs40 = errors;
        const _errs41 = errors;
        if (errors === _errs41) {
          if (data && typeof data == "object" && !Array.isArray(data)) {
            let missing3;
            if (data.notebook_id === void 0 && (missing3 = "notebook_id") || data.snapshot_id === void 0 && (missing3 = "snapshot_id") || data.op === void 0 && (missing3 = "op") || data.job_id === void 0 && (missing3 = "job_id") || data.offset === void 0 && (missing3 = "offset")) {
              const err37 = { instancePath, schemaPath: "#/$defs/JobUnitsCommand/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" };
              if (vErrors === null) {
                vErrors = [err37];
              } else {
                vErrors.push(err37);
              }
              errors++;
            } else {
              const _errs43 = errors;
              for (const key3 in data) {
                if (!(key3 === "notebook_id" || key3 === "snapshot_id" || key3 === "op" || key3 === "job_id" || key3 === "offset")) {
                  const err38 = { instancePath, schemaPath: "#/$defs/JobUnitsCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                  if (vErrors === null) {
                    vErrors = [err38];
                  } else {
                    vErrors.push(err38);
                  }
                  errors++;
                  break;
                }
              }
              if (_errs43 === errors) {
                if (data.notebook_id !== void 0) {
                  let data13 = data.notebook_id;
                  const _errs44 = errors;
                  if (errors === _errs44) {
                    if (typeof data13 === "string") {
                      if (!pattern4.test(data13)) {
                        const err39 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobUnitsCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                        if (vErrors === null) {
                          vErrors = [err39];
                        } else {
                          vErrors.push(err39);
                        }
                        errors++;
                      }
                    } else {
                      const err40 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobUnitsCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err40];
                      } else {
                        vErrors.push(err40);
                      }
                      errors++;
                    }
                  }
                  var valid8 = _errs44 === errors;
                } else {
                  var valid8 = true;
                }
                if (valid8) {
                  if (data.snapshot_id !== void 0) {
                    let data14 = data.snapshot_id;
                    const _errs46 = errors;
                    if (errors === _errs46) {
                      if (typeof data14 === "string") {
                        if (!pattern5.test(data14)) {
                          const err41 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobUnitsCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                          if (vErrors === null) {
                            vErrors = [err41];
                          } else {
                            vErrors.push(err41);
                          }
                          errors++;
                        }
                      } else {
                        const err42 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobUnitsCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err42];
                        } else {
                          vErrors.push(err42);
                        }
                        errors++;
                      }
                    }
                    var valid8 = _errs46 === errors;
                  } else {
                    var valid8 = true;
                  }
                  if (valid8) {
                    if (data.op !== void 0) {
                      let data15 = data.op;
                      const _errs48 = errors;
                      if (typeof data15 !== "string") {
                        const err43 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobUnitsCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err43];
                        } else {
                          vErrors.push(err43);
                        }
                        errors++;
                      }
                      if ("jobs.units" !== data15) {
                        const err44 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobUnitsCommand/properties/op/const", keyword: "const", params: { allowedValue: "jobs.units" }, message: "must be equal to constant" };
                        if (vErrors === null) {
                          vErrors = [err44];
                        } else {
                          vErrors.push(err44);
                        }
                        errors++;
                      }
                      var valid8 = _errs48 === errors;
                    } else {
                      var valid8 = true;
                    }
                    if (valid8) {
                      if (data.job_id !== void 0) {
                        let data16 = data.job_id;
                        const _errs50 = errors;
                        if (errors === _errs50) {
                          if (typeof data16 === "string") {
                            if (!pattern8.test(data16)) {
                              const err45 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobUnitsCommand/properties/job_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                              if (vErrors === null) {
                                vErrors = [err45];
                              } else {
                                vErrors.push(err45);
                              }
                              errors++;
                            }
                          } else {
                            const err46 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobUnitsCommand/properties/job_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err46];
                            } else {
                              vErrors.push(err46);
                            }
                            errors++;
                          }
                        }
                        var valid8 = _errs50 === errors;
                      } else {
                        var valid8 = true;
                      }
                      if (valid8) {
                        if (data.offset !== void 0) {
                          let data17 = data.offset;
                          const _errs52 = errors;
                          if (!(typeof data17 == "number" && (!(data17 % 1) && !isNaN(data17)) && isFinite(data17))) {
                            const err47 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobUnitsCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                            if (vErrors === null) {
                              vErrors = [err47];
                            } else {
                              vErrors.push(err47);
                            }
                            errors++;
                          }
                          if (errors === _errs52) {
                            if (typeof data17 == "number" && isFinite(data17)) {
                              if (data17 > 1e6 || isNaN(data17)) {
                                const err48 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobUnitsCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                if (vErrors === null) {
                                  vErrors = [err48];
                                } else {
                                  vErrors.push(err48);
                                }
                                errors++;
                              } else {
                                if (data17 < 0 || isNaN(data17)) {
                                  const err49 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/JobUnitsCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                  if (vErrors === null) {
                                    vErrors = [err49];
                                  } else {
                                    vErrors.push(err49);
                                  }
                                  errors++;
                                }
                              }
                            }
                          }
                          var valid8 = _errs52 === errors;
                        } else {
                          var valid8 = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          } else {
            const err50 = { instancePath, schemaPath: "#/$defs/JobUnitsCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err50];
            } else {
              vErrors.push(err50);
            }
            errors++;
          }
        }
        var _valid0 = _errs40 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
            if (props0 !== true) {
              props0 = true;
            }
          }
          const _errs54 = errors;
          const _errs55 = errors;
          if (errors === _errs55) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing4;
              if (data.notebook_id === void 0 && (missing4 = "notebook_id") || data.snapshot_id === void 0 && (missing4 = "snapshot_id") || data.op === void 0 && (missing4 = "op") || data.job_id === void 0 && (missing4 = "job_id") || data.unit_id === void 0 && (missing4 = "unit_id") || data.batch_index === void 0 && (missing4 = "batch_index")) {
                const err51 = { instancePath, schemaPath: "#/$defs/JobPreviewCommand/required", keyword: "required", params: { missingProperty: missing4 }, message: "must have required property '" + missing4 + "'" };
                if (vErrors === null) {
                  vErrors = [err51];
                } else {
                  vErrors.push(err51);
                }
                errors++;
              } else {
                const _errs57 = errors;
                for (const key4 in data) {
                  if (!(key4 === "notebook_id" || key4 === "snapshot_id" || key4 === "op" || key4 === "job_id" || key4 === "unit_id" || key4 === "batch_index")) {
                    const err52 = { instancePath, schemaPath: "#/$defs/JobPreviewCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err52];
                    } else {
                      vErrors.push(err52);
                    }
                    errors++;
                    break;
                  }
                }
                if (_errs57 === errors) {
                  if (data.notebook_id !== void 0) {
                    let data18 = data.notebook_id;
                    const _errs58 = errors;
                    if (errors === _errs58) {
                      if (typeof data18 === "string") {
                        if (!pattern4.test(data18)) {
                          const err53 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobPreviewCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                          if (vErrors === null) {
                            vErrors = [err53];
                          } else {
                            vErrors.push(err53);
                          }
                          errors++;
                        }
                      } else {
                        const err54 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobPreviewCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err54];
                        } else {
                          vErrors.push(err54);
                        }
                        errors++;
                      }
                    }
                    var valid10 = _errs58 === errors;
                  } else {
                    var valid10 = true;
                  }
                  if (valid10) {
                    if (data.snapshot_id !== void 0) {
                      let data19 = data.snapshot_id;
                      const _errs60 = errors;
                      if (errors === _errs60) {
                        if (typeof data19 === "string") {
                          if (!pattern5.test(data19)) {
                            const err55 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobPreviewCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                            if (vErrors === null) {
                              vErrors = [err55];
                            } else {
                              vErrors.push(err55);
                            }
                            errors++;
                          }
                        } else {
                          const err56 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobPreviewCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err56];
                          } else {
                            vErrors.push(err56);
                          }
                          errors++;
                        }
                      }
                      var valid10 = _errs60 === errors;
                    } else {
                      var valid10 = true;
                    }
                    if (valid10) {
                      if (data.op !== void 0) {
                        let data20 = data.op;
                        const _errs62 = errors;
                        if (typeof data20 !== "string") {
                          const err57 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobPreviewCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err57];
                          } else {
                            vErrors.push(err57);
                          }
                          errors++;
                        }
                        if ("jobs.preview" !== data20) {
                          const err58 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobPreviewCommand/properties/op/const", keyword: "const", params: { allowedValue: "jobs.preview" }, message: "must be equal to constant" };
                          if (vErrors === null) {
                            vErrors = [err58];
                          } else {
                            vErrors.push(err58);
                          }
                          errors++;
                        }
                        var valid10 = _errs62 === errors;
                      } else {
                        var valid10 = true;
                      }
                      if (valid10) {
                        if (data.job_id !== void 0) {
                          let data21 = data.job_id;
                          const _errs64 = errors;
                          if (errors === _errs64) {
                            if (typeof data21 === "string") {
                              if (!pattern8.test(data21)) {
                                const err59 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobPreviewCommand/properties/job_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                if (vErrors === null) {
                                  vErrors = [err59];
                                } else {
                                  vErrors.push(err59);
                                }
                                errors++;
                              }
                            } else {
                              const err60 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/JobPreviewCommand/properties/job_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err60];
                              } else {
                                vErrors.push(err60);
                              }
                              errors++;
                            }
                          }
                          var valid10 = _errs64 === errors;
                        } else {
                          var valid10 = true;
                        }
                        if (valid10) {
                          if (data.unit_id !== void 0) {
                            let data22 = data.unit_id;
                            const _errs66 = errors;
                            if (errors === _errs66) {
                              if (typeof data22 === "string") {
                                if (!pattern8.test(data22)) {
                                  const err61 = { instancePath: instancePath + "/unit_id", schemaPath: "#/$defs/JobPreviewCommand/properties/unit_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err61];
                                  } else {
                                    vErrors.push(err61);
                                  }
                                  errors++;
                                }
                              } else {
                                const err62 = { instancePath: instancePath + "/unit_id", schemaPath: "#/$defs/JobPreviewCommand/properties/unit_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err62];
                                } else {
                                  vErrors.push(err62);
                                }
                                errors++;
                              }
                            }
                            var valid10 = _errs66 === errors;
                          } else {
                            var valid10 = true;
                          }
                          if (valid10) {
                            if (data.batch_index !== void 0) {
                              let data23 = data.batch_index;
                              const _errs68 = errors;
                              if (!(typeof data23 == "number" && (!(data23 % 1) && !isNaN(data23)) && isFinite(data23))) {
                                const err63 = { instancePath: instancePath + "/batch_index", schemaPath: "#/$defs/JobPreviewCommand/properties/batch_index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                if (vErrors === null) {
                                  vErrors = [err63];
                                } else {
                                  vErrors.push(err63);
                                }
                                errors++;
                              }
                              if (errors === _errs68) {
                                if (typeof data23 == "number" && isFinite(data23)) {
                                  if (data23 > 1e4 || isNaN(data23)) {
                                    const err64 = { instancePath: instancePath + "/batch_index", schemaPath: "#/$defs/JobPreviewCommand/properties/batch_index/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e4 }, message: "must be <= 10000" };
                                    if (vErrors === null) {
                                      vErrors = [err64];
                                    } else {
                                      vErrors.push(err64);
                                    }
                                    errors++;
                                  } else {
                                    if (data23 < 0 || isNaN(data23)) {
                                      const err65 = { instancePath: instancePath + "/batch_index", schemaPath: "#/$defs/JobPreviewCommand/properties/batch_index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                      if (vErrors === null) {
                                        vErrors = [err65];
                                      } else {
                                        vErrors.push(err65);
                                      }
                                      errors++;
                                    }
                                  }
                                }
                              }
                              var valid10 = _errs68 === errors;
                            } else {
                              var valid10 = true;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              const err66 = { instancePath, schemaPath: "#/$defs/JobPreviewCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
              if (vErrors === null) {
                vErrors = [err66];
              } else {
                vErrors.push(err66);
              }
              errors++;
            }
          }
          var _valid0 = _errs54 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
              if (props0 !== true) {
                props0 = true;
              }
            }
            const _errs70 = errors;
            if (!validate25(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs70 === errors;
            if (_valid0 && valid0) {
              valid0 = false;
              passing0 = [passing0, 6];
            } else {
              if (_valid0) {
                valid0 = true;
                passing0 = 6;
                if (props0 !== true) {
                  props0 = true;
                }
              }
              const _errs71 = errors;
              const _errs72 = errors;
              if (errors === _errs72) {
                if (data && typeof data == "object" && !Array.isArray(data)) {
                  let missing5;
                  if (data.notebook_id === void 0 && (missing5 = "notebook_id") || data.snapshot_id === void 0 && (missing5 = "snapshot_id") || data.op === void 0 && (missing5 = "op")) {
                    const err67 = { instancePath, schemaPath: "#/$defs/JobCacheCommand/required", keyword: "required", params: { missingProperty: missing5 }, message: "must have required property '" + missing5 + "'" };
                    if (vErrors === null) {
                      vErrors = [err67];
                    } else {
                      vErrors.push(err67);
                    }
                    errors++;
                  } else {
                    const _errs74 = errors;
                    for (const key5 in data) {
                      if (!(key5 === "notebook_id" || key5 === "snapshot_id" || key5 === "op")) {
                        const err68 = { instancePath, schemaPath: "#/$defs/JobCacheCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                        if (vErrors === null) {
                          vErrors = [err68];
                        } else {
                          vErrors.push(err68);
                        }
                        errors++;
                        break;
                      }
                    }
                    if (_errs74 === errors) {
                      if (data.notebook_id !== void 0) {
                        let data24 = data.notebook_id;
                        const _errs75 = errors;
                        if (errors === _errs75) {
                          if (typeof data24 === "string") {
                            if (!pattern4.test(data24)) {
                              const err69 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobCacheCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                              if (vErrors === null) {
                                vErrors = [err69];
                              } else {
                                vErrors.push(err69);
                              }
                              errors++;
                            }
                          } else {
                            const err70 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/JobCacheCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err70];
                            } else {
                              vErrors.push(err70);
                            }
                            errors++;
                          }
                        }
                        var valid12 = _errs75 === errors;
                      } else {
                        var valid12 = true;
                      }
                      if (valid12) {
                        if (data.snapshot_id !== void 0) {
                          let data25 = data.snapshot_id;
                          const _errs77 = errors;
                          if (errors === _errs77) {
                            if (typeof data25 === "string") {
                              if (!pattern5.test(data25)) {
                                const err71 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobCacheCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                if (vErrors === null) {
                                  vErrors = [err71];
                                } else {
                                  vErrors.push(err71);
                                }
                                errors++;
                              }
                            } else {
                              const err72 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/JobCacheCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err72];
                              } else {
                                vErrors.push(err72);
                              }
                              errors++;
                            }
                          }
                          var valid12 = _errs77 === errors;
                        } else {
                          var valid12 = true;
                        }
                        if (valid12) {
                          if (data.op !== void 0) {
                            let data26 = data.op;
                            const _errs79 = errors;
                            if (typeof data26 !== "string") {
                              const err73 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobCacheCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err73];
                              } else {
                                vErrors.push(err73);
                              }
                              errors++;
                            }
                            if ("jobs.cache.clear" !== data26) {
                              const err74 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/JobCacheCommand/properties/op/const", keyword: "const", params: { allowedValue: "jobs.cache.clear" }, message: "must be equal to constant" };
                              if (vErrors === null) {
                                vErrors = [err74];
                              } else {
                                vErrors.push(err74);
                              }
                              errors++;
                            }
                            var valid12 = _errs79 === errors;
                          } else {
                            var valid12 = true;
                          }
                        }
                      }
                    }
                  }
                } else {
                  const err75 = { instancePath, schemaPath: "#/$defs/JobCacheCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                  if (vErrors === null) {
                    vErrors = [err75];
                  } else {
                    vErrors.push(err75);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs71 === errors;
              if (_valid0 && valid0) {
                valid0 = false;
                passing0 = [passing0, 7];
              } else {
                if (_valid0) {
                  valid0 = true;
                  passing0 = 7;
                  if (props0 !== true) {
                    props0 = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err76 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err76];
    } else {
      vErrors.push(err76);
    }
    errors++;
    validate20.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate20.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate20.evaluated = { "dynamicProps": true, "dynamicItems": false };
export {
  validate_job_command_generated_default as default,
  validate
};
