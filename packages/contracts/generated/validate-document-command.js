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

// validate-document-command.generated.js
var validate = validate20;
var validate_document_command_generated_default = validate20;
var schema37 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["documents.evidence", "documents.open"], "title": "Op", "type": "string" }, "evidence_id": { "pattern": "^[a-f0-9]{64}$", "title": "Evidence Id", "type": "string" } }, "required": ["notebook_id", "snapshot_id", "op", "evidence_id"], "title": "DocumentEvidenceCommand", "type": "object" };
var schema38 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["documents.operation", "documents.cancel", "documents.preview.read"], "title": "Op", "type": "string" }, "operation_id": { "pattern": "^[a-f0-9]{32}$", "title": "Operation Id", "type": "string" } }, "required": ["notebook_id", "snapshot_id", "op", "operation_id"], "title": "DocumentOperationCommand", "type": "object" };
var pattern4 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern5 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
var pattern6 = new RegExp("^[a-f0-9]{64}$", "u");
var pattern16 = new RegExp("^[a-f0-9]{32}$", "u");
var func1 = require_ucs2length().default;
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
      if (data.source_id === void 0 && (missing0 = "source_id") || data.content_key === void 0 && (missing0 = "content_key") || data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.limits === void 0 && (missing0 = "limits") || data.idempotency_key === void 0 && (missing0 = "idempotency_key")) {
        validate21.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "source_id" || key0 === "content_key" || key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "limits" || key0 === "idempotency_key")) {
            validate21.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.source_id !== void 0) {
            let data0 = data.source_id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (!pattern6.test(data0)) {
                  validate21.errors = [{ instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                  return false;
                }
              } else {
                validate21.errors = [{ instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.content_key !== void 0) {
              let data1 = data.content_key;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 200) {
                    validate21.errors = [{ instancePath: instancePath + "/content_key", schemaPath: "#/properties/content_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 1) {
                      validate21.errors = [{ instancePath: instancePath + "/content_key", schemaPath: "#/properties/content_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    }
                  }
                } else {
                  validate21.errors = [{ instancePath: instancePath + "/content_key", schemaPath: "#/properties/content_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.notebook_id !== void 0) {
                let data2 = data.notebook_id;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (!pattern4.test(data2)) {
                      validate21.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                      return false;
                    }
                  } else {
                    validate21.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.snapshot_id !== void 0) {
                  let data3 = data.snapshot_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern5.test(data3)) {
                        validate21.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                        return false;
                      }
                    } else {
                      validate21.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.op !== void 0) {
                    let data4 = data.op;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if ("documents.index" !== data4) {
                      validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "documents.index" }, message: "must be equal to constant" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.limits !== void 0) {
                      let data5 = data.limits;
                      const _errs12 = errors;
                      const _errs13 = errors;
                      if (errors === _errs13) {
                        if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
                          const _errs15 = errors;
                          for (const key1 in data5) {
                            if (!(key1 === "max_file_bytes" || key1 === "max_pages" || key1 === "memory_bytes" || key1 === "timeout_seconds")) {
                              validate21.errors = [{ instancePath: instancePath + "/limits", schemaPath: "#/$defs/ParserLimits/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                              return false;
                              break;
                            }
                          }
                          if (_errs15 === errors) {
                            if (data5.max_file_bytes !== void 0) {
                              let data6 = data5.max_file_bytes;
                              const _errs16 = errors;
                              if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                                validate21.errors = [{ instancePath: instancePath + "/limits/max_file_bytes", schemaPath: "#/$defs/ParserLimits/properties/max_file_bytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                return false;
                              }
                              if (errors === _errs16) {
                                if (typeof data6 == "number" && isFinite(data6)) {
                                  if (data6 > 2e9 || isNaN(data6)) {
                                    validate21.errors = [{ instancePath: instancePath + "/limits/max_file_bytes", schemaPath: "#/$defs/ParserLimits/properties/max_file_bytes/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2e9 }, message: "must be <= 2000000000" }];
                                    return false;
                                  } else {
                                    if (data6 < 1 || isNaN(data6)) {
                                      validate21.errors = [{ instancePath: instancePath + "/limits/max_file_bytes", schemaPath: "#/$defs/ParserLimits/properties/max_file_bytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                      return false;
                                    }
                                  }
                                }
                              }
                              var valid2 = _errs16 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data5.max_pages !== void 0) {
                                let data7 = data5.max_pages;
                                const _errs18 = errors;
                                if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                                  validate21.errors = [{ instancePath: instancePath + "/limits/max_pages", schemaPath: "#/$defs/ParserLimits/properties/max_pages/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                  return false;
                                }
                                if (errors === _errs18) {
                                  if (typeof data7 == "number" && isFinite(data7)) {
                                    if (data7 > 1e4 || isNaN(data7)) {
                                      validate21.errors = [{ instancePath: instancePath + "/limits/max_pages", schemaPath: "#/$defs/ParserLimits/properties/max_pages/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e4 }, message: "must be <= 10000" }];
                                      return false;
                                    } else {
                                      if (data7 < 1 || isNaN(data7)) {
                                        validate21.errors = [{ instancePath: instancePath + "/limits/max_pages", schemaPath: "#/$defs/ParserLimits/properties/max_pages/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                        return false;
                                      }
                                    }
                                  }
                                }
                                var valid2 = _errs18 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data5.memory_bytes !== void 0) {
                                  let data8 = data5.memory_bytes;
                                  const _errs20 = errors;
                                  if (!(typeof data8 == "number" && (!(data8 % 1) && !isNaN(data8)) && isFinite(data8))) {
                                    validate21.errors = [{ instancePath: instancePath + "/limits/memory_bytes", schemaPath: "#/$defs/ParserLimits/properties/memory_bytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs20) {
                                    if (typeof data8 == "number" && isFinite(data8)) {
                                      if (data8 > 4294967296 || isNaN(data8)) {
                                        validate21.errors = [{ instancePath: instancePath + "/limits/memory_bytes", schemaPath: "#/$defs/ParserLimits/properties/memory_bytes/maximum", keyword: "maximum", params: { comparison: "<=", limit: 4294967296 }, message: "must be <= 4294967296" }];
                                        return false;
                                      } else {
                                        if (data8 < 67108864 || isNaN(data8)) {
                                          validate21.errors = [{ instancePath: instancePath + "/limits/memory_bytes", schemaPath: "#/$defs/ParserLimits/properties/memory_bytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 67108864 }, message: "must be >= 67108864" }];
                                          return false;
                                        }
                                      }
                                    }
                                  }
                                  var valid2 = _errs20 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data5.timeout_seconds !== void 0) {
                                    let data9 = data5.timeout_seconds;
                                    const _errs22 = errors;
                                    if (errors === _errs22) {
                                      if (typeof data9 == "number" && isFinite(data9)) {
                                        if (data9 > 1800 || isNaN(data9)) {
                                          validate21.errors = [{ instancePath: instancePath + "/limits/timeout_seconds", schemaPath: "#/$defs/ParserLimits/properties/timeout_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1800 }, message: "must be <= 1800" }];
                                          return false;
                                        } else {
                                          if (data9 < 0.1 || isNaN(data9)) {
                                            validate21.errors = [{ instancePath: instancePath + "/limits/timeout_seconds", schemaPath: "#/$defs/ParserLimits/properties/timeout_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0.1 }, message: "must be >= 0.1" }];
                                            return false;
                                          }
                                        }
                                      } else {
                                        validate21.errors = [{ instancePath: instancePath + "/limits/timeout_seconds", schemaPath: "#/$defs/ParserLimits/properties/timeout_seconds/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                                        return false;
                                      }
                                    }
                                    var valid2 = _errs22 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          validate21.errors = [{ instancePath: instancePath + "/limits", schemaPath: "#/$defs/ParserLimits/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                          return false;
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.idempotency_key !== void 0) {
                        let data10 = data.idempotency_key;
                        const _errs24 = errors;
                        if (errors === _errs24) {
                          if (typeof data10 === "string") {
                            if (func1(data10) > 200) {
                              validate21.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                              return false;
                            } else {
                              if (func1(data10) < 1) {
                                validate21.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                return false;
                              }
                            }
                          } else {
                            validate21.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid0 = _errs24 === errors;
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
      validate21.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
                if ("documents.search" !== data2) {
                  validate23.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "documents.search" }, message: "must be equal to constant" }];
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
                      if (data3.query === void 0 && (missing1 = "query")) {
                        validate23.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SearchRequest/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "query" || key1 === "offset" || key1 === "limit")) {
                            validate23.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SearchRequest/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs11 === errors) {
                          if (data3.query !== void 0) {
                            let data4 = data3.query;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 2e3) {
                                  validate23.errors = [{ instancePath: instancePath + "/request/query", schemaPath: "#/$defs/SearchRequest/properties/query/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate23.errors = [{ instancePath: instancePath + "/request/query", schemaPath: "#/$defs/SearchRequest/properties/query/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate23.errors = [{ instancePath: instancePath + "/request/query", schemaPath: "#/$defs/SearchRequest/properties/query/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                                validate23.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/SearchRequest/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                return false;
                              }
                              if (errors === _errs14) {
                                if (typeof data5 == "number" && isFinite(data5)) {
                                  if (data5 > 1e6 || isNaN(data5)) {
                                    validate23.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/SearchRequest/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" }];
                                    return false;
                                  } else {
                                    if (data5 < 0 || isNaN(data5)) {
                                      validate23.errors = [{ instancePath: instancePath + "/request/offset", schemaPath: "#/$defs/SearchRequest/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
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
                              if (data3.limit !== void 0) {
                                let data6 = data3.limit;
                                const _errs16 = errors;
                                if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                                  validate23.errors = [{ instancePath: instancePath + "/request/limit", schemaPath: "#/$defs/SearchRequest/properties/limit/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                  return false;
                                }
                                if (errors === _errs16) {
                                  if (typeof data6 == "number" && isFinite(data6)) {
                                    if (data6 > 100 || isNaN(data6)) {
                                      validate23.errors = [{ instancePath: instancePath + "/request/limit", schemaPath: "#/$defs/SearchRequest/properties/limit/maximum", keyword: "maximum", params: { comparison: "<=", limit: 100 }, message: "must be <= 100" }];
                                      return false;
                                    } else {
                                      if (data6 < 1 || isNaN(data6)) {
                                        validate23.errors = [{ instancePath: instancePath + "/request/limit", schemaPath: "#/$defs/SearchRequest/properties/limit/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                        return false;
                                      }
                                    }
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                            }
                          }
                        }
                      }
                    } else {
                      validate23.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SearchRequest/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
function validate26(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate26.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.document_version_id === void 0 && (missing0 = "document_version_id") || data.page_index === void 0 && (missing0 = "page_index") || data.idempotency_key === void 0 && (missing0 = "idempotency_key")) {
        validate26.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "document_version_id" || key0 === "page_index" || key0 === "region" || key0 === "scale" || key0 === "idempotency_key" || key0 === "limits")) {
            validate26.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.document_version_id !== void 0) {
            let data0 = data.document_version_id;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (!pattern6.test(data0)) {
                  validate26.errors = [{ instancePath: instancePath + "/document_version_id", schemaPath: "#/properties/document_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                  return false;
                }
              } else {
                validate26.errors = [{ instancePath: instancePath + "/document_version_id", schemaPath: "#/properties/document_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.page_index !== void 0) {
              let data1 = data.page_index;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                validate26.errors = [{ instancePath: instancePath + "/page_index", schemaPath: "#/properties/page_index/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 > 9999 || isNaN(data1)) {
                    validate26.errors = [{ instancePath: instancePath + "/page_index", schemaPath: "#/properties/page_index/maximum", keyword: "maximum", params: { comparison: "<=", limit: 9999 }, message: "must be <= 9999" }];
                    return false;
                  } else {
                    if (data1 < 0 || isNaN(data1)) {
                      validate26.errors = [{ instancePath: instancePath + "/page_index", schemaPath: "#/properties/page_index/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                      return false;
                    }
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.region !== void 0) {
                let data2 = data.region;
                const _errs6 = errors;
                const _errs7 = errors;
                let valid1 = false;
                const _errs8 = errors;
                if (errors === _errs8) {
                  if (Array.isArray(data2)) {
                    if (data2.length > 4) {
                      const err0 = { instancePath: instancePath + "/region", schemaPath: "#/properties/region/anyOf/0/maxItems", keyword: "maxItems", params: { limit: 4 }, message: "must NOT have more than 4 items" };
                      if (vErrors === null) {
                        vErrors = [err0];
                      } else {
                        vErrors.push(err0);
                      }
                      errors++;
                    } else {
                      if (data2.length < 4) {
                        const err1 = { instancePath: instancePath + "/region", schemaPath: "#/properties/region/anyOf/0/minItems", keyword: "minItems", params: { limit: 4 }, message: "must NOT have fewer than 4 items" };
                        if (vErrors === null) {
                          vErrors = [err1];
                        } else {
                          vErrors.push(err1);
                        }
                        errors++;
                      } else {
                        const len0 = data2.length;
                        if (len0 > 0) {
                          let data3 = data2[0];
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && isFinite(data3))) {
                            const err2 = { instancePath: instancePath + "/region/0", schemaPath: "#/properties/region/anyOf/0/prefixItems/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                            if (vErrors === null) {
                              vErrors = [err2];
                            } else {
                              vErrors.push(err2);
                            }
                            errors++;
                          }
                          var valid2 = _errs10 === errors;
                        }
                        if (valid2) {
                          if (len0 > 1) {
                            let data4 = data2[1];
                            const _errs12 = errors;
                            if (!(typeof data4 == "number" && isFinite(data4))) {
                              const err3 = { instancePath: instancePath + "/region/1", schemaPath: "#/properties/region/anyOf/0/prefixItems/1/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                              if (vErrors === null) {
                                vErrors = [err3];
                              } else {
                                vErrors.push(err3);
                              }
                              errors++;
                            }
                            var valid2 = _errs12 === errors;
                          }
                          if (valid2) {
                            if (len0 > 2) {
                              let data5 = data2[2];
                              const _errs14 = errors;
                              if (!(typeof data5 == "number" && isFinite(data5))) {
                                const err4 = { instancePath: instancePath + "/region/2", schemaPath: "#/properties/region/anyOf/0/prefixItems/2/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                if (vErrors === null) {
                                  vErrors = [err4];
                                } else {
                                  vErrors.push(err4);
                                }
                                errors++;
                              }
                              var valid2 = _errs14 === errors;
                            }
                            if (valid2) {
                              if (len0 > 3) {
                                let data6 = data2[3];
                                const _errs16 = errors;
                                if (!(typeof data6 == "number" && isFinite(data6))) {
                                  const err5 = { instancePath: instancePath + "/region/3", schemaPath: "#/properties/region/anyOf/0/prefixItems/3/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                  if (vErrors === null) {
                                    vErrors = [err5];
                                  } else {
                                    vErrors.push(err5);
                                  }
                                  errors++;
                                }
                                var valid2 = _errs16 === errors;
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    const err6 = { instancePath: instancePath + "/region", schemaPath: "#/properties/region/anyOf/0/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                      vErrors = [err6];
                    } else {
                      vErrors.push(err6);
                    }
                    errors++;
                  }
                }
                var _valid0 = _errs8 === errors;
                valid1 = valid1 || _valid0;
                const _errs18 = errors;
                if (data2 !== null) {
                  const err7 = { instancePath: instancePath + "/region", schemaPath: "#/properties/region/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                  if (vErrors === null) {
                    vErrors = [err7];
                  } else {
                    vErrors.push(err7);
                  }
                  errors++;
                }
                var _valid0 = _errs18 === errors;
                valid1 = valid1 || _valid0;
                if (!valid1) {
                  const err8 = { instancePath: instancePath + "/region", schemaPath: "#/properties/region/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                  validate26.errors = vErrors;
                  return false;
                } else {
                  errors = _errs7;
                  if (vErrors !== null) {
                    if (_errs7) {
                      vErrors.length = _errs7;
                    } else {
                      vErrors = null;
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.scale !== void 0) {
                  let data7 = data.scale;
                  const _errs20 = errors;
                  if (errors === _errs20) {
                    if (typeof data7 == "number" && isFinite(data7)) {
                      if (data7 > 4 || isNaN(data7)) {
                        validate26.errors = [{ instancePath: instancePath + "/scale", schemaPath: "#/properties/scale/maximum", keyword: "maximum", params: { comparison: "<=", limit: 4 }, message: "must be <= 4" }];
                        return false;
                      } else {
                        if (data7 <= 0 || isNaN(data7)) {
                          validate26.errors = [{ instancePath: instancePath + "/scale", schemaPath: "#/properties/scale/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" }];
                          return false;
                        }
                      }
                    } else {
                      validate26.errors = [{ instancePath: instancePath + "/scale", schemaPath: "#/properties/scale/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                      return false;
                    }
                  }
                  var valid0 = _errs20 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.idempotency_key !== void 0) {
                    let data8 = data.idempotency_key;
                    const _errs22 = errors;
                    if (errors === _errs22) {
                      if (typeof data8 === "string") {
                        if (func1(data8) > 200) {
                          validate26.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                          return false;
                        } else {
                          if (func1(data8) < 1) {
                            validate26.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                            return false;
                          }
                        }
                      } else {
                        validate26.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                    var valid0 = _errs22 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.limits !== void 0) {
                      let data9 = data.limits;
                      const _errs24 = errors;
                      const _errs25 = errors;
                      if (errors === _errs25) {
                        if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                          const _errs27 = errors;
                          for (const key1 in data9) {
                            if (!(key1 === "max_file_bytes" || key1 === "max_pages" || key1 === "memory_bytes" || key1 === "timeout_seconds")) {
                              validate26.errors = [{ instancePath: instancePath + "/limits", schemaPath: "#/$defs/ParserLimits/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                              return false;
                              break;
                            }
                          }
                          if (_errs27 === errors) {
                            if (data9.max_file_bytes !== void 0) {
                              let data10 = data9.max_file_bytes;
                              const _errs28 = errors;
                              if (!(typeof data10 == "number" && (!(data10 % 1) && !isNaN(data10)) && isFinite(data10))) {
                                validate26.errors = [{ instancePath: instancePath + "/limits/max_file_bytes", schemaPath: "#/$defs/ParserLimits/properties/max_file_bytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                return false;
                              }
                              if (errors === _errs28) {
                                if (typeof data10 == "number" && isFinite(data10)) {
                                  if (data10 > 2e9 || isNaN(data10)) {
                                    validate26.errors = [{ instancePath: instancePath + "/limits/max_file_bytes", schemaPath: "#/$defs/ParserLimits/properties/max_file_bytes/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2e9 }, message: "must be <= 2000000000" }];
                                    return false;
                                  } else {
                                    if (data10 < 1 || isNaN(data10)) {
                                      validate26.errors = [{ instancePath: instancePath + "/limits/max_file_bytes", schemaPath: "#/$defs/ParserLimits/properties/max_file_bytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                      return false;
                                    }
                                  }
                                }
                              }
                              var valid4 = _errs28 === errors;
                            } else {
                              var valid4 = true;
                            }
                            if (valid4) {
                              if (data9.max_pages !== void 0) {
                                let data11 = data9.max_pages;
                                const _errs30 = errors;
                                if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)) && isFinite(data11))) {
                                  validate26.errors = [{ instancePath: instancePath + "/limits/max_pages", schemaPath: "#/$defs/ParserLimits/properties/max_pages/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                  return false;
                                }
                                if (errors === _errs30) {
                                  if (typeof data11 == "number" && isFinite(data11)) {
                                    if (data11 > 1e4 || isNaN(data11)) {
                                      validate26.errors = [{ instancePath: instancePath + "/limits/max_pages", schemaPath: "#/$defs/ParserLimits/properties/max_pages/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e4 }, message: "must be <= 10000" }];
                                      return false;
                                    } else {
                                      if (data11 < 1 || isNaN(data11)) {
                                        validate26.errors = [{ instancePath: instancePath + "/limits/max_pages", schemaPath: "#/$defs/ParserLimits/properties/max_pages/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                        return false;
                                      }
                                    }
                                  }
                                }
                                var valid4 = _errs30 === errors;
                              } else {
                                var valid4 = true;
                              }
                              if (valid4) {
                                if (data9.memory_bytes !== void 0) {
                                  let data12 = data9.memory_bytes;
                                  const _errs32 = errors;
                                  if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12)) && isFinite(data12))) {
                                    validate26.errors = [{ instancePath: instancePath + "/limits/memory_bytes", schemaPath: "#/$defs/ParserLimits/properties/memory_bytes/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs32) {
                                    if (typeof data12 == "number" && isFinite(data12)) {
                                      if (data12 > 4294967296 || isNaN(data12)) {
                                        validate26.errors = [{ instancePath: instancePath + "/limits/memory_bytes", schemaPath: "#/$defs/ParserLimits/properties/memory_bytes/maximum", keyword: "maximum", params: { comparison: "<=", limit: 4294967296 }, message: "must be <= 4294967296" }];
                                        return false;
                                      } else {
                                        if (data12 < 67108864 || isNaN(data12)) {
                                          validate26.errors = [{ instancePath: instancePath + "/limits/memory_bytes", schemaPath: "#/$defs/ParserLimits/properties/memory_bytes/minimum", keyword: "minimum", params: { comparison: ">=", limit: 67108864 }, message: "must be >= 67108864" }];
                                          return false;
                                        }
                                      }
                                    }
                                  }
                                  var valid4 = _errs32 === errors;
                                } else {
                                  var valid4 = true;
                                }
                                if (valid4) {
                                  if (data9.timeout_seconds !== void 0) {
                                    let data13 = data9.timeout_seconds;
                                    const _errs34 = errors;
                                    if (errors === _errs34) {
                                      if (typeof data13 == "number" && isFinite(data13)) {
                                        if (data13 > 1800 || isNaN(data13)) {
                                          validate26.errors = [{ instancePath: instancePath + "/limits/timeout_seconds", schemaPath: "#/$defs/ParserLimits/properties/timeout_seconds/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1800 }, message: "must be <= 1800" }];
                                          return false;
                                        } else {
                                          if (data13 < 0.1 || isNaN(data13)) {
                                            validate26.errors = [{ instancePath: instancePath + "/limits/timeout_seconds", schemaPath: "#/$defs/ParserLimits/properties/timeout_seconds/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0.1 }, message: "must be >= 0.1" }];
                                            return false;
                                          }
                                        }
                                      } else {
                                        validate26.errors = [{ instancePath: instancePath + "/limits/timeout_seconds", schemaPath: "#/$defs/ParserLimits/properties/timeout_seconds/type", keyword: "type", params: { type: "number" }, message: "must be number" }];
                                        return false;
                                      }
                                    }
                                    var valid4 = _errs34 === errors;
                                  } else {
                                    var valid4 = true;
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          validate26.errors = [{ instancePath: instancePath + "/limits", schemaPath: "#/$defs/ParserLimits/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                          return false;
                        }
                      }
                      var valid0 = _errs24 === errors;
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
    } else {
      validate26.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate26.errors = vErrors;
  return errors === 0;
}
validate26.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
                if ("documents.preview" !== data2) {
                  validate25.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "documents.preview" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  const _errs8 = errors;
                  if (!validate26(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate26.errors : vErrors.concat(validate26.errors);
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
        const err0 = { instancePath, schemaPath: "#/$defs/DocumentListCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
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
            const err1 = { instancePath, schemaPath: "#/$defs/DocumentListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
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
                  const err2 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/DocumentListCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/DocumentListCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                    const err4 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/DocumentListCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                    if (vErrors === null) {
                      vErrors = [err4];
                    } else {
                      vErrors.push(err4);
                    }
                    errors++;
                  }
                } else {
                  const err5 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/DocumentListCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                  const err6 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/DocumentListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
                if ("documents.list" !== data2) {
                  const err7 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/DocumentListCommand/properties/op/const", keyword: "const", params: { allowedValue: "documents.list" }, message: "must be equal to constant" };
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
                    const err8 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/DocumentListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
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
                        const err9 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/DocumentListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          const err10 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/DocumentListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
      const err11 = { instancePath, schemaPath: "#/$defs/DocumentListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
    if (!validate23(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
      vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
      errors = vErrors.length;
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
      const _errs15 = errors;
      const _errs16 = errors;
      if (errors === _errs16) {
        if (data && typeof data == "object" && !Array.isArray(data)) {
          let missing1;
          if (data.notebook_id === void 0 && (missing1 = "notebook_id") || data.snapshot_id === void 0 && (missing1 = "snapshot_id") || data.op === void 0 && (missing1 = "op") || data.evidence_id === void 0 && (missing1 = "evidence_id")) {
            const err12 = { instancePath, schemaPath: "#/$defs/DocumentEvidenceCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          } else {
            const _errs18 = errors;
            for (const key1 in data) {
              if (!(key1 === "notebook_id" || key1 === "snapshot_id" || key1 === "op" || key1 === "evidence_id")) {
                const err13 = { instancePath, schemaPath: "#/$defs/DocumentEvidenceCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
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
                      const err14 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                      if (vErrors === null) {
                        vErrors = [err14];
                      } else {
                        vErrors.push(err14);
                      }
                      errors++;
                    }
                  } else {
                    const err15 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err15];
                    } else {
                      vErrors.push(err15);
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
                        const err16 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                        if (vErrors === null) {
                          vErrors = [err16];
                        } else {
                          vErrors.push(err16);
                        }
                        errors++;
                      }
                    } else {
                      const err17 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
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
                      const err18 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                    }
                    if (!(data6 === "documents.evidence" || data6 === "documents.open")) {
                      const err19 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/op/enum", keyword: "enum", params: { allowedValues: schema37.properties.op.enum }, message: "must be equal to one of the allowed values" };
                      if (vErrors === null) {
                        vErrors = [err19];
                      } else {
                        vErrors.push(err19);
                      }
                      errors++;
                    }
                    var valid4 = _errs23 === errors;
                  } else {
                    var valid4 = true;
                  }
                  if (valid4) {
                    if (data.evidence_id !== void 0) {
                      let data7 = data.evidence_id;
                      const _errs25 = errors;
                      if (errors === _errs25) {
                        if (typeof data7 === "string") {
                          if (!pattern6.test(data7)) {
                            const err20 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/evidence_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                            if (vErrors === null) {
                              vErrors = [err20];
                            } else {
                              vErrors.push(err20);
                            }
                            errors++;
                          }
                        } else {
                          const err21 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/$defs/DocumentEvidenceCommand/properties/evidence_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err21];
                          } else {
                            vErrors.push(err21);
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
          const err22 = { instancePath, schemaPath: "#/$defs/DocumentEvidenceCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
          if (vErrors === null) {
            vErrors = [err22];
          } else {
            vErrors.push(err22);
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
            if (data.notebook_id === void 0 && (missing2 = "notebook_id") || data.snapshot_id === void 0 && (missing2 = "snapshot_id") || data.op === void 0 && (missing2 = "op") || data.operation_id === void 0 && (missing2 = "operation_id")) {
              const err23 = { instancePath, schemaPath: "#/$defs/DocumentOperationCommand/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            } else {
              const _errs30 = errors;
              for (const key2 in data) {
                if (!(key2 === "notebook_id" || key2 === "snapshot_id" || key2 === "op" || key2 === "operation_id")) {
                  const err24 = { instancePath, schemaPath: "#/$defs/DocumentOperationCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                  if (vErrors === null) {
                    vErrors = [err24];
                  } else {
                    vErrors.push(err24);
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
                        const err25 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/DocumentOperationCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                        if (vErrors === null) {
                          vErrors = [err25];
                        } else {
                          vErrors.push(err25);
                        }
                        errors++;
                      }
                    } else {
                      const err26 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/DocumentOperationCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err26];
                      } else {
                        vErrors.push(err26);
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
                          const err27 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/DocumentOperationCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                          if (vErrors === null) {
                            vErrors = [err27];
                          } else {
                            vErrors.push(err27);
                          }
                          errors++;
                        }
                      } else {
                        const err28 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/DocumentOperationCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err28];
                        } else {
                          vErrors.push(err28);
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
                        const err29 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/DocumentOperationCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err29];
                        } else {
                          vErrors.push(err29);
                        }
                        errors++;
                      }
                      if (!(data10 === "documents.operation" || data10 === "documents.cancel" || data10 === "documents.preview.read")) {
                        const err30 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/DocumentOperationCommand/properties/op/enum", keyword: "enum", params: { allowedValues: schema38.properties.op.enum }, message: "must be equal to one of the allowed values" };
                        if (vErrors === null) {
                          vErrors = [err30];
                        } else {
                          vErrors.push(err30);
                        }
                        errors++;
                      }
                      var valid6 = _errs35 === errors;
                    } else {
                      var valid6 = true;
                    }
                    if (valid6) {
                      if (data.operation_id !== void 0) {
                        let data11 = data.operation_id;
                        const _errs37 = errors;
                        if (errors === _errs37) {
                          if (typeof data11 === "string") {
                            if (!pattern16.test(data11)) {
                              const err31 = { instancePath: instancePath + "/operation_id", schemaPath: "#/$defs/DocumentOperationCommand/properties/operation_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                              if (vErrors === null) {
                                vErrors = [err31];
                              } else {
                                vErrors.push(err31);
                              }
                              errors++;
                            }
                          } else {
                            const err32 = { instancePath: instancePath + "/operation_id", schemaPath: "#/$defs/DocumentOperationCommand/properties/operation_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err32];
                            } else {
                              vErrors.push(err32);
                            }
                            errors++;
                          }
                        }
                        var valid6 = _errs37 === errors;
                      } else {
                        var valid6 = true;
                      }
                    }
                  }
                }
              }
            }
          } else {
            const err33 = { instancePath, schemaPath: "#/$defs/DocumentOperationCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
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
          const _errs39 = errors;
          if (!validate25(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs39 === errors;
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
          }
        }
      }
    }
  }
  if (!valid0) {
    const err34 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err34];
    } else {
      vErrors.push(err34);
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
  validate_document_command_generated_default as default,
  validate
};
