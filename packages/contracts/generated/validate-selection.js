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

// validate-selection.generated.js
var validate = validate21;
var validate_selection_generated_default = validate21;
var schema33 = { "$defs": { "AttachmentRole": { "additionalProperties": false, "properties": { "identity": { "$ref": "#/$defs/SourceIdentity" }, "key": { "maxLength": 200, "minLength": 1, "title": "Key", "type": "string" }, "role": { "enum": ["unassigned", "principal", "supplement"], "title": "Role", "type": "string" } }, "required": ["identity", "key", "role"], "title": "AttachmentRole", "type": "object" }, "Selector": { "additionalProperties": false, "properties": { "kind": { "enum": ["library", "collection", "search", "item"], "title": "Kind", "type": "string" }, "library_id": { "minimum": 1, "title": "Library Id", "type": "integer" }, "key": { "anyOf": [{ "maxLength": 200, "type": "string" }, { "type": "null" }], "default": null, "title": "Key" } }, "required": ["kind", "library_id"], "title": "Selector", "type": "object" }, "SourceIdentity": { "additionalProperties": false, "properties": { "profile_instance_id": { "maxLength": 200, "minLength": 1, "title": "Profile Instance Id", "type": "string" }, "library_id": { "minimum": 1, "title": "Library Id", "type": "integer" }, "item_key": { "maxLength": 200, "minLength": 1, "title": "Item Key", "type": "string" } }, "required": ["profile_instance_id", "library_id", "item_key"], "title": "SourceIdentity", "type": "object" } }, "additionalProperties": false, "properties": { "selectors": { "items": { "$ref": "#/$defs/Selector" }, "maxItems": 1e3, "title": "Selectors", "type": "array" }, "include_descendants": { "default": false, "title": "Include Descendants", "type": "boolean" }, "year_min": { "anyOf": [{ "maximum": 9999, "minimum": 1, "type": "integer" }, { "type": "null" }], "default": null, "title": "Year Min" }, "year_max": { "anyOf": [{ "maximum": 9999, "minimum": 1, "type": "integer" }, { "type": "null" }], "default": null, "title": "Year Max" }, "item_types": { "items": { "type": "string" }, "maxItems": 100, "title": "Item Types", "type": "array" }, "tags": { "items": { "type": "string" }, "maxItems": 100, "title": "Tags", "type": "array" }, "tag_mode": { "default": "AND", "enum": ["AND", "OR"], "title": "Tag Mode", "type": "string" }, "pdf_only": { "default": false, "title": "Pdf Only", "type": "boolean" }, "include_notes": { "default": false, "title": "Include Notes", "type": "boolean" }, "include_annotations": { "default": false, "title": "Include Annotations", "type": "boolean" }, "exclusions": { "items": { "$ref": "#/$defs/SourceIdentity" }, "maxItems": 1e3, "title": "Exclusions", "type": "array" }, "attachment_roles": { "items": { "$ref": "#/$defs/AttachmentRole" }, "maxItems": 1e3, "title": "Attachment Roles", "type": "array" } }, "title": "SelectionSpec", "type": "object" };
var schema34 = { "additionalProperties": false, "properties": { "kind": { "enum": ["library", "collection", "search", "item"], "title": "Kind", "type": "string" }, "library_id": { "minimum": 1, "title": "Library Id", "type": "integer" }, "key": { "anyOf": [{ "maxLength": 200, "type": "string" }, { "type": "null" }], "default": null, "title": "Key" } }, "required": ["kind", "library_id"], "title": "Selector", "type": "object" };
var func3 = Object.prototype.hasOwnProperty;
var func1 = require_ucs2length().default;
var schema36 = { "additionalProperties": false, "properties": { "identity": { "$ref": "#/$defs/SourceIdentity" }, "key": { "maxLength": 200, "minLength": 1, "title": "Key", "type": "string" }, "role": { "enum": ["unassigned", "principal", "supplement"], "title": "Role", "type": "string" } }, "required": ["identity", "key", "role"], "title": "AttachmentRole", "type": "object" };
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
      if (data.identity === void 0 && (missing0 = "identity") || data.key === void 0 && (missing0 = "key") || data.role === void 0 && (missing0 = "role")) {
        validate22.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "identity" || key0 === "key" || key0 === "role")) {
            validate22.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.identity !== void 0) {
            let data0 = data.identity;
            const _errs2 = errors;
            const _errs3 = errors;
            if (errors === _errs3) {
              if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
                let missing1;
                if (data0.profile_instance_id === void 0 && (missing1 = "profile_instance_id") || data0.library_id === void 0 && (missing1 = "library_id") || data0.item_key === void 0 && (missing1 = "item_key")) {
                  validate22.errors = [{ instancePath: instancePath + "/identity", schemaPath: "#/$defs/SourceIdentity/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                  return false;
                } else {
                  const _errs5 = errors;
                  for (const key1 in data0) {
                    if (!(key1 === "profile_instance_id" || key1 === "library_id" || key1 === "item_key")) {
                      validate22.errors = [{ instancePath: instancePath + "/identity", schemaPath: "#/$defs/SourceIdentity/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                      return false;
                      break;
                    }
                  }
                  if (_errs5 === errors) {
                    if (data0.profile_instance_id !== void 0) {
                      let data1 = data0.profile_instance_id;
                      const _errs6 = errors;
                      if (errors === _errs6) {
                        if (typeof data1 === "string") {
                          if (func1(data1) > 200) {
                            validate22.errors = [{ instancePath: instancePath + "/identity/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                            return false;
                          } else {
                            if (func1(data1) < 1) {
                              validate22.errors = [{ instancePath: instancePath + "/identity/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                              return false;
                            }
                          }
                        } else {
                          validate22.errors = [{ instancePath: instancePath + "/identity/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                      }
                      var valid2 = _errs6 === errors;
                    } else {
                      var valid2 = true;
                    }
                    if (valid2) {
                      if (data0.library_id !== void 0) {
                        let data2 = data0.library_id;
                        const _errs8 = errors;
                        if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                          validate22.errors = [{ instancePath: instancePath + "/identity/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                          return false;
                        }
                        if (errors === _errs8) {
                          if (typeof data2 == "number" && isFinite(data2)) {
                            if (data2 < 1 || isNaN(data2)) {
                              validate22.errors = [{ instancePath: instancePath + "/identity/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                              return false;
                            }
                          }
                        }
                        var valid2 = _errs8 === errors;
                      } else {
                        var valid2 = true;
                      }
                      if (valid2) {
                        if (data0.item_key !== void 0) {
                          let data3 = data0.item_key;
                          const _errs10 = errors;
                          if (errors === _errs10) {
                            if (typeof data3 === "string") {
                              if (func1(data3) > 200) {
                                validate22.errors = [{ instancePath: instancePath + "/identity/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                return false;
                              } else {
                                if (func1(data3) < 1) {
                                  validate22.errors = [{ instancePath: instancePath + "/identity/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                  return false;
                                }
                              }
                            } else {
                              validate22.errors = [{ instancePath: instancePath + "/identity/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                      }
                    }
                  }
                }
              } else {
                validate22.errors = [{ instancePath: instancePath + "/identity", schemaPath: "#/$defs/SourceIdentity/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.key !== void 0) {
              let data4 = data.key;
              const _errs12 = errors;
              if (errors === _errs12) {
                if (typeof data4 === "string") {
                  if (func1(data4) > 200) {
                    validate22.errors = [{ instancePath: instancePath + "/key", schemaPath: "#/properties/key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                    return false;
                  } else {
                    if (func1(data4) < 1) {
                      validate22.errors = [{ instancePath: instancePath + "/key", schemaPath: "#/properties/key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate22.errors = [{ instancePath: instancePath + "/key", schemaPath: "#/properties/key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs12 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.role !== void 0) {
                let data5 = data.role;
                const _errs14 = errors;
                if (typeof data5 !== "string") {
                  validate22.errors = [{ instancePath: instancePath + "/role", schemaPath: "#/properties/role/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data5 === "unassigned" || data5 === "principal" || data5 === "supplement")) {
                  validate22.errors = [{ instancePath: instancePath + "/role", schemaPath: "#/properties/role/enum", keyword: "enum", params: { allowedValues: schema36.properties.role.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs14 === errors;
              } else {
                var valid0 = true;
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
      const _errs1 = errors;
      for (const key0 in data) {
        if (!func3.call(schema33.properties, key0)) {
          validate21.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
          return false;
          break;
        }
      }
      if (_errs1 === errors) {
        if (data.selectors !== void 0) {
          let data0 = data.selectors;
          const _errs2 = errors;
          if (errors === _errs2) {
            if (Array.isArray(data0)) {
              if (data0.length > 1e3) {
                validate21.errors = [{ instancePath: instancePath + "/selectors", schemaPath: "#/properties/selectors/maxItems", keyword: "maxItems", params: { limit: 1e3 }, message: "must NOT have more than 1000 items" }];
                return false;
              } else {
                var valid1 = true;
                const len0 = data0.length;
                for (let i0 = 0; i0 < len0; i0++) {
                  let data1 = data0[i0];
                  const _errs4 = errors;
                  const _errs5 = errors;
                  if (errors === _errs5) {
                    if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                      let missing0;
                      if (data1.kind === void 0 && (missing0 = "kind") || data1.library_id === void 0 && (missing0 = "library_id")) {
                        validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0, schemaPath: "#/$defs/Selector/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
                        return false;
                      } else {
                        const _errs7 = errors;
                        for (const key1 in data1) {
                          if (!(key1 === "kind" || key1 === "library_id" || key1 === "key")) {
                            validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0, schemaPath: "#/$defs/Selector/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs7 === errors) {
                          if (data1.kind !== void 0) {
                            let data2 = data1.kind;
                            const _errs8 = errors;
                            if (typeof data2 !== "string") {
                              validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0 + "/kind", schemaPath: "#/$defs/Selector/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data2 === "library" || data2 === "collection" || data2 === "search" || data2 === "item")) {
                              validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0 + "/kind", schemaPath: "#/$defs/Selector/properties/kind/enum", keyword: "enum", params: { allowedValues: schema34.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid3 = _errs8 === errors;
                          } else {
                            var valid3 = true;
                          }
                          if (valid3) {
                            if (data1.library_id !== void 0) {
                              let data3 = data1.library_id;
                              const _errs10 = errors;
                              if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                                validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0 + "/library_id", schemaPath: "#/$defs/Selector/properties/library_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                return false;
                              }
                              if (errors === _errs10) {
                                if (typeof data3 == "number" && isFinite(data3)) {
                                  if (data3 < 1 || isNaN(data3)) {
                                    validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0 + "/library_id", schemaPath: "#/$defs/Selector/properties/library_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                    return false;
                                  }
                                }
                              }
                              var valid3 = _errs10 === errors;
                            } else {
                              var valid3 = true;
                            }
                            if (valid3) {
                              if (data1.key !== void 0) {
                                let data4 = data1.key;
                                const _errs12 = errors;
                                const _errs13 = errors;
                                let valid4 = false;
                                const _errs14 = errors;
                                if (errors === _errs14) {
                                  if (typeof data4 === "string") {
                                    if (func1(data4) > 200) {
                                      const err0 = { instancePath: instancePath + "/selectors/" + i0 + "/key", schemaPath: "#/$defs/Selector/properties/key/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" };
                                      if (vErrors === null) {
                                        vErrors = [err0];
                                      } else {
                                        vErrors.push(err0);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err1 = { instancePath: instancePath + "/selectors/" + i0 + "/key", schemaPath: "#/$defs/Selector/properties/key/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err1];
                                    } else {
                                      vErrors.push(err1);
                                    }
                                    errors++;
                                  }
                                }
                                var _valid0 = _errs14 === errors;
                                valid4 = valid4 || _valid0;
                                const _errs16 = errors;
                                if (data4 !== null) {
                                  const err2 = { instancePath: instancePath + "/selectors/" + i0 + "/key", schemaPath: "#/$defs/Selector/properties/key/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                  if (vErrors === null) {
                                    vErrors = [err2];
                                  } else {
                                    vErrors.push(err2);
                                  }
                                  errors++;
                                }
                                var _valid0 = _errs16 === errors;
                                valid4 = valid4 || _valid0;
                                if (!valid4) {
                                  const err3 = { instancePath: instancePath + "/selectors/" + i0 + "/key", schemaPath: "#/$defs/Selector/properties/key/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                  if (vErrors === null) {
                                    vErrors = [err3];
                                  } else {
                                    vErrors.push(err3);
                                  }
                                  errors++;
                                  validate21.errors = vErrors;
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
                                var valid3 = _errs12 === errors;
                              } else {
                                var valid3 = true;
                              }
                            }
                          }
                        }
                      }
                    } else {
                      validate21.errors = [{ instancePath: instancePath + "/selectors/" + i0, schemaPath: "#/$defs/Selector/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                      return false;
                    }
                  }
                  var valid1 = _errs4 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              }
            } else {
              validate21.errors = [{ instancePath: instancePath + "/selectors", schemaPath: "#/properties/selectors/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
              return false;
            }
          }
          var valid0 = _errs2 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.include_descendants !== void 0) {
            const _errs18 = errors;
            if (typeof data.include_descendants !== "boolean") {
              validate21.errors = [{ instancePath: instancePath + "/include_descendants", schemaPath: "#/properties/include_descendants/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
              return false;
            }
            var valid0 = _errs18 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.year_min !== void 0) {
              let data6 = data.year_min;
              const _errs20 = errors;
              const _errs21 = errors;
              let valid5 = false;
              const _errs22 = errors;
              if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                const err4 = { instancePath: instancePath + "/year_min", schemaPath: "#/properties/year_min/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              if (errors === _errs22) {
                if (typeof data6 == "number" && isFinite(data6)) {
                  if (data6 > 9999 || isNaN(data6)) {
                    const err5 = { instancePath: instancePath + "/year_min", schemaPath: "#/properties/year_min/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 9999 }, message: "must be <= 9999" };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  } else {
                    if (data6 < 1 || isNaN(data6)) {
                      const err6 = { instancePath: instancePath + "/year_min", schemaPath: "#/properties/year_min/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
                      if (vErrors === null) {
                        vErrors = [err6];
                      } else {
                        vErrors.push(err6);
                      }
                      errors++;
                    }
                  }
                }
              }
              var _valid1 = _errs22 === errors;
              valid5 = valid5 || _valid1;
              const _errs24 = errors;
              if (data6 !== null) {
                const err7 = { instancePath: instancePath + "/year_min", schemaPath: "#/properties/year_min/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
              var _valid1 = _errs24 === errors;
              valid5 = valid5 || _valid1;
              if (!valid5) {
                const err8 = { instancePath: instancePath + "/year_min", schemaPath: "#/properties/year_min/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
                validate21.errors = vErrors;
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
              if (data.year_max !== void 0) {
                let data7 = data.year_max;
                const _errs26 = errors;
                const _errs27 = errors;
                let valid6 = false;
                const _errs28 = errors;
                if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                  const err9 = { instancePath: instancePath + "/year_max", schemaPath: "#/properties/year_max/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                  if (vErrors === null) {
                    vErrors = [err9];
                  } else {
                    vErrors.push(err9);
                  }
                  errors++;
                }
                if (errors === _errs28) {
                  if (typeof data7 == "number" && isFinite(data7)) {
                    if (data7 > 9999 || isNaN(data7)) {
                      const err10 = { instancePath: instancePath + "/year_max", schemaPath: "#/properties/year_max/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 9999 }, message: "must be <= 9999" };
                      if (vErrors === null) {
                        vErrors = [err10];
                      } else {
                        vErrors.push(err10);
                      }
                      errors++;
                    } else {
                      if (data7 < 1 || isNaN(data7)) {
                        const err11 = { instancePath: instancePath + "/year_max", schemaPath: "#/properties/year_max/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
                        if (vErrors === null) {
                          vErrors = [err11];
                        } else {
                          vErrors.push(err11);
                        }
                        errors++;
                      }
                    }
                  }
                }
                var _valid2 = _errs28 === errors;
                valid6 = valid6 || _valid2;
                const _errs30 = errors;
                if (data7 !== null) {
                  const err12 = { instancePath: instancePath + "/year_max", schemaPath: "#/properties/year_max/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                  if (vErrors === null) {
                    vErrors = [err12];
                  } else {
                    vErrors.push(err12);
                  }
                  errors++;
                }
                var _valid2 = _errs30 === errors;
                valid6 = valid6 || _valid2;
                if (!valid6) {
                  const err13 = { instancePath: instancePath + "/year_max", schemaPath: "#/properties/year_max/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                  if (vErrors === null) {
                    vErrors = [err13];
                  } else {
                    vErrors.push(err13);
                  }
                  errors++;
                  validate21.errors = vErrors;
                  return false;
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
                var valid0 = _errs26 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.item_types !== void 0) {
                  let data8 = data.item_types;
                  const _errs32 = errors;
                  if (errors === _errs32) {
                    if (Array.isArray(data8)) {
                      if (data8.length > 100) {
                        validate21.errors = [{ instancePath: instancePath + "/item_types", schemaPath: "#/properties/item_types/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                        return false;
                      } else {
                        var valid7 = true;
                        const len1 = data8.length;
                        for (let i1 = 0; i1 < len1; i1++) {
                          const _errs34 = errors;
                          if (typeof data8[i1] !== "string") {
                            validate21.errors = [{ instancePath: instancePath + "/item_types/" + i1, schemaPath: "#/properties/item_types/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          var valid7 = _errs34 === errors;
                          if (!valid7) {
                            break;
                          }
                        }
                      }
                    } else {
                      validate21.errors = [{ instancePath: instancePath + "/item_types", schemaPath: "#/properties/item_types/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                      return false;
                    }
                  }
                  var valid0 = _errs32 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.tags !== void 0) {
                    let data10 = data.tags;
                    const _errs36 = errors;
                    if (errors === _errs36) {
                      if (Array.isArray(data10)) {
                        if (data10.length > 100) {
                          validate21.errors = [{ instancePath: instancePath + "/tags", schemaPath: "#/properties/tags/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                          return false;
                        } else {
                          var valid8 = true;
                          const len2 = data10.length;
                          for (let i2 = 0; i2 < len2; i2++) {
                            const _errs38 = errors;
                            if (typeof data10[i2] !== "string") {
                              validate21.errors = [{ instancePath: instancePath + "/tags/" + i2, schemaPath: "#/properties/tags/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            var valid8 = _errs38 === errors;
                            if (!valid8) {
                              break;
                            }
                          }
                        }
                      } else {
                        validate21.errors = [{ instancePath: instancePath + "/tags", schemaPath: "#/properties/tags/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                        return false;
                      }
                    }
                    var valid0 = _errs36 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.tag_mode !== void 0) {
                      let data12 = data.tag_mode;
                      const _errs40 = errors;
                      if (typeof data12 !== "string") {
                        validate21.errors = [{ instancePath: instancePath + "/tag_mode", schemaPath: "#/properties/tag_mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      if (!(data12 === "AND" || data12 === "OR")) {
                        validate21.errors = [{ instancePath: instancePath + "/tag_mode", schemaPath: "#/properties/tag_mode/enum", keyword: "enum", params: { allowedValues: schema33.properties.tag_mode.enum }, message: "must be equal to one of the allowed values" }];
                        return false;
                      }
                      var valid0 = _errs40 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.pdf_only !== void 0) {
                        const _errs42 = errors;
                        if (typeof data.pdf_only !== "boolean") {
                          validate21.errors = [{ instancePath: instancePath + "/pdf_only", schemaPath: "#/properties/pdf_only/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                          return false;
                        }
                        var valid0 = _errs42 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.include_notes !== void 0) {
                          const _errs44 = errors;
                          if (typeof data.include_notes !== "boolean") {
                            validate21.errors = [{ instancePath: instancePath + "/include_notes", schemaPath: "#/properties/include_notes/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                            return false;
                          }
                          var valid0 = _errs44 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.include_annotations !== void 0) {
                            const _errs46 = errors;
                            if (typeof data.include_annotations !== "boolean") {
                              validate21.errors = [{ instancePath: instancePath + "/include_annotations", schemaPath: "#/properties/include_annotations/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                              return false;
                            }
                            var valid0 = _errs46 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.exclusions !== void 0) {
                              let data16 = data.exclusions;
                              const _errs48 = errors;
                              if (errors === _errs48) {
                                if (Array.isArray(data16)) {
                                  if (data16.length > 1e3) {
                                    validate21.errors = [{ instancePath: instancePath + "/exclusions", schemaPath: "#/properties/exclusions/maxItems", keyword: "maxItems", params: { limit: 1e3 }, message: "must NOT have more than 1000 items" }];
                                    return false;
                                  } else {
                                    var valid9 = true;
                                    const len3 = data16.length;
                                    for (let i3 = 0; i3 < len3; i3++) {
                                      let data17 = data16[i3];
                                      const _errs50 = errors;
                                      const _errs51 = errors;
                                      if (errors === _errs51) {
                                        if (data17 && typeof data17 == "object" && !Array.isArray(data17)) {
                                          let missing1;
                                          if (data17.profile_instance_id === void 0 && (missing1 = "profile_instance_id") || data17.library_id === void 0 && (missing1 = "library_id") || data17.item_key === void 0 && (missing1 = "item_key")) {
                                            validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3, schemaPath: "#/$defs/SourceIdentity/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                                            return false;
                                          } else {
                                            const _errs53 = errors;
                                            for (const key2 in data17) {
                                              if (!(key2 === "profile_instance_id" || key2 === "library_id" || key2 === "item_key")) {
                                                validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3, schemaPath: "#/$defs/SourceIdentity/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" }];
                                                return false;
                                                break;
                                              }
                                            }
                                            if (_errs53 === errors) {
                                              if (data17.profile_instance_id !== void 0) {
                                                let data18 = data17.profile_instance_id;
                                                const _errs54 = errors;
                                                if (errors === _errs54) {
                                                  if (typeof data18 === "string") {
                                                    if (func1(data18) > 200) {
                                                      validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                                      return false;
                                                    } else {
                                                      if (func1(data18) < 1) {
                                                        validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                        return false;
                                                      }
                                                    }
                                                  } else {
                                                    validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                    return false;
                                                  }
                                                }
                                                var valid11 = _errs54 === errors;
                                              } else {
                                                var valid11 = true;
                                              }
                                              if (valid11) {
                                                if (data17.library_id !== void 0) {
                                                  let data19 = data17.library_id;
                                                  const _errs56 = errors;
                                                  if (!(typeof data19 == "number" && (!(data19 % 1) && !isNaN(data19)) && isFinite(data19))) {
                                                    validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                                    return false;
                                                  }
                                                  if (errors === _errs56) {
                                                    if (typeof data19 == "number" && isFinite(data19)) {
                                                      if (data19 < 1 || isNaN(data19)) {
                                                        validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                                        return false;
                                                      }
                                                    }
                                                  }
                                                  var valid11 = _errs56 === errors;
                                                } else {
                                                  var valid11 = true;
                                                }
                                                if (valid11) {
                                                  if (data17.item_key !== void 0) {
                                                    let data20 = data17.item_key;
                                                    const _errs58 = errors;
                                                    if (errors === _errs58) {
                                                      if (typeof data20 === "string") {
                                                        if (func1(data20) > 200) {
                                                          validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                                          return false;
                                                        } else {
                                                          if (func1(data20) < 1) {
                                                            validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                            return false;
                                                          }
                                                        }
                                                      } else {
                                                        validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3 + "/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                        return false;
                                                      }
                                                    }
                                                    var valid11 = _errs58 === errors;
                                                  } else {
                                                    var valid11 = true;
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        } else {
                                          validate21.errors = [{ instancePath: instancePath + "/exclusions/" + i3, schemaPath: "#/$defs/SourceIdentity/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                          return false;
                                        }
                                      }
                                      var valid9 = _errs50 === errors;
                                      if (!valid9) {
                                        break;
                                      }
                                    }
                                  }
                                } else {
                                  validate21.errors = [{ instancePath: instancePath + "/exclusions", schemaPath: "#/properties/exclusions/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                  return false;
                                }
                              }
                              var valid0 = _errs48 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.attachment_roles !== void 0) {
                                let data21 = data.attachment_roles;
                                const _errs60 = errors;
                                if (errors === _errs60) {
                                  if (Array.isArray(data21)) {
                                    if (data21.length > 1e3) {
                                      validate21.errors = [{ instancePath: instancePath + "/attachment_roles", schemaPath: "#/properties/attachment_roles/maxItems", keyword: "maxItems", params: { limit: 1e3 }, message: "must NOT have more than 1000 items" }];
                                      return false;
                                    } else {
                                      var valid12 = true;
                                      const len4 = data21.length;
                                      for (let i4 = 0; i4 < len4; i4++) {
                                        const _errs62 = errors;
                                        if (!validate22(data21[i4], { instancePath: instancePath + "/attachment_roles/" + i4, parentData: data21, parentDataProperty: i4, rootData, dynamicAnchors })) {
                                          vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
                                          errors = vErrors.length;
                                        }
                                        var valid12 = _errs62 === errors;
                                        if (!valid12) {
                                          break;
                                        }
                                      }
                                    }
                                  } else {
                                    validate21.errors = [{ instancePath: instancePath + "/attachment_roles", schemaPath: "#/properties/attachment_roles/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                    return false;
                                  }
                                }
                                var valid0 = _errs60 === errors;
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
export {
  validate_selection_generated_default as default,
  validate
};
