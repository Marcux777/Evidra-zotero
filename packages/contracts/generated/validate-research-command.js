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

// validate-research-command.generated.js
var validate = validate20;
var validate_research_command_generated_default = validate20;
var schema32 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["research.protocols", "research.runs", "research.notes.list"], "title": "Op", "type": "string" }, "offset": { "maximum": 1e6, "minimum": 0, "title": "Offset", "type": "integer" } }, "required": ["notebook_id", "snapshot_id", "op", "offset"], "title": "ResearchListCommand", "type": "object" };
var schema43 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["research.run", "research.preview"], "title": "Op", "type": "string" }, "run_id": { "pattern": "^[a-f0-9]{32}$", "title": "Run Id", "type": "string" } }, "required": ["notebook_id", "snapshot_id", "op", "run_id"], "title": "ResearchRunCommand", "type": "object" };
var pattern4 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern5 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
var pattern10 = new RegExp("^[a-f0-9]{32}$", "u");
var schema34 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "question": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Question", "type": "string" }, "objective": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Objective", "type": "string" }, "review_type": { "enum": ["EXPLORATORY", "SYSTEMATIC"], "title": "Review Type", "type": "string" }, "form_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Form Version Id", "type": "string" }, "criteria": { "items": { "$ref": "#/$defs/Criterion" }, "maxItems": 30, "minItems": 1, "title": "Criteria", "type": "array" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" } }, "required": ["idempotency_key", "question", "objective", "review_type", "form_version_id", "criteria", "expected_revision"], "title": "ProtocolWrite", "type": "object" };
var schema35 = { "additionalProperties": false, "properties": { "id": { "pattern": "^[a-z][a-z0-9_]{0,63}$", "title": "Id", "type": "string" }, "text": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Text", "type": "string" }, "kind": { "enum": ["INCLUSION", "EXCLUSION"], "title": "Kind", "type": "string" }, "applicability": { "enum": ["TITLE_ABSTRACT", "FULL_TEXT", "BOTH"], "title": "Applicability", "type": "string" } }, "required": ["id", "text", "kind", "applicability"], "title": "Criterion", "type": "object" };
var func1 = require_ucs2length().default;
var pattern8 = new RegExp("\\S", "u");
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
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.question === void 0 && (missing0 = "question") || data.objective === void 0 && (missing0 = "objective") || data.review_type === void 0 && (missing0 = "review_type") || data.form_version_id === void 0 && (missing0 = "form_version_id") || data.criteria === void 0 && (missing0 = "criteria") || data.expected_revision === void 0 && (missing0 = "expected_revision")) {
        validate22.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "idempotency_key" || key0 === "question" || key0 === "objective" || key0 === "review_type" || key0 === "form_version_id" || key0 === "criteria" || key0 === "expected_revision")) {
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
            if (data.question !== void 0) {
              let data1 = data.question;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (func1(data1) > 2e3) {
                    validate22.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                    return false;
                  } else {
                    if (func1(data1) < 1) {
                      validate22.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                      return false;
                    } else {
                      if (!pattern8.test(data1)) {
                        validate22.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                        return false;
                      }
                    }
                  }
                } else {
                  validate22.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.objective !== void 0) {
                let data2 = data.objective;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 2e3) {
                      validate22.errors = [{ instancePath: instancePath + "/objective", schemaPath: "#/properties/objective/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate22.errors = [{ instancePath: instancePath + "/objective", schemaPath: "#/properties/objective/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      } else {
                        if (!pattern8.test(data2)) {
                          validate22.errors = [{ instancePath: instancePath + "/objective", schemaPath: "#/properties/objective/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                          return false;
                        }
                      }
                    }
                  } else {
                    validate22.errors = [{ instancePath: instancePath + "/objective", schemaPath: "#/properties/objective/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.review_type !== void 0) {
                  let data3 = data.review_type;
                  const _errs8 = errors;
                  if (typeof data3 !== "string") {
                    validate22.errors = [{ instancePath: instancePath + "/review_type", schemaPath: "#/properties/review_type/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  if (!(data3 === "EXPLORATORY" || data3 === "SYSTEMATIC")) {
                    validate22.errors = [{ instancePath: instancePath + "/review_type", schemaPath: "#/properties/review_type/enum", keyword: "enum", params: { allowedValues: schema34.properties.review_type.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.form_version_id !== void 0) {
                    let data4 = data.form_version_id;
                    const _errs10 = errors;
                    if (errors === _errs10) {
                      if (typeof data4 === "string") {
                        if (!pattern10.test(data4)) {
                          validate22.errors = [{ instancePath: instancePath + "/form_version_id", schemaPath: "#/properties/form_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                          return false;
                        }
                      } else {
                        validate22.errors = [{ instancePath: instancePath + "/form_version_id", schemaPath: "#/properties/form_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.criteria !== void 0) {
                      let data5 = data.criteria;
                      const _errs12 = errors;
                      if (errors === _errs12) {
                        if (Array.isArray(data5)) {
                          if (data5.length > 30) {
                            validate22.errors = [{ instancePath: instancePath + "/criteria", schemaPath: "#/properties/criteria/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                            return false;
                          } else {
                            if (data5.length < 1) {
                              validate22.errors = [{ instancePath: instancePath + "/criteria", schemaPath: "#/properties/criteria/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                              return false;
                            } else {
                              var valid1 = true;
                              const len0 = data5.length;
                              for (let i0 = 0; i0 < len0; i0++) {
                                let data6 = data5[i0];
                                const _errs14 = errors;
                                const _errs15 = errors;
                                if (errors === _errs15) {
                                  if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
                                    let missing1;
                                    if (data6.id === void 0 && (missing1 = "id") || data6.text === void 0 && (missing1 = "text") || data6.kind === void 0 && (missing1 = "kind") || data6.applicability === void 0 && (missing1 = "applicability")) {
                                      validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0, schemaPath: "#/$defs/Criterion/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                                      return false;
                                    } else {
                                      const _errs17 = errors;
                                      for (const key1 in data6) {
                                        if (!(key1 === "id" || key1 === "text" || key1 === "kind" || key1 === "applicability")) {
                                          validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0, schemaPath: "#/$defs/Criterion/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                                          return false;
                                          break;
                                        }
                                      }
                                      if (_errs17 === errors) {
                                        if (data6.id !== void 0) {
                                          let data7 = data6.id;
                                          const _errs18 = errors;
                                          if (errors === _errs18) {
                                            if (typeof data7 === "string") {
                                              if (!pattern11.test(data7)) {
                                                validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/id", schemaPath: "#/$defs/Criterion/properties/id/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' }];
                                                return false;
                                              }
                                            } else {
                                              validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/id", schemaPath: "#/$defs/Criterion/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                              return false;
                                            }
                                          }
                                          var valid3 = _errs18 === errors;
                                        } else {
                                          var valid3 = true;
                                        }
                                        if (valid3) {
                                          if (data6.text !== void 0) {
                                            let data8 = data6.text;
                                            const _errs20 = errors;
                                            if (errors === _errs20) {
                                              if (typeof data8 === "string") {
                                                if (func1(data8) > 2e3) {
                                                  validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/text", schemaPath: "#/$defs/Criterion/properties/text/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                  return false;
                                                } else {
                                                  if (func1(data8) < 1) {
                                                    validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/text", schemaPath: "#/$defs/Criterion/properties/text/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                    return false;
                                                  } else {
                                                    if (!pattern8.test(data8)) {
                                                      validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/text", schemaPath: "#/$defs/Criterion/properties/text/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                      return false;
                                                    }
                                                  }
                                                }
                                              } else {
                                                validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/text", schemaPath: "#/$defs/Criterion/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                            }
                                            var valid3 = _errs20 === errors;
                                          } else {
                                            var valid3 = true;
                                          }
                                          if (valid3) {
                                            if (data6.kind !== void 0) {
                                              let data9 = data6.kind;
                                              const _errs22 = errors;
                                              if (typeof data9 !== "string") {
                                                validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/kind", schemaPath: "#/$defs/Criterion/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                              if (!(data9 === "INCLUSION" || data9 === "EXCLUSION")) {
                                                validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/kind", schemaPath: "#/$defs/Criterion/properties/kind/enum", keyword: "enum", params: { allowedValues: schema35.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                                                return false;
                                              }
                                              var valid3 = _errs22 === errors;
                                            } else {
                                              var valid3 = true;
                                            }
                                            if (valid3) {
                                              if (data6.applicability !== void 0) {
                                                let data10 = data6.applicability;
                                                const _errs24 = errors;
                                                if (typeof data10 !== "string") {
                                                  validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/applicability", schemaPath: "#/$defs/Criterion/properties/applicability/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                  return false;
                                                }
                                                if (!(data10 === "TITLE_ABSTRACT" || data10 === "FULL_TEXT" || data10 === "BOTH")) {
                                                  validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0 + "/applicability", schemaPath: "#/$defs/Criterion/properties/applicability/enum", keyword: "enum", params: { allowedValues: schema35.properties.applicability.enum }, message: "must be equal to one of the allowed values" }];
                                                  return false;
                                                }
                                                var valid3 = _errs24 === errors;
                                              } else {
                                                var valid3 = true;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  } else {
                                    validate22.errors = [{ instancePath: instancePath + "/criteria/" + i0, schemaPath: "#/$defs/Criterion/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                    return false;
                                  }
                                }
                                var valid1 = _errs14 === errors;
                                if (!valid1) {
                                  break;
                                }
                              }
                            }
                          }
                        } else {
                          validate22.errors = [{ instancePath: instancePath + "/criteria", schemaPath: "#/properties/criteria/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                          return false;
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.expected_revision !== void 0) {
                        let data11 = data.expected_revision;
                        const _errs26 = errors;
                        if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)) && isFinite(data11))) {
                          validate22.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                          return false;
                        }
                        if (errors === _errs26) {
                          if (typeof data11 == "number" && isFinite(data11)) {
                            if (data11 < 0 || isNaN(data11)) {
                              validate22.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                              return false;
                            }
                          }
                        }
                        var valid0 = _errs26 === errors;
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
                if ("research.protocol.write" !== data2) {
                  validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.protocol.write" }, message: "must be equal to constant" }];
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
var schema39 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "protocol_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Protocol Version Id", "type": "string" }, "source_id": { "pattern": "^[a-f0-9]{64}$", "title": "Source Id", "type": "string" }, "stage": { "enum": ["TITLE_ABSTRACT", "FULL_TEXT"], "title": "Stage", "type": "string" }, "reviewer": { "maxLength": 100, "minLength": 1, "pattern": "\\S", "title": "Reviewer", "type": "string" }, "decision": { "enum": ["INCLUDE", "EXCLUDE", "UNCERTAIN"], "title": "Decision", "type": "string" }, "criterion_ids": { "items": { "pattern": "^[a-z][a-z0-9_]{0,63}$", "type": "string" }, "maxItems": 30, "minItems": 1, "title": "Criterion Ids", "type": "array" }, "rationale": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Rationale", "type": "string" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" } }, "required": ["idempotency_key", "protocol_version_id", "source_id", "stage", "reviewer", "decision", "criterion_ids", "rationale", "expected_revision"], "title": "ScreeningWrite", "type": "object" };
var pattern22 = new RegExp("^[a-f0-9]{64}$", "u");
var func9 = Object.prototype.hasOwnProperty;
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
                if ("research.screening.decide" !== data2) {
                  validate25.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.screening.decide" }, message: "must be equal to constant" }];
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
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key") || data3.protocol_version_id === void 0 && (missing1 = "protocol_version_id") || data3.source_id === void 0 && (missing1 = "source_id") || data3.stage === void 0 && (missing1 = "stage") || data3.reviewer === void 0 && (missing1 = "reviewer") || data3.decision === void 0 && (missing1 = "decision") || data3.criterion_ids === void 0 && (missing1 = "criterion_ids") || data3.rationale === void 0 && (missing1 = "rationale") || data3.expected_revision === void 0 && (missing1 = "expected_revision")) {
                        validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ScreeningWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!func9.call(schema39.properties, key1)) {
                            validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ScreeningWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ScreeningWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ScreeningWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate25.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ScreeningWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.protocol_version_id !== void 0) {
                              let data5 = data3.protocol_version_id;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (!pattern10.test(data5)) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/protocol_version_id", schemaPath: "#/$defs/ScreeningWrite/properties/protocol_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate25.errors = [{ instancePath: instancePath + "/request/protocol_version_id", schemaPath: "#/$defs/ScreeningWrite/properties/protocol_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
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
                                if (errors === _errs16) {
                                  if (typeof data6 === "string") {
                                    if (!pattern22.test(data6)) {
                                      validate25.errors = [{ instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/ScreeningWrite/properties/source_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                      return false;
                                    }
                                  } else {
                                    validate25.errors = [{ instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/ScreeningWrite/properties/source_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.stage !== void 0) {
                                  let data7 = data3.stage;
                                  const _errs18 = errors;
                                  if (typeof data7 !== "string") {
                                    validate25.errors = [{ instancePath: instancePath + "/request/stage", schemaPath: "#/$defs/ScreeningWrite/properties/stage/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                  if (!(data7 === "TITLE_ABSTRACT" || data7 === "FULL_TEXT")) {
                                    validate25.errors = [{ instancePath: instancePath + "/request/stage", schemaPath: "#/$defs/ScreeningWrite/properties/stage/enum", keyword: "enum", params: { allowedValues: schema39.properties.stage.enum }, message: "must be equal to one of the allowed values" }];
                                    return false;
                                  }
                                  var valid2 = _errs18 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data3.reviewer !== void 0) {
                                    let data8 = data3.reviewer;
                                    const _errs20 = errors;
                                    if (errors === _errs20) {
                                      if (typeof data8 === "string") {
                                        if (func1(data8) > 100) {
                                          validate25.errors = [{ instancePath: instancePath + "/request/reviewer", schemaPath: "#/$defs/ScreeningWrite/properties/reviewer/maxLength", keyword: "maxLength", params: { limit: 100 }, message: "must NOT have more than 100 characters" }];
                                          return false;
                                        } else {
                                          if (func1(data8) < 1) {
                                            validate25.errors = [{ instancePath: instancePath + "/request/reviewer", schemaPath: "#/$defs/ScreeningWrite/properties/reviewer/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                            return false;
                                          } else {
                                            if (!pattern8.test(data8)) {
                                              validate25.errors = [{ instancePath: instancePath + "/request/reviewer", schemaPath: "#/$defs/ScreeningWrite/properties/reviewer/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                              return false;
                                            }
                                          }
                                        }
                                      } else {
                                        validate25.errors = [{ instancePath: instancePath + "/request/reviewer", schemaPath: "#/$defs/ScreeningWrite/properties/reviewer/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                        return false;
                                      }
                                    }
                                    var valid2 = _errs20 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                  if (valid2) {
                                    if (data3.decision !== void 0) {
                                      let data9 = data3.decision;
                                      const _errs22 = errors;
                                      if (typeof data9 !== "string") {
                                        validate25.errors = [{ instancePath: instancePath + "/request/decision", schemaPath: "#/$defs/ScreeningWrite/properties/decision/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                        return false;
                                      }
                                      if (!(data9 === "INCLUDE" || data9 === "EXCLUDE" || data9 === "UNCERTAIN")) {
                                        validate25.errors = [{ instancePath: instancePath + "/request/decision", schemaPath: "#/$defs/ScreeningWrite/properties/decision/enum", keyword: "enum", params: { allowedValues: schema39.properties.decision.enum }, message: "must be equal to one of the allowed values" }];
                                        return false;
                                      }
                                      var valid2 = _errs22 === errors;
                                    } else {
                                      var valid2 = true;
                                    }
                                    if (valid2) {
                                      if (data3.criterion_ids !== void 0) {
                                        let data10 = data3.criterion_ids;
                                        const _errs24 = errors;
                                        if (errors === _errs24) {
                                          if (Array.isArray(data10)) {
                                            if (data10.length > 30) {
                                              validate25.errors = [{ instancePath: instancePath + "/request/criterion_ids", schemaPath: "#/$defs/ScreeningWrite/properties/criterion_ids/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                                              return false;
                                            } else {
                                              if (data10.length < 1) {
                                                validate25.errors = [{ instancePath: instancePath + "/request/criterion_ids", schemaPath: "#/$defs/ScreeningWrite/properties/criterion_ids/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                                                return false;
                                              } else {
                                                var valid3 = true;
                                                const len0 = data10.length;
                                                for (let i0 = 0; i0 < len0; i0++) {
                                                  let data11 = data10[i0];
                                                  const _errs26 = errors;
                                                  if (errors === _errs26) {
                                                    if (typeof data11 === "string") {
                                                      if (!pattern11.test(data11)) {
                                                        validate25.errors = [{ instancePath: instancePath + "/request/criterion_ids/" + i0, schemaPath: "#/$defs/ScreeningWrite/properties/criterion_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' }];
                                                        return false;
                                                      }
                                                    } else {
                                                      validate25.errors = [{ instancePath: instancePath + "/request/criterion_ids/" + i0, schemaPath: "#/$defs/ScreeningWrite/properties/criterion_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                      return false;
                                                    }
                                                  }
                                                  var valid3 = _errs26 === errors;
                                                  if (!valid3) {
                                                    break;
                                                  }
                                                }
                                              }
                                            }
                                          } else {
                                            validate25.errors = [{ instancePath: instancePath + "/request/criterion_ids", schemaPath: "#/$defs/ScreeningWrite/properties/criterion_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                            return false;
                                          }
                                        }
                                        var valid2 = _errs24 === errors;
                                      } else {
                                        var valid2 = true;
                                      }
                                      if (valid2) {
                                        if (data3.rationale !== void 0) {
                                          let data12 = data3.rationale;
                                          const _errs28 = errors;
                                          if (errors === _errs28) {
                                            if (typeof data12 === "string") {
                                              if (func1(data12) > 2e3) {
                                                validate25.errors = [{ instancePath: instancePath + "/request/rationale", schemaPath: "#/$defs/ScreeningWrite/properties/rationale/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                return false;
                                              } else {
                                                if (func1(data12) < 1) {
                                                  validate25.errors = [{ instancePath: instancePath + "/request/rationale", schemaPath: "#/$defs/ScreeningWrite/properties/rationale/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                  return false;
                                                } else {
                                                  if (!pattern8.test(data12)) {
                                                    validate25.errors = [{ instancePath: instancePath + "/request/rationale", schemaPath: "#/$defs/ScreeningWrite/properties/rationale/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                    return false;
                                                  }
                                                }
                                              }
                                            } else {
                                              validate25.errors = [{ instancePath: instancePath + "/request/rationale", schemaPath: "#/$defs/ScreeningWrite/properties/rationale/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                              return false;
                                            }
                                          }
                                          var valid2 = _errs28 === errors;
                                        } else {
                                          var valid2 = true;
                                        }
                                        if (valid2) {
                                          if (data3.expected_revision !== void 0) {
                                            let data13 = data3.expected_revision;
                                            const _errs30 = errors;
                                            if (!(typeof data13 == "number" && (!(data13 % 1) && !isNaN(data13)) && isFinite(data13))) {
                                              validate25.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ScreeningWrite/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                              return false;
                                            }
                                            if (errors === _errs30) {
                                              if (typeof data13 == "number" && isFinite(data13)) {
                                                if (data13 < 0 || isNaN(data13)) {
                                                  validate25.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ScreeningWrite/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                                  return false;
                                                }
                                              }
                                            }
                                            var valid2 = _errs30 === errors;
                                          } else {
                                            var valid2 = true;
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
                      validate25.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ScreeningWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
var schema41 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "kind": { "enum": ["SCREENING", "SYNTHESIS", "AUDIT"], "title": "Kind", "type": "string" }, "protocol_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Protocol Version Id", "type": "string" }, "profile_id": { "pattern": "^[a-zA-Z0-9_-]{1,100}$", "title": "Profile Id", "type": "string" }, "source_id": { "anyOf": [{ "pattern": "^[a-f0-9]{64}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Source Id" }, "stage": { "anyOf": [{ "enum": ["TITLE_ABSTRACT", "FULL_TEXT"], "type": "string" }, { "type": "null" }], "default": null, "title": "Stage" }, "question": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Question", "type": "string" }, "pasted_text": { "default": "", "maxLength": 12e3, "title": "Pasted Text", "type": "string" }, "retrieval_query": { "default": "", "maxLength": 2e3, "title": "Retrieval Query", "type": "string" }, "include_unreviewed": { "default": false, "title": "Include Unreviewed", "type": "boolean" }, "context_tokens": { "default": 32768, "maximum": 1e6, "minimum": 1024, "title": "Context Tokens", "type": "integer" }, "max_output_tokens": { "default": 4096, "maximum": 32768, "minimum": 1, "title": "Max Output Tokens", "type": "integer" }, "ollama_options": { "anyOf": [{ "$ref": "#/$defs/OllamaOptions" }, { "type": "null" }], "default": null } }, "required": ["idempotency_key", "kind", "protocol_version_id", "profile_id", "question"], "title": "ResearchPrepare", "type": "object" };
var pattern29 = new RegExp("^[a-zA-Z0-9_-]{1,100}$", "u");
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
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.kind === void 0 && (missing0 = "kind") || data.protocol_version_id === void 0 && (missing0 = "protocol_version_id") || data.profile_id === void 0 && (missing0 = "profile_id") || data.question === void 0 && (missing0 = "question")) {
        validate28.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func9.call(schema41.properties, key0)) {
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
            if (data.kind !== void 0) {
              let data1 = data.kind;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate28.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "SCREENING" || data1 === "SYNTHESIS" || data1 === "AUDIT")) {
                validate28.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/enum", keyword: "enum", params: { allowedValues: schema41.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.protocol_version_id !== void 0) {
                let data2 = data.protocol_version_id;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (!pattern10.test(data2)) {
                      validate28.errors = [{ instancePath: instancePath + "/protocol_version_id", schemaPath: "#/properties/protocol_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                      return false;
                    }
                  } else {
                    validate28.errors = [{ instancePath: instancePath + "/protocol_version_id", schemaPath: "#/properties/protocol_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.profile_id !== void 0) {
                  let data3 = data.profile_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern29.test(data3)) {
                        validate28.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                        return false;
                      }
                    } else {
                      validate28.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.source_id !== void 0) {
                    let data4 = data.source_id;
                    const _errs10 = errors;
                    const _errs11 = errors;
                    let valid1 = false;
                    const _errs12 = errors;
                    if (errors === _errs12) {
                      if (typeof data4 === "string") {
                        if (!pattern22.test(data4)) {
                          const err0 = { instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                          if (vErrors === null) {
                            vErrors = [err0];
                          } else {
                            vErrors.push(err0);
                          }
                          errors++;
                        }
                      } else {
                        const err1 = { instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err1];
                        } else {
                          vErrors.push(err1);
                        }
                        errors++;
                      }
                    }
                    var _valid0 = _errs12 === errors;
                    valid1 = valid1 || _valid0;
                    const _errs14 = errors;
                    if (data4 !== null) {
                      const err2 = { instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                      if (vErrors === null) {
                        vErrors = [err2];
                      } else {
                        vErrors.push(err2);
                      }
                      errors++;
                    }
                    var _valid0 = _errs14 === errors;
                    valid1 = valid1 || _valid0;
                    if (!valid1) {
                      const err3 = { instancePath: instancePath + "/source_id", schemaPath: "#/properties/source_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                      if (vErrors === null) {
                        vErrors = [err3];
                      } else {
                        vErrors.push(err3);
                      }
                      errors++;
                      validate28.errors = vErrors;
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
                    if (data.stage !== void 0) {
                      let data5 = data.stage;
                      const _errs16 = errors;
                      const _errs17 = errors;
                      let valid2 = false;
                      const _errs18 = errors;
                      if (typeof data5 !== "string") {
                        const err4 = { instancePath: instancePath + "/stage", schemaPath: "#/properties/stage/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err4];
                        } else {
                          vErrors.push(err4);
                        }
                        errors++;
                      }
                      if (!(data5 === "TITLE_ABSTRACT" || data5 === "FULL_TEXT")) {
                        const err5 = { instancePath: instancePath + "/stage", schemaPath: "#/properties/stage/anyOf/0/enum", keyword: "enum", params: { allowedValues: schema41.properties.stage.anyOf[0].enum }, message: "must be equal to one of the allowed values" };
                        if (vErrors === null) {
                          vErrors = [err5];
                        } else {
                          vErrors.push(err5);
                        }
                        errors++;
                      }
                      var _valid1 = _errs18 === errors;
                      valid2 = valid2 || _valid1;
                      const _errs20 = errors;
                      if (data5 !== null) {
                        const err6 = { instancePath: instancePath + "/stage", schemaPath: "#/properties/stage/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                        if (vErrors === null) {
                          vErrors = [err6];
                        } else {
                          vErrors.push(err6);
                        }
                        errors++;
                      }
                      var _valid1 = _errs20 === errors;
                      valid2 = valid2 || _valid1;
                      if (!valid2) {
                        const err7 = { instancePath: instancePath + "/stage", schemaPath: "#/properties/stage/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                        if (vErrors === null) {
                          vErrors = [err7];
                        } else {
                          vErrors.push(err7);
                        }
                        errors++;
                        validate28.errors = vErrors;
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
                      var valid0 = _errs16 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.question !== void 0) {
                        let data6 = data.question;
                        const _errs22 = errors;
                        if (errors === _errs22) {
                          if (typeof data6 === "string") {
                            if (func1(data6) > 2e3) {
                              validate28.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                              return false;
                            } else {
                              if (func1(data6) < 1) {
                                validate28.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                return false;
                              } else {
                                if (!pattern8.test(data6)) {
                                  validate28.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                  return false;
                                }
                              }
                            }
                          } else {
                            validate28.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid0 = _errs22 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.pasted_text !== void 0) {
                          let data7 = data.pasted_text;
                          const _errs24 = errors;
                          if (errors === _errs24) {
                            if (typeof data7 === "string") {
                              if (func1(data7) > 12e3) {
                                validate28.errors = [{ instancePath: instancePath + "/pasted_text", schemaPath: "#/properties/pasted_text/maxLength", keyword: "maxLength", params: { limit: 12e3 }, message: "must NOT have more than 12000 characters" }];
                                return false;
                              }
                            } else {
                              validate28.errors = [{ instancePath: instancePath + "/pasted_text", schemaPath: "#/properties/pasted_text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                          var valid0 = _errs24 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.retrieval_query !== void 0) {
                            let data8 = data.retrieval_query;
                            const _errs26 = errors;
                            if (errors === _errs26) {
                              if (typeof data8 === "string") {
                                if (func1(data8) > 2e3) {
                                  validate28.errors = [{ instancePath: instancePath + "/retrieval_query", schemaPath: "#/properties/retrieval_query/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                  return false;
                                }
                              } else {
                                validate28.errors = [{ instancePath: instancePath + "/retrieval_query", schemaPath: "#/properties/retrieval_query/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid0 = _errs26 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.include_unreviewed !== void 0) {
                              const _errs28 = errors;
                              if (typeof data.include_unreviewed !== "boolean") {
                                validate28.errors = [{ instancePath: instancePath + "/include_unreviewed", schemaPath: "#/properties/include_unreviewed/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                return false;
                              }
                              var valid0 = _errs28 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.context_tokens !== void 0) {
                                let data10 = data.context_tokens;
                                const _errs30 = errors;
                                if (!(typeof data10 == "number" && (!(data10 % 1) && !isNaN(data10)) && isFinite(data10))) {
                                  validate28.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                  return false;
                                }
                                if (errors === _errs30) {
                                  if (typeof data10 == "number" && isFinite(data10)) {
                                    if (data10 > 1e6 || isNaN(data10)) {
                                      validate28.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" }];
                                      return false;
                                    } else {
                                      if (data10 < 1024 || isNaN(data10)) {
                                        validate28.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1024 }, message: "must be >= 1024" }];
                                        return false;
                                      }
                                    }
                                  }
                                }
                                var valid0 = _errs30 === errors;
                              } else {
                                var valid0 = true;
                              }
                              if (valid0) {
                                if (data.max_output_tokens !== void 0) {
                                  let data11 = data.max_output_tokens;
                                  const _errs32 = errors;
                                  if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)) && isFinite(data11))) {
                                    validate28.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs32) {
                                    if (typeof data11 == "number" && isFinite(data11)) {
                                      if (data11 > 32768 || isNaN(data11)) {
                                        validate28.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/maximum", keyword: "maximum", params: { comparison: "<=", limit: 32768 }, message: "must be <= 32768" }];
                                        return false;
                                      } else {
                                        if (data11 < 1 || isNaN(data11)) {
                                          validate28.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                          return false;
                                        }
                                      }
                                    }
                                  }
                                  var valid0 = _errs32 === errors;
                                } else {
                                  var valid0 = true;
                                }
                                if (valid0) {
                                  if (data.ollama_options !== void 0) {
                                    let data12 = data.ollama_options;
                                    const _errs34 = errors;
                                    const _errs35 = errors;
                                    let valid3 = false;
                                    const _errs36 = errors;
                                    const _errs37 = errors;
                                    if (errors === _errs37) {
                                      if (data12 && typeof data12 == "object" && !Array.isArray(data12)) {
                                        const _errs39 = errors;
                                        for (const key1 in data12) {
                                          if (!(key1 === "num_ctx" || key1 === "temperature" || key1 === "seed" || key1 === "think")) {
                                            const err8 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/$defs/OllamaOptions/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                                            if (vErrors === null) {
                                              vErrors = [err8];
                                            } else {
                                              vErrors.push(err8);
                                            }
                                            errors++;
                                            break;
                                          }
                                        }
                                        if (_errs39 === errors) {
                                          if (data12.num_ctx !== void 0) {
                                            let data13 = data12.num_ctx;
                                            const _errs40 = errors;
                                            const _errs41 = errors;
                                            let valid6 = false;
                                            const _errs42 = errors;
                                            if (!(typeof data13 == "number" && (!(data13 % 1) && !isNaN(data13)) && isFinite(data13))) {
                                              const err9 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                              if (vErrors === null) {
                                                vErrors = [err9];
                                              } else {
                                                vErrors.push(err9);
                                              }
                                              errors++;
                                            }
                                            if (errors === _errs42) {
                                              if (typeof data13 == "number" && isFinite(data13)) {
                                                if (data13 <= 0 || isNaN(data13)) {
                                                  const err10 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/0/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
                                                  if (vErrors === null) {
                                                    vErrors = [err10];
                                                  } else {
                                                    vErrors.push(err10);
                                                  }
                                                  errors++;
                                                }
                                              }
                                            }
                                            var _valid3 = _errs42 === errors;
                                            valid6 = valid6 || _valid3;
                                            const _errs44 = errors;
                                            if (data13 !== null) {
                                              const err11 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                              if (vErrors === null) {
                                                vErrors = [err11];
                                              } else {
                                                vErrors.push(err11);
                                              }
                                              errors++;
                                            }
                                            var _valid3 = _errs44 === errors;
                                            valid6 = valid6 || _valid3;
                                            if (!valid6) {
                                              const err12 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                              if (vErrors === null) {
                                                vErrors = [err12];
                                              } else {
                                                vErrors.push(err12);
                                              }
                                              errors++;
                                            } else {
                                              errors = _errs41;
                                              if (vErrors !== null) {
                                                if (_errs41) {
                                                  vErrors.length = _errs41;
                                                } else {
                                                  vErrors = null;
                                                }
                                              }
                                            }
                                            var valid5 = _errs40 === errors;
                                          } else {
                                            var valid5 = true;
                                          }
                                          if (valid5) {
                                            if (data12.temperature !== void 0) {
                                              let data14 = data12.temperature;
                                              const _errs46 = errors;
                                              const _errs47 = errors;
                                              let valid7 = false;
                                              const _errs48 = errors;
                                              if (errors === _errs48) {
                                                if (typeof data14 == "number" && isFinite(data14)) {
                                                  if (data14 > 2 || isNaN(data14)) {
                                                    const err13 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2 }, message: "must be <= 2" };
                                                    if (vErrors === null) {
                                                      vErrors = [err13];
                                                    } else {
                                                      vErrors.push(err13);
                                                    }
                                                    errors++;
                                                  } else {
                                                    if (data14 < 0 || isNaN(data14)) {
                                                      const err14 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                                      if (vErrors === null) {
                                                        vErrors = [err14];
                                                      } else {
                                                        vErrors.push(err14);
                                                      }
                                                      errors++;
                                                    }
                                                  }
                                                } else {
                                                  const err15 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                                  if (vErrors === null) {
                                                    vErrors = [err15];
                                                  } else {
                                                    vErrors.push(err15);
                                                  }
                                                  errors++;
                                                }
                                              }
                                              var _valid4 = _errs48 === errors;
                                              valid7 = valid7 || _valid4;
                                              const _errs50 = errors;
                                              if (data14 !== null) {
                                                const err16 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                                if (vErrors === null) {
                                                  vErrors = [err16];
                                                } else {
                                                  vErrors.push(err16);
                                                }
                                                errors++;
                                              }
                                              var _valid4 = _errs50 === errors;
                                              valid7 = valid7 || _valid4;
                                              if (!valid7) {
                                                const err17 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                                if (vErrors === null) {
                                                  vErrors = [err17];
                                                } else {
                                                  vErrors.push(err17);
                                                }
                                                errors++;
                                              } else {
                                                errors = _errs47;
                                                if (vErrors !== null) {
                                                  if (_errs47) {
                                                    vErrors.length = _errs47;
                                                  } else {
                                                    vErrors = null;
                                                  }
                                                }
                                              }
                                              var valid5 = _errs46 === errors;
                                            } else {
                                              var valid5 = true;
                                            }
                                            if (valid5) {
                                              if (data12.seed !== void 0) {
                                                let data15 = data12.seed;
                                                const _errs52 = errors;
                                                const _errs53 = errors;
                                                let valid8 = false;
                                                const _errs54 = errors;
                                                if (!(typeof data15 == "number" && (!(data15 % 1) && !isNaN(data15)) && isFinite(data15))) {
                                                  const err18 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                                  if (vErrors === null) {
                                                    vErrors = [err18];
                                                  } else {
                                                    vErrors.push(err18);
                                                  }
                                                  errors++;
                                                }
                                                var _valid5 = _errs54 === errors;
                                                valid8 = valid8 || _valid5;
                                                const _errs56 = errors;
                                                if (data15 !== null) {
                                                  const err19 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                                  if (vErrors === null) {
                                                    vErrors = [err19];
                                                  } else {
                                                    vErrors.push(err19);
                                                  }
                                                  errors++;
                                                }
                                                var _valid5 = _errs56 === errors;
                                                valid8 = valid8 || _valid5;
                                                if (!valid8) {
                                                  const err20 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                                  if (vErrors === null) {
                                                    vErrors = [err20];
                                                  } else {
                                                    vErrors.push(err20);
                                                  }
                                                  errors++;
                                                } else {
                                                  errors = _errs53;
                                                  if (vErrors !== null) {
                                                    if (_errs53) {
                                                      vErrors.length = _errs53;
                                                    } else {
                                                      vErrors = null;
                                                    }
                                                  }
                                                }
                                                var valid5 = _errs52 === errors;
                                              } else {
                                                var valid5 = true;
                                              }
                                              if (valid5) {
                                                if (data12.think !== void 0) {
                                                  let data16 = data12.think;
                                                  const _errs58 = errors;
                                                  const _errs59 = errors;
                                                  let valid9 = false;
                                                  const _errs60 = errors;
                                                  if (typeof data16 !== "boolean") {
                                                    const err21 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf/0/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                                                    if (vErrors === null) {
                                                      vErrors = [err21];
                                                    } else {
                                                      vErrors.push(err21);
                                                    }
                                                    errors++;
                                                  }
                                                  var _valid6 = _errs60 === errors;
                                                  valid9 = valid9 || _valid6;
                                                  const _errs62 = errors;
                                                  if (data16 !== null) {
                                                    const err22 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                                    if (vErrors === null) {
                                                      vErrors = [err22];
                                                    } else {
                                                      vErrors.push(err22);
                                                    }
                                                    errors++;
                                                  }
                                                  var _valid6 = _errs62 === errors;
                                                  valid9 = valid9 || _valid6;
                                                  if (!valid9) {
                                                    const err23 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                                    if (vErrors === null) {
                                                      vErrors = [err23];
                                                    } else {
                                                      vErrors.push(err23);
                                                    }
                                                    errors++;
                                                  } else {
                                                    errors = _errs59;
                                                    if (vErrors !== null) {
                                                      if (_errs59) {
                                                        vErrors.length = _errs59;
                                                      } else {
                                                        vErrors = null;
                                                      }
                                                    }
                                                  }
                                                  var valid5 = _errs58 === errors;
                                                } else {
                                                  var valid5 = true;
                                                }
                                              }
                                            }
                                          }
                                        }
                                      } else {
                                        const err24 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/$defs/OllamaOptions/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                                        if (vErrors === null) {
                                          vErrors = [err24];
                                        } else {
                                          vErrors.push(err24);
                                        }
                                        errors++;
                                      }
                                    }
                                    var _valid2 = _errs36 === errors;
                                    valid3 = valid3 || _valid2;
                                    const _errs64 = errors;
                                    if (data12 !== null) {
                                      const err25 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/properties/ollama_options/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                      if (vErrors === null) {
                                        vErrors = [err25];
                                      } else {
                                        vErrors.push(err25);
                                      }
                                      errors++;
                                    }
                                    var _valid2 = _errs64 === errors;
                                    valid3 = valid3 || _valid2;
                                    if (!valid3) {
                                      const err26 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/properties/ollama_options/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err26];
                                      } else {
                                        vErrors.push(err26);
                                      }
                                      errors++;
                                      validate28.errors = vErrors;
                                      return false;
                                    } else {
                                      errors = _errs35;
                                      if (vErrors !== null) {
                                        if (_errs35) {
                                          vErrors.length = _errs35;
                                        } else {
                                          vErrors = null;
                                        }
                                      }
                                    }
                                    var valid0 = _errs34 === errors;
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
                if ("research.prepare" !== data2) {
                  validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.prepare" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.request !== void 0) {
                  const _errs8 = errors;
                  if (!validate28(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                    vErrors = vErrors === null ? validate28.errors : vErrors.concat(validate28.errors);
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
      validate27.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate27.errors = vErrors;
  return errors === 0;
}
validate27.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema45 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "action": { "enum": ["start", "cancel", "acknowledge_uncertain"], "title": "Action", "type": "string" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" } }, "required": ["idempotency_key", "action", "expected_revision"], "title": "ResearchControl", "type": "object" };
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.run_id === void 0 && (missing0 = "run_id") || data.request === void 0 && (missing0 = "request")) {
        validate31.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "run_id" || key0 === "request")) {
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
                if ("research.control" !== data2) {
                  validate31.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.control" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.run_id !== void 0) {
                  let data3 = data.run_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern10.test(data3)) {
                        validate31.errors = [{ instancePath: instancePath + "/run_id", schemaPath: "#/properties/run_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate31.errors = [{ instancePath: instancePath + "/run_id", schemaPath: "#/properties/run_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                          validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ResearchControl/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                          return false;
                        } else {
                          const _errs13 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "idempotency_key" || key1 === "action" || key1 === "expected_revision")) {
                              validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ResearchControl/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  if (func1(data5) > 200) {
                                    validate31.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ResearchControl/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                    return false;
                                  } else {
                                    if (func1(data5) < 1) {
                                      validate31.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ResearchControl/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                      return false;
                                    }
                                  }
                                } else {
                                  validate31.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ResearchControl/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                                  validate31.errors = [{ instancePath: instancePath + "/request/action", schemaPath: "#/$defs/ResearchControl/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                                if (!(data6 === "start" || data6 === "cancel" || data6 === "acknowledge_uncertain")) {
                                  validate31.errors = [{ instancePath: instancePath + "/request/action", schemaPath: "#/$defs/ResearchControl/properties/action/enum", keyword: "enum", params: { allowedValues: schema45.properties.action.enum }, message: "must be equal to one of the allowed values" }];
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
                                    validate31.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ResearchControl/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs18) {
                                    if (typeof data7 == "number" && isFinite(data7)) {
                                      if (data7 < 0 || isNaN(data7)) {
                                        validate31.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ResearchControl/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
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
                        validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ResearchControl/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
var schema49 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "expected_revision": { "minimum": 1, "title": "Expected Revision", "type": "integer" }, "action": { "enum": ["APPROVED", "CORRECTED", "REJECTED"], "title": "Action", "type": "string" }, "rationale": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Rationale", "type": "string" }, "corrected_output": { "anyOf": [{ "discriminator": { "mapping": { "AUDIT": "#/$defs/AuditOutput", "SCREENING": "#/$defs/ScreeningOutput", "SYNTHESIS": "#/$defs/SynthesisOutput" }, "propertyName": "kind" }, "oneOf": [{ "$ref": "#/$defs/ScreeningOutput" }, { "$ref": "#/$defs/SynthesisOutput" }, { "$ref": "#/$defs/AuditOutput" }] }, { "type": "null" }], "default": null, "title": "Corrected Output" } }, "required": ["idempotency_key", "expected_revision", "action", "rationale"], "title": "ArtifactReview", "type": "object" };
var schema50 = { "additionalProperties": false, "properties": { "kind": { "const": "SCREENING", "title": "Kind", "type": "string" }, "decision": { "enum": ["INCLUDE", "EXCLUDE", "UNCERTAIN"], "title": "Decision", "type": "string" }, "criterion_ids": { "items": { "pattern": "^[a-z][a-z0-9_]{0,63}$", "type": "string" }, "maxItems": 30, "minItems": 1, "title": "Criterion Ids", "type": "array" }, "evidence_ids": { "items": { "pattern": "^[a-f0-9]{64}$", "type": "string" }, "maxItems": 12, "title": "Evidence Ids", "type": "array" }, "rationale": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Rationale", "type": "string" } }, "required": ["kind", "decision", "criterion_ids", "evidence_ids", "rationale"], "title": "ScreeningOutput", "type": "object" };
var schema52 = { "additionalProperties": false, "properties": { "heading": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Heading", "type": "string" }, "text": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Text", "type": "string" }, "cell_ids": { "items": { "type": "string" }, "maxItems": 50, "minItems": 1, "title": "Cell Ids", "type": "array" }, "evidence_ids": { "items": { "pattern": "^[a-f0-9]{64}$", "type": "string" }, "maxItems": 12, "title": "Evidence Ids", "type": "array" }, "basis": { "enum": ["REVIEWED", "UNREVIEWED", "MIXED"], "title": "Basis", "type": "string" }, "comparability": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Comparability", "type": "string" } }, "required": ["heading", "text", "cell_ids", "evidence_ids", "basis", "comparability"], "title": "SynthesisSection", "type": "object" };
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
      if (data.kind === void 0 && (missing0 = "kind") || data.sections === void 0 && (missing0 = "sections") || data.limitations === void 0 && (missing0 = "limitations")) {
        validate35.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "sections" || key0 === "limitations")) {
            validate35.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            let data0 = data.kind;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate35.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("SYNTHESIS" !== data0) {
              validate35.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "SYNTHESIS" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.sections !== void 0) {
              let data1 = data.sections;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (Array.isArray(data1)) {
                  if (data1.length > 20) {
                    validate35.errors = [{ instancePath: instancePath + "/sections", schemaPath: "#/properties/sections/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" }];
                    return false;
                  } else {
                    if (data1.length < 1) {
                      validate35.errors = [{ instancePath: instancePath + "/sections", schemaPath: "#/properties/sections/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
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
                            if (data2.heading === void 0 && (missing1 = "heading") || data2.text === void 0 && (missing1 = "text") || data2.cell_ids === void 0 && (missing1 = "cell_ids") || data2.evidence_ids === void 0 && (missing1 = "evidence_ids") || data2.basis === void 0 && (missing1 = "basis") || data2.comparability === void 0 && (missing1 = "comparability")) {
                              validate35.errors = [{ instancePath: instancePath + "/sections/" + i0, schemaPath: "#/$defs/SynthesisSection/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                              return false;
                            } else {
                              const _errs9 = errors;
                              for (const key1 in data2) {
                                if (!(key1 === "heading" || key1 === "text" || key1 === "cell_ids" || key1 === "evidence_ids" || key1 === "basis" || key1 === "comparability")) {
                                  validate35.errors = [{ instancePath: instancePath + "/sections/" + i0, schemaPath: "#/$defs/SynthesisSection/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                                  return false;
                                  break;
                                }
                              }
                              if (_errs9 === errors) {
                                if (data2.heading !== void 0) {
                                  let data3 = data2.heading;
                                  const _errs10 = errors;
                                  if (errors === _errs10) {
                                    if (typeof data3 === "string") {
                                      if (func1(data3) > 2e3) {
                                        validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/heading", schemaPath: "#/$defs/SynthesisSection/properties/heading/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                        return false;
                                      } else {
                                        if (func1(data3) < 1) {
                                          validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/heading", schemaPath: "#/$defs/SynthesisSection/properties/heading/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                          return false;
                                        } else {
                                          if (!pattern8.test(data3)) {
                                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/heading", schemaPath: "#/$defs/SynthesisSection/properties/heading/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                            return false;
                                          }
                                        }
                                      }
                                    } else {
                                      validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/heading", schemaPath: "#/$defs/SynthesisSection/properties/heading/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid3 = _errs10 === errors;
                                } else {
                                  var valid3 = true;
                                }
                                if (valid3) {
                                  if (data2.text !== void 0) {
                                    let data4 = data2.text;
                                    const _errs12 = errors;
                                    if (errors === _errs12) {
                                      if (typeof data4 === "string") {
                                        if (func1(data4) > 2e3) {
                                          validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/text", schemaPath: "#/$defs/SynthesisSection/properties/text/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                          return false;
                                        } else {
                                          if (func1(data4) < 1) {
                                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/text", schemaPath: "#/$defs/SynthesisSection/properties/text/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                            return false;
                                          } else {
                                            if (!pattern8.test(data4)) {
                                              validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/text", schemaPath: "#/$defs/SynthesisSection/properties/text/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                              return false;
                                            }
                                          }
                                        }
                                      } else {
                                        validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/text", schemaPath: "#/$defs/SynthesisSection/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                        return false;
                                      }
                                    }
                                    var valid3 = _errs12 === errors;
                                  } else {
                                    var valid3 = true;
                                  }
                                  if (valid3) {
                                    if (data2.cell_ids !== void 0) {
                                      let data5 = data2.cell_ids;
                                      const _errs14 = errors;
                                      if (errors === _errs14) {
                                        if (Array.isArray(data5)) {
                                          if (data5.length > 50) {
                                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/cell_ids", schemaPath: "#/$defs/SynthesisSection/properties/cell_ids/maxItems", keyword: "maxItems", params: { limit: 50 }, message: "must NOT have more than 50 items" }];
                                            return false;
                                          } else {
                                            if (data5.length < 1) {
                                              validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/cell_ids", schemaPath: "#/$defs/SynthesisSection/properties/cell_ids/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                                              return false;
                                            } else {
                                              var valid4 = true;
                                              const len1 = data5.length;
                                              for (let i1 = 0; i1 < len1; i1++) {
                                                const _errs16 = errors;
                                                if (typeof data5[i1] !== "string") {
                                                  validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/cell_ids/" + i1, schemaPath: "#/$defs/SynthesisSection/properties/cell_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                  return false;
                                                }
                                                var valid4 = _errs16 === errors;
                                                if (!valid4) {
                                                  break;
                                                }
                                              }
                                            }
                                          }
                                        } else {
                                          validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/cell_ids", schemaPath: "#/$defs/SynthesisSection/properties/cell_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                          return false;
                                        }
                                      }
                                      var valid3 = _errs14 === errors;
                                    } else {
                                      var valid3 = true;
                                    }
                                    if (valid3) {
                                      if (data2.evidence_ids !== void 0) {
                                        let data7 = data2.evidence_ids;
                                        const _errs18 = errors;
                                        if (errors === _errs18) {
                                          if (Array.isArray(data7)) {
                                            if (data7.length > 12) {
                                              validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/evidence_ids", schemaPath: "#/$defs/SynthesisSection/properties/evidence_ids/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" }];
                                              return false;
                                            } else {
                                              var valid5 = true;
                                              const len2 = data7.length;
                                              for (let i2 = 0; i2 < len2; i2++) {
                                                let data8 = data7[i2];
                                                const _errs20 = errors;
                                                if (errors === _errs20) {
                                                  if (typeof data8 === "string") {
                                                    if (!pattern22.test(data8)) {
                                                      validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/evidence_ids/" + i2, schemaPath: "#/$defs/SynthesisSection/properties/evidence_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                                      return false;
                                                    }
                                                  } else {
                                                    validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/evidence_ids/" + i2, schemaPath: "#/$defs/SynthesisSection/properties/evidence_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                    return false;
                                                  }
                                                }
                                                var valid5 = _errs20 === errors;
                                                if (!valid5) {
                                                  break;
                                                }
                                              }
                                            }
                                          } else {
                                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/evidence_ids", schemaPath: "#/$defs/SynthesisSection/properties/evidence_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                            return false;
                                          }
                                        }
                                        var valid3 = _errs18 === errors;
                                      } else {
                                        var valid3 = true;
                                      }
                                      if (valid3) {
                                        if (data2.basis !== void 0) {
                                          let data9 = data2.basis;
                                          const _errs22 = errors;
                                          if (typeof data9 !== "string") {
                                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/basis", schemaPath: "#/$defs/SynthesisSection/properties/basis/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                            return false;
                                          }
                                          if (!(data9 === "REVIEWED" || data9 === "UNREVIEWED" || data9 === "MIXED")) {
                                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/basis", schemaPath: "#/$defs/SynthesisSection/properties/basis/enum", keyword: "enum", params: { allowedValues: schema52.properties.basis.enum }, message: "must be equal to one of the allowed values" }];
                                            return false;
                                          }
                                          var valid3 = _errs22 === errors;
                                        } else {
                                          var valid3 = true;
                                        }
                                        if (valid3) {
                                          if (data2.comparability !== void 0) {
                                            let data10 = data2.comparability;
                                            const _errs24 = errors;
                                            if (errors === _errs24) {
                                              if (typeof data10 === "string") {
                                                if (func1(data10) > 2e3) {
                                                  validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/comparability", schemaPath: "#/$defs/SynthesisSection/properties/comparability/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                  return false;
                                                } else {
                                                  if (func1(data10) < 1) {
                                                    validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/comparability", schemaPath: "#/$defs/SynthesisSection/properties/comparability/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                    return false;
                                                  } else {
                                                    if (!pattern8.test(data10)) {
                                                      validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/comparability", schemaPath: "#/$defs/SynthesisSection/properties/comparability/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                      return false;
                                                    }
                                                  }
                                                }
                                              } else {
                                                validate35.errors = [{ instancePath: instancePath + "/sections/" + i0 + "/comparability", schemaPath: "#/$defs/SynthesisSection/properties/comparability/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                            }
                                            var valid3 = _errs24 === errors;
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
                          } else {
                            validate35.errors = [{ instancePath: instancePath + "/sections/" + i0, schemaPath: "#/$defs/SynthesisSection/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
                  validate35.errors = [{ instancePath: instancePath + "/sections", schemaPath: "#/properties/sections/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.limitations !== void 0) {
                let data11 = data.limitations;
                const _errs26 = errors;
                if (errors === _errs26) {
                  if (Array.isArray(data11)) {
                    if (data11.length > 20) {
                      validate35.errors = [{ instancePath: instancePath + "/limitations", schemaPath: "#/properties/limitations/maxItems", keyword: "maxItems", params: { limit: 20 }, message: "must NOT have more than 20 items" }];
                      return false;
                    } else {
                      if (data11.length < 1) {
                        validate35.errors = [{ instancePath: instancePath + "/limitations", schemaPath: "#/properties/limitations/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                        return false;
                      } else {
                        var valid6 = true;
                        const len3 = data11.length;
                        for (let i3 = 0; i3 < len3; i3++) {
                          let data12 = data11[i3];
                          const _errs28 = errors;
                          if (errors === _errs28) {
                            if (typeof data12 === "string") {
                              if (func1(data12) > 2e3) {
                                validate35.errors = [{ instancePath: instancePath + "/limitations/" + i3, schemaPath: "#/properties/limitations/items/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                return false;
                              } else {
                                if (func1(data12) < 1) {
                                  validate35.errors = [{ instancePath: instancePath + "/limitations/" + i3, schemaPath: "#/properties/limitations/items/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                  return false;
                                } else {
                                  if (!pattern8.test(data12)) {
                                    validate35.errors = [{ instancePath: instancePath + "/limitations/" + i3, schemaPath: "#/properties/limitations/items/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                    return false;
                                  }
                                }
                              }
                            } else {
                              validate35.errors = [{ instancePath: instancePath + "/limitations/" + i3, schemaPath: "#/properties/limitations/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                          }
                          var valid6 = _errs28 === errors;
                          if (!valid6) {
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    validate35.errors = [{ instancePath: instancePath + "/limitations", schemaPath: "#/properties/limitations/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
                  }
                }
                var valid0 = _errs26 === errors;
              } else {
                var valid0 = true;
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
var schema54 = { "additionalProperties": false, "properties": { "text": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Text", "type": "string" }, "start": { "maximum": 12e3, "minimum": 0, "title": "Start", "type": "integer" }, "end": { "maximum": 12e3, "minimum": 1, "title": "End", "type": "integer" }, "support": { "enum": ["SUPPORTED_PROPOSAL", "PARTIALLY_SUPPORTED_PROPOSAL", "CONTRADICTED_PROPOSAL", "INSUFFICIENT_EVIDENCE"], "title": "Support", "type": "string" }, "evidence_ids": { "items": { "pattern": "^[a-f0-9]{64}$", "type": "string" }, "maxItems": 12, "title": "Evidence Ids", "type": "array" }, "explanation": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Explanation", "type": "string" }, "references": { "items": { "$ref": "#/$defs/AuditReference" }, "maxItems": 12, "title": "References", "type": "array" } }, "required": ["text", "start", "end", "support", "evidence_ids", "explanation", "references"], "title": "AuditClaim", "type": "object" };
var schema55 = { "additionalProperties": false, "properties": { "citation": { "maxLength": 2e3, "minLength": 1, "pattern": "\\S", "title": "Citation", "type": "string" }, "source_id": { "anyOf": [{ "pattern": "^[a-f0-9]{64}$", "type": "string" }, { "type": "null" }], "title": "Source Id" }, "relationship": { "enum": ["DIRECT", "INDIRECT_MENTION", "NOT_IN_NOTEBOOK"], "title": "Relationship", "type": "string" } }, "required": ["citation", "source_id", "relationship"], "title": "AuditReference", "type": "object" };
function validate38(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate38.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.text === void 0 && (missing0 = "text") || data.start === void 0 && (missing0 = "start") || data.end === void 0 && (missing0 = "end") || data.support === void 0 && (missing0 = "support") || data.evidence_ids === void 0 && (missing0 = "evidence_ids") || data.explanation === void 0 && (missing0 = "explanation") || data.references === void 0 && (missing0 = "references")) {
        validate38.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "text" || key0 === "start" || key0 === "end" || key0 === "support" || key0 === "evidence_ids" || key0 === "explanation" || key0 === "references")) {
            validate38.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.text !== void 0) {
            let data0 = data.text;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (typeof data0 === "string") {
                if (func1(data0) > 2e3) {
                  validate38.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate38.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  } else {
                    if (!pattern8.test(data0)) {
                      validate38.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                      return false;
                    }
                  }
                }
              } else {
                validate38.errors = [{ instancePath: instancePath + "/text", schemaPath: "#/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.start !== void 0) {
              let data1 = data.start;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                validate38.errors = [{ instancePath: instancePath + "/start", schemaPath: "#/properties/start/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 > 12e3 || isNaN(data1)) {
                    validate38.errors = [{ instancePath: instancePath + "/start", schemaPath: "#/properties/start/maximum", keyword: "maximum", params: { comparison: "<=", limit: 12e3 }, message: "must be <= 12000" }];
                    return false;
                  } else {
                    if (data1 < 0 || isNaN(data1)) {
                      validate38.errors = [{ instancePath: instancePath + "/start", schemaPath: "#/properties/start/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
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
              if (data.end !== void 0) {
                let data2 = data.end;
                const _errs6 = errors;
                if (!(typeof data2 == "number" && (!(data2 % 1) && !isNaN(data2)) && isFinite(data2))) {
                  validate38.errors = [{ instancePath: instancePath + "/end", schemaPath: "#/properties/end/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                  return false;
                }
                if (errors === _errs6) {
                  if (typeof data2 == "number" && isFinite(data2)) {
                    if (data2 > 12e3 || isNaN(data2)) {
                      validate38.errors = [{ instancePath: instancePath + "/end", schemaPath: "#/properties/end/maximum", keyword: "maximum", params: { comparison: "<=", limit: 12e3 }, message: "must be <= 12000" }];
                      return false;
                    } else {
                      if (data2 < 1 || isNaN(data2)) {
                        validate38.errors = [{ instancePath: instancePath + "/end", schemaPath: "#/properties/end/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                        return false;
                      }
                    }
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.support !== void 0) {
                  let data3 = data.support;
                  const _errs8 = errors;
                  if (typeof data3 !== "string") {
                    validate38.errors = [{ instancePath: instancePath + "/support", schemaPath: "#/properties/support/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  if (!(data3 === "SUPPORTED_PROPOSAL" || data3 === "PARTIALLY_SUPPORTED_PROPOSAL" || data3 === "CONTRADICTED_PROPOSAL" || data3 === "INSUFFICIENT_EVIDENCE")) {
                    validate38.errors = [{ instancePath: instancePath + "/support", schemaPath: "#/properties/support/enum", keyword: "enum", params: { allowedValues: schema54.properties.support.enum }, message: "must be equal to one of the allowed values" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.evidence_ids !== void 0) {
                    let data4 = data.evidence_ids;
                    const _errs10 = errors;
                    if (errors === _errs10) {
                      if (Array.isArray(data4)) {
                        if (data4.length > 12) {
                          validate38.errors = [{ instancePath: instancePath + "/evidence_ids", schemaPath: "#/properties/evidence_ids/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" }];
                          return false;
                        } else {
                          var valid1 = true;
                          const len0 = data4.length;
                          for (let i0 = 0; i0 < len0; i0++) {
                            let data5 = data4[i0];
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data5 === "string") {
                                if (!pattern22.test(data5)) {
                                  validate38.errors = [{ instancePath: instancePath + "/evidence_ids/" + i0, schemaPath: "#/properties/evidence_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                  return false;
                                }
                              } else {
                                validate38.errors = [{ instancePath: instancePath + "/evidence_ids/" + i0, schemaPath: "#/properties/evidence_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid1 = _errs12 === errors;
                            if (!valid1) {
                              break;
                            }
                          }
                        }
                      } else {
                        validate38.errors = [{ instancePath: instancePath + "/evidence_ids", schemaPath: "#/properties/evidence_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                        return false;
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.explanation !== void 0) {
                      let data6 = data.explanation;
                      const _errs14 = errors;
                      if (errors === _errs14) {
                        if (typeof data6 === "string") {
                          if (func1(data6) > 2e3) {
                            validate38.errors = [{ instancePath: instancePath + "/explanation", schemaPath: "#/properties/explanation/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                            return false;
                          } else {
                            if (func1(data6) < 1) {
                              validate38.errors = [{ instancePath: instancePath + "/explanation", schemaPath: "#/properties/explanation/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                              return false;
                            } else {
                              if (!pattern8.test(data6)) {
                                validate38.errors = [{ instancePath: instancePath + "/explanation", schemaPath: "#/properties/explanation/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                return false;
                              }
                            }
                          }
                        } else {
                          validate38.errors = [{ instancePath: instancePath + "/explanation", schemaPath: "#/properties/explanation/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                          return false;
                        }
                      }
                      var valid0 = _errs14 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.references !== void 0) {
                        let data7 = data.references;
                        const _errs16 = errors;
                        if (errors === _errs16) {
                          if (Array.isArray(data7)) {
                            if (data7.length > 12) {
                              validate38.errors = [{ instancePath: instancePath + "/references", schemaPath: "#/properties/references/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" }];
                              return false;
                            } else {
                              var valid2 = true;
                              const len1 = data7.length;
                              for (let i1 = 0; i1 < len1; i1++) {
                                let data8 = data7[i1];
                                const _errs18 = errors;
                                const _errs19 = errors;
                                if (errors === _errs19) {
                                  if (data8 && typeof data8 == "object" && !Array.isArray(data8)) {
                                    let missing1;
                                    if (data8.citation === void 0 && (missing1 = "citation") || data8.source_id === void 0 && (missing1 = "source_id") || data8.relationship === void 0 && (missing1 = "relationship")) {
                                      validate38.errors = [{ instancePath: instancePath + "/references/" + i1, schemaPath: "#/$defs/AuditReference/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                                      return false;
                                    } else {
                                      const _errs21 = errors;
                                      for (const key1 in data8) {
                                        if (!(key1 === "citation" || key1 === "source_id" || key1 === "relationship")) {
                                          validate38.errors = [{ instancePath: instancePath + "/references/" + i1, schemaPath: "#/$defs/AuditReference/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                                          return false;
                                          break;
                                        }
                                      }
                                      if (_errs21 === errors) {
                                        if (data8.citation !== void 0) {
                                          let data9 = data8.citation;
                                          const _errs22 = errors;
                                          if (errors === _errs22) {
                                            if (typeof data9 === "string") {
                                              if (func1(data9) > 2e3) {
                                                validate38.errors = [{ instancePath: instancePath + "/references/" + i1 + "/citation", schemaPath: "#/$defs/AuditReference/properties/citation/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                                return false;
                                              } else {
                                                if (func1(data9) < 1) {
                                                  validate38.errors = [{ instancePath: instancePath + "/references/" + i1 + "/citation", schemaPath: "#/$defs/AuditReference/properties/citation/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                  return false;
                                                } else {
                                                  if (!pattern8.test(data9)) {
                                                    validate38.errors = [{ instancePath: instancePath + "/references/" + i1 + "/citation", schemaPath: "#/$defs/AuditReference/properties/citation/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                                    return false;
                                                  }
                                                }
                                              }
                                            } else {
                                              validate38.errors = [{ instancePath: instancePath + "/references/" + i1 + "/citation", schemaPath: "#/$defs/AuditReference/properties/citation/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                              return false;
                                            }
                                          }
                                          var valid4 = _errs22 === errors;
                                        } else {
                                          var valid4 = true;
                                        }
                                        if (valid4) {
                                          if (data8.source_id !== void 0) {
                                            let data10 = data8.source_id;
                                            const _errs24 = errors;
                                            const _errs25 = errors;
                                            let valid5 = false;
                                            const _errs26 = errors;
                                            if (errors === _errs26) {
                                              if (typeof data10 === "string") {
                                                if (!pattern22.test(data10)) {
                                                  const err0 = { instancePath: instancePath + "/references/" + i1 + "/source_id", schemaPath: "#/$defs/AuditReference/properties/source_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                                                  if (vErrors === null) {
                                                    vErrors = [err0];
                                                  } else {
                                                    vErrors.push(err0);
                                                  }
                                                  errors++;
                                                }
                                              } else {
                                                const err1 = { instancePath: instancePath + "/references/" + i1 + "/source_id", schemaPath: "#/$defs/AuditReference/properties/source_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                                if (vErrors === null) {
                                                  vErrors = [err1];
                                                } else {
                                                  vErrors.push(err1);
                                                }
                                                errors++;
                                              }
                                            }
                                            var _valid0 = _errs26 === errors;
                                            valid5 = valid5 || _valid0;
                                            const _errs28 = errors;
                                            if (data10 !== null) {
                                              const err2 = { instancePath: instancePath + "/references/" + i1 + "/source_id", schemaPath: "#/$defs/AuditReference/properties/source_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                              if (vErrors === null) {
                                                vErrors = [err2];
                                              } else {
                                                vErrors.push(err2);
                                              }
                                              errors++;
                                            }
                                            var _valid0 = _errs28 === errors;
                                            valid5 = valid5 || _valid0;
                                            if (!valid5) {
                                              const err3 = { instancePath: instancePath + "/references/" + i1 + "/source_id", schemaPath: "#/$defs/AuditReference/properties/source_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                              if (vErrors === null) {
                                                vErrors = [err3];
                                              } else {
                                                vErrors.push(err3);
                                              }
                                              errors++;
                                              validate38.errors = vErrors;
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
                                            var valid4 = _errs24 === errors;
                                          } else {
                                            var valid4 = true;
                                          }
                                          if (valid4) {
                                            if (data8.relationship !== void 0) {
                                              let data11 = data8.relationship;
                                              const _errs30 = errors;
                                              if (typeof data11 !== "string") {
                                                validate38.errors = [{ instancePath: instancePath + "/references/" + i1 + "/relationship", schemaPath: "#/$defs/AuditReference/properties/relationship/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                              if (!(data11 === "DIRECT" || data11 === "INDIRECT_MENTION" || data11 === "NOT_IN_NOTEBOOK")) {
                                                validate38.errors = [{ instancePath: instancePath + "/references/" + i1 + "/relationship", schemaPath: "#/$defs/AuditReference/properties/relationship/enum", keyword: "enum", params: { allowedValues: schema55.properties.relationship.enum }, message: "must be equal to one of the allowed values" }];
                                                return false;
                                              }
                                              var valid4 = _errs30 === errors;
                                            } else {
                                              var valid4 = true;
                                            }
                                          }
                                        }
                                      }
                                    }
                                  } else {
                                    validate38.errors = [{ instancePath: instancePath + "/references/" + i1, schemaPath: "#/$defs/AuditReference/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                    return false;
                                  }
                                }
                                var valid2 = _errs18 === errors;
                                if (!valid2) {
                                  break;
                                }
                              }
                            }
                          } else {
                            validate38.errors = [{ instancePath: instancePath + "/references", schemaPath: "#/properties/references/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                            return false;
                          }
                        }
                        var valid0 = _errs16 === errors;
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
      validate38.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate38.errors = vErrors;
  return errors === 0;
}
validate38.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate37(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate37.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.kind === void 0 && (missing0 = "kind") || data.claims === void 0 && (missing0 = "claims") || data.collection_limitations === void 0 && (missing0 = "collection_limitations")) {
        validate37.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "kind" || key0 === "claims" || key0 === "collection_limitations")) {
            validate37.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.kind !== void 0) {
            let data0 = data.kind;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate37.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("AUDIT" !== data0) {
              validate37.errors = [{ instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/const", keyword: "const", params: { allowedValue: "AUDIT" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.claims !== void 0) {
              let data1 = data.claims;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (Array.isArray(data1)) {
                  if (data1.length > 30) {
                    validate37.errors = [{ instancePath: instancePath + "/claims", schemaPath: "#/properties/claims/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" }];
                    return false;
                  } else {
                    if (data1.length < 1) {
                      validate37.errors = [{ instancePath: instancePath + "/claims", schemaPath: "#/properties/claims/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                      return false;
                    } else {
                      var valid1 = true;
                      const len0 = data1.length;
                      for (let i0 = 0; i0 < len0; i0++) {
                        const _errs6 = errors;
                        if (!validate38(data1[i0], { instancePath: instancePath + "/claims/" + i0, parentData: data1, parentDataProperty: i0, rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
                          errors = vErrors.length;
                        }
                        var valid1 = _errs6 === errors;
                        if (!valid1) {
                          break;
                        }
                      }
                    }
                  }
                } else {
                  validate37.errors = [{ instancePath: instancePath + "/claims", schemaPath: "#/properties/claims/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.collection_limitations !== void 0) {
                let data3 = data.collection_limitations;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (typeof data3 === "string") {
                    if (func1(data3) > 2e3) {
                      validate37.errors = [{ instancePath: instancePath + "/collection_limitations", schemaPath: "#/properties/collection_limitations/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                      return false;
                    } else {
                      if (func1(data3) < 1) {
                        validate37.errors = [{ instancePath: instancePath + "/collection_limitations", schemaPath: "#/properties/collection_limitations/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      } else {
                        if (!pattern8.test(data3)) {
                          validate37.errors = [{ instancePath: instancePath + "/collection_limitations", schemaPath: "#/properties/collection_limitations/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                          return false;
                        }
                      }
                    }
                  } else {
                    validate37.errors = [{ instancePath: instancePath + "/collection_limitations", schemaPath: "#/properties/collection_limitations/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs7 === errors;
              } else {
                var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate37.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate37.errors = vErrors;
  return errors === 0;
}
validate37.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate34(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate34.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.expected_revision === void 0 && (missing0 = "expected_revision") || data.action === void 0 && (missing0 = "action") || data.rationale === void 0 && (missing0 = "rationale")) {
        validate34.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "idempotency_key" || key0 === "expected_revision" || key0 === "action" || key0 === "rationale" || key0 === "corrected_output")) {
            validate34.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate34.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate34.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate34.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.expected_revision !== void 0) {
              let data1 = data.expected_revision;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                validate34.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 < 1 || isNaN(data1)) {
                    validate34.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.action !== void 0) {
                let data2 = data.action;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate34.errors = [{ instancePath: instancePath + "/action", schemaPath: "#/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "APPROVED" || data2 === "CORRECTED" || data2 === "REJECTED")) {
                  validate34.errors = [{ instancePath: instancePath + "/action", schemaPath: "#/properties/action/enum", keyword: "enum", params: { allowedValues: schema49.properties.action.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.rationale !== void 0) {
                  let data3 = data.rationale;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 2e3) {
                        validate34.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 1) {
                          validate34.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                          return false;
                        } else {
                          if (!pattern8.test(data3)) {
                            validate34.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                            return false;
                          }
                        }
                      }
                    } else {
                      validate34.errors = [{ instancePath: instancePath + "/rationale", schemaPath: "#/properties/rationale/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.corrected_output !== void 0) {
                    let data4 = data.corrected_output;
                    const _errs10 = errors;
                    const _errs11 = errors;
                    let valid1 = false;
                    const _errs12 = errors;
                    const _errs13 = errors;
                    let valid2 = false;
                    let passing0 = null;
                    const _errs14 = errors;
                    const _errs15 = errors;
                    if (errors === _errs15) {
                      if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
                        let missing1;
                        if (data4.kind === void 0 && (missing1 = "kind") || data4.decision === void 0 && (missing1 = "decision") || data4.criterion_ids === void 0 && (missing1 = "criterion_ids") || data4.evidence_ids === void 0 && (missing1 = "evidence_ids") || data4.rationale === void 0 && (missing1 = "rationale")) {
                          const err0 = { instancePath: instancePath + "/corrected_output", schemaPath: "#/$defs/ScreeningOutput/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
                          if (vErrors === null) {
                            vErrors = [err0];
                          } else {
                            vErrors.push(err0);
                          }
                          errors++;
                        } else {
                          const _errs17 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "kind" || key1 === "decision" || key1 === "criterion_ids" || key1 === "evidence_ids" || key1 === "rationale")) {
                              const err1 = { instancePath: instancePath + "/corrected_output", schemaPath: "#/$defs/ScreeningOutput/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                              if (vErrors === null) {
                                vErrors = [err1];
                              } else {
                                vErrors.push(err1);
                              }
                              errors++;
                              break;
                            }
                          }
                          if (_errs17 === errors) {
                            if (data4.kind !== void 0) {
                              let data5 = data4.kind;
                              const _errs18 = errors;
                              if (typeof data5 !== "string") {
                                const err2 = { instancePath: instancePath + "/corrected_output/kind", schemaPath: "#/$defs/ScreeningOutput/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err2];
                                } else {
                                  vErrors.push(err2);
                                }
                                errors++;
                              }
                              if ("SCREENING" !== data5) {
                                const err3 = { instancePath: instancePath + "/corrected_output/kind", schemaPath: "#/$defs/ScreeningOutput/properties/kind/const", keyword: "const", params: { allowedValue: "SCREENING" }, message: "must be equal to constant" };
                                if (vErrors === null) {
                                  vErrors = [err3];
                                } else {
                                  vErrors.push(err3);
                                }
                                errors++;
                              }
                              var valid4 = _errs18 === errors;
                            } else {
                              var valid4 = true;
                            }
                            if (valid4) {
                              if (data4.decision !== void 0) {
                                let data6 = data4.decision;
                                const _errs20 = errors;
                                if (typeof data6 !== "string") {
                                  const err4 = { instancePath: instancePath + "/corrected_output/decision", schemaPath: "#/$defs/ScreeningOutput/properties/decision/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err4];
                                  } else {
                                    vErrors.push(err4);
                                  }
                                  errors++;
                                }
                                if (!(data6 === "INCLUDE" || data6 === "EXCLUDE" || data6 === "UNCERTAIN")) {
                                  const err5 = { instancePath: instancePath + "/corrected_output/decision", schemaPath: "#/$defs/ScreeningOutput/properties/decision/enum", keyword: "enum", params: { allowedValues: schema50.properties.decision.enum }, message: "must be equal to one of the allowed values" };
                                  if (vErrors === null) {
                                    vErrors = [err5];
                                  } else {
                                    vErrors.push(err5);
                                  }
                                  errors++;
                                }
                                var valid4 = _errs20 === errors;
                              } else {
                                var valid4 = true;
                              }
                              if (valid4) {
                                if (data4.criterion_ids !== void 0) {
                                  let data7 = data4.criterion_ids;
                                  const _errs22 = errors;
                                  if (errors === _errs22) {
                                    if (Array.isArray(data7)) {
                                      if (data7.length > 30) {
                                        const err6 = { instancePath: instancePath + "/corrected_output/criterion_ids", schemaPath: "#/$defs/ScreeningOutput/properties/criterion_ids/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" };
                                        if (vErrors === null) {
                                          vErrors = [err6];
                                        } else {
                                          vErrors.push(err6);
                                        }
                                        errors++;
                                      } else {
                                        if (data7.length < 1) {
                                          const err7 = { instancePath: instancePath + "/corrected_output/criterion_ids", schemaPath: "#/$defs/ScreeningOutput/properties/criterion_ids/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                                          if (vErrors === null) {
                                            vErrors = [err7];
                                          } else {
                                            vErrors.push(err7);
                                          }
                                          errors++;
                                        } else {
                                          var valid5 = true;
                                          const len0 = data7.length;
                                          for (let i0 = 0; i0 < len0; i0++) {
                                            let data8 = data7[i0];
                                            const _errs24 = errors;
                                            if (errors === _errs24) {
                                              if (typeof data8 === "string") {
                                                if (!pattern11.test(data8)) {
                                                  const err8 = { instancePath: instancePath + "/corrected_output/criterion_ids/" + i0, schemaPath: "#/$defs/ScreeningOutput/properties/criterion_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]{0,63}$" }, message: 'must match pattern "^[a-z][a-z0-9_]{0,63}$"' };
                                                  if (vErrors === null) {
                                                    vErrors = [err8];
                                                  } else {
                                                    vErrors.push(err8);
                                                  }
                                                  errors++;
                                                }
                                              } else {
                                                const err9 = { instancePath: instancePath + "/corrected_output/criterion_ids/" + i0, schemaPath: "#/$defs/ScreeningOutput/properties/criterion_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                                if (vErrors === null) {
                                                  vErrors = [err9];
                                                } else {
                                                  vErrors.push(err9);
                                                }
                                                errors++;
                                              }
                                            }
                                            var valid5 = _errs24 === errors;
                                            if (!valid5) {
                                              break;
                                            }
                                          }
                                        }
                                      }
                                    } else {
                                      const err10 = { instancePath: instancePath + "/corrected_output/criterion_ids", schemaPath: "#/$defs/ScreeningOutput/properties/criterion_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                                      if (vErrors === null) {
                                        vErrors = [err10];
                                      } else {
                                        vErrors.push(err10);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid4 = _errs22 === errors;
                                } else {
                                  var valid4 = true;
                                }
                                if (valid4) {
                                  if (data4.evidence_ids !== void 0) {
                                    let data9 = data4.evidence_ids;
                                    const _errs26 = errors;
                                    if (errors === _errs26) {
                                      if (Array.isArray(data9)) {
                                        if (data9.length > 12) {
                                          const err11 = { instancePath: instancePath + "/corrected_output/evidence_ids", schemaPath: "#/$defs/ScreeningOutput/properties/evidence_ids/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" };
                                          if (vErrors === null) {
                                            vErrors = [err11];
                                          } else {
                                            vErrors.push(err11);
                                          }
                                          errors++;
                                        } else {
                                          var valid6 = true;
                                          const len1 = data9.length;
                                          for (let i1 = 0; i1 < len1; i1++) {
                                            let data10 = data9[i1];
                                            const _errs28 = errors;
                                            if (errors === _errs28) {
                                              if (typeof data10 === "string") {
                                                if (!pattern22.test(data10)) {
                                                  const err12 = { instancePath: instancePath + "/corrected_output/evidence_ids/" + i1, schemaPath: "#/$defs/ScreeningOutput/properties/evidence_ids/items/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                                                  if (vErrors === null) {
                                                    vErrors = [err12];
                                                  } else {
                                                    vErrors.push(err12);
                                                  }
                                                  errors++;
                                                }
                                              } else {
                                                const err13 = { instancePath: instancePath + "/corrected_output/evidence_ids/" + i1, schemaPath: "#/$defs/ScreeningOutput/properties/evidence_ids/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                                if (vErrors === null) {
                                                  vErrors = [err13];
                                                } else {
                                                  vErrors.push(err13);
                                                }
                                                errors++;
                                              }
                                            }
                                            var valid6 = _errs28 === errors;
                                            if (!valid6) {
                                              break;
                                            }
                                          }
                                        }
                                      } else {
                                        const err14 = { instancePath: instancePath + "/corrected_output/evidence_ids", schemaPath: "#/$defs/ScreeningOutput/properties/evidence_ids/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                                        if (vErrors === null) {
                                          vErrors = [err14];
                                        } else {
                                          vErrors.push(err14);
                                        }
                                        errors++;
                                      }
                                    }
                                    var valid4 = _errs26 === errors;
                                  } else {
                                    var valid4 = true;
                                  }
                                  if (valid4) {
                                    if (data4.rationale !== void 0) {
                                      let data11 = data4.rationale;
                                      const _errs30 = errors;
                                      if (errors === _errs30) {
                                        if (typeof data11 === "string") {
                                          if (func1(data11) > 2e3) {
                                            const err15 = { instancePath: instancePath + "/corrected_output/rationale", schemaPath: "#/$defs/ScreeningOutput/properties/rationale/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" };
                                            if (vErrors === null) {
                                              vErrors = [err15];
                                            } else {
                                              vErrors.push(err15);
                                            }
                                            errors++;
                                          } else {
                                            if (func1(data11) < 1) {
                                              const err16 = { instancePath: instancePath + "/corrected_output/rationale", schemaPath: "#/$defs/ScreeningOutput/properties/rationale/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                              if (vErrors === null) {
                                                vErrors = [err16];
                                              } else {
                                                vErrors.push(err16);
                                              }
                                              errors++;
                                            } else {
                                              if (!pattern8.test(data11)) {
                                                const err17 = { instancePath: instancePath + "/corrected_output/rationale", schemaPath: "#/$defs/ScreeningOutput/properties/rationale/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' };
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
                                          const err18 = { instancePath: instancePath + "/corrected_output/rationale", schemaPath: "#/$defs/ScreeningOutput/properties/rationale/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err18];
                                          } else {
                                            vErrors.push(err18);
                                          }
                                          errors++;
                                        }
                                      }
                                      var valid4 = _errs30 === errors;
                                    } else {
                                      var valid4 = true;
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        const err19 = { instancePath: instancePath + "/corrected_output", schemaPath: "#/$defs/ScreeningOutput/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                        if (vErrors === null) {
                          vErrors = [err19];
                        } else {
                          vErrors.push(err19);
                        }
                        errors++;
                      }
                    }
                    var _valid1 = _errs14 === errors;
                    if (_valid1) {
                      valid2 = true;
                      passing0 = 0;
                      var props0 = true;
                    }
                    const _errs32 = errors;
                    if (!validate35(data4, { instancePath: instancePath + "/corrected_output", parentData: data, parentDataProperty: "corrected_output", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
                      errors = vErrors.length;
                    }
                    var _valid1 = _errs32 === errors;
                    if (_valid1 && valid2) {
                      valid2 = false;
                      passing0 = [passing0, 1];
                    } else {
                      if (_valid1) {
                        valid2 = true;
                        passing0 = 1;
                        if (props0 !== true) {
                          props0 = true;
                        }
                      }
                      const _errs33 = errors;
                      if (!validate37(data4, { instancePath: instancePath + "/corrected_output", parentData: data, parentDataProperty: "corrected_output", rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate37.errors : vErrors.concat(validate37.errors);
                        errors = vErrors.length;
                      }
                      var _valid1 = _errs33 === errors;
                      if (_valid1 && valid2) {
                        valid2 = false;
                        passing0 = [passing0, 2];
                      } else {
                        if (_valid1) {
                          valid2 = true;
                          passing0 = 2;
                          if (props0 !== true) {
                            props0 = true;
                          }
                        }
                      }
                    }
                    if (!valid2) {
                      const err20 = { instancePath: instancePath + "/corrected_output", schemaPath: "#/properties/corrected_output/anyOf/0/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
                      if (vErrors === null) {
                        vErrors = [err20];
                      } else {
                        vErrors.push(err20);
                      }
                      errors++;
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
                    var _valid0 = _errs12 === errors;
                    valid1 = valid1 || _valid0;
                    const _errs34 = errors;
                    if (data4 !== null) {
                      const err21 = { instancePath: instancePath + "/corrected_output", schemaPath: "#/properties/corrected_output/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                      if (vErrors === null) {
                        vErrors = [err21];
                      } else {
                        vErrors.push(err21);
                      }
                      errors++;
                    }
                    var _valid0 = _errs34 === errors;
                    valid1 = valid1 || _valid0;
                    if (!valid1) {
                      const err22 = { instancePath: instancePath + "/corrected_output", schemaPath: "#/properties/corrected_output/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                      if (vErrors === null) {
                        vErrors = [err22];
                      } else {
                        vErrors.push(err22);
                      }
                      errors++;
                      validate34.errors = vErrors;
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
                }
              }
            }
          }
        }
      }
    } else {
      validate34.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate34.errors = vErrors;
  return errors === 0;
}
validate34.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate33(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate33.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.version_id === void 0 && (missing0 = "version_id") || data.request === void 0 && (missing0 = "request")) {
        validate33.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "version_id" || key0 === "request")) {
            validate33.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate33.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate33.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate33.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate33.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate33.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("research.review" !== data2) {
                  validate33.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.review" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.version_id !== void 0) {
                  let data3 = data.version_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern10.test(data3)) {
                        validate33.errors = [{ instancePath: instancePath + "/version_id", schemaPath: "#/properties/version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate33.errors = [{ instancePath: instancePath + "/version_id", schemaPath: "#/properties/version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    if (!validate34(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate34.errors : vErrors.concat(validate34.errors);
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
      validate33.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate33.errors = vErrors;
  return errors === 0;
}
validate33.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema57 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "artifact_version_id": { "pattern": "^[a-f0-9]{32}$", "title": "Artifact Version Id", "type": "string" }, "source_id": { "pattern": "^[a-f0-9]{64}$", "title": "Source Id", "type": "string" }, "title": { "maxLength": 200, "minLength": 1, "pattern": "\\S", "title": "Title", "type": "string" }, "locale": { "default": "pt-BR", "enum": ["pt-BR", "en-US"], "title": "Locale", "type": "string" } }, "required": ["idempotency_key", "artifact_version_id", "source_id", "title"], "title": "NotePreviewWrite", "type": "object" };
function validate43(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate43.evaluated;
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
        validate43.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate43.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate43.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate43.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate43.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate43.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate43.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("research.notes.preview" !== data2) {
                  validate43.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.notes.preview" }, message: "must be equal to constant" }];
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
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key") || data3.artifact_version_id === void 0 && (missing1 = "artifact_version_id") || data3.source_id === void 0 && (missing1 = "source_id") || data3.title === void 0 && (missing1 = "title")) {
                        validate43.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/NotePreviewWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key" || key1 === "artifact_version_id" || key1 === "source_id" || key1 === "title" || key1 === "locale")) {
                            validate43.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/NotePreviewWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate43.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/NotePreviewWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate43.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/NotePreviewWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate43.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/NotePreviewWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.artifact_version_id !== void 0) {
                              let data5 = data3.artifact_version_id;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (!pattern10.test(data5)) {
                                    validate43.errors = [{ instancePath: instancePath + "/request/artifact_version_id", schemaPath: "#/$defs/NotePreviewWrite/properties/artifact_version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate43.errors = [{ instancePath: instancePath + "/request/artifact_version_id", schemaPath: "#/$defs/NotePreviewWrite/properties/artifact_version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
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
                                if (errors === _errs16) {
                                  if (typeof data6 === "string") {
                                    if (!pattern22.test(data6)) {
                                      validate43.errors = [{ instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/NotePreviewWrite/properties/source_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                      return false;
                                    }
                                  } else {
                                    validate43.errors = [{ instancePath: instancePath + "/request/source_id", schemaPath: "#/$defs/NotePreviewWrite/properties/source_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.title !== void 0) {
                                  let data7 = data3.title;
                                  const _errs18 = errors;
                                  if (errors === _errs18) {
                                    if (typeof data7 === "string") {
                                      if (func1(data7) > 200) {
                                        validate43.errors = [{ instancePath: instancePath + "/request/title", schemaPath: "#/$defs/NotePreviewWrite/properties/title/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                        return false;
                                      } else {
                                        if (func1(data7) < 1) {
                                          validate43.errors = [{ instancePath: instancePath + "/request/title", schemaPath: "#/$defs/NotePreviewWrite/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                          return false;
                                        } else {
                                          if (!pattern8.test(data7)) {
                                            validate43.errors = [{ instancePath: instancePath + "/request/title", schemaPath: "#/$defs/NotePreviewWrite/properties/title/pattern", keyword: "pattern", params: { pattern: "\\S" }, message: 'must match pattern "\\S"' }];
                                            return false;
                                          }
                                        }
                                      }
                                    } else {
                                      validate43.errors = [{ instancePath: instancePath + "/request/title", schemaPath: "#/$defs/NotePreviewWrite/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid2 = _errs18 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data3.locale !== void 0) {
                                    let data8 = data3.locale;
                                    const _errs20 = errors;
                                    if (typeof data8 !== "string") {
                                      validate43.errors = [{ instancePath: instancePath + "/request/locale", schemaPath: "#/$defs/NotePreviewWrite/properties/locale/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                    if (!(data8 === "pt-BR" || data8 === "en-US")) {
                                      validate43.errors = [{ instancePath: instancePath + "/request/locale", schemaPath: "#/$defs/NotePreviewWrite/properties/locale/enum", keyword: "enum", params: { allowedValues: schema57.properties.locale.enum }, message: "must be equal to one of the allowed values" }];
                                      return false;
                                    }
                                    var valid2 = _errs20 === errors;
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
                      validate43.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/NotePreviewWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate43.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate43.errors = vErrors;
  return errors === 0;
}
validate43.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate45(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate45.evaluated;
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
        validate45.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate45.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate45.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate45.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate45.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate45.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate45.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("research.notes.approve" !== data2) {
                  validate45.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.notes.approve" }, message: "must be equal to constant" }];
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
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key") || data3.preview_id === void 0 && (missing1 = "preview_id") || data3.expected_artifact_revision === void 0 && (missing1 = "expected_artifact_revision")) {
                        validate45.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/NoteApproval/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key" || key1 === "preview_id" || key1 === "expected_artifact_revision")) {
                            validate45.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/NoteApproval/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate45.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/NoteApproval/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate45.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/NoteApproval/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate45.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/NoteApproval/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                                  if (!pattern10.test(data5)) {
                                    validate45.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/NoteApproval/properties/preview_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate45.errors = [{ instancePath: instancePath + "/request/preview_id", schemaPath: "#/$defs/NoteApproval/properties/preview_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data3.expected_artifact_revision !== void 0) {
                                let data6 = data3.expected_artifact_revision;
                                const _errs16 = errors;
                                if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
                                  validate45.errors = [{ instancePath: instancePath + "/request/expected_artifact_revision", schemaPath: "#/$defs/NoteApproval/properties/expected_artifact_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                  return false;
                                }
                                if (errors === _errs16) {
                                  if (typeof data6 == "number" && isFinite(data6)) {
                                    if (data6 < 1 || isNaN(data6)) {
                                      validate45.errors = [{ instancePath: instancePath + "/request/expected_artifact_revision", schemaPath: "#/$defs/NoteApproval/properties/expected_artifact_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                      return false;
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
                      validate45.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/NoteApproval/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate45.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate45.errors = vErrors;
  return errors === 0;
}
validate45.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate47(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate47.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.intent_id === void 0 && (missing0 = "intent_id") || data.request === void 0 && (missing0 = "request")) {
        validate47.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "intent_id" || key0 === "request")) {
            validate47.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate47.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate47.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    validate47.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate47.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate47.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("research.notes.publish" !== data2) {
                  validate47.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "research.notes.publish" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.intent_id !== void 0) {
                  let data3 = data.intent_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern10.test(data3)) {
                        validate47.errors = [{ instancePath: instancePath + "/intent_id", schemaPath: "#/properties/intent_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate47.errors = [{ instancePath: instancePath + "/intent_id", schemaPath: "#/properties/intent_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                        if (data4.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                          validate47.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/Write/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                          return false;
                        } else {
                          const _errs13 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "idempotency_key")) {
                              validate47.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/Write/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  if (func1(data5) > 200) {
                                    validate47.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/Write/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                    return false;
                                  } else {
                                    if (func1(data5) < 1) {
                                      validate47.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/Write/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                      return false;
                                    }
                                  }
                                } else {
                                  validate47.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/Write/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                            }
                          }
                        }
                      } else {
                        validate47.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/Write/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate47.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate47.errors = vErrors;
  return errors === 0;
}
validate47.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
        const err0 = { instancePath, schemaPath: "#/$defs/ResearchListCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
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
            const err1 = { instancePath, schemaPath: "#/$defs/ResearchListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
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
                  const err2 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ResearchListCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ResearchListCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                    const err4 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ResearchListCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                    if (vErrors === null) {
                      vErrors = [err4];
                    } else {
                      vErrors.push(err4);
                    }
                    errors++;
                  }
                } else {
                  const err5 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ResearchListCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                  const err6 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ResearchListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
                if (!(data2 === "research.protocols" || data2 === "research.runs" || data2 === "research.notes.list")) {
                  const err7 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ResearchListCommand/properties/op/enum", keyword: "enum", params: { allowedValues: schema32.properties.op.enum }, message: "must be equal to one of the allowed values" };
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
                    const err8 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ResearchListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
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
                        const err9 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ResearchListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          const err10 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ResearchListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
      const err11 = { instancePath, schemaPath: "#/$defs/ResearchListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
        if (data.notebook_id === void 0 && (missing1 = "notebook_id") || data.snapshot_id === void 0 && (missing1 = "snapshot_id") || data.op === void 0 && (missing1 = "op") || data.protocol_id === void 0 && (missing1 = "protocol_id")) {
          const err12 = { instancePath, schemaPath: "#/$defs/ProtocolReadCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        } else {
          const _errs17 = errors;
          for (const key1 in data) {
            if (!(key1 === "notebook_id" || key1 === "snapshot_id" || key1 === "op" || key1 === "protocol_id")) {
              const err13 = { instancePath, schemaPath: "#/$defs/ProtocolReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
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
                    const err14 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProtocolReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                    if (vErrors === null) {
                      vErrors = [err14];
                    } else {
                      vErrors.push(err14);
                    }
                    errors++;
                  }
                } else {
                  const err15 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProtocolReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                      const err16 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProtocolReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                      if (vErrors === null) {
                        vErrors = [err16];
                      } else {
                        vErrors.push(err16);
                      }
                      errors++;
                    }
                  } else {
                    const err17 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProtocolReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                    const err18 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProtocolReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err18];
                    } else {
                      vErrors.push(err18);
                    }
                    errors++;
                  }
                  if ("research.protocol.read" !== data6) {
                    const err19 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProtocolReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "research.protocol.read" }, message: "must be equal to constant" };
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
                  if (data.protocol_id !== void 0) {
                    let data7 = data.protocol_id;
                    const _errs24 = errors;
                    if (errors === _errs24) {
                      if (typeof data7 === "string") {
                        if (!pattern10.test(data7)) {
                          const err20 = { instancePath: instancePath + "/protocol_id", schemaPath: "#/$defs/ProtocolReadCommand/properties/protocol_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                          if (vErrors === null) {
                            vErrors = [err20];
                          } else {
                            vErrors.push(err20);
                          }
                          errors++;
                        }
                      } else {
                        const err21 = { instancePath: instancePath + "/protocol_id", schemaPath: "#/$defs/ProtocolReadCommand/properties/protocol_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
        const err22 = { instancePath, schemaPath: "#/$defs/ProtocolReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
          if (data.notebook_id === void 0 && (missing2 = "notebook_id") || data.snapshot_id === void 0 && (missing2 = "snapshot_id") || data.op === void 0 && (missing2 = "op") || data.protocol_id === void 0 && (missing2 = "protocol_id") || data.offset === void 0 && (missing2 = "offset")) {
            const err23 = { instancePath, schemaPath: "#/$defs/ScreeningReadCommand/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          } else {
            const _errs29 = errors;
            for (const key2 in data) {
              if (!(key2 === "notebook_id" || key2 === "snapshot_id" || key2 === "op" || key2 === "protocol_id" || key2 === "offset")) {
                const err24 = { instancePath, schemaPath: "#/$defs/ScreeningReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
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
                      const err25 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ScreeningReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                      if (vErrors === null) {
                        vErrors = [err25];
                      } else {
                        vErrors.push(err25);
                      }
                      errors++;
                    }
                  } else {
                    const err26 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ScreeningReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                        const err27 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ScreeningReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                        if (vErrors === null) {
                          vErrors = [err27];
                        } else {
                          vErrors.push(err27);
                        }
                        errors++;
                      }
                    } else {
                      const err28 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ScreeningReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                      const err29 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ScreeningReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err29];
                      } else {
                        vErrors.push(err29);
                      }
                      errors++;
                    }
                    if ("research.screening" !== data10) {
                      const err30 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ScreeningReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "research.screening" }, message: "must be equal to constant" };
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
                    if (data.protocol_id !== void 0) {
                      let data11 = data.protocol_id;
                      const _errs36 = errors;
                      if (errors === _errs36) {
                        if (typeof data11 === "string") {
                          if (!pattern10.test(data11)) {
                            const err31 = { instancePath: instancePath + "/protocol_id", schemaPath: "#/$defs/ScreeningReadCommand/properties/protocol_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                            if (vErrors === null) {
                              vErrors = [err31];
                            } else {
                              vErrors.push(err31);
                            }
                            errors++;
                          }
                        } else {
                          const err32 = { instancePath: instancePath + "/protocol_id", schemaPath: "#/$defs/ScreeningReadCommand/properties/protocol_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                          const err33 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ScreeningReadCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
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
                              const err34 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ScreeningReadCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                              if (vErrors === null) {
                                vErrors = [err34];
                              } else {
                                vErrors.push(err34);
                              }
                              errors++;
                            } else {
                              if (data12 < 0 || isNaN(data12)) {
                                const err35 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ScreeningReadCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
          const err36 = { instancePath, schemaPath: "#/$defs/ScreeningReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
        if (!validate25(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
          errors = vErrors.length;
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
          const _errs41 = errors;
          if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs41 === errors;
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
            const _errs42 = errors;
            const _errs43 = errors;
            if (errors === _errs43) {
              if (data && typeof data == "object" && !Array.isArray(data)) {
                let missing3;
                if (data.notebook_id === void 0 && (missing3 = "notebook_id") || data.snapshot_id === void 0 && (missing3 = "snapshot_id") || data.op === void 0 && (missing3 = "op") || data.run_id === void 0 && (missing3 = "run_id")) {
                  const err37 = { instancePath, schemaPath: "#/$defs/ResearchRunCommand/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" };
                  if (vErrors === null) {
                    vErrors = [err37];
                  } else {
                    vErrors.push(err37);
                  }
                  errors++;
                } else {
                  const _errs45 = errors;
                  for (const key3 in data) {
                    if (!(key3 === "notebook_id" || key3 === "snapshot_id" || key3 === "op" || key3 === "run_id")) {
                      const err38 = { instancePath, schemaPath: "#/$defs/ResearchRunCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                      if (vErrors === null) {
                        vErrors = [err38];
                      } else {
                        vErrors.push(err38);
                      }
                      errors++;
                      break;
                    }
                  }
                  if (_errs45 === errors) {
                    if (data.notebook_id !== void 0) {
                      let data13 = data.notebook_id;
                      const _errs46 = errors;
                      if (errors === _errs46) {
                        if (typeof data13 === "string") {
                          if (!pattern4.test(data13)) {
                            const err39 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ResearchRunCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                            if (vErrors === null) {
                              vErrors = [err39];
                            } else {
                              vErrors.push(err39);
                            }
                            errors++;
                          }
                        } else {
                          const err40 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ResearchRunCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err40];
                          } else {
                            vErrors.push(err40);
                          }
                          errors++;
                        }
                      }
                      var valid8 = _errs46 === errors;
                    } else {
                      var valid8 = true;
                    }
                    if (valid8) {
                      if (data.snapshot_id !== void 0) {
                        let data14 = data.snapshot_id;
                        const _errs48 = errors;
                        if (errors === _errs48) {
                          if (typeof data14 === "string") {
                            if (!pattern5.test(data14)) {
                              const err41 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ResearchRunCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                              if (vErrors === null) {
                                vErrors = [err41];
                              } else {
                                vErrors.push(err41);
                              }
                              errors++;
                            }
                          } else {
                            const err42 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ResearchRunCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err42];
                            } else {
                              vErrors.push(err42);
                            }
                            errors++;
                          }
                        }
                        var valid8 = _errs48 === errors;
                      } else {
                        var valid8 = true;
                      }
                      if (valid8) {
                        if (data.op !== void 0) {
                          let data15 = data.op;
                          const _errs50 = errors;
                          if (typeof data15 !== "string") {
                            const err43 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ResearchRunCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err43];
                            } else {
                              vErrors.push(err43);
                            }
                            errors++;
                          }
                          if (!(data15 === "research.run" || data15 === "research.preview")) {
                            const err44 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ResearchRunCommand/properties/op/enum", keyword: "enum", params: { allowedValues: schema43.properties.op.enum }, message: "must be equal to one of the allowed values" };
                            if (vErrors === null) {
                              vErrors = [err44];
                            } else {
                              vErrors.push(err44);
                            }
                            errors++;
                          }
                          var valid8 = _errs50 === errors;
                        } else {
                          var valid8 = true;
                        }
                        if (valid8) {
                          if (data.run_id !== void 0) {
                            let data16 = data.run_id;
                            const _errs52 = errors;
                            if (errors === _errs52) {
                              if (typeof data16 === "string") {
                                if (!pattern10.test(data16)) {
                                  const err45 = { instancePath: instancePath + "/run_id", schemaPath: "#/$defs/ResearchRunCommand/properties/run_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err45];
                                  } else {
                                    vErrors.push(err45);
                                  }
                                  errors++;
                                }
                              } else {
                                const err46 = { instancePath: instancePath + "/run_id", schemaPath: "#/$defs/ResearchRunCommand/properties/run_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err46];
                                } else {
                                  vErrors.push(err46);
                                }
                                errors++;
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
              } else {
                const err47 = { instancePath, schemaPath: "#/$defs/ResearchRunCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err47];
                } else {
                  vErrors.push(err47);
                }
                errors++;
              }
            }
            var _valid0 = _errs42 === errors;
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
              const _errs54 = errors;
              if (!validate31(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs54 === errors;
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
                const _errs55 = errors;
                const _errs56 = errors;
                if (errors === _errs56) {
                  if (data && typeof data == "object" && !Array.isArray(data)) {
                    let missing4;
                    if (data.notebook_id === void 0 && (missing4 = "notebook_id") || data.snapshot_id === void 0 && (missing4 = "snapshot_id") || data.op === void 0 && (missing4 = "op") || data.version_id === void 0 && (missing4 = "version_id")) {
                      const err48 = { instancePath, schemaPath: "#/$defs/ArtifactReadCommand/required", keyword: "required", params: { missingProperty: missing4 }, message: "must have required property '" + missing4 + "'" };
                      if (vErrors === null) {
                        vErrors = [err48];
                      } else {
                        vErrors.push(err48);
                      }
                      errors++;
                    } else {
                      const _errs58 = errors;
                      for (const key4 in data) {
                        if (!(key4 === "notebook_id" || key4 === "snapshot_id" || key4 === "op" || key4 === "version_id")) {
                          const err49 = { instancePath, schemaPath: "#/$defs/ArtifactReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                          if (vErrors === null) {
                            vErrors = [err49];
                          } else {
                            vErrors.push(err49);
                          }
                          errors++;
                          break;
                        }
                      }
                      if (_errs58 === errors) {
                        if (data.notebook_id !== void 0) {
                          let data17 = data.notebook_id;
                          const _errs59 = errors;
                          if (errors === _errs59) {
                            if (typeof data17 === "string") {
                              if (!pattern4.test(data17)) {
                                const err50 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ArtifactReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                if (vErrors === null) {
                                  vErrors = [err50];
                                } else {
                                  vErrors.push(err50);
                                }
                                errors++;
                              }
                            } else {
                              const err51 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ArtifactReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err51];
                              } else {
                                vErrors.push(err51);
                              }
                              errors++;
                            }
                          }
                          var valid10 = _errs59 === errors;
                        } else {
                          var valid10 = true;
                        }
                        if (valid10) {
                          if (data.snapshot_id !== void 0) {
                            let data18 = data.snapshot_id;
                            const _errs61 = errors;
                            if (errors === _errs61) {
                              if (typeof data18 === "string") {
                                if (!pattern5.test(data18)) {
                                  const err52 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ArtifactReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                  if (vErrors === null) {
                                    vErrors = [err52];
                                  } else {
                                    vErrors.push(err52);
                                  }
                                  errors++;
                                }
                              } else {
                                const err53 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ArtifactReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err53];
                                } else {
                                  vErrors.push(err53);
                                }
                                errors++;
                              }
                            }
                            var valid10 = _errs61 === errors;
                          } else {
                            var valid10 = true;
                          }
                          if (valid10) {
                            if (data.op !== void 0) {
                              let data19 = data.op;
                              const _errs63 = errors;
                              if (typeof data19 !== "string") {
                                const err54 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ArtifactReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err54];
                                } else {
                                  vErrors.push(err54);
                                }
                                errors++;
                              }
                              if ("research.artifact" !== data19) {
                                const err55 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ArtifactReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "research.artifact" }, message: "must be equal to constant" };
                                if (vErrors === null) {
                                  vErrors = [err55];
                                } else {
                                  vErrors.push(err55);
                                }
                                errors++;
                              }
                              var valid10 = _errs63 === errors;
                            } else {
                              var valid10 = true;
                            }
                            if (valid10) {
                              if (data.version_id !== void 0) {
                                let data20 = data.version_id;
                                const _errs65 = errors;
                                if (errors === _errs65) {
                                  if (typeof data20 === "string") {
                                    if (!pattern10.test(data20)) {
                                      const err56 = { instancePath: instancePath + "/version_id", schemaPath: "#/$defs/ArtifactReadCommand/properties/version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                      if (vErrors === null) {
                                        vErrors = [err56];
                                      } else {
                                        vErrors.push(err56);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err57 = { instancePath: instancePath + "/version_id", schemaPath: "#/$defs/ArtifactReadCommand/properties/version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err57];
                                    } else {
                                      vErrors.push(err57);
                                    }
                                    errors++;
                                  }
                                }
                                var valid10 = _errs65 === errors;
                              } else {
                                var valid10 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    const err58 = { instancePath, schemaPath: "#/$defs/ArtifactReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                      vErrors = [err58];
                    } else {
                      vErrors.push(err58);
                    }
                    errors++;
                  }
                }
                var _valid0 = _errs55 === errors;
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
                  const _errs67 = errors;
                  const _errs68 = errors;
                  if (errors === _errs68) {
                    if (data && typeof data == "object" && !Array.isArray(data)) {
                      let missing5;
                      if (data.notebook_id === void 0 && (missing5 = "notebook_id") || data.snapshot_id === void 0 && (missing5 = "snapshot_id") || data.op === void 0 && (missing5 = "op") || data.version_id === void 0 && (missing5 = "version_id") || data.offset === void 0 && (missing5 = "offset")) {
                        const err59 = { instancePath, schemaPath: "#/$defs/ArtifactVersionsCommand/required", keyword: "required", params: { missingProperty: missing5 }, message: "must have required property '" + missing5 + "'" };
                        if (vErrors === null) {
                          vErrors = [err59];
                        } else {
                          vErrors.push(err59);
                        }
                        errors++;
                      } else {
                        const _errs70 = errors;
                        for (const key5 in data) {
                          if (!(key5 === "notebook_id" || key5 === "snapshot_id" || key5 === "op" || key5 === "version_id" || key5 === "offset")) {
                            const err60 = { instancePath, schemaPath: "#/$defs/ArtifactVersionsCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                              vErrors = [err60];
                            } else {
                              vErrors.push(err60);
                            }
                            errors++;
                            break;
                          }
                        }
                        if (_errs70 === errors) {
                          if (data.notebook_id !== void 0) {
                            let data21 = data.notebook_id;
                            const _errs71 = errors;
                            if (errors === _errs71) {
                              if (typeof data21 === "string") {
                                if (!pattern4.test(data21)) {
                                  const err61 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err61];
                                  } else {
                                    vErrors.push(err61);
                                  }
                                  errors++;
                                }
                              } else {
                                const err62 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err62];
                                } else {
                                  vErrors.push(err62);
                                }
                                errors++;
                              }
                            }
                            var valid12 = _errs71 === errors;
                          } else {
                            var valid12 = true;
                          }
                          if (valid12) {
                            if (data.snapshot_id !== void 0) {
                              let data22 = data.snapshot_id;
                              const _errs73 = errors;
                              if (errors === _errs73) {
                                if (typeof data22 === "string") {
                                  if (!pattern5.test(data22)) {
                                    const err63 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                    if (vErrors === null) {
                                      vErrors = [err63];
                                    } else {
                                      vErrors.push(err63);
                                    }
                                    errors++;
                                  }
                                } else {
                                  const err64 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err64];
                                  } else {
                                    vErrors.push(err64);
                                  }
                                  errors++;
                                }
                              }
                              var valid12 = _errs73 === errors;
                            } else {
                              var valid12 = true;
                            }
                            if (valid12) {
                              if (data.op !== void 0) {
                                let data23 = data.op;
                                const _errs75 = errors;
                                if (typeof data23 !== "string") {
                                  const err65 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err65];
                                  } else {
                                    vErrors.push(err65);
                                  }
                                  errors++;
                                }
                                if ("research.versions" !== data23) {
                                  const err66 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/op/const", keyword: "const", params: { allowedValue: "research.versions" }, message: "must be equal to constant" };
                                  if (vErrors === null) {
                                    vErrors = [err66];
                                  } else {
                                    vErrors.push(err66);
                                  }
                                  errors++;
                                }
                                var valid12 = _errs75 === errors;
                              } else {
                                var valid12 = true;
                              }
                              if (valid12) {
                                if (data.version_id !== void 0) {
                                  let data24 = data.version_id;
                                  const _errs77 = errors;
                                  if (errors === _errs77) {
                                    if (typeof data24 === "string") {
                                      if (!pattern10.test(data24)) {
                                        const err67 = { instancePath: instancePath + "/version_id", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/version_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                        if (vErrors === null) {
                                          vErrors = [err67];
                                        } else {
                                          vErrors.push(err67);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err68 = { instancePath: instancePath + "/version_id", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/version_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err68];
                                      } else {
                                        vErrors.push(err68);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid12 = _errs77 === errors;
                                } else {
                                  var valid12 = true;
                                }
                                if (valid12) {
                                  if (data.offset !== void 0) {
                                    let data25 = data.offset;
                                    const _errs79 = errors;
                                    if (!(typeof data25 == "number" && (!(data25 % 1) && !isNaN(data25)) && isFinite(data25))) {
                                      const err69 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                      if (vErrors === null) {
                                        vErrors = [err69];
                                      } else {
                                        vErrors.push(err69);
                                      }
                                      errors++;
                                    }
                                    if (errors === _errs79) {
                                      if (typeof data25 == "number" && isFinite(data25)) {
                                        if (data25 > 1e6 || isNaN(data25)) {
                                          const err70 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                          if (vErrors === null) {
                                            vErrors = [err70];
                                          } else {
                                            vErrors.push(err70);
                                          }
                                          errors++;
                                        } else {
                                          if (data25 < 0 || isNaN(data25)) {
                                            const err71 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ArtifactVersionsCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                            if (vErrors === null) {
                                              vErrors = [err71];
                                            } else {
                                              vErrors.push(err71);
                                            }
                                            errors++;
                                          }
                                        }
                                      }
                                    }
                                    var valid12 = _errs79 === errors;
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
                      const err72 = { instancePath, schemaPath: "#/$defs/ArtifactVersionsCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                      if (vErrors === null) {
                        vErrors = [err72];
                      } else {
                        vErrors.push(err72);
                      }
                      errors++;
                    }
                  }
                  var _valid0 = _errs67 === errors;
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
                    const _errs81 = errors;
                    if (!validate33(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate33.errors : vErrors.concat(validate33.errors);
                      errors = vErrors.length;
                    }
                    var _valid0 = _errs81 === errors;
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
                      const _errs82 = errors;
                      if (!validate43(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
                        errors = vErrors.length;
                      }
                      var _valid0 = _errs82 === errors;
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
                        const _errs83 = errors;
                        if (!validate45(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                          vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
                          errors = vErrors.length;
                        }
                        var _valid0 = _errs83 === errors;
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
                          const _errs84 = errors;
                          const _errs85 = errors;
                          if (errors === _errs85) {
                            if (data && typeof data == "object" && !Array.isArray(data)) {
                              let missing6;
                              if (data.notebook_id === void 0 && (missing6 = "notebook_id") || data.snapshot_id === void 0 && (missing6 = "snapshot_id") || data.op === void 0 && (missing6 = "op") || data.intent_id === void 0 && (missing6 = "intent_id")) {
                                const err73 = { instancePath, schemaPath: "#/$defs/NoteReadCommand/required", keyword: "required", params: { missingProperty: missing6 }, message: "must have required property '" + missing6 + "'" };
                                if (vErrors === null) {
                                  vErrors = [err73];
                                } else {
                                  vErrors.push(err73);
                                }
                                errors++;
                              } else {
                                const _errs87 = errors;
                                for (const key6 in data) {
                                  if (!(key6 === "notebook_id" || key6 === "snapshot_id" || key6 === "op" || key6 === "intent_id")) {
                                    const err74 = { instancePath, schemaPath: "#/$defs/NoteReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
                                    if (vErrors === null) {
                                      vErrors = [err74];
                                    } else {
                                      vErrors.push(err74);
                                    }
                                    errors++;
                                    break;
                                  }
                                }
                                if (_errs87 === errors) {
                                  if (data.notebook_id !== void 0) {
                                    let data26 = data.notebook_id;
                                    const _errs88 = errors;
                                    if (errors === _errs88) {
                                      if (typeof data26 === "string") {
                                        if (!pattern4.test(data26)) {
                                          const err75 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/NoteReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                          if (vErrors === null) {
                                            vErrors = [err75];
                                          } else {
                                            vErrors.push(err75);
                                          }
                                          errors++;
                                        }
                                      } else {
                                        const err76 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/NoteReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                        if (vErrors === null) {
                                          vErrors = [err76];
                                        } else {
                                          vErrors.push(err76);
                                        }
                                        errors++;
                                      }
                                    }
                                    var valid14 = _errs88 === errors;
                                  } else {
                                    var valid14 = true;
                                  }
                                  if (valid14) {
                                    if (data.snapshot_id !== void 0) {
                                      let data27 = data.snapshot_id;
                                      const _errs90 = errors;
                                      if (errors === _errs90) {
                                        if (typeof data27 === "string") {
                                          if (!pattern5.test(data27)) {
                                            const err77 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/NoteReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                            if (vErrors === null) {
                                              vErrors = [err77];
                                            } else {
                                              vErrors.push(err77);
                                            }
                                            errors++;
                                          }
                                        } else {
                                          const err78 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/NoteReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err78];
                                          } else {
                                            vErrors.push(err78);
                                          }
                                          errors++;
                                        }
                                      }
                                      var valid14 = _errs90 === errors;
                                    } else {
                                      var valid14 = true;
                                    }
                                    if (valid14) {
                                      if (data.op !== void 0) {
                                        let data28 = data.op;
                                        const _errs92 = errors;
                                        if (typeof data28 !== "string") {
                                          const err79 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/NoteReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err79];
                                          } else {
                                            vErrors.push(err79);
                                          }
                                          errors++;
                                        }
                                        if ("research.notes.read" !== data28) {
                                          const err80 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/NoteReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "research.notes.read" }, message: "must be equal to constant" };
                                          if (vErrors === null) {
                                            vErrors = [err80];
                                          } else {
                                            vErrors.push(err80);
                                          }
                                          errors++;
                                        }
                                        var valid14 = _errs92 === errors;
                                      } else {
                                        var valid14 = true;
                                      }
                                      if (valid14) {
                                        if (data.intent_id !== void 0) {
                                          let data29 = data.intent_id;
                                          const _errs94 = errors;
                                          if (errors === _errs94) {
                                            if (typeof data29 === "string") {
                                              if (!pattern10.test(data29)) {
                                                const err81 = { instancePath: instancePath + "/intent_id", schemaPath: "#/$defs/NoteReadCommand/properties/intent_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                                if (vErrors === null) {
                                                  vErrors = [err81];
                                                } else {
                                                  vErrors.push(err81);
                                                }
                                                errors++;
                                              }
                                            } else {
                                              const err82 = { instancePath: instancePath + "/intent_id", schemaPath: "#/$defs/NoteReadCommand/properties/intent_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                              if (vErrors === null) {
                                                vErrors = [err82];
                                              } else {
                                                vErrors.push(err82);
                                              }
                                              errors++;
                                            }
                                          }
                                          var valid14 = _errs94 === errors;
                                        } else {
                                          var valid14 = true;
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            } else {
                              const err83 = { instancePath, schemaPath: "#/$defs/NoteReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                              if (vErrors === null) {
                                vErrors = [err83];
                              } else {
                                vErrors.push(err83);
                              }
                              errors++;
                            }
                          }
                          var _valid0 = _errs84 === errors;
                          if (_valid0 && valid0) {
                            valid0 = false;
                            passing0 = [passing0, 13];
                          } else {
                            if (_valid0) {
                              valid0 = true;
                              passing0 = 13;
                              if (props0 !== true) {
                                props0 = true;
                              }
                            }
                            const _errs96 = errors;
                            if (!validate47(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                              vErrors = vErrors === null ? validate47.errors : vErrors.concat(validate47.errors);
                              errors = vErrors.length;
                            }
                            var _valid0 = _errs96 === errors;
                            if (_valid0 && valid0) {
                              valid0 = false;
                              passing0 = [passing0, 14];
                            } else {
                              if (_valid0) {
                                valid0 = true;
                                passing0 = 14;
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
    }
  }
  if (!valid0) {
    const err84 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err84];
    } else {
      vErrors.push(err84);
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
  validate_research_command_generated_default as default,
  validate
};
