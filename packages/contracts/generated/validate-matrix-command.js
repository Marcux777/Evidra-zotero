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

// validate-matrix-command.generated.js
var validate = validate20;
var validate_matrix_command_generated_default = validate20;
var pattern4 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern5 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
var schema36 = { "additionalProperties": false, "properties": { "key": { "pattern": "^[a-z][a-z0-9_]{0,63}$", "title": "Key", "type": "string" }, "label": { "maxLength": 200, "minLength": 1, "pattern": "\\S", "title": "Label", "type": "string" }, "kind": { "enum": ["text", "number", "boolean", "enum", "list", "experimental_result"], "title": "Kind", "type": "string" }, "question": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Question", "type": "string" }, "definition": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Definition", "type": "string" }, "unit": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "null" }], "default": null, "title": "Unit" }, "rules": { "items": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, "maxItems": 10, "title": "Rules", "type": "array" }, "required": { "default": false, "title": "Required", "type": "boolean" }, "options": { "items": { "maxLength": 200, "minLength": 1, "pattern": "\\S", "type": "string" }, "maxItems": 50, "title": "Options", "type": "array" } }, "required": ["key", "label", "kind", "question", "definition"], "title": "FieldDefinition", "type": "object" };
var func1 = require_ucs2length().default;
var func5 = Object.prototype.hasOwnProperty;
var pattern10 = new RegExp("\\S", "u");
var pattern11 = new RegExp("^[a-z][a-z0-9_]{0,63}$", "u");
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
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.name === void 0 && (missing0 = "name") || data.expected_revision === void 0 && (missing0 = "expected_revision") || data.fields === void 0 && (missing0 = "fields")) {
        validate22.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "idempotency_key" || key0 === "name" || key0 === "expected_revision" || key0 === "fields")) {
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
                if (func1(data0) > 200) {
                  validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
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
            if (data.name !== void 0) {
              let data1 = data.name;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 200) {
                    validate22.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 1) {
                      validate22.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    } else {
                      if (!pattern10.test(data1)) {
                        validate22.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate22.errors = [{ instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.expected_revision !== void 0) {
                let data2 = data.expected_revision;
                const _errs6 = errors;
                if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                  validate22.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 == "number" && isFinite(data2)) {
                    if (data2 < 0 || isNaN(data2)) {
                      validate22.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.fields !== void 0) {
                  let data3 = data.fields;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (Array.isArray(data3)) {
                      if (data3.length > 30) {
                        validate22.errors = [{ instancePath: instancePath + "/fields", schemaPath: "#/properties/fields/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                        return false;
                      } else {
                        if (data3.length < 1) {
                          validate22.errors = [{ instancePath: instancePath + "/fields", schemaPath: "#/properties/fields/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                          return false;
                        } else {
                          var valid1 = true;
                          const len0 = data3.length;
                          for (let i0 = 0; i0 < len0; i0++) {
                            let data4 = data3[i0];
                            const _errs10 = errors;
                            const _errs11 = errors;
                            if (errors === _errs11) {
                              if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
                                let missing1;
                                if (data4.key === void 0 && (missing1 = "key") || data4.label === void 0 && (missing1 = "label") || data4.kind === void 0 && (missing1 = "kind") || data4.question === void 0 && (missing1 = "question") || data4.definition === void 0 && (missing1 = "definition")) {
                                  validate22.errors = [{ instancePath: instancePath + "/fields/" + i0, schemaPath: "#/$defs/FieldDefinition/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                                  return false;
                                } else {
                                  const _errs13 = errors;
                                  for (const key1 in data4) {
                                    if (!func5.call(schema36.properties, key1)) {
                                      validate22.errors = [{ instancePath: instancePath + "/fields/" + i0, schemaPath: "#/$defs/FieldDefinition/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                                      return false;
                                      break;
                                    }
                                  }
                                  if (_errs13 === errors) {
                                    if (data4.key !== void 0) {
                                      let data5 = data4.key;
                                      const _errs14 = errors;
                                      if (errors === _errs14) {
                                        if (typeof data5 === "string") {
                                          if (!pattern11.test(data5)) {
                                            validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/key", schemaPath: "#/$defs/FieldDefinition/properties/key/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' }];
                                            return false;
                                          }
                                        } else {
                                          validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/key", schemaPath: "#/$defs/FieldDefinition/properties/key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                          return false;
                                        }
                                      }
                                      var valid3 = _errs14 === errors;
                                    } else {
                                      var valid3 = true;
                                    }
                                    if (valid3) {
                                      if (data4.label !== void 0) {
                                        let data6 = data4.label;
                                        const _errs16 = errors;
                                        if (errors === _errs16) {
                                          if (typeof data6 === "string") {
                                            if (func1(data6) > 200) {
                                              validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/label", schemaPath: "#/$defs/FieldDefinition/properties/label/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                              return false;
                                            } else {
                                              if (func1(data6) < 1) {
                                                validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/label", schemaPath: "#/$defs/FieldDefinition/properties/label/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                return false;
                                              } else {
                                                if (!pattern10.test(data6)) {
                                                  validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/label", schemaPath: "#/$defs/FieldDefinition/properties/label/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                  return false;
                                                }
                                              }
                                            }
                                          } else {
                                            validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/label", schemaPath: "#/$defs/FieldDefinition/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                            return false;
                                          }
                                        }
                                        var valid3 = _errs16 === errors;
                                      } else {
                                        var valid3 = true;
                                      }
                                      if (valid3) {
                                        if (data4.kind !== void 0) {
                                          let data7 = data4.kind;
                                          const _errs18 = errors;
                                          if (typeof data7 !== "string") {
                                            validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/kind", schemaPath: "#/$defs/FieldDefinition/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                            return false;
                                          }
                                          if (!(data7 === "text" || data7 === "number" || data7 === "boolean" || data7 === "enum" || data7 === "list" || data7 === "experimental_result")) {
                                            validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/kind", schemaPath: "#/$defs/FieldDefinition/properties/kind/enum", keyword: "enum", params: { allowedValues: schema36.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                                            return false;
                                          }
                                          var valid3 = _errs18 === errors;
                                        } else {
                                          var valid3 = true;
                                        }
                                        if (valid3) {
                                          if (data4.question !== void 0) {
                                            let data8 = data4.question;
                                            const _errs20 = errors;
                                            if (errors === _errs20) {
                                              if (typeof data8 === "string") {
                                                if (func1(data8) > 2e3) {
                                                  validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/question", schemaPath: "#/$defs/FieldDefinition/properties/question/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                  return false;
                                                } else {
                                                  if (func1(data8) < 1) {
                                                    validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/question", schemaPath: "#/$defs/FieldDefinition/properties/question/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                    return false;
                                                  } else {
                                                    if (!pattern10.test(data8)) {
                                                      validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/question", schemaPath: "#/$defs/FieldDefinition/properties/question/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                      return false;
                                                    }
                                                  }
                                                }
                                              } else {
                                                validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/question", schemaPath: "#/$defs/FieldDefinition/properties/question/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                            }
                                            var valid3 = _errs20 === errors;
                                          } else {
                                            var valid3 = true;
                                          }
                                          if (valid3) {
                                            if (data4.definition !== void 0) {
                                              let data9 = data4.definition;
                                              const _errs22 = errors;
                                              if (errors === _errs22) {
                                                if (typeof data9 === "string") {
                                                  if (func1(data9) > 2e3) {
                                                    validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/definition", schemaPath: "#/$defs/FieldDefinition/properties/definition/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                    return false;
                                                  } else {
                                                    if (func1(data9) < 1) {
                                                      validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/definition", schemaPath: "#/$defs/FieldDefinition/properties/definition/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                      return false;
                                                    } else {
                                                      if (!pattern10.test(data9)) {
                                                        validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/definition", schemaPath: "#/$defs/FieldDefinition/properties/definition/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                        return false;
                                                      }
                                                    }
                                                  }
                                                } else {
                                                  validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/definition", schemaPath: "#/$defs/FieldDefinition/properties/definition/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                  return false;
                                                }
                                              }
                                              var valid3 = _errs22 === errors;
                                            } else {
                                              var valid3 = true;
                                            }
                                            if (valid3) {
                                              if (data4.unit !== void 0) {
                                                let data10 = data4.unit;
                                                const _errs24 = errors;
                                                const _errs25 = errors;
                                                let valid4 = false;
                                                const _errs26 = errors;
                                                if (errors === _errs26) {
                                                  if (typeof data10 === "string") {
                                                    if (func1(data10) > 2e3) {
                                                      const err0 = { instancePath: instancePath + "/fields/" + i0 + "/unit", schemaPath: "#/$defs/FieldDefinition/properties/unit/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                                                      if (vErrors === null) {
                                                        vErrors = [err0];
                                                      } else {
                                                        vErrors.push(err0);
                                                      }
                                                      errors++;
                                                    } else {
                                                      if (func1(data10) < 1) {
                                                        const err1 = { instancePath: instancePath + "/fields/" + i0 + "/unit", schemaPath: "#/$defs/FieldDefinition/properties/unit/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                                        if (vErrors === null) {
                                                          vErrors = [err1];
                                                        } else {
                                                          vErrors.push(err1);
                                                        }
                                                        errors++;
                                                      } else {
                                                        if (!pattern10.test(data10)) {
                                                          const err2 = { instancePath: instancePath + "/fields/" + i0 + "/unit", schemaPath: "#/$defs/FieldDefinition/properties/unit/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                                          if (vErrors === null) {
                                                            vErrors = [err2];
                                                          } else {
                                                            vErrors.push(err2);
                                                          }
                                                          errors++;
                                                        }
                                                      }
                                                    }
                                                  } else {
                                                    const err3 = { instancePath: instancePath + "/fields/" + i0 + "/unit", schemaPath: "#/$defs/FieldDefinition/properties/unit/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                                    if (vErrors === null) {
                                                      vErrors = [err3];
                                                    } else {
                                                      vErrors.push(err3);
                                                    }
                                                    errors++;
                                                  }
                                                }
                                                var _valid0 = _errs26 === errors;
                                                valid4 = valid4 || _valid0;
                                                const _errs28 = errors;
                                                if (data10 !== null) {
                                                  const err4 = { instancePath: instancePath + "/fields/" + i0 + "/unit", schemaPath: "#/$defs/FieldDefinition/properties/unit/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                                  if (vErrors === null) {
                                                    vErrors = [err4];
                                                  } else {
                                                    vErrors.push(err4);
                                                  }
                                                  errors++;
                                                }
                                                var _valid0 = _errs28 === errors;
                                                valid4 = valid4 || _valid0;
                                                if (!valid4) {
                                                  const err5 = { instancePath: instancePath + "/fields/" + i0 + "/unit", schemaPath: "#/$defs/FieldDefinition/properties/unit/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                                  if (vErrors === null) {
                                                    vErrors = [err5];
                                                  } else {
                                                    vErrors.push(err5);
                                                  }
                                                  errors++;
                                                  validate22.errors = vErrors;
                                                  return false;
                                                } else {
                                                  errors = _errs25;
                                                  if (vErrors !== null) {
                                                    if (_errs25) {
                                                      vErrors.length = _errs25;
                                                    } else {
                                                      vErrors = null;
                                                    }
                                                  }
                                                }
                                                var valid3 = _errs24 === errors;
                                              } else {
                                                var valid3 = true;
                                              }
                                              if (valid3) {
                                                if (data4.rules !== void 0) {
                                                  let data11 = data4.rules;
                                                  const _errs30 = errors;
                                                  if (errors === _errs30) {
                                                    if (Array.isArray(data11)) {
                                                      if (data11.length > 10) {
                                                        validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/rules", schemaPath: "#/$defs/FieldDefinition/properties/rules/maxItems", keyword: "maxItems", params: { limit: 10 }, message: "must NOT have more than 10 items" }];
                                                        return false;
                                                      } else {
                                                        var valid5 = true;
                                                        const len1 = data11.length;
                                                        for (let i1 = 0; i1 < len1; i1++) {
                                                          let data12 = data11[i1];
                                                          const _errs32 = errors;
                                                          if (errors === _errs32) {
                                                            if (typeof data12 === "string") {
                                                              if (func1(data12) > 2e3) {
                                                                validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/rules/" + i1, schemaPath: "#/$defs/FieldDefinition/properties/rules/items/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                                return false;
                                                              } else {
                                                                if (func1(data12) < 1) {
                                                                  validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/rules/" + i1, schemaPath: "#/$defs/FieldDefinition/properties/rules/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                                  return false;
                                                                } else {
                                                                  if (!pattern10.test(data12)) {
                                                                    validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/rules/" + i1, schemaPath: "#/$defs/FieldDefinition/properties/rules/items/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                                    return false;
                                                                  }
                                                                }
                                                              }
                                                            } else {
                                                              validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/rules/" + i1, schemaPath: "#/$defs/FieldDefinition/properties/rules/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                              return false;
                                                            }
                                                          }
                                                          var valid5 = _errs32 === errors;
                                                          if (!valid5) {
                                                            break;
                                                          }
                                                        }
                                                      }
                                                    } else {
                                                      validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/rules", schemaPath: "#/$defs/FieldDefinition/properties/rules/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                                      return false;
                                                    }
                                                  }
                                                  var valid3 = _errs30 === errors;
                                                } else {
                                                  var valid3 = true;
                                                }
                                                if (valid3) {
                                                  if (data4.required !== void 0) {
                                                    const _errs34 = errors;
                                                    if (typeof data4.required !== "boolean") {
                                                      validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/required", schemaPath: "#/$defs/FieldDefinition/properties/required/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                                      return false;
                                                    }
                                                    var valid3 = _errs34 === errors;
                                                  } else {
                                                    var valid3 = true;
                                                  }
                                                  if (valid3) {
                                                    if (data4.options !== void 0) {
                                                      let data14 = data4.options;
                                                      const _errs36 = errors;
                                                      if (errors === _errs36) {
                                                        if (Array.isArray(data14)) {
                                                          if (data14.length > 50) {
                                                            validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/options", schemaPath: "#/$defs/FieldDefinition/properties/options/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" }];
                                                            return false;
                                                          } else {
                                                            var valid6 = true;
                                                            const len2 = data14.length;
                                                            for (let i2 = 0; i2 < len2; i2++) {
                                                              let data15 = data14[i2];
                                                              const _errs38 = errors;
                                                              if (errors === _errs38) {
                                                                if (typeof data15 === "string") {
                                                                  if (func1(data15) > 200) {
                                                                    validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/options/" + i2, schemaPath: "#/$defs/FieldDefinition/properties/options/items/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                                                    return false;
                                                                  } else {
                                                                    if (func1(data15) < 1) {
                                                                      validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/options/" + i2, schemaPath: "#/$defs/FieldDefinition/properties/options/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                                      return false;
                                                                    } else {
                                                                      if (!pattern10.test(data15)) {
                                                                        validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/options/" + i2, schemaPath: "#/$defs/FieldDefinition/properties/options/items/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                                        return false;
                                                                      }
                                                                    }
                                                                  }
                                                                } else {
                                                                  validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/options/" + i2, schemaPath: "#/$defs/FieldDefinition/properties/options/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                                  return false;
                                                                }
                                                              }
                                                              var valid6 = _errs38 === errors;
                                                              if (!valid6) {
                                                                break;
                                                              }
                                                            }
                                                          }
                                                        } else {
                                                          validate22.errors = [{ instancePath: instancePath + "/fields/" + i0 + "/options", schemaPath: "#/$defs/FieldDefinition/properties/options/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                                          return false;
                                                        }
                                                      }
                                                      var valid3 = _errs36 === errors;
                                                    } else {
                                                      var valid3 = true;
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
                                validate22.errors = [{ instancePath: instancePath + "/fields/" + i0, schemaPath: "#/$defs/FieldDefinition/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                return false;
                              }
                            }
                            var valid1 = _errs10 === errors;
                            if (!valid1) {
                              break;
                            }
                          }
                        }
                      }
                    } else {
                      validate22.errors = [{ instancePath: instancePath + "/fields", schemaPath: "#/properties/fields/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                      return false;
                    }
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
                if ("matrix.form.write" !== data2) {
                  validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "matrix.form.write" }, message: "must be equal to constant" }];
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
var schema38 = { "additionalProperties": false, "properties": { "form_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Form Version Id", "type": "string" }, "offset": { "maximum": 1e6, "minimum": 0, "title": "Offset", "type": "integer" }, "source_id": { "anyOf": [{ "pattern": "^[a-f0-9]{64}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Source Id" }, "review_state": { "anyOf": [{ "enum": ["UNREVIEWED", "APPROVED", "CORRECTED", "REJECTED"], "type": "string" }, { "type": "null" }], "default": null, "title": "Review State" }, "value_state": { "anyOf": [{ "enum": ["FOUND", "NOT_FOUND_IN_SEARCH", "NOT_REPORTED_CANDIDATE", "NOT_APPLICABLE", "UNREADABLE", "CONFLICTING"], "type": "string" }, { "type": "null" }], "default": null, "title": "Value State" } }, "required": ["form_version_id", "offset"], "title": "MatrixQuery", "type": "object" };
var pattern20 = new RegExp("^[a-f0-9]{32}$", "u");
var pattern21 = new RegExp("^[a-f0-9]{64}$", "u");
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.request === void 0 && (missing0 = "request")) {
        validate25.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
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
                if ("matrix.query" !== data2) {
                  validate25.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "matrix.query" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  let data3 = data.request;
                  const _errs8 = errors;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                      let missing1;
                      if (data3.form_version_id === void 0 && (missing1 = "form_version_id") || data3.offset === void 0 && (missing1 = "offset")) {
                        validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/MatrixQuery/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "form_version_id" || key1 === "offset" || key1 === "source_id" || key1 === "review_state" || key1 === "value_state")) {
                            validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/MatrixQuery/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs11 === errors) {
                          if (data3.form_version_id !== void 0) {
                            let data4 = data3.form_version_id;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (!pattern20.test(data4)) {
                                  validate25.errors = [{ instancePath: instancePath + "/request/form_version_id", schemaPath: "#/$defs/MatrixQuery/properties/form_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                  return false;
                                }
                              } else {
                                validate25.errors = [{ instancePath: instancePath + "/request/form_version_id", schemaPath: "#/$defs/MatrixQuery/properties/form_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.offset !== void 0) {
                              let data5 = data3.offset;
                              const _errs14 = errors;
                              if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
                                validate25.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/MatrixQuery/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                return false;
                              }
                              if (errors === _errs14) {
                                if (typeof data5 == "number" && isFinite(data5)) {
                                  if (data5 > 1e6 || isNaN(data5)) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/MatrixQuery/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" }];
                                    return false;
                                  } else {
                                    if (data5 < 0 || isNaN(data5)) {
                                      validate25.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/MatrixQuery/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                      return false;
                                    }
                                  }
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data3.source_id !== void 0) {
                                let data6 = data3.source_id;
                                const _errs16 = errors;
                                const _errs17 = errors;
                                let valid3 = false;
                                const _errs18 = errors;
                                if (errors === _errs18) {
                                  if (typeof data6 === "string") {
                                    if (!pattern21.test(data6)) {
                                      const err0 = { instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/MatrixQuery/properties/source_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                                      if (vErrors === null) {
                                        vErrors = [err0];
                                      } else {
                                        vErrors.push(err0);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err1 = { instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/MatrixQuery/properties/source_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err1];
                                    } else {
                                      vErrors.push(err1);
                                    }
                                    errors++;
                                  }
                                }
                                var _valid0 = _errs18 === errors;
                                valid3 = valid3 || _valid0;
                                const _errs20 = errors;
                                if (data6 !== null) {
                                  const err2 = { instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/MatrixQuery/properties/source_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                  if (vErrors === null) {
                                    vErrors = [err2];
                                  } else {
                                    vErrors.push(err2);
                                  }
                                  errors++;
                                }
                                var _valid0 = _errs20 === errors;
                                valid3 = valid3 || _valid0;
                                if (!valid3) {
                                  const err3 = { instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/MatrixQuery/properties/source_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                  if (vErrors === null) {
                                    vErrors = [err3];
                                  } else {
                                    vErrors.push(err3);
                                  }
                                  errors++;
                                  validate25.errors = vErrors;
                                  return false;
                                } else {
                                  errors = _errs17;
                                  if (vErrors !== null) {
                                    if (_errs17) {
                                      vErrors.length = _errs17;
                                    } else {
                                      vErrors = null;
                                    }
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.review_state !== void 0) {
                                  let data7 = data3.review_state;
                                  const _errs22 = errors;
                                  const _errs23 = errors;
                                  let valid4 = false;
                                  const _errs24 = errors;
                                  if (typeof data7 !== "string") {
                                    const err4 = { instancePath: instancePath + "/request/review_state", schemaPath: "#/$defs/MatrixQuery/properties/review_state/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err4];
                                    } else {
                                      vErrors.push(err4);
                                    }
                                    errors++;
                                  }
                                  if (!(data7 === "UNREVIEWED" || data7 === "APPROVED" || data7 === "CORRECTED" || data7 === "REJECTED")) {
                                    const err5 = { instancePath: instancePath + "/request/review_state", schemaPath: "#/$defs/MatrixQuery/properties/review_state/anyOf/0/enum", keyword: "enum", params: { allowedValues: schema38.properties.review_state.anyOf[0].enum }, message: "must be equal to one of the allowed values" };
                                    if (vErrors === null) {
                                      vErrors = [err5];
                                    } else {
                                      vErrors.push(err5);
                                    }
                                    errors++;
                                  }
                                  var _valid1 = _errs24 === errors;
                                  valid4 = valid4 || _valid1;
                                  const _errs26 = errors;
                                  if (data7 !== null) {
                                    const err6 = { instancePath: instancePath + "/request/review_state", schemaPath: "#/$defs/MatrixQuery/properties/review_state/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                    if (vErrors === null) {
                                      vErrors = [err6];
                                    } else {
                                      vErrors.push(err6);
                                    }
                                    errors++;
                                  }
                                  var _valid1 = _errs26 === errors;
                                  valid4 = valid4 || _valid1;
                                  if (!valid4) {
                                    const err7 = { instancePath: instancePath + "/request/review_state", schemaPath: "#/$defs/MatrixQuery/properties/review_state/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                    if (vErrors === null) {
                                      vErrors = [err7];
                                    } else {
                                      vErrors.push(err7);
                                    }
                                    errors++;
                                    validate25.errors = vErrors;
                                    return false;
                                  } else {
                                    errors = _errs23;
                                    if (vErrors !== null) {
                                      if (_errs23) {
                                        vErrors.length = _errs23;
                                      } else {
                                        vErrors = null;
                                      }
                                    }
                                  }
                                  var valid2 = _errs22 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data3.value_state !== void 0) {
                                    let data8 = data3.value_state;
                                    const _errs28 = errors;
                                    const _errs29 = errors;
                                    let valid5 = false;
                                    const _errs30 = errors;
                                    if (typeof data8 !== "string") {
                                      const err8 = { instancePath: instancePath + "/request/value_state", schemaPath: "#/$defs/MatrixQuery/properties/value_state/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err8];
                                      } else {
                                        vErrors.push(err8);
                                      }
                                      errors++;
                                    }
                                    if (!(data8 === "FOUND" || data8 === "NOT_FOUND_IN_SEARCH" || data8 === "NOT_REPORTED_CANDIDATE" || data8 === "NOT_APPLICABLE" || data8 === "UNREADABLE" || data8 === "CONFLICTING")) {
                                      const err9 = { instancePath: instancePath + "/request/value_state", schemaPath: "#/$defs/MatrixQuery/properties/value_state/anyOf/0/enum", keyword: "enum", params: { allowedValues: schema38.properties.value_state.anyOf[0].enum }, message: "must be equal to one of the allowed values" };
                                      if (vErrors === null) {
                                        vErrors = [err9];
                                      } else {
                                        vErrors.push(err9);
                                      }
                                      errors++;
                                    }
                                    var _valid2 = _errs30 === errors;
                                    valid5 = valid5 || _valid2;
                                    const _errs32 = errors;
                                    if (data8 !== null) {
                                      const err10 = { instancePath: instancePath + "/request/value_state", schemaPath: "#/$defs/MatrixQuery/properties/value_state/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                      if (vErrors === null) {
                                        vErrors = [err10];
                                      } else {
                                        vErrors.push(err10);
                                      }
                                      errors++;
                                    }
                                    var _valid2 = _errs32 === errors;
                                    valid5 = valid5 || _valid2;
                                    if (!valid5) {
                                      const err11 = { instancePath: instancePath + "/request/value_state", schemaPath: "#/$defs/MatrixQuery/properties/value_state/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err11];
                                      } else {
                                        vErrors.push(err11);
                                      }
                                      errors++;
                                      validate25.errors = vErrors;
                                      return false;
                                    } else {
                                      errors = _errs29;
                                      if (vErrors !== null) {
                                        if (_errs29) {
                                          vErrors.length = _errs29;
                                        } else {
                                          vErrors = null;
                                        }
                                      }
                                    }
                                    var valid2 = _errs28 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    } else {
                      validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/MatrixQuery/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                      return false;
                    }
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
      validate25.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate25.errors = vErrors;
  return errors === 0;
}
validate25.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema39 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["matrix.proposals", "matrix.history"], "title": "Op", "type": "string" }, "request": { "$ref": "#/$defs/CellQuery" } }, "required": ["notebook_id", "snapshot_id", "op", "request"], "title": "MatrixHistoryCommand", "type": "object" };
function validate27(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate27.evaluated;
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
        validate27.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate27.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate27.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate27.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate27.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate27.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "matrix.proposals" || data2 === "matrix.history")) {
                  validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/enum", keyword: "enum", params: { allowedValues: schema39.properties.op.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  let data3 = data.request;
                  const _errs8 = errors;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                      let missing1;
                      if (data3.form_version_id === void 0 && (missing1 = "form_version_id") || data3.source_id === void 0 && (missing1 = "source_id") || data3.field_key === void 0 && (missing1 = "field_key") || data3.offset === void 0 && (missing1 = "offset")) {
                        validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/CellQuery/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "form_version_id" || key1 === "source_id" || key1 === "field_key" || key1 === "offset")) {
                            validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/CellQuery/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs11 === errors) {
                          if (data3.form_version_id !== void 0) {
                            let data4 = data3.form_version_id;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (!pattern20.test(data4)) {
                                  validate27.errors = [{ instancePath: instancePath + "/request/form_version_id", schemaPath: "#/$defs/CellQuery/properties/form_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                  return false;
                                }
                              } else {
                                validate27.errors = [{ instancePath: instancePath + "/request/form_version_id", schemaPath: "#/$defs/CellQuery/properties/form_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.source_id !== void 0) {
                              let data5 = data3.source_id;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (!pattern21.test(data5)) {
                                    validate27.errors = [{ instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/CellQuery/properties/source_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate27.errors = [{ instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/CellQuery/properties/source_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data3.field_key !== void 0) {
                                let data6 = data3.field_key;
                                const _errs16 = errors;
                                if (errors === _errs16) {
                                  if (typeof data6 === "string") {
                                    if (!pattern11.test(data6)) {
                                      validate27.errors = [{ instancePath: instancePath + "/request/field_key", schemaPath: "#/$defs/CellQuery/properties/field_key/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' }];
                                      return false;
                                    }
                                  } else {
                                    validate27.errors = [{ instancePath: instancePath + "/request/field_key", schemaPath: "#/$defs/CellQuery/properties/field_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.offset !== void 0) {
                                  let data7 = data3.offset;
                                  const _errs18 = errors;
                                  if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                                    validate27.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/CellQuery/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs18) {
                                    if (typeof data7 == "number" && isFinite(data7)) {
                                      if (data7 > 1e6 || isNaN(data7)) {
                                        validate27.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/CellQuery/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" }];
                                        return false;
                                      } else {
                                        if (data7 < 0 || isNaN(data7)) {
                                          validate27.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/CellQuery/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                          return false;
                                        }
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
                      }
                    } else {
                      validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/CellQuery/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                      return false;
                    }
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
      validate27.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate27.errors = vErrors;
  return errors === 0;
}
validate27.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema42 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "value": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "boolean" }, { "$ref": "#/$defs/NumericValue" }, { "items": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, "maxItems": 50, "minItems": 1, "type": "array" }, { "items": { "$ref": "#/$defs/ExperimentalResult" }, "maxItems": 50, "minItems": 1, "type": "array" }, { "type": "null" }], "title": "Value" }, "value_state": { "enum": ["FOUND", "NOT_FOUND_IN_SEARCH", "NOT_REPORTED_CANDIDATE", "NOT_APPLICABLE", "UNREADABLE", "CONFLICTING"], "title": "Value State", "type": "string" }, "form_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Form Version Id", "type": "string" }, "source_id": { "pattern": "^[a-f0-9]{64}$", "title": "Source Id", "type": "string" }, "field_key": { "pattern": "^[a-z][a-z0-9_]{0,63}$", "title": "Field Key", "type": "string" }, "evidence_ids": { "items": { "pattern": "^[a-f0-9]{64}$", "type": "string" }, "maxItems": 12, "title": "Evidence Ids", "type": "array" }, "run_id": { "anyOf": [{ "pattern": "^[a-f0-9]{32}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Run Id" }, "rationale": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Rationale", "type": "string" } }, "required": ["idempotency_key", "value", "value_state", "form_version_id", "source_id", "field_key", "evidence_ids", "rationale"], "title": "ProposalWrite", "type": "object" };
var schema44 = { "additionalProperties": false, "properties": { "metric": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Metric", "type": "string" }, "number": { "$ref": "#/$defs/NumericValue" }, "dataset": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "null" }], "title": "Dataset" }, "condition": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "null" }], "title": "Condition" }, "unit": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "null" }], "title": "Unit" }, "baseline": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "null" }], "title": "Baseline" }, "direction": { "enum": ["HIGHER_BETTER", "LOWER_BETTER", "UNSPECIFIED"], "title": "Direction", "type": "string" } }, "required": ["metric", "number", "dataset", "condition", "unit", "baseline", "direction"], "title": "ExperimentalResult", "type": "object" };
function validate31(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate31.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.metric === void 0 && (missing0 = "metric") || data.number === void 0 && (missing0 = "number") || data.dataset === void 0 && (missing0 = "dataset") || data.condition === void 0 && (missing0 = "condition") || data.unit === void 0 && (missing0 = "unit") || data.baseline === void 0 && (missing0 = "baseline") || data.direction === void 0 && (missing0 = "direction")) {
        validate31.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "metric" || key0 === "number" || key0 === "dataset" || key0 === "condition" || key0 === "unit" || key0 === "baseline" || key0 === "direction")) {
            validate31.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.metric !== void 0) {
            let data0 = data.metric;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) > 2e3) {
                  validate31.errors = [{ instancePath: instancePath + "/metric", schemaPath: "#/properties/metric/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate31.errors = [{ instancePath: instancePath + "/metric", schemaPath: "#/properties/metric/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  } else {
                    if (!pattern10.test(data0)) {
                      validate31.errors = [{ instancePath: instancePath + "/metric", schemaPath: "#/properties/metric/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                      return false;
                    }
                  }
                }
              } else {
                validate31.errors = [{ instancePath: instancePath + "/metric", schemaPath: "#/properties/metric/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.number !== void 0) {
              let data1 = data.number;
              const _errs4 = errors;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                  let missing1;
                  if (data1.original === void 0 && (missing1 = "original") || data1.normalized === void 0 && (missing1 = "normalized")) {
                    validate31.errors = [{ instancePath: instancePath + "/number", schemaPath: "#/$defs/NumericValue/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                    return false;
                  } else {
                    const _errs7 = errors;
                    for (const key1 in data1) {
                      if (!(key1 === "original" || key1 === "normalized")) {
                        validate31.errors = [{ instancePath: instancePath + "/number", schemaPath: "#/$defs/NumericValue/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                        return false;
                        break;
                      }
                    }
                    if (_errs7 === errors) {
                      if (data1.original !== void 0) {
                        let data2 = data1.original;
                        const _errs8 = errors;
                        if (errors === _errs8) {
                          if (typeof data2 === "string") {
                            if (func1(data2) > 2e3) {
                              validate31.errors = [{ instancePath: instancePath + "/number/original", schemaPath: "#/$defs/NumericValue/properties/original/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                              return false;
                            } else {
                              if (func1(data2) < 1) {
                                validate31.errors = [{ instancePath: instancePath + "/number/original", schemaPath: "#/$defs/NumericValue/properties/original/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                return false;
                              } else {
                                if (!pattern10.test(data2)) {
                                  validate31.errors = [{ instancePath: instancePath + "/number/original", schemaPath: "#/$defs/NumericValue/properties/original/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                  return false;
                                }
                              }
                            }
                          } else {
                            validate31.errors = [{ instancePath: instancePath + "/number/original", schemaPath: "#/$defs/NumericValue/properties/original/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid2 = _errs8 === errors;
                      } else {
                        var valid2 = true;
                      }
                      if (valid2) {
                        if (data1.normalized !== void 0) {
                          let data3 = data1.normalized;
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && isFinite(data3))) {
                            validate31.errors = [{ instancePath: instancePath + "/number/normalized", schemaPath: "#/$defs/NumericValue/properties/normalized/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                            return false;
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                      }
                    }
                  }
                } else {
                  validate31.errors = [{ instancePath: instancePath + "/number", schemaPath: "#/$defs/NumericValue/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.dataset !== void 0) {
                let data4 = data.dataset;
                const _errs12 = errors;
                const _errs13 = errors;
                let valid3 = false;
                const _errs14 = errors;
                if (errors === _errs14) {
                  if (typeof data4 === "string") {
                    if (func1(data4) > 2e3) {
                      const err0 = { instancePath: instancePath + "/dataset", schemaPath: "#/properties/dataset/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                      if (vErrors === null) {
                        vErrors = [err0];
                      } else {
                        vErrors.push(err0);
                      }
                      errors++;
                    } else {
                      if (func1(data4) < 1) {
                        const err1 = { instancePath: instancePath + "/dataset", schemaPath: "#/properties/dataset/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                        if (vErrors === null) {
                          vErrors = [err1];
                        } else {
                          vErrors.push(err1);
                        }
                        errors++;
                      } else {
                        if (!pattern10.test(data4)) {
                          const err2 = { instancePath: instancePath + "/dataset", schemaPath: "#/properties/dataset/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                          if (vErrors === null) {
                            vErrors = [err2];
                          } else {
                            vErrors.push(err2);
                          }
                          errors++;
                        }
                      }
                    }
                  } else {
                    const err3 = { instancePath: instancePath + "/dataset", schemaPath: "#/properties/dataset/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err3];
                    } else {
                      vErrors.push(err3);
                    }
                    errors++;
                  }
                }
                var _valid0 = _errs14 === errors;
                valid3 = valid3 || _valid0;
                const _errs16 = errors;
                if (data4 !== null) {
                  const err4 = { instancePath: instancePath + "/dataset", schemaPath: "#/properties/dataset/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                  if (vErrors === null) {
                    vErrors = [err4];
                  } else {
                    vErrors.push(err4);
                  }
                  errors++;
                }
                var _valid0 = _errs16 === errors;
                valid3 = valid3 || _valid0;
                if (!valid3) {
                  const err5 = { instancePath: instancePath + "/dataset", schemaPath: "#/properties/dataset/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                  if (vErrors === null) {
                    vErrors = [err5];
                  } else {
                    vErrors.push(err5);
                  }
                  errors++;
                  validate31.errors = vErrors;
                  return false;
                } else {
                  errors = _errs13;
                  if (vErrors !== null) {
                    if (_errs13) {
                      vErrors.length = _errs13;
                    } else {
                      vErrors = null;
                    }
                  }
                }
                var valid0 = _errs12 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.condition !== void 0) {
                  let data5 = data.condition;
                  const _errs18 = errors;
                  const _errs19 = errors;
                  let valid4 = false;
                  const _errs20 = errors;
                  if (errors === _errs20) {
                    if (typeof data5 === "string") {
                      if (func1(data5) > 2e3) {
                        const err6 = { instancePath: instancePath + "/condition", schemaPath: "#/properties/condition/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                        if (vErrors === null) {
                          vErrors = [err6];
                        } else {
                          vErrors.push(err6);
                        }
                        errors++;
                      } else {
                        if (func1(data5) < 1) {
                          const err7 = { instancePath: instancePath + "/condition", schemaPath: "#/properties/condition/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                          if (vErrors === null) {
                            vErrors = [err7];
                          } else {
                            vErrors.push(err7);
                          }
                          errors++;
                        } else {
                          if (!pattern10.test(data5)) {
                            const err8 = { instancePath: instancePath + "/condition", schemaPath: "#/properties/condition/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                            if (vErrors === null) {
                              vErrors = [err8];
                            } else {
                              vErrors.push(err8);
                            }
                            errors++;
                          }
                        }
                      }
                    } else {
                      const err9 = { instancePath: instancePath + "/condition", schemaPath: "#/properties/condition/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err9];
                      } else {
                        vErrors.push(err9);
                      }
                      errors++;
                    }
                  }
                  var _valid1 = _errs20 === errors;
                  valid4 = valid4 || _valid1;
                  const _errs22 = errors;
                  if (data5 !== null) {
                    const err10 = { instancePath: instancePath + "/condition", schemaPath: "#/properties/condition/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                    if (vErrors === null) {
                      vErrors = [err10];
                    } else {
                      vErrors.push(err10);
                    }
                    errors++;
                  }
                  var _valid1 = _errs22 === errors;
                  valid4 = valid4 || _valid1;
                  if (!valid4) {
                    const err11 = { instancePath: instancePath + "/condition", schemaPath: "#/properties/condition/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                    if (vErrors === null) {
                      vErrors = [err11];
                    } else {
                      vErrors.push(err11);
                    }
                    errors++;
                    validate31.errors = vErrors;
                    return false;
                  } else {
                    errors = _errs19;
                    if (vErrors !== null) {
                      if (_errs19) {
                        vErrors.length = _errs19;
                      } else {
                        vErrors = null;
                      }
                    }
                  }
                  var valid0 = _errs18 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.unit !== void 0) {
                    let data6 = data.unit;
                    const _errs24 = errors;
                    const _errs25 = errors;
                    let valid5 = false;
                    const _errs26 = errors;
                    if (errors === _errs26) {
                      if (typeof data6 === "string") {
                        if (func1(data6) > 2e3) {
                          const err12 = { instancePath: instancePath + "/unit", schemaPath: "#/properties/unit/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                          if (vErrors === null) {
                            vErrors = [err12];
                          } else {
                            vErrors.push(err12);
                          }
                          errors++;
                        } else {
                          if (func1(data6) < 1) {
                            const err13 = { instancePath: instancePath + "/unit", schemaPath: "#/properties/unit/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                            if (vErrors === null) {
                              vErrors = [err13];
                            } else {
                              vErrors.push(err13);
                            }
                            errors++;
                          } else {
                            if (!pattern10.test(data6)) {
                              const err14 = { instancePath: instancePath + "/unit", schemaPath: "#/properties/unit/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                              if (vErrors === null) {
                                vErrors = [err14];
                              } else {
                                vErrors.push(err14);
                              }
                              errors++;
                            }
                          }
                        }
                      } else {
                        const err15 = { instancePath: instancePath + "/unit", schemaPath: "#/properties/unit/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err15];
                        } else {
                          vErrors.push(err15);
                        }
                        errors++;
                      }
                    }
                    var _valid2 = _errs26 === errors;
                    valid5 = valid5 || _valid2;
                    const _errs28 = errors;
                    if (data6 !== null) {
                      const err16 = { instancePath: instancePath + "/unit", schemaPath: "#/properties/unit/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                      if (vErrors === null) {
                        vErrors = [err16];
                      } else {
                        vErrors.push(err16);
                      }
                      errors++;
                    }
                    var _valid2 = _errs28 === errors;
                    valid5 = valid5 || _valid2;
                    if (!valid5) {
                      const err17 = { instancePath: instancePath + "/unit", schemaPath: "#/properties/unit/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                      validate31.errors = vErrors;
                      return false;
                    } else {
                      errors = _errs25;
                      if (vErrors !== null) {
                        if (_errs25) {
                          vErrors.length = _errs25;
                        } else {
                          vErrors = null;
                        }
                      }
                    }
                    var valid0 = _errs24 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.baseline !== void 0) {
                      let data7 = data.baseline;
                      const _errs30 = errors;
                      const _errs31 = errors;
                      let valid6 = false;
                      const _errs32 = errors;
                      if (errors === _errs32) {
                        if (typeof data7 === "string") {
                          if (func1(data7) > 2e3) {
                            const err18 = { instancePath: instancePath + "/baseline", schemaPath: "#/properties/baseline/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                            if (vErrors === null) {
                              vErrors = [err18];
                            } else {
                              vErrors.push(err18);
                            }
                            errors++;
                          } else {
                            if (func1(data7) < 1) {
                              const err19 = { instancePath: instancePath + "/baseline", schemaPath: "#/properties/baseline/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                              if (vErrors === null) {
                                vErrors = [err19];
                              } else {
                                vErrors.push(err19);
                              }
                              errors++;
                            } else {
                              if (!pattern10.test(data7)) {
                                const err20 = { instancePath: instancePath + "/baseline", schemaPath: "#/properties/baseline/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                if (vErrors === null) {
                                  vErrors = [err20];
                                } else {
                                  vErrors.push(err20);
                                }
                                errors++;
                              }
                            }
                          }
                        } else {
                          const err21 = { instancePath: instancePath + "/baseline", schemaPath: "#/properties/baseline/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err21];
                          } else {
                            vErrors.push(err21);
                          }
                          errors++;
                        }
                      }
                      var _valid3 = _errs32 === errors;
                      valid6 = valid6 || _valid3;
                      const _errs34 = errors;
                      if (data7 !== null) {
                        const err22 = { instancePath: instancePath + "/baseline", schemaPath: "#/properties/baseline/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                        if (vErrors === null) {
                          vErrors = [err22];
                        } else {
                          vErrors.push(err22);
                        }
                        errors++;
                      }
                      var _valid3 = _errs34 === errors;
                      valid6 = valid6 || _valid3;
                      if (!valid6) {
                        const err23 = { instancePath: instancePath + "/baseline", schemaPath: "#/properties/baseline/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                        if (vErrors === null) {
                          vErrors = [err23];
                        } else {
                          vErrors.push(err23);
                        }
                        errors++;
                        validate31.errors = vErrors;
                        return false;
                      } else {
                        errors = _errs31;
                        if (vErrors !== null) {
                          if (_errs31) {
                            vErrors.length = _errs31;
                          } else {
                            vErrors = null;
                          }
                        }
                      }
                      var valid0 = _errs30 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.direction !== void 0) {
                        let data8 = data.direction;
                        const _errs36 = errors;
                        if (typeof data8 !== "string") {
                          validate31.errors = [{ instancePath: instancePath + "/direction", schemaPath: "#/properties/direction/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                        if (!(data8 === "HIGHER_BETTER" || data8 === "LOWER_BETTER" || data8 === "UNSPECIFIED")) {
                          validate31.errors = [{ instancePath: instancePath + "/direction", schemaPath: "#/properties/direction/enum", keyword: "enum", params: { allowedValues: schema44.properties.direction.enum }, message: "must be equal to one of the allowed values" }];
                          return false;
                        }
                        var valid0 = _errs36 === errors;
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
    } else {
      validate31.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate31.errors = vErrors;
  return errors === 0;
}
validate31.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate30(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate30.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.value === void 0 && (missing0 = "value") || data.value_state === void 0 && (missing0 = "value_state") || data.form_version_id === void 0 && (missing0 = "form_version_id") || data.source_id === void 0 && (missing0 = "source_id") || data.field_key === void 0 && (missing0 = "field_key") || data.evidence_ids === void 0 && (missing0 = "evidence_ids") || data.rationale === void 0 && (missing0 = "rationale")) {
        validate30.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func5.call(schema42.properties, key0)) {
            validate30.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                if (func1(data0) > 200) {
                  validate30.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate30.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate30.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.value !== void 0) {
              let data1 = data.value;
              const _errs4 = errors;
              const _errs5 = errors;
              let valid1 = false;
              const _errs6 = errors;
              if (errors === _errs6) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 2e3) {
                    const err0 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                    if (vErrors === null) {
                      vErrors = [err0];
                    } else {
                      vErrors.push(err0);
                    }
                    errors++;
                  } else {
                    if (func1(data1) < 1) {
                      const err1 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                      if (vErrors === null) {
                        vErrors = [err1];
                      } else {
                        vErrors.push(err1);
                      }
                      errors++;
                    } else {
                      if (!pattern10.test(data1)) {
                        const err2 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                        if (vErrors === null) {
                          vErrors = [err2];
                        } else {
                          vErrors.push(err2);
                        }
                        errors++;
                      }
                    }
                  }
                } else {
                  const err3 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err3];
                  } else {
                    vErrors.push(err3);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs6 === errors;
              valid1 = valid1 || _valid0;
              const _errs8 = errors;
              if (typeof data1 !== "boolean") {
                const err4 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/1/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              var _valid0 = _errs8 === errors;
              valid1 = valid1 || _valid0;
              const _errs10 = errors;
              const _errs11 = errors;
              if (errors === _errs11) {
                if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                  let missing1;
                  if (data1.original === void 0 && (missing1 = "original") || data1.normalized === void 0 && (missing1 = "normalized")) {
                    const err5 = { instancePath: instancePath + "/value", schemaPath: "#/$defs/NumericValue/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  } else {
                    const _errs13 = errors;
                    for (const key1 in data1) {
                      if (!(key1 === "original" || key1 === "normalized")) {
                        const err6 = { instancePath: instancePath + "/value", schemaPath: "#/$defs/NumericValue/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                        if (vErrors === null) {
                          vErrors = [err6];
                        } else {
                          vErrors.push(err6);
                        }
                        errors++;
                        break;
                      }
                    }
                    if (_errs13 === errors) {
                      if (data1.original !== void 0) {
                        let data2 = data1.original;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (typeof data2 === "string") {
                            if (func1(data2) > 2e3) {
                              const err7 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                              if (vErrors === null) {
                                vErrors = [err7];
                              } else {
                                vErrors.push(err7);
                              }
                              errors++;
                            } else {
                              if (func1(data2) < 1) {
                                const err8 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                if (vErrors === null) {
                                  vErrors = [err8];
                                } else {
                                  vErrors.push(err8);
                                }
                                errors++;
                              } else {
                                if (!pattern10.test(data2)) {
                                  const err9 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                  if (vErrors === null) {
                                    vErrors = [err9];
                                  } else {
                                    vErrors.push(err9);
                                  }
                                  errors++;
                                }
                              }
                            }
                          } else {
                            const err10 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err10];
                            } else {
                              vErrors.push(err10);
                            }
                            errors++;
                          }
                        }
                        var valid3 = _errs14 === errors;
                      } else {
                        var valid3 = true;
                      }
                      if (valid3) {
                        if (data1.normalized !== void 0) {
                          let data3 = data1.normalized;
                          const _errs16 = errors;
                          if (!(typeof data3 == "number" && isFinite(data3))) {
                            const err11 = { instancePath: instancePath + "/value/normalized", schemaPath: "#/$defs/NumericValue/properties/normalized/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                            if (vErrors === null) {
                              vErrors = [err11];
                            } else {
                              vErrors.push(err11);
                            }
                            errors++;
                          }
                          var valid3 = _errs16 === errors;
                        } else {
                          var valid3 = true;
                        }
                      }
                    }
                  }
                } else {
                  const err12 = { instancePath: instancePath + "/value", schemaPath: "#/$defs/NumericValue/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                  if (vErrors === null) {
                    vErrors = [err12];
                  } else {
                    vErrors.push(err12);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs10 === errors;
              valid1 = valid1 || _valid0;
              const _errs18 = errors;
              if (errors === _errs18) {
                if (Array.isArray(data1)) {
                  if (data1.length > 50) {
                    const err13 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/3/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" };
                    if (vErrors === null) {
                      vErrors = [err13];
                    } else {
                      vErrors.push(err13);
                    }
                    errors++;
                  } else {
                    if (data1.length < 1) {
                      const err14 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/3/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                      if (vErrors === null) {
                        vErrors = [err14];
                      } else {
                        vErrors.push(err14);
                      }
                      errors++;
                    } else {
                      var valid4 = true;
                      const len0 = data1.length;
                      for (let i0 = 0; i0 < len0; i0++) {
                        let data4 = data1[i0];
                        const _errs20 = errors;
                        if (errors === _errs20) {
                          if (typeof data4 === "string") {
                            if (func1(data4) > 2e3) {
                              const err15 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                              if (vErrors === null) {
                                vErrors = [err15];
                              } else {
                                vErrors.push(err15);
                              }
                              errors++;
                            } else {
                              if (func1(data4) < 1) {
                                const err16 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                if (vErrors === null) {
                                  vErrors = [err16];
                                } else {
                                  vErrors.push(err16);
                                }
                                errors++;
                              } else {
                                if (!pattern10.test(data4)) {
                                  const err17 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                  if (vErrors === null) {
                                    vErrors = [err17];
                                  } else {
                                    vErrors.push(err17);
                                  }
                                  errors++;
                                }
                              }
                            }
                          } else {
                            const err18 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err18];
                            } else {
                              vErrors.push(err18);
                            }
                            errors++;
                          }
                        }
                        var valid4 = _errs20 === errors;
                        if (!valid4) {
                          break;
                        }
                      }
                    }
                  }
                } else {
                  const err19 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/3/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs18 === errors;
              valid1 = valid1 || _valid0;
              if (_valid0) {
                var items0 = true;
              }
              const _errs22 = errors;
              if (errors === _errs22) {
                if (Array.isArray(data1)) {
                  if (data1.length > 50) {
                    const err20 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/4/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" };
                    if (vErrors === null) {
                      vErrors = [err20];
                    } else {
                      vErrors.push(err20);
                    }
                    errors++;
                  } else {
                    if (data1.length < 1) {
                      const err21 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/4/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                      if (vErrors === null) {
                        vErrors = [err21];
                      } else {
                        vErrors.push(err21);
                      }
                      errors++;
                    } else {
                      var valid5 = true;
                      const len1 = data1.length;
                      for (let i1 = 0; i1 < len1; i1++) {
                        const _errs24 = errors;
                        if (!validate31(data1[i1], { instancePath: instancePath + "/value/" + i1, parentData: data1, parentDataProperty: i1, rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
                          errors = vErrors.length;
                        }
                        var valid5 = _errs24 === errors;
                        if (!valid5) {
                          break;
                        }
                      }
                    }
                  }
                } else {
                  const err22 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/4/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                  if (vErrors === null) {
                    vErrors = [err22];
                  } else {
                    vErrors.push(err22);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs22 === errors;
              valid1 = valid1 || _valid0;
              if (_valid0) {
                if (items0 !== true) {
                  items0 = true;
                }
              }
              const _errs25 = errors;
              if (data1 !== null) {
                const err23 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/5/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
              var _valid0 = _errs25 === errors;
              valid1 = valid1 || _valid0;
              if (!valid1) {
                const err24 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
                validate30.errors = vErrors;
                return false;
              } else {
                errors = _errs5;
                if (vErrors !== null) {
                  if (_errs5) {
                    vErrors.length = _errs5;
                  } else {
                    vErrors = null;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.value_state !== void 0) {
                let data6 = data.value_state;
                const _errs27 = errors;
                if (typeof data6 !== "string") {
                  validate30.errors = [{ instancePath: instancePath + "/value_state", schemaPath: "#/properties/value_state/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data6 === "FOUND" || data6 === "NOT_FOUND_IN_SEARCH" || data6 === "NOT_REPORTED_CANDIDATE" || data6 === "NOT_APPLICABLE" || data6 === "UNREADABLE" || data6 === "CONFLICTING")) {
                  validate30.errors = [{ instancePath: instancePath + "/value_state", schemaPath: "#/properties/value_state/enum", keyword: "enum", params: { allowedValues: schema42.properties.value_state.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs27 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.form_version_id !== void 0) {
                  let data7 = data.form_version_id;
                  const _errs29 = errors;
                  if (errors === _errs29) {
                    if (typeof data7 === "string") {
                      if (!pattern20.test(data7)) {
                        validate30.errors = [{ instancePath: instancePath + "/form_version_id", schemaPath: "#/properties/form_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate30.errors = [{ instancePath: instancePath + "/form_version_id", schemaPath: "#/properties/form_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs29 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.source_id !== void 0) {
                    let data8 = data.source_id;
                    const _errs31 = errors;
                    if (errors === _errs31) {
                      if (typeof data8 === "string") {
                        if (!pattern21.test(data8)) {
                          validate30.errors = [{ instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                          return false;
                        }
                      } else {
                        validate30.errors = [{ instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                    var valid0 = _errs31 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.field_key !== void 0) {
                      let data9 = data.field_key;
                      const _errs33 = errors;
                      if (errors === _errs33) {
                        if (typeof data9 === "string") {
                          if (!pattern11.test(data9)) {
                            validate30.errors = [{ instancePath: instancePath + "/field_key", schemaPath: "#/properties/field_key/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' }];
                            return false;
                          }
                        } else {
                          validate30.errors = [{ instancePath: instancePath + "/field_key", schemaPath: "#/properties/field_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                      }
                      var valid0 = _errs33 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.evidence_ids !== void 0) {
                        let data10 = data.evidence_ids;
                        const _errs35 = errors;
                        if (errors === _errs35) {
                          if (Array.isArray(data10)) {
                            if (data10.length > 12) {
                              validate30.errors = [{ instancePath: instancePath + "/evidence_ids", schemaPath: "#/properties/evidence_ids/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" }];
                              return false;
                            } else {
                              var valid6 = true;
                              const len2 = data10.length;
                              for (let i2 = 0; i2 < len2; i2++) {
                                let data11 = data10[i2];
                                const _errs37 = errors;
                                if (errors === _errs37) {
                                  if (typeof data11 === "string") {
                                    if (!pattern21.test(data11)) {
                                      validate30.errors = [{ instancePath: instancePath + "/evidence_ids/" + i2, schemaPath: "#/properties/evidence_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                      return false;
                                    }
                                  } else {
                                    validate30.errors = [{ instancePath: instancePath + "/evidence_ids/" + i2, schemaPath: "#/properties/evidence_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid6 = _errs37 === errors;
                                if (!valid6) {
                                  break;
                                }
                              }
                            }
                          } else {
                            validate30.errors = [{ instancePath: instancePath + "/evidence_ids", schemaPath: "#/properties/evidence_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                            return false;
                          }
                        }
                        var valid0 = _errs35 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.run_id !== void 0) {
                          let data12 = data.run_id;
                          const _errs39 = errors;
                          const _errs40 = errors;
                          let valid7 = false;
                          const _errs41 = errors;
                          if (errors === _errs41) {
                            if (typeof data12 === "string") {
                              if (!pattern20.test(data12)) {
                                const err25 = { instancePath: instancePath + "/run_id", schemaPath: "#/properties/run_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                if (vErrors === null) {
                                  vErrors = [err25];
                                } else {
                                  vErrors.push(err25);
                                }
                                errors++;
                              }
                            } else {
                              const err26 = { instancePath: instancePath + "/run_id", schemaPath: "#/properties/run_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err26];
                              } else {
                                vErrors.push(err26);
                              }
                              errors++;
                            }
                          }
                          var _valid1 = _errs41 === errors;
                          valid7 = valid7 || _valid1;
                          const _errs43 = errors;
                          if (data12 !== null) {
                            const err27 = { instancePath: instancePath + "/run_id", schemaPath: "#/properties/run_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                            if (vErrors === null) {
                              vErrors = [err27];
                            } else {
                              vErrors.push(err27);
                            }
                            errors++;
                          }
                          var _valid1 = _errs43 === errors;
                          valid7 = valid7 || _valid1;
                          if (!valid7) {
                            const err28 = { instancePath: instancePath + "/run_id", schemaPath: "#/properties/run_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                            if (vErrors === null) {
                              vErrors = [err28];
                            } else {
                              vErrors.push(err28);
                            }
                            errors++;
                            validate30.errors = vErrors;
                            return false;
                          } else {
                            errors = _errs40;
                            if (vErrors !== null) {
                              if (_errs40) {
                                vErrors.length = _errs40;
                              } else {
                                vErrors = null;
                              }
                            }
                          }
                          var valid0 = _errs39 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.rationale !== void 0) {
                            let data13 = data.rationale;
                            const _errs45 = errors;
                            if (errors === _errs45) {
                              if (typeof data13 === "string") {
                                if (func1(data13) > 2e3) {
                                  validate30.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                  return false;
                                } else {
                                  if (func1(data13) < 1) {
                                    validate30.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  } else {
                                    if (!pattern10.test(data13)) {
                                      validate30.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                      return false;
                                    }
                                  }
                                }
                              } else {
                                validate30.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid0 = _errs45 === errors;
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
    } else {
      validate30.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate30.errors = vErrors;
  return errors === 0;
}
validate30.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate29(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate29.evaluated;
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
        validate29.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate29.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate29.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate29.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate29.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate29.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate29.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("matrix.propose" !== data2) {
                  validate29.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "matrix.propose" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  const _errs8 = errors;
                  if (!validate30(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
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
      validate29.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate29.errors = vErrors;
  return errors === 0;
}
validate29.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema47 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "proposal_id": { "pattern": "^[a-f0-9]{32}$", "title": "Proposal Id", "type": "string" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" }, "action": { "enum": ["APPROVED", "CORRECTED", "REJECTED"], "title": "Action", "type": "string" }, "value": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "boolean" }, { "$ref": "#/$defs/NumericValue" }, { "items": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, "maxItems": 50, "minItems": 1, "type": "array" }, { "items": { "$ref": "#/$defs/ExperimentalResult" }, "maxItems": 50, "minItems": 1, "type": "array" }, { "type": "null" }], "default": null, "title": "Value" }, "value_state": { "anyOf": [{ "enum": ["FOUND", "NOT_FOUND_IN_SEARCH", "NOT_REPORTED_CANDIDATE", "NOT_APPLICABLE", "UNREADABLE", "CONFLICTING"], "type": "string" }, { "type": "null" }], "default": null, "title": "Value State" }, "rationale": { "anyOf": [{ "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "type": "string" }, { "type": "null" }], "default": null, "title": "Rationale" } }, "required": ["idempotency_key", "proposal_id", "expected_revision", "action"], "title": "DecisionWrite", "type": "object" };
function validate36(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate36.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.proposal_id === void 0 && (missing0 = "proposal_id") || data.expected_revision === void 0 && (missing0 = "expected_revision") || data.action === void 0 && (missing0 = "action")) {
        validate36.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "idempotency_key" || key0 === "proposal_id" || key0 === "expected_revision" || key0 === "action" || key0 === "value" || key0 === "value_state" || key0 === "rationale")) {
            validate36.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                if (func1(data0) > 200) {
                  validate36.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate36.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate36.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.proposal_id !== void 0) {
              let data1 = data.proposal_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern20.test(data1)) {
                    validate36.errors = [{ instancePath: instancePath + "/proposal_id", schemaPath: "#/properties/proposal_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                    return false;
                  }
                } else {
                  validate36.errors = [{ instancePath: instancePath + "/proposal_id", schemaPath: "#/properties/proposal_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.expected_revision !== void 0) {
                let data2 = data.expected_revision;
                const _errs6 = errors;
                if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                  validate36.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 == "number" && isFinite(data2)) {
                    if (data2 < 0 || isNaN(data2)) {
                      validate36.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.action !== void 0) {
                  let data3 = data.action;
                  const _errs8 = errors;
                  if (typeof data3 !== "string") {
                    validate36.errors = [{ instancePath: instancePath + "/action", schemaPath: "#/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  if (!(data3 === "APPROVED" || data3 === "CORRECTED" || data3 === "REJECTED")) {
                    validate36.errors = [{ instancePath: instancePath + "/action", schemaPath: "#/properties/action/enum", keyword: "enum", params: { allowedValues: schema47.properties.action.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.value !== void 0) {
                    let data4 = data.value;
                    const _errs10 = errors;
                    const _errs11 = errors;
                    let valid1 = false;
                    const _errs12 = errors;
                    if (errors === _errs12) {
                      if (typeof data4 === "string") {
                        if (func1(data4) > 2e3) {
                          const err0 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                          if (vErrors === null) {
                            vErrors = [err0];
                          } else {
                            vErrors.push(err0);
                          }
                          errors++;
                        } else {
                          if (func1(data4) < 1) {
                            const err1 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                            if (vErrors === null) {
                              vErrors = [err1];
                            } else {
                              vErrors.push(err1);
                            }
                            errors++;
                          } else {
                            if (!pattern10.test(data4)) {
                              const err2 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                              if (vErrors === null) {
                                vErrors = [err2];
                              } else {
                                vErrors.push(err2);
                              }
                              errors++;
                            }
                          }
                        }
                      } else {
                        const err3 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err3];
                        } else {
                          vErrors.push(err3);
                        }
                        errors++;
                      }
                    }
                    var _valid0 = _errs12 === errors;
                    valid1 = valid1 || _valid0;
                    const _errs14 = errors;
                    if (typeof data4 !== "boolean") {
                      const err4 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/1/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                      if (vErrors === null) {
                        vErrors = [err4];
                      } else {
                        vErrors.push(err4);
                      }
                      errors++;
                    }
                    var _valid0 = _errs14 === errors;
                    valid1 = valid1 || _valid0;
                    const _errs16 = errors;
                    const _errs17 = errors;
                    if (errors === _errs17) {
                      if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
                        let missing1;
                        if (data4.original === void 0 && (missing1 = "original") || data4.normalized === void 0 && (missing1 = "normalized")) {
                          const err5 = { instancePath: instancePath + "/value", schemaPath: "#/$defs/NumericValue/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
                          if (vErrors === null) {
                            vErrors = [err5];
                          } else {
                            vErrors.push(err5);
                          }
                          errors++;
                        } else {
                          const _errs19 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "original" || key1 === "normalized")) {
                              const err6 = { instancePath: instancePath + "/value", schemaPath: "#/$defs/NumericValue/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                              if (vErrors === null) {
                                vErrors = [err6];
                              } else {
                                vErrors.push(err6);
                              }
                              errors++;
                              break;
                            }
                          }
                          if (_errs19 === errors) {
                            if (data4.original !== void 0) {
                              let data5 = data4.original;
                              const _errs20 = errors;
                              if (errors === _errs20) {
                                if (typeof data5 === "string") {
                                  if (func1(data5) > 2e3) {
                                    const err7 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                                    if (vErrors === null) {
                                      vErrors = [err7];
                                    } else {
                                      vErrors.push(err7);
                                    }
                                    errors++;
                                  } else {
                                    if (func1(data5) < 1) {
                                      const err8 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                      if (vErrors === null) {
                                        vErrors = [err8];
                                      } else {
                                        vErrors.push(err8);
                                      }
                                      errors++;
                                    } else {
                                      if (!pattern10.test(data5)) {
                                        const err9 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                        if (vErrors === null) {
                                          vErrors = [err9];
                                        } else {
                                          vErrors.push(err9);
                                        }
                                        errors++;
                                      }
                                    }
                                  }
                                } else {
                                  const err10 = { instancePath: instancePath + "/value/original", schemaPath: "#/$defs/NumericValue/properties/original/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err10];
                                  } else {
                                    vErrors.push(err10);
                                  }
                                  errors++;
                                }
                              }
                              var valid3 = _errs20 === errors;
                            } else {
                              var valid3 = true;
                            }
                            if (valid3) {
                              if (data4.normalized !== void 0) {
                                let data6 = data4.normalized;
                                const _errs22 = errors;
                                if (!(typeof data6 == "number" && isFinite(data6))) {
                                  const err11 = { instancePath: instancePath + "/value/normalized", schemaPath: "#/$defs/NumericValue/properties/normalized/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                  if (vErrors === null) {
                                    vErrors = [err11];
                                  } else {
                                    vErrors.push(err11);
                                  }
                                  errors++;
                                }
                                var valid3 = _errs22 === errors;
                              } else {
                                var valid3 = true;
                              }
                            }
                          }
                        }
                      } else {
                        const err12 = { instancePath: instancePath + "/value", schemaPath: "#/$defs/NumericValue/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                        if (vErrors === null) {
                          vErrors = [err12];
                        } else {
                          vErrors.push(err12);
                        }
                        errors++;
                      }
                    }
                    var _valid0 = _errs16 === errors;
                    valid1 = valid1 || _valid0;
                    const _errs24 = errors;
                    if (errors === _errs24) {
                      if (Array.isArray(data4)) {
                        if (data4.length > 50) {
                          const err13 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/3/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" };
                          if (vErrors === null) {
                            vErrors = [err13];
                          } else {
                            vErrors.push(err13);
                          }
                          errors++;
                        } else {
                          if (data4.length < 1) {
                            const err14 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/3/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                            if (vErrors === null) {
                              vErrors = [err14];
                            } else {
                              vErrors.push(err14);
                            }
                            errors++;
                          } else {
                            var valid4 = true;
                            const len0 = data4.length;
                            for (let i0 = 0; i0 < len0; i0++) {
                              let data7 = data4[i0];
                              const _errs26 = errors;
                              if (errors === _errs26) {
                                if (typeof data7 === "string") {
                                  if (func1(data7) > 2e3) {
                                    const err15 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                                    if (vErrors === null) {
                                      vErrors = [err15];
                                    } else {
                                      vErrors.push(err15);
                                    }
                                    errors++;
                                  } else {
                                    if (func1(data7) < 1) {
                                      const err16 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                      if (vErrors === null) {
                                        vErrors = [err16];
                                      } else {
                                        vErrors.push(err16);
                                      }
                                      errors++;
                                    } else {
                                      if (!pattern10.test(data7)) {
                                        const err17 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                        if (vErrors === null) {
                                          vErrors = [err17];
                                        } else {
                                          vErrors.push(err17);
                                        }
                                        errors++;
                                      }
                                    }
                                  }
                                } else {
                                  const err18 = { instancePath: instancePath + "/value/" + i0, schemaPath: "#/properties/value/anyOf/3/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err18];
                                  } else {
                                    vErrors.push(err18);
                                  }
                                  errors++;
                                }
                              }
                              var valid4 = _errs26 === errors;
                              if (!valid4) {
                                break;
                              }
                            }
                          }
                        }
                      } else {
                        const err19 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/3/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                        if (vErrors === null) {
                          vErrors = [err19];
                        } else {
                          vErrors.push(err19);
                        }
                        errors++;
                      }
                    }
                    var _valid0 = _errs24 === errors;
                    valid1 = valid1 || _valid0;
                    if (_valid0) {
                      var items0 = true;
                    }
                    const _errs28 = errors;
                    if (errors === _errs28) {
                      if (Array.isArray(data4)) {
                        if (data4.length > 50) {
                          const err20 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/4/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" };
                          if (vErrors === null) {
                            vErrors = [err20];
                          } else {
                            vErrors.push(err20);
                          }
                          errors++;
                        } else {
                          if (data4.length < 1) {
                            const err21 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/4/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                            if (vErrors === null) {
                              vErrors = [err21];
                            } else {
                              vErrors.push(err21);
                            }
                            errors++;
                          } else {
                            var valid5 = true;
                            const len1 = data4.length;
                            for (let i1 = 0; i1 < len1; i1++) {
                              const _errs30 = errors;
                              if (!validate31(data4[i1], { instancePath: instancePath + "/value/" + i1, parentData: data4, parentDataProperty: i1, rootData, dynamicAnchors })) {
                                vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
                                errors = vErrors.length;
                              }
                              var valid5 = _errs30 === errors;
                              if (!valid5) {
                                break;
                              }
                            }
                          }
                        }
                      } else {
                        const err22 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/4/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                        if (vErrors === null) {
                          vErrors = [err22];
                        } else {
                          vErrors.push(err22);
                        }
                        errors++;
                      }
                    }
                    var _valid0 = _errs28 === errors;
                    valid1 = valid1 || _valid0;
                    if (_valid0) {
                      if (items0 !== true) {
                        items0 = true;
                      }
                    }
                    const _errs31 = errors;
                    if (data4 !== null) {
                      const err23 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf/5/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                      if (vErrors === null) {
                        vErrors = [err23];
                      } else {
                        vErrors.push(err23);
                      }
                      errors++;
                    }
                    var _valid0 = _errs31 === errors;
                    valid1 = valid1 || _valid0;
                    if (!valid1) {
                      const err24 = { instancePath: instancePath + "/value", schemaPath: "#/properties/value/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                      if (vErrors === null) {
                        vErrors = [err24];
                      } else {
                        vErrors.push(err24);
                      }
                      errors++;
                      validate36.errors = vErrors;
                      return false;
                    } else {
                      errors = _errs11;
                      if (vErrors !== null) {
                        if (_errs11) {
                          vErrors.length = _errs11;
                        } else {
                          vErrors = null;
                        }
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.value_state !== void 0) {
                      let data9 = data.value_state;
                      const _errs33 = errors;
                      const _errs34 = errors;
                      let valid6 = false;
                      const _errs35 = errors;
                      if (typeof data9 !== "string") {
                        const err25 = { instancePath: instancePath + "/value_state", schemaPath: "#/properties/value_state/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err25];
                        } else {
                          vErrors.push(err25);
                        }
                        errors++;
                      }
                      if (!(data9 === "FOUND" || data9 === "NOT_FOUND_IN_SEARCH" || data9 === "NOT_REPORTED_CANDIDATE" || data9 === "NOT_APPLICABLE" || data9 === "UNREADABLE" || data9 === "CONFLICTING")) {
                        const err26 = { instancePath: instancePath + "/value_state", schemaPath: "#/properties/value_state/anyOf/0/enum", keyword: "enum", params: { allowedValues: schema47.properties.value_state.anyOf[0].enum }, message: "must be equal to one of the allowed values" };
                        if (vErrors === null) {
                          vErrors = [err26];
                        } else {
                          vErrors.push(err26);
                        }
                        errors++;
                      }
                      var _valid1 = _errs35 === errors;
                      valid6 = valid6 || _valid1;
                      const _errs37 = errors;
                      if (data9 !== null) {
                        const err27 = { instancePath: instancePath + "/value_state", schemaPath: "#/properties/value_state/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                        if (vErrors === null) {
                          vErrors = [err27];
                        } else {
                          vErrors.push(err27);
                        }
                        errors++;
                      }
                      var _valid1 = _errs37 === errors;
                      valid6 = valid6 || _valid1;
                      if (!valid6) {
                        const err28 = { instancePath: instancePath + "/value_state", schemaPath: "#/properties/value_state/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                        if (vErrors === null) {
                          vErrors = [err28];
                        } else {
                          vErrors.push(err28);
                        }
                        errors++;
                        validate36.errors = vErrors;
                        return false;
                      } else {
                        errors = _errs34;
                        if (vErrors !== null) {
                          if (_errs34) {
                            vErrors.length = _errs34;
                          } else {
                            vErrors = null;
                          }
                        }
                      }
                      var valid0 = _errs33 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.rationale !== void 0) {
                        let data10 = data.rationale;
                        const _errs39 = errors;
                        const _errs40 = errors;
                        let valid7 = false;
                        const _errs41 = errors;
                        if (errors === _errs41) {
                          if (typeof data10 === "string") {
                            if (func1(data10) > 2e3) {
                              const err29 = { instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                              if (vErrors === null) {
                                vErrors = [err29];
                              } else {
                                vErrors.push(err29);
                              }
                              errors++;
                            } else {
                              if (func1(data10) < 1) {
                                const err30 = { instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                if (vErrors === null) {
                                  vErrors = [err30];
                                } else {
                                  vErrors.push(err30);
                                }
                                errors++;
                              } else {
                                if (!pattern10.test(data10)) {
                                  const err31 = { instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/anyOf/0/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
                                  if (vErrors === null) {
                                    vErrors = [err31];
                                  } else {
                                    vErrors.push(err31);
                                  }
                                  errors++;
                                }
                              }
                            }
                          } else {
                            const err32 = { instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err32];
                            } else {
                              vErrors.push(err32);
                            }
                            errors++;
                          }
                        }
                        var _valid2 = _errs41 === errors;
                        valid7 = valid7 || _valid2;
                        const _errs43 = errors;
                        if (data10 !== null) {
                          const err33 = { instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                          if (vErrors === null) {
                            vErrors = [err33];
                          } else {
                            vErrors.push(err33);
                          }
                          errors++;
                        }
                        var _valid2 = _errs43 === errors;
                        valid7 = valid7 || _valid2;
                        if (!valid7) {
                          const err34 = { instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                          if (vErrors === null) {
                            vErrors = [err34];
                          } else {
                            vErrors.push(err34);
                          }
                          errors++;
                          validate36.errors = vErrors;
                          return false;
                        } else {
                          errors = _errs40;
                          if (vErrors !== null) {
                            if (_errs40) {
                              vErrors.length = _errs40;
                            } else {
                              vErrors = null;
                            }
                          }
                        }
                        var valid0 = _errs39 === errors;
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
    } else {
      validate36.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate36.errors = vErrors;
  return errors === 0;
}
validate36.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate35(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate35.evaluated;
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
        validate35.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate35.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate35.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate35.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate35.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate35.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate35.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("matrix.decide" !== data2) {
                  validate35.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "matrix.decide" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  const _errs8 = errors;
                  if (!validate36(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate36.errors : vErrors.concat(validate36.errors);
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
      validate35.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate35.errors = vErrors;
  return errors === 0;
}
validate35.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate41(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate41.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.items === void 0 && (missing0 = "items")) {
        validate41.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "idempotency_key" || key0 === "items")) {
            validate41.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                if (func1(data0) > 200) {
                  validate41.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate41.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate41.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.items !== void 0) {
              let data1 = data.items;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (Array.isArray(data1)) {
                  if (data1.length > 20) {
                    validate41.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" }];
                    return false;
                  } else {
                    if (data1.length < 1) {
                      validate41.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                      return false;
                    } else {
                      var valid1 = true;
                      const len0 = data1.length;
                      for (let i0 = 0; i0 < len0; i0++) {
                        let data2 = data1[i0];
                        const _errs6 = errors;
                        const _errs7 = errors;
                        if (errors === _errs7) {
                          if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                            let missing1;
                            if (data2.proposal_id === void 0 && (missing1 = "proposal_id") || data2.expected_revision === void 0 && (missing1 = "expected_revision")) {
                              validate41.errors = [{ instancePath: instancePath + "/items/" + i0, schemaPath: "#/$defs/BulkItem/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                              return false;
                            } else {
                              const _errs9 = errors;
                              for (const key1 in data2) {
                                if (!(key1 === "proposal_id" || key1 === "expected_revision")) {
                                  validate41.errors = [{ instancePath: instancePath + "/items/" + i0, schemaPath: "#/$defs/BulkItem/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                                  return false;
                                  break;
                                }
                              }
                              if (_errs9 === errors) {
                                if (data2.proposal_id !== void 0) {
                                  let data3 = data2.proposal_id;
                                  const _errs10 = errors;
                                  if (errors === _errs10) {
                                    if (typeof data3 === "string") {
                                      if (!pattern20.test(data3)) {
                                        validate41.errors = [{ instancePath: instancePath + "/items/" + i0 + "/proposal_id", schemaPath: "#/$defs/BulkItem/properties/proposal_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                        return false;
                                      }
                                    } else {
                                      validate41.errors = [{ instancePath: instancePath + "/items/" + i0 + "/proposal_id", schemaPath: "#/$defs/BulkItem/properties/proposal_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid3 = _errs10 === errors;
                                } else {
                                  var valid3 = true;
                                }
                                if (valid3) {
                                  if (data2.expected_revision !== void 0) {
                                    let data4 = data2.expected_revision;
                                    const _errs12 = errors;
                                    if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                                      validate41.errors = [{ instancePath: instancePath + "/items/" + i0 + "/expected_revision", schemaPath: "#/$defs/BulkItem/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                      return false;
                                    }
                                    if (errors === _errs12) {
                                      if (typeof data4 == "number" && isFinite(data4)) {
                                        if (data4 < 0 || isNaN(data4)) {
                                          validate41.errors = [{ instancePath: instancePath + "/items/" + i0 + "/expected_revision", schemaPath: "#/$defs/BulkItem/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                          return false;
                                        }
                                      }
                                    }
                                    var valid3 = _errs12 === errors;
                                  } else {
                                    var valid3 = true;
                                  }
                                }
                              }
                            }
                          } else {
                            validate41.errors = [{ instancePath: instancePath + "/items/" + i0, schemaPath: "#/$defs/BulkItem/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                            return false;
                          }
                        }
                        var valid1 = _errs6 === errors;
                        if (!valid1) {
                          break;
                        }
                      }
                    }
                  }
                } else {
                  validate41.errors = [{ instancePath: instancePath + "/items", schemaPath: "#/properties/items/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
          }
        }
      }
    } else {
      validate41.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate41.errors = vErrors;
  return errors === 0;
}
validate41.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate40(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate40.evaluated;
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
        validate40.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate40.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate40.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate40.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate40.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate40.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate40.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("matrix.preview" !== data2) {
                  validate40.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "matrix.preview" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  const _errs8 = errors;
                  if (!validate41(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate41.errors : vErrors.concat(validate41.errors);
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
      validate40.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate40.errors = vErrors;
  return errors === 0;
}
validate40.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate44(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate44.evaluated;
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
        validate44.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate44.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate44.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate44.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate44.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate44.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate44.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("matrix.approve" !== data2) {
                  validate44.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "matrix.approve" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  let data3 = data.request;
                  const _errs8 = errors;
                  const _errs9 = errors;
                  if (errors === _errs9) {
                    if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                      let missing1;
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key") || data3.preview_id === void 0 && (missing1 = "preview_id")) {
                        validate44.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/BulkApprove/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key" || key1 === "preview_id")) {
                            validate44.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/BulkApprove/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs11 === errors) {
                          if (data3.idempotency_key !== void 0) {
                            let data4 = data3.idempotency_key;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 200) {
                                  validate44.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/BulkApprove/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate44.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/BulkApprove/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate44.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/BulkApprove/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.preview_id !== void 0) {
                              let data5 = data3.preview_id;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (!pattern20.test(data5)) {
                                    validate44.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/BulkApprove/properties/preview_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate44.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/BulkApprove/properties/preview_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                          }
                        }
                      }
                    } else {
                      validate44.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/BulkApprove/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                      return false;
                    }
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
      validate44.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate44.errors = vErrors;
  return errors === 0;
}
validate44.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
        const err0 = { instancePath, schemaPath: "#/$defs/FormListCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
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
            const err1 = { instancePath, schemaPath: "#/$defs/FormListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
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
                  const err2 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/FormListCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/FormListCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                    const err4 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/FormListCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                    if (vErrors === null) {
                      vErrors = [err4];
                    } else {
                      vErrors.push(err4);
                    }
                    errors++;
                  }
                } else {
                  const err5 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/FormListCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                  const err6 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/FormListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
                if ("matrix.forms" !== data2) {
                  const err7 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/FormListCommand/properties/op/const", keyword: "const", params: { allowedValue: "matrix.forms" }, message: "must be equal to constant" };
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
                    const err8 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/FormListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
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
                        const err9 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/FormListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          const err10 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/FormListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
      const err11 = { instancePath, schemaPath: "#/$defs/FormListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
  const _errs14 = errors;
  if (errors === _errs14) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing1;
      if (data.notebook_id === void 0 && (missing1 = "notebook_id") || data.snapshot_id === void 0 && (missing1 = "snapshot_id") || data.op === void 0 && (missing1 = "op")) {
        const err12 = { instancePath, schemaPath: "#/$defs/FormTemplateCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      } else {
        const _errs16 = errors;
        for (const key1 in data) {
          if (!(key1 === "notebook_id" || key1 === "snapshot_id" || key1 === "op")) {
            const err13 = { instancePath, schemaPath: "#/$defs/FormTemplateCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
            break;
          }
        }
        if (_errs16 === errors) {
          if (data.notebook_id !== void 0) {
            let data4 = data.notebook_id;
            const _errs17 = errors;
            if (errors === _errs17) {
              if (typeof data4 === "string") {
                if (!pattern4.test(data4)) {
                  const err14 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/FormTemplateCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err14];
                  } else {
                    vErrors.push(err14);
                  }
                  errors++;
                }
              } else {
                const err15 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/FormTemplateCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
            var valid4 = _errs17 === errors;
          } else {
            var valid4 = true;
          }
          if (valid4) {
            if (data.snapshot_id !== void 0) {
              let data5 = data.snapshot_id;
              const _errs19 = errors;
              if (errors === _errs19) {
                if (typeof data5 === "string") {
                  if (!pattern5.test(data5)) {
                    const err16 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/FormTemplateCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                    if (vErrors === null) {
                      vErrors = [err16];
                    } else {
                      vErrors.push(err16);
                    }
                    errors++;
                  }
                } else {
                  const err17 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/FormTemplateCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err17];
                  } else {
                    vErrors.push(err17);
                  }
                  errors++;
                }
              }
              var valid4 = _errs19 === errors;
            } else {
              var valid4 = true;
            }
            if (valid4) {
              if (data.op !== void 0) {
                let data6 = data.op;
                const _errs21 = errors;
                if (typeof data6 !== "string") {
                  const err18 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/FormTemplateCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err18];
                  } else {
                    vErrors.push(err18);
                  }
                  errors++;
                }
                if ("matrix.template" !== data6) {
                  const err19 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/FormTemplateCommand/properties/op/const", keyword: "const", params: { allowedValue: "matrix.template" }, message: "must be equal to constant" };
                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }
                  errors++;
                }
                var valid4 = _errs21 === errors;
              } else {
                var valid4 = true;
              }
            }
          }
        }
      }
    } else {
      const err20 = { instancePath, schemaPath: "#/$defs/FormTemplateCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
      if (vErrors === null) {
        vErrors = [err20];
      } else {
        vErrors.push(err20);
      }
      errors++;
    }
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
    const _errs23 = errors;
    if (!validate21(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs23 === errors;
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
      const _errs24 = errors;
      if (!validate25(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs24 === errors;
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
        const _errs25 = errors;
        if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs25 === errors;
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
          const _errs26 = errors;
          if (!validate29(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs26 === errors;
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
            const _errs27 = errors;
            if (!validate35(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs27 === errors;
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
              const _errs28 = errors;
              if (!validate40(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs28 === errors;
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
                const _errs29 = errors;
                if (!validate44(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate44.errors : vErrors.concat(validate44.errors);
                  errors = vErrors.length;
                }
                var _valid0 = _errs29 === errors;
                if (_valid0 && valid0) {
                  valid0 = false;
                  passing0 = [passing0, 8];
                } else {
                  if (_valid0) {
                    valid0 = true;
                    passing0 = 8;
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
  }
  if (!valid0) {
    const err21 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err21];
    } else {
      vErrors.push(err21);
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
  validate_matrix_command_generated_default as default,
  validate
};
