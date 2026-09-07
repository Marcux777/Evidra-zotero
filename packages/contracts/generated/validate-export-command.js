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

// validate-export-command.generated.js
var validate = validate20;
var validate_export_command_generated_default = validate20;
var schema33 = { "additionalProperties": false, "properties": { "format": { "enum": ["json", "markdown", "csv_studies", "csv_results", "backup", "bibtex", "ris", "csl_json"], "title": "Format", "type": "string" }, "excel": { "default": false, "title": "Excel", "type": "boolean" }, "include_pdfs": { "default": false, "title": "Include Pdfs", "type": "boolean" }, "source_ids": { "items": { "pattern": "^[a-f0-9]{64}$", "type": "string" }, "maxItems": 100, "title": "Source Ids", "type": "array" } }, "required": ["format"], "title": "ExportOptions", "type": "object" };
var pattern4 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern5 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
var pattern6 = new RegExp("^[a-f0-9]{64}$", "u");
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
                if ("exports.preview" !== data2) {
                  validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "exports.preview" }, message: "must be equal to constant" }];
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
                      if (data3.format === void 0 && (missing1 = "format")) {
                        validate21.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ExportOptions/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "format" || key1 === "excel" || key1 === "include_pdfs" || key1 === "source_ids")) {
                            validate21.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ExportOptions/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs11 === errors) {
                          if (data3.format !== void 0) {
                            let data4 = data3.format;
                            const _errs12 = errors;
                            if (typeof data4 !== "string") {
                              validate21.errors = [{ instancePath: instancePath + "/request/format", schemaPath: "#/$defs/ExportOptions/properties/format/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data4 === "json" || data4 === "markdown" || data4 === "csv_studies" || data4 === "csv_results" || data4 === "backup" || data4 === "bibtex" || data4 === "ris" || data4 === "csl_json")) {
                              validate21.errors = [{ instancePath: instancePath + "/request/format", schemaPath: "#/$defs/ExportOptions/properties/format/enum", keyword: "enum", params: { allowedValues: schema33.properties.format.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.excel !== void 0) {
                              const _errs14 = errors;
                              if (typeof data3.excel !== "boolean") {
                                validate21.errors = [{ instancePath: instancePath + "/request/excel", schemaPath: "#/$defs/ExportOptions/properties/excel/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                return false;
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data3.include_pdfs !== void 0) {
                                const _errs16 = errors;
                                if (typeof data3.include_pdfs !== "boolean") {
                                  validate21.errors = [{ instancePath: instancePath + "/request/include_pdfs", schemaPath: "#/$defs/ExportOptions/properties/include_pdfs/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.source_ids !== void 0) {
                                  let data7 = data3.source_ids;
                                  const _errs18 = errors;
                                  if (errors === _errs18) {
                                    if (Array.isArray(data7)) {
                                      if (data7.length > 100) {
                                        validate21.errors = [{ instancePath: instancePath + "/request/source_ids", schemaPath: "#/$defs/ExportOptions/properties/source_ids/maxItems", keyword: "maxItems", params: { limit: 100 }, message: "must NOT have more than 100 items" }];
                                        return false;
                                      } else {
                                        var valid3 = true;
                                        const len0 = data7.length;
                                        for (let i0 = 0; i0 < len0; i0++) {
                                          let data8 = data7[i0];
                                          const _errs20 = errors;
                                          if (errors === _errs20) {
                                            if (typeof data8 === "string") {
                                              if (!pattern6.test(data8)) {
                                                validate21.errors = [{ instancePath: instancePath + "/request/source_ids/" + i0, schemaPath: "#/$defs/ExportOptions/properties/source_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                                return false;
                                              }
                                            } else {
                                              validate21.errors = [{ instancePath: instancePath + "/request/source_ids/" + i0, schemaPath: "#/$defs/ExportOptions/properties/source_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                              return false;
                                            }
                                          }
                                          var valid3 = _errs20 === errors;
                                          if (!valid3) {
                                            break;
                                          }
                                        }
                                      }
                                    } else {
                                      validate21.errors = [{ instancePath: instancePath + "/request/source_ids", schemaPath: "#/$defs/ExportOptions/properties/source_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                      return false;
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
                      validate21.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ExportOptions/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate21.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var pattern9 = new RegExp("^[a-f0-9]{32}$", "u");
var func1 = require_ucs2length().default;
function validate23(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate23.evaluated;
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
        validate23.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate23.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate23.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate23.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate23.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate23.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate23.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("exports.create" !== data2) {
                  validate23.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "exports.create" }, message: "must be equal to constant" }];
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
                        validate23.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ExportCreate/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key" || key1 === "preview_id")) {
                            validate23.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ExportCreate/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate23.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ExportCreate/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate23.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ExportCreate/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate23.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ExportCreate/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                                  if (!pattern9.test(data5)) {
                                    validate23.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/ExportCreate/properties/preview_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate23.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/ExportCreate/properties/preview_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                      validate23.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ExportCreate/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate23.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate23.errors = vErrors;
  return errors === 0;
}
validate23.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
                if ("imports.commit" !== data2) {
                  validate25.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "imports.commit" }, message: "must be equal to constant" }];
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
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key") || data3.preview_id === void 0 && (missing1 = "preview_id") || data3.confirmed === void 0 && (missing1 = "confirmed") || data3.expected_mapping_revision === void 0 && (missing1 = "expected_mapping_revision")) {
                        validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ImportCommit/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key" || key1 === "preview_id" || key1 === "confirmed" || key1 === "expected_mapping_revision")) {
                            validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ImportCommit/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ImportCommit/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ImportCommit/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ImportCommit/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                                  if (!pattern9.test(data5)) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/ImportCommit/properties/preview_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate25.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/ImportCommit/properties/preview_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data3.confirmed !== void 0) {
                                let data6 = data3.confirmed;
                                const _errs16 = errors;
                                if (typeof data6 !== "boolean") {
                                  validate25.errors = [{ instancePath: instancePath + "/request/confirmed", schemaPath: "#/$defs/ImportCommit/properties/confirmed/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                if (true !== data6) {
                                  validate25.errors = [{ instancePath: instancePath + "/request/confirmed", schemaPath: "#/$defs/ImportCommit/properties/confirmed/const", keyword: "const", params: { allowedValue: true }, message: "must be equal to constant" }];
                                  return false;
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.expected_mapping_revision !== void 0) {
                                  let data7 = data3.expected_mapping_revision;
                                  const _errs18 = errors;
                                  if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/expected_mapping_revision", schemaPath: "#/$defs/ImportCommit/properties/expected_mapping_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs18) {
                                    if (typeof data7 == "number" && isFinite(data7)) {
                                      if (data7 < 0 || isNaN(data7)) {
                                        validate25.errors = [{ instancePath: instancePath + "/request/expected_mapping_revision", schemaPath: "#/$defs/ImportCommit/properties/expected_mapping_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
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
                      }
                    } else {
                      validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ImportCommit/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
var schema49 = { "additionalProperties": false, "properties": { "original_key": { "maxLength": 200, "minLength": 1, "title": "Original Key", "type": "string" }, "target_key": { "maxLength": 200, "minLength": 1, "title": "Target Key", "type": "string" }, "kind": { "enum": ["pdf", "abstract", "human_note", "human_annotation", "ai_artifact", "approved_data", "text_attachment"], "title": "Kind", "type": "string" } }, "required": ["original_key", "target_key", "kind"], "title": "ContentRemap", "type": "object" };
function validate28(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate28.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.original === void 0 && (missing0 = "original") || data.target === void 0 && (missing0 = "target") || data.contents === void 0 && (missing0 = "contents") || data.offset === void 0 && (missing0 = "offset") || data.final === void 0 && (missing0 = "final") || data.expected_revision === void 0 && (missing0 = "expected_revision")) {
        validate28.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "idempotency_key" || key0 === "original" || key0 === "target" || key0 === "contents" || key0 === "offset" || key0 === "final" || key0 === "expected_revision")) {
            validate28.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate28.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate28.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate28.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.original !== void 0) {
              let data1 = data.original;
              const _errs4 = errors;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                  let missing1;
                  if (data1.profile_instance_id === void 0 && (missing1 = "profile_instance_id") || data1.library_id === void 0 && (missing1 = "library_id") || data1.item_key === void 0 && (missing1 = "item_key")) {
                    validate28.errors = [{ instancePath: instancePath + "/original", schemaPath: "#/$defs/SourceIdentity/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                    return false;
                  } else {
                    const _errs7 = errors;
                    for (const key1 in data1) {
                      if (!(key1 === "profile_instance_id" || key1 === "library_id" || key1 === "item_key")) {
                        validate28.errors = [{ instancePath: instancePath + "/original", schemaPath: "#/$defs/SourceIdentity/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                        return false;
                        break;
                      }
                    }
                    if (_errs7 === errors) {
                      if (data1.profile_instance_id !== void 0) {
                        let data2 = data1.profile_instance_id;
                        const _errs8 = errors;
                        if (errors === _errs8) {
                          if (typeof data2 === "string") {
                            if (func1(data2) > 200) {
                              validate28.errors = [{ instancePath: instancePath + "/original/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                              return false;
                            } else {
                              if (func1(data2) < 1) {
                                validate28.errors = [{ instancePath: instancePath + "/original/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                return false;
                              }
                            }
                          } else {
                            validate28.errors = [{ instancePath: instancePath + "/original/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid2 = _errs8 === errors;
                      } else {
                        var valid2 = true;
                      }
                      if (valid2) {
                        if (data1.library_id !== void 0) {
                          let data3 = data1.library_id;
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                            validate28.errors = [{ instancePath: instancePath + "/original/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs10) {
                            if (typeof data3 == "number" && isFinite(data3)) {
                              if (data3 < 1 || isNaN(data3)) {
                                validate28.errors = [{ instancePath: instancePath + "/original/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                return false;
                              }
                            }
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                        if (valid2) {
                          if (data1.item_key !== void 0) {
                            let data4 = data1.item_key;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 200) {
                                  validate28.errors = [{ instancePath: instancePath + "/original/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate28.errors = [{ instancePath: instancePath + "/original/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate28.errors = [{ instancePath: instancePath + "/original/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                        }
                      }
                    }
                  }
                } else {
                  validate28.errors = [{ instancePath: instancePath + "/original", schemaPath: "#/$defs/SourceIdentity/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.target !== void 0) {
                let data5 = data.target;
                const _errs14 = errors;
                const _errs15 = errors;
                if (errors === _errs15) {
                  if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
                    let missing2;
                    if (data5.profile_instance_id === void 0 && (missing2 = "profile_instance_id") || data5.library_id === void 0 && (missing2 = "library_id") || data5.item_key === void 0 && (missing2 = "item_key")) {
                      validate28.errors = [{ instancePath: instancePath + "/target", schemaPath: "#/$defs/SourceIdentity/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" }];
                      return false;
                    } else {
                      const _errs17 = errors;
                      for (const key2 in data5) {
                        if (!(key2 === "profile_instance_id" || key2 === "library_id" || key2 === "item_key")) {
                          validate28.errors = [{ instancePath: instancePath + "/target", schemaPath: "#/$defs/SourceIdentity/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" }];
                          return false;
                          break;
                        }
                      }
                      if (_errs17 === errors) {
                        if (data5.profile_instance_id !== void 0) {
                          let data6 = data5.profile_instance_id;
                          const _errs18 = errors;
                          if (errors === _errs18) {
                            if (typeof data6 === "string") {
                              if (func1(data6) > 200) {
                                validate28.errors = [{ instancePath: instancePath + "/target/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                return false;
                              } else {
                                if (func1(data6) < 1) {
                                  validate28.errors = [{ instancePath: instancePath + "/target/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                  return false;
                                }
                              }
                            } else {
                              validate28.errors = [{ instancePath: instancePath + "/target/profile_instance_id", schemaPath: "#/$defs/SourceIdentity/properties/profile_instance_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                          var valid4 = _errs18 === errors;
                        } else {
                          var valid4 = true;
                        }
                        if (valid4) {
                          if (data5.library_id !== void 0) {
                            let data7 = data5.library_id;
                            const _errs20 = errors;
                            if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                              validate28.errors = [{ instancePath: instancePath + "/target/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                              return false;
                            }
                            if (errors === _errs20) {
                              if (typeof data7 == "number" && isFinite(data7)) {
                                if (data7 < 1 || isNaN(data7)) {
                                  validate28.errors = [{ instancePath: instancePath + "/target/library_id", schemaPath: "#/$defs/SourceIdentity/properties/library_id/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                  return false;
                                }
                              }
                            }
                            var valid4 = _errs20 === errors;
                          } else {
                            var valid4 = true;
                          }
                          if (valid4) {
                            if (data5.item_key !== void 0) {
                              let data8 = data5.item_key;
                              const _errs22 = errors;
                              if (errors === _errs22) {
                                if (typeof data8 === "string") {
                                  if (func1(data8) > 200) {
                                    validate28.errors = [{ instancePath: instancePath + "/target/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                    return false;
                                  } else {
                                    if (func1(data8) < 1) {
                                      validate28.errors = [{ instancePath: instancePath + "/target/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                      return false;
                                    }
                                  }
                                } else {
                                  validate28.errors = [{ instancePath: instancePath + "/target/item_key", schemaPath: "#/$defs/SourceIdentity/properties/item_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid4 = _errs22 === errors;
                            } else {
                              var valid4 = true;
                            }
                          }
                        }
                      }
                    }
                  } else {
                    validate28.errors = [{ instancePath: instancePath + "/target", schemaPath: "#/$defs/SourceIdentity/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs14 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.contents !== void 0) {
                  let data9 = data.contents;
                  const _errs24 = errors;
                  if (errors === _errs24) {
                    if (Array.isArray(data9)) {
                      if (data9.length > 50) {
                        validate28.errors = [{ instancePath: instancePath + "/contents", schemaPath: "#/properties/contents/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" }];
                        return false;
                      } else {
                        var valid5 = true;
                        const len0 = data9.length;
                        for (let i0 = 0; i0 < len0; i0++) {
                          let data10 = data9[i0];
                          const _errs26 = errors;
                          const _errs27 = errors;
                          if (errors === _errs27) {
                            if (data10 && typeof data10 == "object" && !Array.isArray(data10)) {
                              let missing3;
                              if (data10.original_key === void 0 && (missing3 = "original_key") || data10.target_key === void 0 && (missing3 = "target_key") || data10.kind === void 0 && (missing3 = "kind")) {
                                validate28.errors = [{ instancePath: instancePath + "/contents/" + i0, schemaPath: "#/$defs/ContentRemap/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" }];
                                return false;
                              } else {
                                const _errs29 = errors;
                                for (const key3 in data10) {
                                  if (!(key3 === "original_key" || key3 === "target_key" || key3 === "kind")) {
                                    validate28.errors = [{ instancePath: instancePath + "/contents/" + i0, schemaPath: "#/$defs/ContentRemap/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" }];
                                    return false;
                                    break;
                                  }
                                }
                                if (_errs29 === errors) {
                                  if (data10.original_key !== void 0) {
                                    let data11 = data10.original_key;
                                    const _errs30 = errors;
                                    if (errors === _errs30) {
                                      if (typeof data11 === "string") {
                                        if (func1(data11) > 200) {
                                          validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/original_key", schemaPath: "#/$defs/ContentRemap/properties/original_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                          return false;
                                        } else {
                                          if (func1(data11) < 1) {
                                            validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/original_key", schemaPath: "#/$defs/ContentRemap/properties/original_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                            return false;
                                          }
                                        }
                                      } else {
                                        validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/original_key", schemaPath: "#/$defs/ContentRemap/properties/original_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                        return false;
                                      }
                                    }
                                    var valid7 = _errs30 === errors;
                                  } else {
                                    var valid7 = true;
                                  }
                                  if (valid7) {
                                    if (data10.target_key !== void 0) {
                                      let data12 = data10.target_key;
                                      const _errs32 = errors;
                                      if (errors === _errs32) {
                                        if (typeof data12 === "string") {
                                          if (func1(data12) > 200) {
                                            validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/target_key", schemaPath: "#/$defs/ContentRemap/properties/target_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                            return false;
                                          } else {
                                            if (func1(data12) < 1) {
                                              validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/target_key", schemaPath: "#/$defs/ContentRemap/properties/target_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                              return false;
                                            }
                                          }
                                        } else {
                                          validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/target_key", schemaPath: "#/$defs/ContentRemap/properties/target_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                          return false;
                                        }
                                      }
                                      var valid7 = _errs32 === errors;
                                    } else {
                                      var valid7 = true;
                                    }
                                    if (valid7) {
                                      if (data10.kind !== void 0) {
                                        let data13 = data10.kind;
                                        const _errs34 = errors;
                                        if (typeof data13 !== "string") {
                                          validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/kind", schemaPath: "#/$defs/ContentRemap/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                          return false;
                                        }
                                        if (!(data13 === "pdf" || data13 === "abstract" || data13 === "human_note" || data13 === "human_annotation" || data13 === "ai_artifact" || data13 === "approved_data" || data13 === "text_attachment")) {
                                          validate28.errors = [{ instancePath: instancePath + "/contents/" + i0 + "/kind", schemaPath: "#/$defs/ContentRemap/properties/kind/enum", keyword: "enum", params: { allowedValues: schema49.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                                          return false;
                                        }
                                        var valid7 = _errs34 === errors;
                                      } else {
                                        var valid7 = true;
                                      }
                                    }
                                  }
                                }
                              }
                            } else {
                              validate28.errors = [{ instancePath: instancePath + "/contents/" + i0, schemaPath: "#/$defs/ContentRemap/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                              return false;
                            }
                          }
                          var valid5 = _errs26 === errors;
                          if (!valid5) {
                            break;
                          }
                        }
                      }
                    } else {
                      validate28.errors = [{ instancePath: instancePath + "/contents", schemaPath: "#/properties/contents/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                      return false;
                    }
                  }
                  var valid0 = _errs24 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.offset !== void 0) {
                    let data14 = data.offset;
                    const _errs36 = errors;
                    if (!(typeof data14 == "number" && (!(data14 % 1) && !isNaN(data14)) && isFinite(data14))) {
                      validate28.errors = [{ instancePath: instancePath + "/offset", schemaPath: "#/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                      return false;
                    }
                    if (errors === _errs36) {
                      if (typeof data14 == "number" && isFinite(data14)) {
                        if (data14 > 1e3 || isNaN(data14)) {
                          validate28.errors = [{ instancePath: instancePath + "/offset", schemaPath: "#/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" }];
                          return false;
                        } else {
                          if (data14 < 0 || isNaN(data14)) {
                            validate28.errors = [{ instancePath: instancePath + "/offset", schemaPath: "#/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                            return false;
                          }
                        }
                      }
                    }
                    var valid0 = _errs36 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.final !== void 0) {
                      const _errs38 = errors;
                      if (typeof data.final !== "boolean") {
                        validate28.errors = [{ instancePath: instancePath + "/final", schemaPath: "#/properties/final/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                        return false;
                      }
                      var valid0 = _errs38 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.expected_revision !== void 0) {
                        let data16 = data.expected_revision;
                        const _errs40 = errors;
                        if (!(typeof data16 == "number" && (!(data16 % 1) && !isNaN(data16)) && isFinite(data16))) {
                          validate28.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                          return false;
                        }
                        if (errors === _errs40) {
                          if (typeof data16 == "number" && isFinite(data16)) {
                            if (data16 < 0 || isNaN(data16)) {
                              validate28.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs40 === errors;
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
      validate28.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate28.errors = vErrors;
  return errors === 0;
}
validate28.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.preview_id === void 0 && (missing0 = "preview_id") || data.request === void 0 && (missing0 = "request")) {
        validate27.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "preview_id" || key0 === "request")) {
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
                if ("imports.map" !== data2) {
                  validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "imports.map" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.preview_id !== void 0) {
                  let data3 = data.preview_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern9.test(data3)) {
                        validate27.errors = [{ instancePath: instancePath + "/preview_id", schemaPath: "#/properties/preview_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate27.errors = [{ instancePath: instancePath + "/preview_id", schemaPath: "#/properties/preview_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.request !== void 0) {
                    const _errs10 = errors;
                    if (!validate28(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
                      errors = vErrors.length;
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
      validate27.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate27.errors = vErrors;
  return errors === 0;
}
validate27.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema52 = { "additionalProperties": false, "properties": { "kind": { "enum": ["form", "protocol", "proposal", "evidence", "artifact"], "title": "Kind", "type": "string" }, "identity": { "pattern": "^[a-f0-9]{32,64}$", "title": "Identity", "type": "string" } }, "required": ["kind", "identity"], "title": "ImportReference", "type": "object" };
var pattern42 = new RegExp("^[a-f0-9]{32,64}$", "u");
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.import_id === void 0 && (missing0 = "import_id") || data.request === void 0 && (missing0 = "request")) {
        validate31.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "import_id" || key0 === "request")) {
            validate31.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate31.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate31.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate31.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate31.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate31.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("imports.reference" !== data2) {
                  validate31.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "imports.reference" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.import_id !== void 0) {
                  let data3 = data.import_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern9.test(data3)) {
                        validate31.errors = [{ instancePath: instancePath + "/import_id", schemaPath: "#/properties/import_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate31.errors = [{ instancePath: instancePath + "/import_id", schemaPath: "#/properties/import_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                        if (data4.kind === void 0 && (missing1 = "kind") || data4.identity === void 0 && (missing1 = "identity")) {
                          validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ImportReference/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                          return false;
                        } else {
                          const _errs13 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "kind" || key1 === "identity")) {
                              validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ImportReference/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                              return false;
                              break;
                            }
                          }
                          if (_errs13 === errors) {
                            if (data4.kind !== void 0) {
                              let data5 = data4.kind;
                              const _errs14 = errors;
                              if (typeof data5 !== "string") {
                                validate31.errors = [{ instancePath: instancePath + "/request/kind", schemaPath: "#/$defs/ImportReference/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                              if (!(data5 === "form" || data5 === "protocol" || data5 === "proposal" || data5 === "evidence" || data5 === "artifact")) {
                                validate31.errors = [{ instancePath: instancePath + "/request/kind", schemaPath: "#/$defs/ImportReference/properties/kind/enum", keyword: "enum", params: { allowedValues: schema52.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                                return false;
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data4.identity !== void 0) {
                                let data6 = data4.identity;
                                const _errs16 = errors;
                                if (errors === _errs16) {
                                  if (typeof data6 === "string") {
                                    if (!pattern42.test(data6)) {
                                      validate31.errors = [{ instancePath: instancePath + "/request/identity", schemaPath: "#/$defs/ImportReference/properties/identity/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32,64}$" }, message: 'must match pattern "^[a-f0-9]{32,64}$"' }];
                                      return false;
                                    }
                                  } else {
                                    validate31.errors = [{ instancePath: instancePath + "/request/identity", schemaPath: "#/$defs/ImportReference/properties/identity/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                            }
                          }
                        }
                      } else {
                        validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ImportReference/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate31.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate31.errors = vErrors;
  return errors === 0;
}
validate31.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
  if (!validate21(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (!validate23(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
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
    const _errs3 = errors;
    const _errs4 = errors;
    if (errors === _errs4) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing0;
        if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.artifact_id === void 0 && (missing0 = "artifact_id")) {
          const err0 = { instancePath, schemaPath: "#/$defs/ExportSaveCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        } else {
          const _errs6 = errors;
          for (const key0 in data) {
            if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "artifact_id")) {
              const err1 = { instancePath, schemaPath: "#/$defs/ExportSaveCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
              break;
            }
          }
          if (_errs6 === errors) {
            if (data.notebook_id !== void 0) {
              let data0 = data.notebook_id;
              const _errs7 = errors;
              if (errors === _errs7) {
                if (typeof data0 === "string") {
                  if (!pattern4.test(data0)) {
                    const err2 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ExportSaveCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                    if (vErrors === null) {
                      vErrors = [err2];
                    } else {
                      vErrors.push(err2);
                    }
                    errors++;
                  }
                } else {
                  const err3 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ExportSaveCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err3];
                  } else {
                    vErrors.push(err3);
                  }
                  errors++;
                }
              }
              var valid2 = _errs7 === errors;
            } else {
              var valid2 = true;
            }
            if (valid2) {
              if (data.snapshot_id !== void 0) {
                let data1 = data.snapshot_id;
                const _errs9 = errors;
                if (errors === _errs9) {
                  if (typeof data1 === "string") {
                    if (!pattern5.test(data1)) {
                      const err4 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ExportSaveCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                      if (vErrors === null) {
                        vErrors = [err4];
                      } else {
                        vErrors.push(err4);
                      }
                      errors++;
                    }
                  } else {
                    const err5 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ExportSaveCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  }
                }
                var valid2 = _errs9 === errors;
              } else {
                var valid2 = true;
              }
              if (valid2) {
                if (data.op !== void 0) {
                  let data2 = data.op;
                  const _errs11 = errors;
                  if (typeof data2 !== "string") {
                    const err6 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ExportSaveCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err6];
                    } else {
                      vErrors.push(err6);
                    }
                    errors++;
                  }
                  if ("exports.save" !== data2) {
                    const err7 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ExportSaveCommand/properties/op/const", keyword: "const", params: { allowedValue: "exports.save" }, message: "must be equal to constant" };
                    if (vErrors === null) {
                      vErrors = [err7];
                    } else {
                      vErrors.push(err7);
                    }
                    errors++;
                  }
                  var valid2 = _errs11 === errors;
                } else {
                  var valid2 = true;
                }
                if (valid2) {
                  if (data.artifact_id !== void 0) {
                    let data3 = data.artifact_id;
                    const _errs13 = errors;
                    if (errors === _errs13) {
                      if (typeof data3 === "string") {
                        if (!pattern9.test(data3)) {
                          const err8 = { instancePath: instancePath + "/artifact_id", schemaPath: "#/$defs/ExportSaveCommand/properties/artifact_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                          if (vErrors === null) {
                            vErrors = [err8];
                          } else {
                            vErrors.push(err8);
                          }
                          errors++;
                        }
                      } else {
                        const err9 = { instancePath: instancePath + "/artifact_id", schemaPath: "#/$defs/ExportSaveCommand/properties/artifact_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      }
                    }
                    var valid2 = _errs13 === errors;
                  } else {
                    var valid2 = true;
                  }
                }
              }
            }
          }
        }
      } else {
        const err10 = { instancePath, schemaPath: "#/$defs/ExportSaveCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    var _valid0 = _errs3 === errors;
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
      const _errs15 = errors;
      const _errs16 = errors;
      if (errors === _errs16) {
        if (data && typeof data == "object" && !Array.isArray(data)) {
          let missing1;
          if (data.notebook_id === void 0 && (missing1 = "notebook_id") || data.snapshot_id === void 0 && (missing1 = "snapshot_id") || data.op === void 0 && (missing1 = "op") || data.transfer_id === void 0 && (missing1 = "transfer_id")) {
            const err11 = { instancePath, schemaPath: "#/$defs/TransferDiscardCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          } else {
            const _errs18 = errors;
            for (const key1 in data) {
              if (!(key1 === "notebook_id" || key1 === "snapshot_id" || key1 === "op" || key1 === "transfer_id")) {
                const err12 = { instancePath, schemaPath: "#/$defs/TransferDiscardCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
                break;
              }
            }
            if (_errs18 === errors) {
              if (data.notebook_id !== void 0) {
                let data4 = data.notebook_id;
                const _errs19 = errors;
                if (errors === _errs19) {
                  if (typeof data4 === "string") {
                    if (!pattern4.test(data4)) {
                      const err13 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/TransferDiscardCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                      if (vErrors === null) {
                        vErrors = [err13];
                      } else {
                        vErrors.push(err13);
                      }
                      errors++;
                    }
                  } else {
                    const err14 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/TransferDiscardCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err14];
                    } else {
                      vErrors.push(err14);
                    }
                    errors++;
                  }
                }
                var valid4 = _errs19 === errors;
              } else {
                var valid4 = true;
              }
              if (valid4) {
                if (data.snapshot_id !== void 0) {
                  let data5 = data.snapshot_id;
                  const _errs21 = errors;
                  if (errors === _errs21) {
                    if (typeof data5 === "string") {
                      if (!pattern5.test(data5)) {
                        const err15 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/TransferDiscardCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                        if (vErrors === null) {
                          vErrors = [err15];
                        } else {
                          vErrors.push(err15);
                        }
                        errors++;
                      }
                    } else {
                      const err16 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/TransferDiscardCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err16];
                      } else {
                        vErrors.push(err16);
                      }
                      errors++;
                    }
                  }
                  var valid4 = _errs21 === errors;
                } else {
                  var valid4 = true;
                }
                if (valid4) {
                  if (data.op !== void 0) {
                    let data6 = data.op;
                    const _errs23 = errors;
                    if (typeof data6 !== "string") {
                      const err17 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/TransferDiscardCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                    }
                    if ("exports.discard" !== data6) {
                      const err18 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/TransferDiscardCommand/properties/op/const", keyword: "const", params: { allowedValue: "exports.discard" }, message: "must be equal to constant" };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                    }
                    var valid4 = _errs23 === errors;
                  } else {
                    var valid4 = true;
                  }
                  if (valid4) {
                    if (data.transfer_id !== void 0) {
                      let data7 = data.transfer_id;
                      const _errs25 = errors;
                      if (errors === _errs25) {
                        if (typeof data7 === "string") {
                          if (!pattern9.test(data7)) {
                            const err19 = { instancePath: instancePath + "/transfer_id", schemaPath: "#/$defs/TransferDiscardCommand/properties/transfer_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                            if (vErrors === null) {
                              vErrors = [err19];
                            } else {
                              vErrors.push(err19);
                            }
                            errors++;
                          }
                        } else {
                          const err20 = { instancePath: instancePath + "/transfer_id", schemaPath: "#/$defs/TransferDiscardCommand/properties/transfer_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err20];
                          } else {
                            vErrors.push(err20);
                          }
                          errors++;
                        }
                      }
                      var valid4 = _errs25 === errors;
                    } else {
                      var valid4 = true;
                    }
                  }
                }
              }
            }
          }
        } else {
          const err21 = { instancePath, schemaPath: "#/$defs/TransferDiscardCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      }
      var _valid0 = _errs15 === errors;
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
        const _errs27 = errors;
        const _errs28 = errors;
        if (errors === _errs28) {
          if (data && typeof data == "object" && !Array.isArray(data)) {
            let missing2;
            if (data.notebook_id === void 0 && (missing2 = "notebook_id") || data.snapshot_id === void 0 && (missing2 = "snapshot_id") || data.op === void 0 && (missing2 = "op")) {
              const err22 = { instancePath, schemaPath: "#/$defs/ImportChooseCommand/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            } else {
              const _errs30 = errors;
              for (const key2 in data) {
                if (!(key2 === "notebook_id" || key2 === "snapshot_id" || key2 === "op")) {
                  const err23 = { instancePath, schemaPath: "#/$defs/ImportChooseCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                  if (vErrors === null) {
                    vErrors = [err23];
                  } else {
                    vErrors.push(err23);
                  }
                  errors++;
                  break;
                }
              }
              if (_errs30 === errors) {
                if (data.notebook_id !== void 0) {
                  let data8 = data.notebook_id;
                  const _errs31 = errors;
                  if (errors === _errs31) {
                    if (typeof data8 === "string") {
                      if (!pattern4.test(data8)) {
                        const err24 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportChooseCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                        if (vErrors === null) {
                          vErrors = [err24];
                        } else {
                          vErrors.push(err24);
                        }
                        errors++;
                      }
                    } else {
                      const err25 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportChooseCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err25];
                      } else {
                        vErrors.push(err25);
                      }
                      errors++;
                    }
                  }
                  var valid6 = _errs31 === errors;
                } else {
                  var valid6 = true;
                }
                if (valid6) {
                  if (data.snapshot_id !== void 0) {
                    let data9 = data.snapshot_id;
                    const _errs33 = errors;
                    if (errors === _errs33) {
                      if (typeof data9 === "string") {
                        if (!pattern5.test(data9)) {
                          const err26 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportChooseCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                          if (vErrors === null) {
                            vErrors = [err26];
                          } else {
                            vErrors.push(err26);
                          }
                          errors++;
                        }
                      } else {
                        const err27 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportChooseCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err27];
                        } else {
                          vErrors.push(err27);
                        }
                        errors++;
                      }
                    }
                    var valid6 = _errs33 === errors;
                  } else {
                    var valid6 = true;
                  }
                  if (valid6) {
                    if (data.op !== void 0) {
                      let data10 = data.op;
                      const _errs35 = errors;
                      if (typeof data10 !== "string") {
                        const err28 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportChooseCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err28];
                        } else {
                          vErrors.push(err28);
                        }
                        errors++;
                      }
                      if ("imports.choose" !== data10) {
                        const err29 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportChooseCommand/properties/op/const", keyword: "const", params: { allowedValue: "imports.choose" }, message: "must be equal to constant" };
                        if (vErrors === null) {
                          vErrors = [err29];
                        } else {
                          vErrors.push(err29);
                        }
                        errors++;
                      }
                      var valid6 = _errs35 === errors;
                    } else {
                      var valid6 = true;
                    }
                  }
                }
              }
            }
          } else {
            const err30 = { instancePath, schemaPath: "#/$defs/ImportChooseCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err30];
            } else {
              vErrors.push(err30);
            }
            errors++;
          }
        }
        var _valid0 = _errs27 === errors;
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
          const _errs37 = errors;
          if (!validate25(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs37 === errors;
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
            const _errs38 = errors;
            const _errs39 = errors;
            if (errors === _errs39) {
              if (data && typeof data == "object" && !Array.isArray(data)) {
                let missing3;
                if (data.notebook_id === void 0 && (missing3 = "notebook_id") || data.snapshot_id === void 0 && (missing3 = "snapshot_id") || data.op === void 0 && (missing3 = "op") || data.offset === void 0 && (missing3 = "offset")) {
                  const err31 = { instancePath, schemaPath: "#/$defs/ImportListCommand/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" };
                  if (vErrors === null) {
                    vErrors = [err31];
                  } else {
                    vErrors.push(err31);
                  }
                  errors++;
                } else {
                  const _errs41 = errors;
                  for (const key3 in data) {
                    if (!(key3 === "notebook_id" || key3 === "snapshot_id" || key3 === "op" || key3 === "offset")) {
                      const err32 = { instancePath, schemaPath: "#/$defs/ImportListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                      if (vErrors === null) {
                        vErrors = [err32];
                      } else {
                        vErrors.push(err32);
                      }
                      errors++;
                      break;
                    }
                  }
                  if (_errs41 === errors) {
                    if (data.notebook_id !== void 0) {
                      let data11 = data.notebook_id;
                      const _errs42 = errors;
                      if (errors === _errs42) {
                        if (typeof data11 === "string") {
                          if (!pattern4.test(data11)) {
                            const err33 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportListCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                            if (vErrors === null) {
                              vErrors = [err33];
                            } else {
                              vErrors.push(err33);
                            }
                            errors++;
                          }
                        } else {
                          const err34 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportListCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err34];
                          } else {
                            vErrors.push(err34);
                          }
                          errors++;
                        }
                      }
                      var valid8 = _errs42 === errors;
                    } else {
                      var valid8 = true;
                    }
                    if (valid8) {
                      if (data.snapshot_id !== void 0) {
                        let data12 = data.snapshot_id;
                        const _errs44 = errors;
                        if (errors === _errs44) {
                          if (typeof data12 === "string") {
                            if (!pattern5.test(data12)) {
                              const err35 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportListCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                              if (vErrors === null) {
                                vErrors = [err35];
                              } else {
                                vErrors.push(err35);
                              }
                              errors++;
                            }
                          } else {
                            const err36 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportListCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err36];
                            } else {
                              vErrors.push(err36);
                            }
                            errors++;
                          }
                        }
                        var valid8 = _errs44 === errors;
                      } else {
                        var valid8 = true;
                      }
                      if (valid8) {
                        if (data.op !== void 0) {
                          let data13 = data.op;
                          const _errs46 = errors;
                          if (typeof data13 !== "string") {
                            const err37 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err37];
                            } else {
                              vErrors.push(err37);
                            }
                            errors++;
                          }
                          if ("imports.list" !== data13) {
                            const err38 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportListCommand/properties/op/const", keyword: "const", params: { allowedValue: "imports.list" }, message: "must be equal to constant" };
                            if (vErrors === null) {
                              vErrors = [err38];
                            } else {
                              vErrors.push(err38);
                            }
                            errors++;
                          }
                          var valid8 = _errs46 === errors;
                        } else {
                          var valid8 = true;
                        }
                        if (valid8) {
                          if (data.offset !== void 0) {
                            let data14 = data.offset;
                            const _errs48 = errors;
                            if (!(typeof data14 == "number" && (!(data14 % 1) && !isNaN(data14)) && isFinite(data14))) {
                              const err39 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                              if (vErrors === null) {
                                vErrors = [err39];
                              } else {
                                vErrors.push(err39);
                              }
                              errors++;
                            }
                            if (errors === _errs48) {
                              if (typeof data14 == "number" && isFinite(data14)) {
                                if (data14 > 1e6 || isNaN(data14)) {
                                  const err40 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                  if (vErrors === null) {
                                    vErrors = [err40];
                                  } else {
                                    vErrors.push(err40);
                                  }
                                  errors++;
                                } else {
                                  if (data14 < 0 || isNaN(data14)) {
                                    const err41 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                    if (vErrors === null) {
                                      vErrors = [err41];
                                    } else {
                                      vErrors.push(err41);
                                    }
                                    errors++;
                                  }
                                }
                              }
                            }
                            var valid8 = _errs48 === errors;
                          } else {
                            var valid8 = true;
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                const err42 = { instancePath, schemaPath: "#/$defs/ImportListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err42];
                } else {
                  vErrors.push(err42);
                }
                errors++;
              }
            }
            var _valid0 = _errs38 === errors;
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
              const _errs50 = errors;
              const _errs51 = errors;
              if (errors === _errs51) {
                if (data && typeof data == "object" && !Array.isArray(data)) {
                  let missing4;
                  if (data.notebook_id === void 0 && (missing4 = "notebook_id") || data.snapshot_id === void 0 && (missing4 = "snapshot_id") || data.op === void 0 && (missing4 = "op") || data.import_id === void 0 && (missing4 = "import_id") || data.offset === void 0 && (missing4 = "offset")) {
                    const err43 = { instancePath, schemaPath: "#/$defs/ImportRecordsCommand/required", keyword: "required", params: { missingProperty: missing4 }, message: "must have required property '" + missing4 + "'" };
                    if (vErrors === null) {
                      vErrors = [err43];
                    } else {
                      vErrors.push(err43);
                    }
                    errors++;
                  } else {
                    const _errs53 = errors;
                    for (const key4 in data) {
                      if (!(key4 === "notebook_id" || key4 === "snapshot_id" || key4 === "op" || key4 === "import_id" || key4 === "offset")) {
                        const err44 = { instancePath, schemaPath: "#/$defs/ImportRecordsCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                        if (vErrors === null) {
                          vErrors = [err44];
                        } else {
                          vErrors.push(err44);
                        }
                        errors++;
                        break;
                      }
                    }
                    if (_errs53 === errors) {
                      if (data.notebook_id !== void 0) {
                        let data15 = data.notebook_id;
                        const _errs54 = errors;
                        if (errors === _errs54) {
                          if (typeof data15 === "string") {
                            if (!pattern4.test(data15)) {
                              const err45 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportRecordsCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                              if (vErrors === null) {
                                vErrors = [err45];
                              } else {
                                vErrors.push(err45);
                              }
                              errors++;
                            }
                          } else {
                            const err46 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportRecordsCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err46];
                            } else {
                              vErrors.push(err46);
                            }
                            errors++;
                          }
                        }
                        var valid10 = _errs54 === errors;
                      } else {
                        var valid10 = true;
                      }
                      if (valid10) {
                        if (data.snapshot_id !== void 0) {
                          let data16 = data.snapshot_id;
                          const _errs56 = errors;
                          if (errors === _errs56) {
                            if (typeof data16 === "string") {
                              if (!pattern5.test(data16)) {
                                const err47 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportRecordsCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                if (vErrors === null) {
                                  vErrors = [err47];
                                } else {
                                  vErrors.push(err47);
                                }
                                errors++;
                              }
                            } else {
                              const err48 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportRecordsCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err48];
                              } else {
                                vErrors.push(err48);
                              }
                              errors++;
                            }
                          }
                          var valid10 = _errs56 === errors;
                        } else {
                          var valid10 = true;
                        }
                        if (valid10) {
                          if (data.op !== void 0) {
                            let data17 = data.op;
                            const _errs58 = errors;
                            if (typeof data17 !== "string") {
                              const err49 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportRecordsCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err49];
                              } else {
                                vErrors.push(err49);
                              }
                              errors++;
                            }
                            if ("imports.records" !== data17) {
                              const err50 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportRecordsCommand/properties/op/const", keyword: "const", params: { allowedValue: "imports.records" }, message: "must be equal to constant" };
                              if (vErrors === null) {
                                vErrors = [err50];
                              } else {
                                vErrors.push(err50);
                              }
                              errors++;
                            }
                            var valid10 = _errs58 === errors;
                          } else {
                            var valid10 = true;
                          }
                          if (valid10) {
                            if (data.import_id !== void 0) {
                              let data18 = data.import_id;
                              const _errs60 = errors;
                              if (errors === _errs60) {
                                if (typeof data18 === "string") {
                                  if (!pattern9.test(data18)) {
                                    const err51 = { instancePath: instancePath + "/import_id", schemaPath: "#/$defs/ImportRecordsCommand/properties/import_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                    if (vErrors === null) {
                                      vErrors = [err51];
                                    } else {
                                      vErrors.push(err51);
                                    }
                                    errors++;
                                  }
                                } else {
                                  const err52 = { instancePath: instancePath + "/import_id", schemaPath: "#/$defs/ImportRecordsCommand/properties/import_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err52];
                                  } else {
                                    vErrors.push(err52);
                                  }
                                  errors++;
                                }
                              }
                              var valid10 = _errs60 === errors;
                            } else {
                              var valid10 = true;
                            }
                            if (valid10) {
                              if (data.offset !== void 0) {
                                let data19 = data.offset;
                                const _errs62 = errors;
                                if (!(typeof data19 == "number" && (!(data19 % 1) && !isNaN(data19)) && isFinite(data19))) {
                                  const err53 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportRecordsCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                  if (vErrors === null) {
                                    vErrors = [err53];
                                  } else {
                                    vErrors.push(err53);
                                  }
                                  errors++;
                                }
                                if (errors === _errs62) {
                                  if (typeof data19 == "number" && isFinite(data19)) {
                                    if (data19 > 1e6 || isNaN(data19)) {
                                      const err54 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportRecordsCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                      if (vErrors === null) {
                                        vErrors = [err54];
                                      } else {
                                        vErrors.push(err54);
                                      }
                                      errors++;
                                    } else {
                                      if (data19 < 0 || isNaN(data19)) {
                                        const err55 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportRecordsCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                        if (vErrors === null) {
                                          vErrors = [err55];
                                        } else {
                                          vErrors.push(err55);
                                        }
                                        errors++;
                                      }
                                    }
                                  }
                                }
                                var valid10 = _errs62 === errors;
                              } else {
                                var valid10 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                } else {
                  const err56 = { instancePath, schemaPath: "#/$defs/ImportRecordsCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                  if (vErrors === null) {
                    vErrors = [err56];
                  } else {
                    vErrors.push(err56);
                  }
                  errors++;
                }
              }
              var _valid0 = _errs50 === errors;
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
                const _errs64 = errors;
                const _errs65 = errors;
                if (errors === _errs65) {
                  if (data && typeof data == "object" && !Array.isArray(data)) {
                    let missing5;
                    if (data.notebook_id === void 0 && (missing5 = "notebook_id") || data.snapshot_id === void 0 && (missing5 = "snapshot_id") || data.op === void 0 && (missing5 = "op") || data.import_id === void 0 && (missing5 = "import_id") || data.evidence_id === void 0 && (missing5 = "evidence_id")) {
                      const err57 = { instancePath, schemaPath: "#/$defs/ImportOpenCommand/required", keyword: "required", params: { missingProperty: missing5 }, message: "must have required property '" + missing5 + "'" };
                      if (vErrors === null) {
                        vErrors = [err57];
                      } else {
                        vErrors.push(err57);
                      }
                      errors++;
                    } else {
                      const _errs67 = errors;
                      for (const key5 in data) {
                        if (!(key5 === "notebook_id" || key5 === "snapshot_id" || key5 === "op" || key5 === "import_id" || key5 === "evidence_id")) {
                          const err58 = { instancePath, schemaPath: "#/$defs/ImportOpenCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                          if (vErrors === null) {
                            vErrors = [err58];
                          } else {
                            vErrors.push(err58);
                          }
                          errors++;
                          break;
                        }
                      }
                      if (_errs67 === errors) {
                        if (data.notebook_id !== void 0) {
                          let data20 = data.notebook_id;
                          const _errs68 = errors;
                          if (errors === _errs68) {
                            if (typeof data20 === "string") {
                              if (!pattern4.test(data20)) {
                                const err59 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportOpenCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                if (vErrors === null) {
                                  vErrors = [err59];
                                } else {
                                  vErrors.push(err59);
                                }
                                errors++;
                              }
                            } else {
                              const err60 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportOpenCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err60];
                              } else {
                                vErrors.push(err60);
                              }
                              errors++;
                            }
                          }
                          var valid12 = _errs68 === errors;
                        } else {
                          var valid12 = true;
                        }
                        if (valid12) {
                          if (data.snapshot_id !== void 0) {
                            let data21 = data.snapshot_id;
                            const _errs70 = errors;
                            if (errors === _errs70) {
                              if (typeof data21 === "string") {
                                if (!pattern5.test(data21)) {
                                  const err61 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportOpenCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                  if (vErrors === null) {
                                    vErrors = [err61];
                                  } else {
                                    vErrors.push(err61);
                                  }
                                  errors++;
                                }
                              } else {
                                const err62 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportOpenCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err62];
                                } else {
                                  vErrors.push(err62);
                                }
                                errors++;
                              }
                            }
                            var valid12 = _errs70 === errors;
                          } else {
                            var valid12 = true;
                          }
                          if (valid12) {
                            if (data.op !== void 0) {
                              let data22 = data.op;
                              const _errs72 = errors;
                              if (typeof data22 !== "string") {
                                const err63 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportOpenCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err63];
                                } else {
                                  vErrors.push(err63);
                                }
                                errors++;
                              }
                              if ("imports.open" !== data22) {
                                const err64 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportOpenCommand/properties/op/const", keyword: "const", params: { allowedValue: "imports.open" }, message: "must be equal to constant" };
                                if (vErrors === null) {
                                  vErrors = [err64];
                                } else {
                                  vErrors.push(err64);
                                }
                                errors++;
                              }
                              var valid12 = _errs72 === errors;
                            } else {
                              var valid12 = true;
                            }
                            if (valid12) {
                              if (data.import_id !== void 0) {
                                let data23 = data.import_id;
                                const _errs74 = errors;
                                if (errors === _errs74) {
                                  if (typeof data23 === "string") {
                                    if (!pattern9.test(data23)) {
                                      const err65 = { instancePath: instancePath + "/import_id", schemaPath: "#/$defs/ImportOpenCommand/properties/import_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                      if (vErrors === null) {
                                        vErrors = [err65];
                                      } else {
                                        vErrors.push(err65);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err66 = { instancePath: instancePath + "/import_id", schemaPath: "#/$defs/ImportOpenCommand/properties/import_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err66];
                                    } else {
                                      vErrors.push(err66);
                                    }
                                    errors++;
                                  }
                                }
                                var valid12 = _errs74 === errors;
                              } else {
                                var valid12 = true;
                              }
                              if (valid12) {
                                if (data.evidence_id !== void 0) {
                                  let data24 = data.evidence_id;
                                  const _errs76 = errors;
                                  if (errors === _errs76) {
                                    if (typeof data24 === "string") {
                                      if (!pattern6.test(data24)) {
                                        const err67 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/$defs/ImportOpenCommand/properties/evidence_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                                        if (vErrors === null) {
                                          vErrors = [err67];
                                        } else {
                                          vErrors.push(err67);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err68 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/$defs/ImportOpenCommand/properties/evidence_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err68];
                                      } else {
                                        vErrors.push(err68);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid12 = _errs76 === errors;
                                } else {
                                  var valid12 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    const err69 = { instancePath, schemaPath: "#/$defs/ImportOpenCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                      vErrors = [err69];
                    } else {
                      vErrors.push(err69);
                    }
                    errors++;
                  }
                }
                var _valid0 = _errs64 === errors;
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
                  const _errs78 = errors;
                  const _errs79 = errors;
                  if (errors === _errs79) {
                    if (data && typeof data == "object" && !Array.isArray(data)) {
                      let missing6;
                      if (data.notebook_id === void 0 && (missing6 = "notebook_id") || data.snapshot_id === void 0 && (missing6 = "snapshot_id") || data.op === void 0 && (missing6 = "op") || data.preview_id === void 0 && (missing6 = "preview_id") || data.offset === void 0 && (missing6 = "offset")) {
                        const err70 = { instancePath, schemaPath: "#/$defs/ImportSourcesCommand/required", keyword: "required", params: { missingProperty: missing6 }, message: "must have required property '" + missing6 + "'" };
                        if (vErrors === null) {
                          vErrors = [err70];
                        } else {
                          vErrors.push(err70);
                        }
                        errors++;
                      } else {
                        const _errs81 = errors;
                        for (const key6 in data) {
                          if (!(key6 === "notebook_id" || key6 === "snapshot_id" || key6 === "op" || key6 === "preview_id" || key6 === "offset")) {
                            const err71 = { instancePath, schemaPath: "#/$defs/ImportSourcesCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                              vErrors = [err71];
                            } else {
                              vErrors.push(err71);
                            }
                            errors++;
                            break;
                          }
                        }
                        if (_errs81 === errors) {
                          if (data.notebook_id !== void 0) {
                            let data25 = data.notebook_id;
                            const _errs82 = errors;
                            if (errors === _errs82) {
                              if (typeof data25 === "string") {
                                if (!pattern4.test(data25)) {
                                  const err72 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportSourcesCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err72];
                                  } else {
                                    vErrors.push(err72);
                                  }
                                  errors++;
                                }
                              } else {
                                const err73 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportSourcesCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err73];
                                } else {
                                  vErrors.push(err73);
                                }
                                errors++;
                              }
                            }
                            var valid14 = _errs82 === errors;
                          } else {
                            var valid14 = true;
                          }
                          if (valid14) {
                            if (data.snapshot_id !== void 0) {
                              let data26 = data.snapshot_id;
                              const _errs84 = errors;
                              if (errors === _errs84) {
                                if (typeof data26 === "string") {
                                  if (!pattern5.test(data26)) {
                                    const err74 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportSourcesCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                    if (vErrors === null) {
                                      vErrors = [err74];
                                    } else {
                                      vErrors.push(err74);
                                    }
                                    errors++;
                                  }
                                } else {
                                  const err75 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportSourcesCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err75];
                                  } else {
                                    vErrors.push(err75);
                                  }
                                  errors++;
                                }
                              }
                              var valid14 = _errs84 === errors;
                            } else {
                              var valid14 = true;
                            }
                            if (valid14) {
                              if (data.op !== void 0) {
                                let data27 = data.op;
                                const _errs86 = errors;
                                if (typeof data27 !== "string") {
                                  const err76 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportSourcesCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err76];
                                  } else {
                                    vErrors.push(err76);
                                  }
                                  errors++;
                                }
                                if ("imports.sources" !== data27) {
                                  const err77 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportSourcesCommand/properties/op/const", keyword: "const", params: { allowedValue: "imports.sources" }, message: "must be equal to constant" };
                                  if (vErrors === null) {
                                    vErrors = [err77];
                                  } else {
                                    vErrors.push(err77);
                                  }
                                  errors++;
                                }
                                var valid14 = _errs86 === errors;
                              } else {
                                var valid14 = true;
                              }
                              if (valid14) {
                                if (data.preview_id !== void 0) {
                                  let data28 = data.preview_id;
                                  const _errs88 = errors;
                                  if (errors === _errs88) {
                                    if (typeof data28 === "string") {
                                      if (!pattern9.test(data28)) {
                                        const err78 = { instancePath: instancePath + "/preview_id", schemaPath: "#/$defs/ImportSourcesCommand/properties/preview_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                        if (vErrors === null) {
                                          vErrors = [err78];
                                        } else {
                                          vErrors.push(err78);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err79 = { instancePath: instancePath + "/preview_id", schemaPath: "#/$defs/ImportSourcesCommand/properties/preview_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err79];
                                      } else {
                                        vErrors.push(err79);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid14 = _errs88 === errors;
                                } else {
                                  var valid14 = true;
                                }
                                if (valid14) {
                                  if (data.offset !== void 0) {
                                    let data29 = data.offset;
                                    const _errs90 = errors;
                                    if (!(typeof data29 == "number" && (!(data29 % 1) && !isNaN(data29)) && isFinite(data29))) {
                                      const err80 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportSourcesCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                      if (vErrors === null) {
                                        vErrors = [err80];
                                      } else {
                                        vErrors.push(err80);
                                      }
                                      errors++;
                                    }
                                    if (errors === _errs90) {
                                      if (typeof data29 == "number" && isFinite(data29)) {
                                        if (data29 > 1e6 || isNaN(data29)) {
                                          const err81 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportSourcesCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                          if (vErrors === null) {
                                            vErrors = [err81];
                                          } else {
                                            vErrors.push(err81);
                                          }
                                          errors++;
                                        } else {
                                          if (data29 < 0 || isNaN(data29)) {
                                            const err82 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ImportSourcesCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                            if (vErrors === null) {
                                              vErrors = [err82];
                                            } else {
                                              vErrors.push(err82);
                                            }
                                            errors++;
                                          }
                                        }
                                      }
                                    }
                                    var valid14 = _errs90 === errors;
                                  } else {
                                    var valid14 = true;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    } else {
                      const err83 = { instancePath, schemaPath: "#/$defs/ImportSourcesCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                      if (vErrors === null) {
                        vErrors = [err83];
                      } else {
                        vErrors.push(err83);
                      }
                      errors++;
                    }
                  }
                  var _valid0 = _errs78 === errors;
                  if (_valid0 && valid0) {
                    valid0 = false;
                    passing0 = [passing0, 9];
                  } else {
                    if (_valid0) {
                      valid0 = true;
                      passing0 = 9;
                      if (props0 !== true) {
                        props0 = true;
                      }
                    }
                    const _errs92 = errors;
                    if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
                      errors = vErrors.length;
                    }
                    var _valid0 = _errs92 === errors;
                    if (_valid0 && valid0) {
                      valid0 = false;
                      passing0 = [passing0, 10];
                    } else {
                      if (_valid0) {
                        valid0 = true;
                        passing0 = 10;
                        if (props0 !== true) {
                          props0 = true;
                        }
                      }
                      const _errs93 = errors;
                      const _errs94 = errors;
                      if (errors === _errs94) {
                        if (data && typeof data == "object" && !Array.isArray(data)) {
                          let missing7;
                          if (data.notebook_id === void 0 && (missing7 = "notebook_id") || data.snapshot_id === void 0 && (missing7 = "snapshot_id") || data.op === void 0 && (missing7 = "op") || data.import_id === void 0 && (missing7 = "import_id")) {
                            const err84 = { instancePath, schemaPath: "#/$defs/ImportStatusCommand/required", keyword: "required", params: { missingProperty: missing7 }, message: "must have required property '" + missing7 + "'" };
                            if (vErrors === null) {
                              vErrors = [err84];
                            } else {
                              vErrors.push(err84);
                            }
                            errors++;
                          } else {
                            const _errs96 = errors;
                            for (const key7 in data) {
                              if (!(key7 === "notebook_id" || key7 === "snapshot_id" || key7 === "op" || key7 === "import_id")) {
                                const err85 = { instancePath, schemaPath: "#/$defs/ImportStatusCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key7 }, message: "must NOT have additional properties" };
                                if (vErrors === null) {
                                  vErrors = [err85];
                                } else {
                                  vErrors.push(err85);
                                }
                                errors++;
                                break;
                              }
                            }
                            if (_errs96 === errors) {
                              if (data.notebook_id !== void 0) {
                                let data30 = data.notebook_id;
                                const _errs97 = errors;
                                if (errors === _errs97) {
                                  if (typeof data30 === "string") {
                                    if (!pattern4.test(data30)) {
                                      const err86 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportStatusCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                      if (vErrors === null) {
                                        vErrors = [err86];
                                      } else {
                                        vErrors.push(err86);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err87 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ImportStatusCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err87];
                                    } else {
                                      vErrors.push(err87);
                                    }
                                    errors++;
                                  }
                                }
                                var valid16 = _errs97 === errors;
                              } else {
                                var valid16 = true;
                              }
                              if (valid16) {
                                if (data.snapshot_id !== void 0) {
                                  let data31 = data.snapshot_id;
                                  const _errs99 = errors;
                                  if (errors === _errs99) {
                                    if (typeof data31 === "string") {
                                      if (!pattern5.test(data31)) {
                                        const err88 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportStatusCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                        if (vErrors === null) {
                                          vErrors = [err88];
                                        } else {
                                          vErrors.push(err88);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err89 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ImportStatusCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err89];
                                      } else {
                                        vErrors.push(err89);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid16 = _errs99 === errors;
                                } else {
                                  var valid16 = true;
                                }
                                if (valid16) {
                                  if (data.op !== void 0) {
                                    let data32 = data.op;
                                    const _errs101 = errors;
                                    if (typeof data32 !== "string") {
                                      const err90 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportStatusCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err90];
                                      } else {
                                        vErrors.push(err90);
                                      }
                                      errors++;
                                    }
                                    if ("imports.status" !== data32) {
                                      const err91 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ImportStatusCommand/properties/op/const", keyword: "const", params: { allowedValue: "imports.status" }, message: "must be equal to constant" };
                                      if (vErrors === null) {
                                        vErrors = [err91];
                                      } else {
                                        vErrors.push(err91);
                                      }
                                      errors++;
                                    }
                                    var valid16 = _errs101 === errors;
                                  } else {
                                    var valid16 = true;
                                  }
                                  if (valid16) {
                                    if (data.import_id !== void 0) {
                                      let data33 = data.import_id;
                                      const _errs103 = errors;
                                      if (errors === _errs103) {
                                        if (typeof data33 === "string") {
                                          if (!pattern9.test(data33)) {
                                            const err92 = { instancePath: instancePath + "/import_id", schemaPath: "#/$defs/ImportStatusCommand/properties/import_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                            if (vErrors === null) {
                                              vErrors = [err92];
                                            } else {
                                              vErrors.push(err92);
                                            }
                                            errors++;
                                          }
                                        } else {
                                          const err93 = { instancePath: instancePath + "/import_id", schemaPath: "#/$defs/ImportStatusCommand/properties/import_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err93];
                                          } else {
                                            vErrors.push(err93);
                                          }
                                          errors++;
                                        }
                                      }
                                      var valid16 = _errs103 === errors;
                                    } else {
                                      var valid16 = true;
                                    }
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          const err94 = { instancePath, schemaPath: "#/$defs/ImportStatusCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                          if (vErrors === null) {
                            vErrors = [err94];
                          } else {
                            vErrors.push(err94);
                          }
                          errors++;
                        }
                      }
                      var _valid0 = _errs93 === errors;
                      if (_valid0 && valid0) {
                        valid0 = false;
                        passing0 = [passing0, 11];
                      } else {
                        if (_valid0) {
                          valid0 = true;
                          passing0 = 11;
                          if (props0 !== true) {
                            props0 = true;
                          }
                        }
                        const _errs105 = errors;
                        if (!validate31(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
                          errors = vErrors.length;
                        }
                        var _valid0 = _errs105 === errors;
                        if (_valid0 && valid0) {
                          valid0 = false;
                          passing0 = [passing0, 12];
                        } else {
                          if (_valid0) {
                            valid0 = true;
                            passing0 = 12;
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
        }
      }
    }
  }
  if (!valid0) {
    const err95 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err95];
    } else {
      vErrors.push(err95);
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
  validate_export_command_generated_default as default,
  validate
};
