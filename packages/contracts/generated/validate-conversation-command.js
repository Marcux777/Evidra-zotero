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

// validate-conversation-command.generated.js
var validate = validate20;
var validate_conversation_command_generated_default = validate20;
var schema40 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["conversation.run", "conversation.start", "conversation.cancel"], "title": "Op", "type": "string" }, "run_id": { "pattern": "^[a-f0-9]{32}$", "title": "Run Id", "type": "string" } }, "required": ["notebook_id", "snapshot_id", "op", "run_id"], "title": "ConversationRunCommand", "type": "object" };
var schema44 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "enum": ["conversation.vectors.read", "conversation.vectors.cancel"], "title": "Op", "type": "string" }, "job_id": { "pattern": "^[a-f0-9]{32}$", "title": "Job Id", "type": "string" } }, "required": ["notebook_id", "snapshot_id", "op", "job_id"], "title": "VectorJobCommand", "type": "object" };
var pattern4 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern5 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
var pattern10 = new RegExp("^[a-f0-9]{32}$", "u");
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
                if ("conversation.create" !== data2) {
                  validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "conversation.create" }, message: "must be equal to constant" }];
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
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                        validate21.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ConversationCreate/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key")) {
                            validate21.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ConversationCreate/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate21.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ConversationCreate/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate21.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ConversationCreate/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate21.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ConversationCreate/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                          }
                        }
                      }
                    } else {
                      validate21.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ConversationCreate/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
var schema38 = { "additionalProperties": false, "properties": { "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" }, "profile_id": { "pattern": "^[a-zA-Z0-9_-]{1,100}$", "title": "Profile Id", "type": "string" }, "question": { "maxLength": 2e3, "minLength": 1, "title": "Question", "type": "string" }, "context_tokens": { "maximum": 1e6, "minimum": 1024, "title": "Context Tokens", "type": "integer" }, "max_output_tokens": { "maximum": 32768, "minimum": 1, "title": "Max Output Tokens", "type": "integer" }, "ollama_options": { "anyOf": [{ "$ref": "#/$defs/OllamaOptions" }, { "type": "null" }], "default": null }, "evidence_id": { "anyOf": [{ "pattern": "^[a-f0-9]{64}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Evidence Id" }, "document_version_id": { "anyOf": [{ "pattern": "^[a-f0-9]{64}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Document Version Id" }, "embedding_profile_id": { "anyOf": [{ "pattern": "^[a-zA-Z0-9_-]{1,100}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Embedding Profile Id" }, "preview_operation_id": { "anyOf": [{ "pattern": "^[a-f0-9]{32}$", "type": "string" }, { "type": "null" }], "default": null, "title": "Preview Operation Id" } }, "required": ["idempotency_key", "expected_revision", "profile_id", "question", "context_tokens", "max_output_tokens"], "title": "RunPrepare", "type": "object" };
var func3 = Object.prototype.hasOwnProperty;
var pattern17 = new RegExp("^[a-zA-Z0-9_-]{1,100}$", "u");
var pattern18 = new RegExp("^[a-f0-9]{64}$", "u");
function validate24(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate24.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.idempotency_key === void 0 && (missing0 = "idempotency_key") || data.expected_revision === void 0 && (missing0 = "expected_revision") || data.profile_id === void 0 && (missing0 = "profile_id") || data.question === void 0 && (missing0 = "question") || data.context_tokens === void 0 && (missing0 = "context_tokens") || data.max_output_tokens === void 0 && (missing0 = "max_output_tokens")) {
        validate24.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!func3.call(schema38.properties, key0)) {
            validate24.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                  validate24.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                  return false;
                } else {
                  if (func1(data0) < 1) {
                    validate24.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                    return false;
                  }
                }
              } else {
                validate24.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                validate24.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 < 0 || isNaN(data1)) {
                    validate24.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.profile_id !== void 0) {
                let data2 = data.profile_id;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (!pattern17.test(data2)) {
                      validate24.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                      return false;
                    }
                  } else {
                    validate24.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.question !== void 0) {
                  let data3 = data.question;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 2e3) {
                        validate24.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                        return false;
                      } else {
                        if (func1(data3) < 1) {
                          validate24.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                          return false;
                        }
                      }
                    } else {
                      validate24.errors = [{ instancePath: instancePath + "/question", schemaPath: "#/properties/question/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.context_tokens !== void 0) {
                    let data4 = data.context_tokens;
                    const _errs10 = errors;
                    if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                      validate24.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                      return false;
                    }
                    if (errors === _errs10) {
                      if (typeof data4 == "number" && isFinite(data4)) {
                        if (data4 > 1e6 || isNaN(data4)) {
                          validate24.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" }];
                          return false;
                        } else {
                          if (data4 < 1024 || isNaN(data4)) {
                            validate24.errors = [{ instancePath: instancePath + "/context_tokens", schemaPath: "#/properties/context_tokens/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1024 }, message: "must be >= 1024" }];
                            return false;
                          }
                        }
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.max_output_tokens !== void 0) {
                      let data5 = data.max_output_tokens;
                      const _errs12 = errors;
                      if (!(typeof data5 == "number" && (!(data5 % 1) && !isNaN(data5)) && isFinite(data5))) {
                        validate24.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                        return false;
                      }
                      if (errors === _errs12) {
                        if (typeof data5 == "number" && isFinite(data5)) {
                          if (data5 > 32768 || isNaN(data5)) {
                            validate24.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/maximum", keyword: "maximum", params: { comparison: "<=", limit: 32768 }, message: "must be <= 32768" }];
                            return false;
                          } else {
                            if (data5 < 1 || isNaN(data5)) {
                              validate24.errors = [{ instancePath: instancePath + "/max_output_tokens", schemaPath: "#/properties/max_output_tokens/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                              return false;
                            }
                          }
                        }
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.ollama_options !== void 0) {
                        let data6 = data.ollama_options;
                        const _errs14 = errors;
                        const _errs15 = errors;
                        let valid1 = false;
                        const _errs16 = errors;
                        const _errs17 = errors;
                        if (errors === _errs17) {
                          if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
                            const _errs19 = errors;
                            for (const key1 in data6) {
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
                            if (_errs19 === errors) {
                              if (data6.num_ctx !== void 0) {
                                let data7 = data6.num_ctx;
                                const _errs20 = errors;
                                const _errs21 = errors;
                                let valid4 = false;
                                const _errs22 = errors;
                                if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                                  const err1 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                  if (vErrors === null) {
                                    vErrors = [err1];
                                  } else {
                                    vErrors.push(err1);
                                  }
                                  errors++;
                                }
                                if (errors === _errs22) {
                                  if (typeof data7 == "number" && isFinite(data7)) {
                                    if (data7 <= 0 || isNaN(data7)) {
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
                                var _valid1 = _errs22 === errors;
                                valid4 = valid4 || _valid1;
                                const _errs24 = errors;
                                if (data7 !== null) {
                                  const err3 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                  if (vErrors === null) {
                                    vErrors = [err3];
                                  } else {
                                    vErrors.push(err3);
                                  }
                                  errors++;
                                }
                                var _valid1 = _errs24 === errors;
                                valid4 = valid4 || _valid1;
                                if (!valid4) {
                                  const err4 = { instancePath: instancePath + "/ollama_options/num_ctx", schemaPath: "#/$defs/OllamaOptions/properties/num_ctx/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                  if (vErrors === null) {
                                    vErrors = [err4];
                                  } else {
                                    vErrors.push(err4);
                                  }
                                  errors++;
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
                                var valid3 = _errs20 === errors;
                              } else {
                                var valid3 = true;
                              }
                              if (valid3) {
                                if (data6.temperature !== void 0) {
                                  let data8 = data6.temperature;
                                  const _errs26 = errors;
                                  const _errs27 = errors;
                                  let valid5 = false;
                                  const _errs28 = errors;
                                  if (errors === _errs28) {
                                    if (typeof data8 == "number" && isFinite(data8)) {
                                      if (data8 > 2 || isNaN(data8)) {
                                        const err5 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 2 }, message: "must be <= 2" };
                                        if (vErrors === null) {
                                          vErrors = [err5];
                                        } else {
                                          vErrors.push(err5);
                                        }
                                        errors++;
                                      } else {
                                        if (data8 < 0 || isNaN(data8)) {
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
                                  var _valid2 = _errs28 === errors;
                                  valid5 = valid5 || _valid2;
                                  const _errs30 = errors;
                                  if (data8 !== null) {
                                    const err8 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                    if (vErrors === null) {
                                      vErrors = [err8];
                                    } else {
                                      vErrors.push(err8);
                                    }
                                    errors++;
                                  }
                                  var _valid2 = _errs30 === errors;
                                  valid5 = valid5 || _valid2;
                                  if (!valid5) {
                                    const err9 = { instancePath: instancePath + "/ollama_options/temperature", schemaPath: "#/$defs/OllamaOptions/properties/temperature/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                    if (vErrors === null) {
                                      vErrors = [err9];
                                    } else {
                                      vErrors.push(err9);
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
                                  var valid3 = _errs26 === errors;
                                } else {
                                  var valid3 = true;
                                }
                                if (valid3) {
                                  if (data6.seed !== void 0) {
                                    let data9 = data6.seed;
                                    const _errs32 = errors;
                                    const _errs33 = errors;
                                    let valid6 = false;
                                    const _errs34 = errors;
                                    if (!(typeof data9 == "number" && (!(data9 % 1) && !isNaN(data9)) && isFinite(data9))) {
                                      const err10 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                      if (vErrors === null) {
                                        vErrors = [err10];
                                      } else {
                                        vErrors.push(err10);
                                      }
                                      errors++;
                                    }
                                    var _valid3 = _errs34 === errors;
                                    valid6 = valid6 || _valid3;
                                    const _errs36 = errors;
                                    if (data9 !== null) {
                                      const err11 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                      if (vErrors === null) {
                                        vErrors = [err11];
                                      } else {
                                        vErrors.push(err11);
                                      }
                                      errors++;
                                    }
                                    var _valid3 = _errs36 === errors;
                                    valid6 = valid6 || _valid3;
                                    if (!valid6) {
                                      const err12 = { instancePath: instancePath + "/ollama_options/seed", schemaPath: "#/$defs/OllamaOptions/properties/seed/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err12];
                                      } else {
                                        vErrors.push(err12);
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
                                    var valid3 = _errs32 === errors;
                                  } else {
                                    var valid3 = true;
                                  }
                                  if (valid3) {
                                    if (data6.think !== void 0) {
                                      let data10 = data6.think;
                                      const _errs38 = errors;
                                      const _errs39 = errors;
                                      let valid7 = false;
                                      const _errs40 = errors;
                                      if (typeof data10 !== "boolean") {
                                        const err13 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf/0/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                                        if (vErrors === null) {
                                          vErrors = [err13];
                                        } else {
                                          vErrors.push(err13);
                                        }
                                        errors++;
                                      }
                                      var _valid4 = _errs40 === errors;
                                      valid7 = valid7 || _valid4;
                                      const _errs42 = errors;
                                      if (data10 !== null) {
                                        const err14 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                        if (vErrors === null) {
                                          vErrors = [err14];
                                        } else {
                                          vErrors.push(err14);
                                        }
                                        errors++;
                                      }
                                      var _valid4 = _errs42 === errors;
                                      valid7 = valid7 || _valid4;
                                      if (!valid7) {
                                        const err15 = { instancePath: instancePath + "/ollama_options/think", schemaPath: "#/$defs/OllamaOptions/properties/think/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                        if (vErrors === null) {
                                          vErrors = [err15];
                                        } else {
                                          vErrors.push(err15);
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
                                      var valid3 = _errs38 === errors;
                                    } else {
                                      var valid3 = true;
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
                        var _valid0 = _errs16 === errors;
                        valid1 = valid1 || _valid0;
                        const _errs44 = errors;
                        if (data6 !== null) {
                          const err17 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/properties/ollama_options/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                          if (vErrors === null) {
                            vErrors = [err17];
                          } else {
                            vErrors.push(err17);
                          }
                          errors++;
                        }
                        var _valid0 = _errs44 === errors;
                        valid1 = valid1 || _valid0;
                        if (!valid1) {
                          const err18 = { instancePath: instancePath + "/ollama_options", schemaPath: "#/properties/ollama_options/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                          if (vErrors === null) {
                            vErrors = [err18];
                          } else {
                            vErrors.push(err18);
                          }
                          errors++;
                          validate24.errors = vErrors;
                          return false;
                        } else {
                          errors = _errs15;
                          if (vErrors !== null) {
                            if (_errs15) {
                              vErrors.length = _errs15;
                            } else {
                              vErrors = null;
                            }
                          }
                        }
                        var valid0 = _errs14 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.evidence_id !== void 0) {
                          let data11 = data.evidence_id;
                          const _errs46 = errors;
                          const _errs47 = errors;
                          let valid8 = false;
                          const _errs48 = errors;
                          if (errors === _errs48) {
                            if (typeof data11 === "string") {
                              if (!pattern18.test(data11)) {
                                const err19 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/properties/evidence_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                                if (vErrors === null) {
                                  vErrors = [err19];
                                } else {
                                  vErrors.push(err19);
                                }
                                errors++;
                              }
                            } else {
                              const err20 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/properties/evidence_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err20];
                              } else {
                                vErrors.push(err20);
                              }
                              errors++;
                            }
                          }
                          var _valid5 = _errs48 === errors;
                          valid8 = valid8 || _valid5;
                          const _errs50 = errors;
                          if (data11 !== null) {
                            const err21 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/properties/evidence_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                            if (vErrors === null) {
                              vErrors = [err21];
                            } else {
                              vErrors.push(err21);
                            }
                            errors++;
                          }
                          var _valid5 = _errs50 === errors;
                          valid8 = valid8 || _valid5;
                          if (!valid8) {
                            const err22 = { instancePath: instancePath + "/evidence_id", schemaPath: "#/properties/evidence_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                            if (vErrors === null) {
                              vErrors = [err22];
                            } else {
                              vErrors.push(err22);
                            }
                            errors++;
                            validate24.errors = vErrors;
                            return false;
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
                          var valid0 = _errs46 === errors;
                        } else {
                          var valid0 = true;
                        }
                        if (valid0) {
                          if (data.document_version_id !== void 0) {
                            let data12 = data.document_version_id;
                            const _errs52 = errors;
                            const _errs53 = errors;
                            let valid9 = false;
                            const _errs54 = errors;
                            if (errors === _errs54) {
                              if (typeof data12 === "string") {
                                if (!pattern18.test(data12)) {
                                  const err23 = { instancePath: instancePath + "/document_version_id", schemaPath: "#/properties/document_version_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err23];
                                  } else {
                                    vErrors.push(err23);
                                  }
                                  errors++;
                                }
                              } else {
                                const err24 = { instancePath: instancePath + "/document_version_id", schemaPath: "#/properties/document_version_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err24];
                                } else {
                                  vErrors.push(err24);
                                }
                                errors++;
                              }
                            }
                            var _valid6 = _errs54 === errors;
                            valid9 = valid9 || _valid6;
                            const _errs56 = errors;
                            if (data12 !== null) {
                              const err25 = { instancePath: instancePath + "/document_version_id", schemaPath: "#/properties/document_version_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                              if (vErrors === null) {
                                vErrors = [err25];
                              } else {
                                vErrors.push(err25);
                              }
                              errors++;
                            }
                            var _valid6 = _errs56 === errors;
                            valid9 = valid9 || _valid6;
                            if (!valid9) {
                              const err26 = { instancePath: instancePath + "/document_version_id", schemaPath: "#/properties/document_version_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                              if (vErrors === null) {
                                vErrors = [err26];
                              } else {
                                vErrors.push(err26);
                              }
                              errors++;
                              validate24.errors = vErrors;
                              return false;
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
                            var valid0 = _errs52 === errors;
                          } else {
                            var valid0 = true;
                          }
                          if (valid0) {
                            if (data.embedding_profile_id !== void 0) {
                              let data13 = data.embedding_profile_id;
                              const _errs58 = errors;
                              const _errs59 = errors;
                              let valid10 = false;
                              const _errs60 = errors;
                              if (errors === _errs60) {
                                if (typeof data13 === "string") {
                                  if (!pattern17.test(data13)) {
                                    const err27 = { instancePath: instancePath + "/embedding_profile_id", schemaPath: "#/properties/embedding_profile_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' };
                                    if (vErrors === null) {
                                      vErrors = [err27];
                                    } else {
                                      vErrors.push(err27);
                                    }
                                    errors++;
                                  }
                                } else {
                                  const err28 = { instancePath: instancePath + "/embedding_profile_id", schemaPath: "#/properties/embedding_profile_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err28];
                                  } else {
                                    vErrors.push(err28);
                                  }
                                  errors++;
                                }
                              }
                              var _valid7 = _errs60 === errors;
                              valid10 = valid10 || _valid7;
                              const _errs62 = errors;
                              if (data13 !== null) {
                                const err29 = { instancePath: instancePath + "/embedding_profile_id", schemaPath: "#/properties/embedding_profile_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                if (vErrors === null) {
                                  vErrors = [err29];
                                } else {
                                  vErrors.push(err29);
                                }
                                errors++;
                              }
                              var _valid7 = _errs62 === errors;
                              valid10 = valid10 || _valid7;
                              if (!valid10) {
                                const err30 = { instancePath: instancePath + "/embedding_profile_id", schemaPath: "#/properties/embedding_profile_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                if (vErrors === null) {
                                  vErrors = [err30];
                                } else {
                                  vErrors.push(err30);
                                }
                                errors++;
                                validate24.errors = vErrors;
                                return false;
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
                              var valid0 = _errs58 === errors;
                            } else {
                              var valid0 = true;
                            }
                            if (valid0) {
                              if (data.preview_operation_id !== void 0) {
                                let data14 = data.preview_operation_id;
                                const _errs64 = errors;
                                const _errs65 = errors;
                                let valid11 = false;
                                const _errs66 = errors;
                                if (errors === _errs66) {
                                  if (typeof data14 === "string") {
                                    if (!pattern10.test(data14)) {
                                      const err31 = { instancePath: instancePath + "/preview_operation_id", schemaPath: "#/properties/preview_operation_id/anyOf/0/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                      if (vErrors === null) {
                                        vErrors = [err31];
                                      } else {
                                        vErrors.push(err31);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err32 = { instancePath: instancePath + "/preview_operation_id", schemaPath: "#/properties/preview_operation_id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err32];
                                    } else {
                                      vErrors.push(err32);
                                    }
                                    errors++;
                                  }
                                }
                                var _valid8 = _errs66 === errors;
                                valid11 = valid11 || _valid8;
                                const _errs68 = errors;
                                if (data14 !== null) {
                                  const err33 = { instancePath: instancePath + "/preview_operation_id", schemaPath: "#/properties/preview_operation_id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                  if (vErrors === null) {
                                    vErrors = [err33];
                                  } else {
                                    vErrors.push(err33);
                                  }
                                  errors++;
                                }
                                var _valid8 = _errs68 === errors;
                                valid11 = valid11 || _valid8;
                                if (!valid11) {
                                  const err34 = { instancePath: instancePath + "/preview_operation_id", schemaPath: "#/properties/preview_operation_id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                  if (vErrors === null) {
                                    vErrors = [err34];
                                  } else {
                                    vErrors.push(err34);
                                  }
                                  errors++;
                                  validate24.errors = vErrors;
                                  return false;
                                } else {
                                  errors = _errs65;
                                  if (vErrors !== null) {
                                    if (_errs65) {
                                      vErrors.length = _errs65;
                                    } else {
                                      vErrors = null;
                                    }
                                  }
                                }
                                var valid0 = _errs64 === errors;
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
      validate24.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate24.errors = vErrors;
  return errors === 0;
}
validate24.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.conversation_id === void 0 && (missing0 = "conversation_id") || data.request === void 0 && (missing0 = "request")) {
        validate23.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "conversation_id" || key0 === "request")) {
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
                if ("conversation.prepare" !== data2) {
                  validate23.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "conversation.prepare" }, message: "must be equal to constant" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.conversation_id !== void 0) {
                  let data3 = data.conversation_id;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (!pattern10.test(data3)) {
                        validate23.errors = [{ instancePath: instancePath + "/conversation_id", schemaPath: "#/properties/conversation_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' }];
                        return false;
                      }
                    } else {
                      validate23.errors = [{ instancePath: instancePath + "/conversation_id", schemaPath: "#/properties/conversation_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                    if (!validate24(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
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
      validate23.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate23.errors = vErrors;
  return errors === 0;
}
validate23.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
                if ("conversation.vectors.build" !== data2) {
                  validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "conversation.vectors.build" }, message: "must be equal to constant" }];
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
                      if (data3.idempotency_key === void 0 && (missing1 = "idempotency_key") || data3.profile_id === void 0 && (missing1 = "profile_id")) {
                        validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/VectorBuild/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "idempotency_key" || key1 === "profile_id")) {
                            validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/VectorBuild/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
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
                                  validate27.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/VectorBuild/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate27.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/VectorBuild/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate27.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/VectorBuild/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.profile_id !== void 0) {
                              let data5 = data3.profile_id;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (!pattern17.test(data5)) {
                                    validate27.errors = [{ instancePath: instancePath + "/request/profile_id", schemaPath: "#/$defs/VectorBuild/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate27.errors = [{ instancePath: instancePath + "/request/profile_id", schemaPath: "#/$defs/VectorBuild/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                      validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/VectorBuild/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
        const err0 = { instancePath, schemaPath: "#/$defs/ConversationListCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
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
            const err1 = { instancePath, schemaPath: "#/$defs/ConversationListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
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
                  const err2 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationListCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                  if (vErrors === null) {
                    vErrors = [err2];
                  } else {
                    vErrors.push(err2);
                  }
                  errors++;
                }
              } else {
                const err3 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationListCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                    const err4 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationListCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                    if (vErrors === null) {
                      vErrors = [err4];
                    } else {
                      vErrors.push(err4);
                    }
                    errors++;
                  }
                } else {
                  const err5 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationListCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                  const err6 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
                if ("conversation.list" !== data2) {
                  const err7 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationListCommand/properties/op/const", keyword: "const", params: { allowedValue: "conversation.list" }, message: "must be equal to constant" };
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
                    const err8 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ConversationListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
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
                        const err9 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ConversationListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      } else {
                        if (data3 < 0 || isNaN(data3)) {
                          const err10 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ConversationListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
      const err11 = { instancePath, schemaPath: "#/$defs/ConversationListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
        if (data.notebook_id === void 0 && (missing1 = "notebook_id") || data.snapshot_id === void 0 && (missing1 = "snapshot_id") || data.op === void 0 && (missing1 = "op") || data.conversation_id === void 0 && (missing1 = "conversation_id")) {
          const err12 = { instancePath, schemaPath: "#/$defs/ConversationReadCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        } else {
          const _errs17 = errors;
          for (const key1 in data) {
            if (!(key1 === "notebook_id" || key1 === "snapshot_id" || key1 === "op" || key1 === "conversation_id")) {
              const err13 = { instancePath, schemaPath: "#/$defs/ConversationReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
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
                    const err14 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                    if (vErrors === null) {
                      vErrors = [err14];
                    } else {
                      vErrors.push(err14);
                    }
                    errors++;
                  }
                } else {
                  const err15 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                      const err16 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                      if (vErrors === null) {
                        vErrors = [err16];
                      } else {
                        vErrors.push(err16);
                      }
                      errors++;
                    }
                  } else {
                    const err17 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                    const err18 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err18];
                    } else {
                      vErrors.push(err18);
                    }
                    errors++;
                  }
                  if ("conversation.read" !== data6) {
                    const err19 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "conversation.read" }, message: "must be equal to constant" };
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
                  if (data.conversation_id !== void 0) {
                    let data7 = data.conversation_id;
                    const _errs24 = errors;
                    if (errors === _errs24) {
                      if (typeof data7 === "string") {
                        if (!pattern10.test(data7)) {
                          const err20 = { instancePath: instancePath + "/conversation_id", schemaPath: "#/$defs/ConversationReadCommand/properties/conversation_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                          if (vErrors === null) {
                            vErrors = [err20];
                          } else {
                            vErrors.push(err20);
                          }
                          errors++;
                        }
                      } else {
                        const err21 = { instancePath: instancePath + "/conversation_id", schemaPath: "#/$defs/ConversationReadCommand/properties/conversation_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
        const err22 = { instancePath, schemaPath: "#/$defs/ConversationReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
          if (data.notebook_id === void 0 && (missing2 = "notebook_id") || data.snapshot_id === void 0 && (missing2 = "snapshot_id") || data.op === void 0 && (missing2 = "op") || data.conversation_id === void 0 && (missing2 = "conversation_id") || data.offset === void 0 && (missing2 = "offset")) {
            const err23 = { instancePath, schemaPath: "#/$defs/ConversationHistoryCommand/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          } else {
            const _errs29 = errors;
            for (const key2 in data) {
              if (!(key2 === "notebook_id" || key2 === "snapshot_id" || key2 === "op" || key2 === "conversation_id" || key2 === "offset")) {
                const err24 = { instancePath, schemaPath: "#/$defs/ConversationHistoryCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
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
                      const err25 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationHistoryCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                      if (vErrors === null) {
                        vErrors = [err25];
                      } else {
                        vErrors.push(err25);
                      }
                      errors++;
                    }
                  } else {
                    const err26 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationHistoryCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                        const err27 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationHistoryCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                        if (vErrors === null) {
                          vErrors = [err27];
                        } else {
                          vErrors.push(err27);
                        }
                        errors++;
                      }
                    } else {
                      const err28 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationHistoryCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                      const err29 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationHistoryCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                      if (vErrors === null) {
                        vErrors = [err29];
                      } else {
                        vErrors.push(err29);
                      }
                      errors++;
                    }
                    if ("conversation.history" !== data10) {
                      const err30 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationHistoryCommand/properties/op/const", keyword: "const", params: { allowedValue: "conversation.history" }, message: "must be equal to constant" };
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
                    if (data.conversation_id !== void 0) {
                      let data11 = data.conversation_id;
                      const _errs36 = errors;
                      if (errors === _errs36) {
                        if (typeof data11 === "string") {
                          if (!pattern10.test(data11)) {
                            const err31 = { instancePath: instancePath + "/conversation_id", schemaPath: "#/$defs/ConversationHistoryCommand/properties/conversation_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                            if (vErrors === null) {
                              vErrors = [err31];
                            } else {
                              vErrors.push(err31);
                            }
                            errors++;
                          }
                        } else {
                          const err32 = { instancePath: instancePath + "/conversation_id", schemaPath: "#/$defs/ConversationHistoryCommand/properties/conversation_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
                          const err33 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ConversationHistoryCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
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
                              const err34 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ConversationHistoryCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                              if (vErrors === null) {
                                vErrors = [err34];
                              } else {
                                vErrors.push(err34);
                              }
                              errors++;
                            } else {
                              if (data12 < 0 || isNaN(data12)) {
                                const err35 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ConversationHistoryCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
          const err36 = { instancePath, schemaPath: "#/$defs/ConversationHistoryCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
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
        if (!validate23(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
          vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
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
          const _errs42 = errors;
          if (errors === _errs42) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing3;
              if (data.notebook_id === void 0 && (missing3 = "notebook_id") || data.snapshot_id === void 0 && (missing3 = "snapshot_id") || data.op === void 0 && (missing3 = "op") || data.run_id === void 0 && (missing3 = "run_id")) {
                const err37 = { instancePath, schemaPath: "#/$defs/ConversationRunCommand/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" };
                if (vErrors === null) {
                  vErrors = [err37];
                } else {
                  vErrors.push(err37);
                }
                errors++;
              } else {
                const _errs44 = errors;
                for (const key3 in data) {
                  if (!(key3 === "notebook_id" || key3 === "snapshot_id" || key3 === "op" || key3 === "run_id")) {
                    const err38 = { instancePath, schemaPath: "#/$defs/ConversationRunCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                      vErrors = [err38];
                    } else {
                      vErrors.push(err38);
                    }
                    errors++;
                    break;
                  }
                }
                if (_errs44 === errors) {
                  if (data.notebook_id !== void 0) {
                    let data13 = data.notebook_id;
                    const _errs45 = errors;
                    if (errors === _errs45) {
                      if (typeof data13 === "string") {
                        if (!pattern4.test(data13)) {
                          const err39 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationRunCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                          if (vErrors === null) {
                            vErrors = [err39];
                          } else {
                            vErrors.push(err39);
                          }
                          errors++;
                        }
                      } else {
                        const err40 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationRunCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err40];
                        } else {
                          vErrors.push(err40);
                        }
                        errors++;
                      }
                    }
                    var valid8 = _errs45 === errors;
                  } else {
                    var valid8 = true;
                  }
                  if (valid8) {
                    if (data.snapshot_id !== void 0) {
                      let data14 = data.snapshot_id;
                      const _errs47 = errors;
                      if (errors === _errs47) {
                        if (typeof data14 === "string") {
                          if (!pattern5.test(data14)) {
                            const err41 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationRunCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                            if (vErrors === null) {
                              vErrors = [err41];
                            } else {
                              vErrors.push(err41);
                            }
                            errors++;
                          }
                        } else {
                          const err42 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationRunCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err42];
                          } else {
                            vErrors.push(err42);
                          }
                          errors++;
                        }
                      }
                      var valid8 = _errs47 === errors;
                    } else {
                      var valid8 = true;
                    }
                    if (valid8) {
                      if (data.op !== void 0) {
                        let data15 = data.op;
                        const _errs49 = errors;
                        if (typeof data15 !== "string") {
                          const err43 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationRunCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err43];
                          } else {
                            vErrors.push(err43);
                          }
                          errors++;
                        }
                        if (!(data15 === "conversation.run" || data15 === "conversation.start" || data15 === "conversation.cancel")) {
                          const err44 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationRunCommand/properties/op/enum", keyword: "enum", params: { allowedValues: schema40.properties.op.enum }, message: "must be equal to one of the allowed values" };
                          if (vErrors === null) {
                            vErrors = [err44];
                          } else {
                            vErrors.push(err44);
                          }
                          errors++;
                        }
                        var valid8 = _errs49 === errors;
                      } else {
                        var valid8 = true;
                      }
                      if (valid8) {
                        if (data.run_id !== void 0) {
                          let data16 = data.run_id;
                          const _errs51 = errors;
                          if (errors === _errs51) {
                            if (typeof data16 === "string") {
                              if (!pattern10.test(data16)) {
                                const err45 = { instancePath: instancePath + "/run_id", schemaPath: "#/$defs/ConversationRunCommand/properties/run_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                if (vErrors === null) {
                                  vErrors = [err45];
                                } else {
                                  vErrors.push(err45);
                                }
                                errors++;
                              }
                            } else {
                              const err46 = { instancePath: instancePath + "/run_id", schemaPath: "#/$defs/ConversationRunCommand/properties/run_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err46];
                              } else {
                                vErrors.push(err46);
                              }
                              errors++;
                            }
                          }
                          var valid8 = _errs51 === errors;
                        } else {
                          var valid8 = true;
                        }
                      }
                    }
                  }
                }
              }
            } else {
              const err47 = { instancePath, schemaPath: "#/$defs/ConversationRunCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
              if (vErrors === null) {
                vErrors = [err47];
              } else {
                vErrors.push(err47);
              }
              errors++;
            }
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
            const _errs53 = errors;
            const _errs54 = errors;
            if (errors === _errs54) {
              if (data && typeof data == "object" && !Array.isArray(data)) {
                let missing4;
                if (data.notebook_id === void 0 && (missing4 = "notebook_id") || data.snapshot_id === void 0 && (missing4 = "snapshot_id") || data.op === void 0 && (missing4 = "op") || data.run_id === void 0 && (missing4 = "run_id") || data.cursor === void 0 && (missing4 = "cursor")) {
                  const err48 = { instancePath, schemaPath: "#/$defs/ConversationEventsCommand/required", keyword: "required", params: { missingProperty: missing4 }, message: "must have required property '" + missing4 + "'" };
                  if (vErrors === null) {
                    vErrors = [err48];
                  } else {
                    vErrors.push(err48);
                  }
                  errors++;
                } else {
                  const _errs56 = errors;
                  for (const key4 in data) {
                    if (!(key4 === "notebook_id" || key4 === "snapshot_id" || key4 === "op" || key4 === "run_id" || key4 === "cursor")) {
                      const err49 = { instancePath, schemaPath: "#/$defs/ConversationEventsCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                      if (vErrors === null) {
                        vErrors = [err49];
                      } else {
                        vErrors.push(err49);
                      }
                      errors++;
                      break;
                    }
                  }
                  if (_errs56 === errors) {
                    if (data.notebook_id !== void 0) {
                      let data17 = data.notebook_id;
                      const _errs57 = errors;
                      if (errors === _errs57) {
                        if (typeof data17 === "string") {
                          if (!pattern4.test(data17)) {
                            const err50 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationEventsCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                            if (vErrors === null) {
                              vErrors = [err50];
                            } else {
                              vErrors.push(err50);
                            }
                            errors++;
                          }
                        } else {
                          const err51 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ConversationEventsCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                          if (vErrors === null) {
                            vErrors = [err51];
                          } else {
                            vErrors.push(err51);
                          }
                          errors++;
                        }
                      }
                      var valid10 = _errs57 === errors;
                    } else {
                      var valid10 = true;
                    }
                    if (valid10) {
                      if (data.snapshot_id !== void 0) {
                        let data18 = data.snapshot_id;
                        const _errs59 = errors;
                        if (errors === _errs59) {
                          if (typeof data18 === "string") {
                            if (!pattern5.test(data18)) {
                              const err52 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationEventsCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                              if (vErrors === null) {
                                vErrors = [err52];
                              } else {
                                vErrors.push(err52);
                              }
                              errors++;
                            }
                          } else {
                            const err53 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ConversationEventsCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err53];
                            } else {
                              vErrors.push(err53);
                            }
                            errors++;
                          }
                        }
                        var valid10 = _errs59 === errors;
                      } else {
                        var valid10 = true;
                      }
                      if (valid10) {
                        if (data.op !== void 0) {
                          let data19 = data.op;
                          const _errs61 = errors;
                          if (typeof data19 !== "string") {
                            const err54 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationEventsCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err54];
                            } else {
                              vErrors.push(err54);
                            }
                            errors++;
                          }
                          if ("conversation.events" !== data19) {
                            const err55 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ConversationEventsCommand/properties/op/const", keyword: "const", params: { allowedValue: "conversation.events" }, message: "must be equal to constant" };
                            if (vErrors === null) {
                              vErrors = [err55];
                            } else {
                              vErrors.push(err55);
                            }
                            errors++;
                          }
                          var valid10 = _errs61 === errors;
                        } else {
                          var valid10 = true;
                        }
                        if (valid10) {
                          if (data.run_id !== void 0) {
                            let data20 = data.run_id;
                            const _errs63 = errors;
                            if (errors === _errs63) {
                              if (typeof data20 === "string") {
                                if (!pattern10.test(data20)) {
                                  const err56 = { instancePath: instancePath + "/run_id", schemaPath: "#/$defs/ConversationEventsCommand/properties/run_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err56];
                                  } else {
                                    vErrors.push(err56);
                                  }
                                  errors++;
                                }
                              } else {
                                const err57 = { instancePath: instancePath + "/run_id", schemaPath: "#/$defs/ConversationEventsCommand/properties/run_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err57];
                                } else {
                                  vErrors.push(err57);
                                }
                                errors++;
                              }
                            }
                            var valid10 = _errs63 === errors;
                          } else {
                            var valid10 = true;
                          }
                          if (valid10) {
                            if (data.cursor !== void 0) {
                              let data21 = data.cursor;
                              const _errs65 = errors;
                              if (!(typeof data21 == "number" && (!(data21 % 1) && !isNaN(data21)) && isFinite(data21))) {
                                const err58 = { instancePath: instancePath + "/cursor", schemaPath: "#/$defs/ConversationEventsCommand/properties/cursor/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                if (vErrors === null) {
                                  vErrors = [err58];
                                } else {
                                  vErrors.push(err58);
                                }
                                errors++;
                              }
                              if (errors === _errs65) {
                                if (typeof data21 == "number" && isFinite(data21)) {
                                  if (data21 > 1e6 || isNaN(data21)) {
                                    const err59 = { instancePath: instancePath + "/cursor", schemaPath: "#/$defs/ConversationEventsCommand/properties/cursor/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                    if (vErrors === null) {
                                      vErrors = [err59];
                                    } else {
                                      vErrors.push(err59);
                                    }
                                    errors++;
                                  } else {
                                    if (data21 < 0 || isNaN(data21)) {
                                      const err60 = { instancePath: instancePath + "/cursor", schemaPath: "#/$defs/ConversationEventsCommand/properties/cursor/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                      if (vErrors === null) {
                                        vErrors = [err60];
                                      } else {
                                        vErrors.push(err60);
                                      }
                                      errors++;
                                    }
                                  }
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
                }
              } else {
                const err61 = { instancePath, schemaPath: "#/$defs/ConversationEventsCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err61];
                } else {
                  vErrors.push(err61);
                }
                errors++;
              }
            }
            var _valid0 = _errs53 === errors;
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
              const _errs67 = errors;
              if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs67 === errors;
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
                const _errs68 = errors;
                const _errs69 = errors;
                if (errors === _errs69) {
                  if (data && typeof data == "object" && !Array.isArray(data)) {
                    let missing5;
                    if (data.notebook_id === void 0 && (missing5 = "notebook_id") || data.snapshot_id === void 0 && (missing5 = "snapshot_id") || data.op === void 0 && (missing5 = "op") || data.job_id === void 0 && (missing5 = "job_id")) {
                      const err62 = { instancePath, schemaPath: "#/$defs/VectorJobCommand/required", keyword: "required", params: { missingProperty: missing5 }, message: "must have required property '" + missing5 + "'" };
                      if (vErrors === null) {
                        vErrors = [err62];
                      } else {
                        vErrors.push(err62);
                      }
                      errors++;
                    } else {
                      const _errs71 = errors;
                      for (const key5 in data) {
                        if (!(key5 === "notebook_id" || key5 === "snapshot_id" || key5 === "op" || key5 === "job_id")) {
                          const err63 = { instancePath, schemaPath: "#/$defs/VectorJobCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                          if (vErrors === null) {
                            vErrors = [err63];
                          } else {
                            vErrors.push(err63);
                          }
                          errors++;
                          break;
                        }
                      }
                      if (_errs71 === errors) {
                        if (data.notebook_id !== void 0) {
                          let data22 = data.notebook_id;
                          const _errs72 = errors;
                          if (errors === _errs72) {
                            if (typeof data22 === "string") {
                              if (!pattern4.test(data22)) {
                                const err64 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/VectorJobCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                if (vErrors === null) {
                                  vErrors = [err64];
                                } else {
                                  vErrors.push(err64);
                                }
                                errors++;
                              }
                            } else {
                              const err65 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/VectorJobCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                              if (vErrors === null) {
                                vErrors = [err65];
                              } else {
                                vErrors.push(err65);
                              }
                              errors++;
                            }
                          }
                          var valid12 = _errs72 === errors;
                        } else {
                          var valid12 = true;
                        }
                        if (valid12) {
                          if (data.snapshot_id !== void 0) {
                            let data23 = data.snapshot_id;
                            const _errs74 = errors;
                            if (errors === _errs74) {
                              if (typeof data23 === "string") {
                                if (!pattern5.test(data23)) {
                                  const err66 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/VectorJobCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                  if (vErrors === null) {
                                    vErrors = [err66];
                                  } else {
                                    vErrors.push(err66);
                                  }
                                  errors++;
                                }
                              } else {
                                const err67 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/VectorJobCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err67];
                                } else {
                                  vErrors.push(err67);
                                }
                                errors++;
                              }
                            }
                            var valid12 = _errs74 === errors;
                          } else {
                            var valid12 = true;
                          }
                          if (valid12) {
                            if (data.op !== void 0) {
                              let data24 = data.op;
                              const _errs76 = errors;
                              if (typeof data24 !== "string") {
                                const err68 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/VectorJobCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err68];
                                } else {
                                  vErrors.push(err68);
                                }
                                errors++;
                              }
                              if (!(data24 === "conversation.vectors.read" || data24 === "conversation.vectors.cancel")) {
                                const err69 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/VectorJobCommand/properties/op/enum", keyword: "enum", params: { allowedValues: schema44.properties.op.enum }, message: "must be equal to one of the allowed values" };
                                if (vErrors === null) {
                                  vErrors = [err69];
                                } else {
                                  vErrors.push(err69);
                                }
                                errors++;
                              }
                              var valid12 = _errs76 === errors;
                            } else {
                              var valid12 = true;
                            }
                            if (valid12) {
                              if (data.job_id !== void 0) {
                                let data25 = data.job_id;
                                const _errs78 = errors;
                                if (errors === _errs78) {
                                  if (typeof data25 === "string") {
                                    if (!pattern10.test(data25)) {
                                      const err70 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/VectorJobCommand/properties/job_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                      if (vErrors === null) {
                                        vErrors = [err70];
                                      } else {
                                        vErrors.push(err70);
                                      }
                                      errors++;
                                    }
                                  } else {
                                    const err71 = { instancePath: instancePath + "/job_id", schemaPath: "#/$defs/VectorJobCommand/properties/job_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                      vErrors = [err71];
                                    } else {
                                      vErrors.push(err71);
                                    }
                                    errors++;
                                  }
                                }
                                var valid12 = _errs78 === errors;
                              } else {
                                var valid12 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    const err72 = { instancePath, schemaPath: "#/$defs/VectorJobCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                      vErrors = [err72];
                    } else {
                      vErrors.push(err72);
                    }
                    errors++;
                  }
                }
                var _valid0 = _errs68 === errors;
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
    const err73 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err73];
    } else {
      vErrors.push(err73);
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
  validate_conversation_command_generated_default as default,
  validate
};
