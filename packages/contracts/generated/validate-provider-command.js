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

// validate-provider-command.generated.js
var validate = validate20;
var validate_provider_command_generated_default = validate20;
var schema53 = { "additionalProperties": false, "properties": { "notebook_id": { "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "title": "Notebook Id", "type": "string" }, "snapshot_id": { "pattern": "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "title": "Snapshot Id", "type": "string" }, "op": { "const": "provider.budget.read", "title": "Op", "type": "string" }, "kind": { "enum": ["call", "job", "session"], "title": "Kind", "type": "string" }, "identity": { "pattern": "^[a-f0-9]{32}$", "title": "Identity", "type": "string" } }, "required": ["notebook_id", "snapshot_id", "op", "kind", "identity"], "title": "ProviderBudgetReadCommand", "type": "object" };
var pattern4 = new RegExp("^[a-zA-Z0-9_-]{1,100}$", "u");
var schema35 = { "additionalProperties": false, "properties": { "adapter": { "enum": ["ollama", "lm_studio", "openai", "anthropic", "gemini", "openai_compatible"], "title": "Adapter", "type": "string" }, "mode": { "enum": ["LOCAL", "API"], "title": "Mode", "type": "string" }, "purpose": { "enum": ["generation", "embedding"], "title": "Purpose", "type": "string" }, "base_url": { "maxLength": 2e3, "title": "Base Url", "type": "string" }, "model": { "maxLength": 200, "minLength": 1, "pattern": "^[\\w.\\-:/]+$", "title": "Model", "type": "string" }, "digest": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "title": "Digest" }, "cloud": { "default": false, "title": "Cloud", "type": "boolean" }, "capabilities": { "additionalProperties": { "$ref": "#/$defs/Capability" }, "propertyNames": { "enum": ["generation", "streaming", "images", "structured_output", "embeddings", "token_counting", "cancellation", "catalog"] }, "title": "Capabilities", "type": "object" } }, "required": ["adapter", "mode", "purpose", "base_url", "model", "capabilities"], "title": "ProfileSpec", "type": "object" };
var schema36 = { "additionalProperties": false, "properties": { "supported": { "title": "Supported", "type": "boolean" }, "provenance": { "enum": ["PROVIDER_REPORTED", "PROBED", "USER_DECLARED", "UNSUPPORTED"], "title": "Provenance", "type": "string" }, "source": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "title": "Source" } }, "required": ["supported", "provenance"], "title": "Capability", "type": "object" };
var func1 = require_ucs2length().default;
var pattern5 = new RegExp("^[\\w.\\-:/]+$", "u");
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
      if (data.adapter === void 0 && (missing0 = "adapter") || data.mode === void 0 && (missing0 = "mode") || data.purpose === void 0 && (missing0 = "purpose") || data.base_url === void 0 && (missing0 = "base_url") || data.model === void 0 && (missing0 = "model") || data.capabilities === void 0 && (missing0 = "capabilities")) {
        validate23.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "adapter" || key0 === "mode" || key0 === "purpose" || key0 === "base_url" || key0 === "model" || key0 === "digest" || key0 === "cloud" || key0 === "capabilities")) {
            validate23.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.adapter !== void 0) {
            let data0 = data.adapter;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate23.errors = [{ instancePath: instancePath + "/adapter", schemaPath: "#/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if (!(data0 === "ollama" || data0 === "lm_studio" || data0 === "openai" || data0 === "anthropic" || data0 === "gemini" || data0 === "openai_compatible")) {
              validate23.errors = [{ instancePath: instancePath + "/adapter", schemaPath: "#/properties/adapter/enum", keyword: "enum", params: { allowedValues: schema35.properties.adapter.enum }, message: "must be equal to one of the allowed values" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.mode !== void 0) {
              let data1 = data.mode;
              const _errs4 = errors;
              if (typeof data1 !== "string") {
                validate23.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                return false;
              }
              if (!(data1 === "LOCAL" || data1 === "API")) {
                validate23.errors = [{ instancePath: instancePath + "/mode", schemaPath: "#/properties/mode/enum", keyword: "enum", params: { allowedValues: schema35.properties.mode.enum }, message: "must be equal to one of the allowed values" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.purpose !== void 0) {
                let data2 = data.purpose;
                const _errs6 = errors;
                if (typeof data2 !== "string") {
                  validate23.errors = [{ instancePath: instancePath + "/purpose", schemaPath: "#/properties/purpose/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if (!(data2 === "generation" || data2 === "embedding")) {
                  validate23.errors = [{ instancePath: instancePath + "/purpose", schemaPath: "#/properties/purpose/enum", keyword: "enum", params: { allowedValues: schema35.properties.purpose.enum }, message: "must be equal to one of the allowed values" }];
                  return false;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.base_url !== void 0) {
                  let data3 = data.base_url;
                  const _errs8 = errors;
                  if (errors === _errs8) {
                    if (typeof data3 === "string") {
                      if (func1(data3) > 2e3) {
                        validate23.errors = [{ instancePath: instancePath + "/base_url", schemaPath: "#/properties/base_url/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                        return false;
                      }
                    } else {
                      validate23.errors = [{ instancePath: instancePath + "/base_url", schemaPath: "#/properties/base_url/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.model !== void 0) {
                    let data4 = data.model;
                    const _errs10 = errors;
                    if (errors === _errs10) {
                      if (typeof data4 === "string") {
                        if (func1(data4) > 200) {
                          validate23.errors = [{ instancePath: instancePath + "/model", schemaPath: "#/properties/model/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                          return false;
                        } else {
                          if (func1(data4) < 1) {
                            validate23.errors = [{ instancePath: instancePath + "/model", schemaPath: "#/properties/model/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                            return false;
                          } else {
                            if (!pattern5.test(data4)) {
                              validate23.errors = [{ instancePath: instancePath + "/model", schemaPath: "#/properties/model/pattern", keyword: "pattern", params: { pattern: "^[\\w.\\-:/]+$" }, message: 'must match pattern "^[\\w.\\-:/]+$"' }];
                              return false;
                            }
                          }
                        }
                      } else {
                        validate23.errors = [{ instancePath: instancePath + "/model", schemaPath: "#/properties/model/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.digest !== void 0) {
                      let data5 = data.digest;
                      const _errs12 = errors;
                      const _errs13 = errors;
                      let valid1 = false;
                      const _errs14 = errors;
                      if (typeof data5 !== "string") {
                        const err0 = { instancePath: instancePath + "/digest", schemaPath: "#/properties/digest/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err0];
                        } else {
                          vErrors.push(err0);
                        }
                        errors++;
                      }
                      var _valid0 = _errs14 === errors;
                      valid1 = valid1 || _valid0;
                      const _errs16 = errors;
                      if (data5 !== null) {
                        const err1 = { instancePath: instancePath + "/digest", schemaPath: "#/properties/digest/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                        if (vErrors === null) {
                          vErrors = [err1];
                        } else {
                          vErrors.push(err1);
                        }
                        errors++;
                      }
                      var _valid0 = _errs16 === errors;
                      valid1 = valid1 || _valid0;
                      if (!valid1) {
                        const err2 = { instancePath: instancePath + "/digest", schemaPath: "#/properties/digest/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                        if (vErrors === null) {
                          vErrors = [err2];
                        } else {
                          vErrors.push(err2);
                        }
                        errors++;
                        validate23.errors = vErrors;
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
                      if (data.cloud !== void 0) {
                        const _errs18 = errors;
                        if (typeof data.cloud !== "boolean") {
                          validate23.errors = [{ instancePath: instancePath + "/cloud", schemaPath: "#/properties/cloud/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                          return false;
                        }
                        var valid0 = _errs18 === errors;
                      } else {
                        var valid0 = true;
                      }
                      if (valid0) {
                        if (data.capabilities !== void 0) {
                          let data7 = data.capabilities;
                          const _errs20 = errors;
                          if (errors === _errs20) {
                            if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
                              for (const key1 in data7) {
                                const _errs22 = errors;
                                if (!(key1 === "generation" || key1 === "streaming" || key1 === "images" || key1 === "structured_output" || key1 === "embeddings" || key1 === "token_counting" || key1 === "cancellation" || key1 === "catalog")) {
                                  const err3 = { instancePath: instancePath + "/capabilities", schemaPath: "#/properties/capabilities/propertyNames/enum", keyword: "enum", params: { allowedValues: schema35.properties.capabilities.propertyNames.enum }, message: "must be equal to one of the allowed values", propertyName: key1 };
                                  if (vErrors === null) {
                                    vErrors = [err3];
                                  } else {
                                    vErrors.push(err3);
                                  }
                                  errors++;
                                }
                                var valid2 = _errs22 === errors;
                                if (!valid2) {
                                  const err4 = { instancePath: instancePath + "/capabilities", schemaPath: "#/properties/capabilities/propertyNames", keyword: "propertyNames", params: { propertyName: key1 }, message: "property name must be valid" };
                                  if (vErrors === null) {
                                    vErrors = [err4];
                                  } else {
                                    vErrors.push(err4);
                                  }
                                  errors++;
                                  validate23.errors = vErrors;
                                  return false;
                                  break;
                                }
                              }
                              if (valid2) {
                                for (const key2 in data7) {
                                  let data8 = data7[key2];
                                  const _errs24 = errors;
                                  const _errs25 = errors;
                                  if (errors === _errs25) {
                                    if (data8 && typeof data8 == "object" && !Array.isArray(data8)) {
                                      let missing1;
                                      if (data8.supported === void 0 && (missing1 = "supported") || data8.provenance === void 0 && (missing1 = "provenance")) {
                                        validate23.errors = [{ instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/$defs/Capability/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                                        return false;
                                      } else {
                                        const _errs27 = errors;
                                        for (const key3 in data8) {
                                          if (!(key3 === "supported" || key3 === "provenance" || key3 === "source")) {
                                            validate23.errors = [{ instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/$defs/Capability/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" }];
                                            return false;
                                            break;
                                          }
                                        }
                                        if (_errs27 === errors) {
                                          if (data8.supported !== void 0) {
                                            const _errs28 = errors;
                                            if (typeof data8.supported !== "boolean") {
                                              validate23.errors = [{ instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/supported", schemaPath: "#/$defs/Capability/properties/supported/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                              return false;
                                            }
                                            var valid5 = _errs28 === errors;
                                          } else {
                                            var valid5 = true;
                                          }
                                          if (valid5) {
                                            if (data8.provenance !== void 0) {
                                              let data10 = data8.provenance;
                                              const _errs30 = errors;
                                              if (typeof data10 !== "string") {
                                                validate23.errors = [{ instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/provenance", schemaPath: "#/$defs/Capability/properties/provenance/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                              if (!(data10 === "PROVIDER_REPORTED" || data10 === "PROBED" || data10 === "USER_DECLARED" || data10 === "UNSUPPORTED")) {
                                                validate23.errors = [{ instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/provenance", schemaPath: "#/$defs/Capability/properties/provenance/enum", keyword: "enum", params: { allowedValues: schema36.properties.provenance.enum }, message: "must be equal to one of the allowed values" }];
                                                return false;
                                              }
                                              var valid5 = _errs30 === errors;
                                            } else {
                                              var valid5 = true;
                                            }
                                            if (valid5) {
                                              if (data8.source !== void 0) {
                                                let data11 = data8.source;
                                                const _errs32 = errors;
                                                const _errs33 = errors;
                                                let valid6 = false;
                                                const _errs34 = errors;
                                                if (typeof data11 !== "string") {
                                                  const err5 = { instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/source", schemaPath: "#/$defs/Capability/properties/source/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                                  if (vErrors === null) {
                                                    vErrors = [err5];
                                                  } else {
                                                    vErrors.push(err5);
                                                  }
                                                  errors++;
                                                }
                                                var _valid1 = _errs34 === errors;
                                                valid6 = valid6 || _valid1;
                                                const _errs36 = errors;
                                                if (data11 !== null) {
                                                  const err6 = { instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/source", schemaPath: "#/$defs/Capability/properties/source/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                                  if (vErrors === null) {
                                                    vErrors = [err6];
                                                  } else {
                                                    vErrors.push(err6);
                                                  }
                                                  errors++;
                                                }
                                                var _valid1 = _errs36 === errors;
                                                valid6 = valid6 || _valid1;
                                                if (!valid6) {
                                                  const err7 = { instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/source", schemaPath: "#/$defs/Capability/properties/source/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                                  if (vErrors === null) {
                                                    vErrors = [err7];
                                                  } else {
                                                    vErrors.push(err7);
                                                  }
                                                  errors++;
                                                  validate23.errors = vErrors;
                                                  return false;
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
                                                var valid5 = _errs32 === errors;
                                              } else {
                                                var valid5 = true;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    } else {
                                      validate23.errors = [{ instancePath: instancePath + "/capabilities/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/$defs/Capability/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                      return false;
                                    }
                                  }
                                  var valid3 = _errs24 === errors;
                                  if (!valid3) {
                                    break;
                                  }
                                }
                              }
                            } else {
                              validate23.errors = [{ instancePath: instancePath + "/capabilities", schemaPath: "#/properties/capabilities/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                              return false;
                            }
                          }
                          var valid0 = _errs20 === errors;
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
    } else {
      validate23.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate23.errors = vErrors;
  return errors === 0;
}
validate23.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
      if (data.spec === void 0 && (missing0 = "spec") || data.expected_revision === void 0 && (missing0 = "expected_revision") || data.idempotency_key === void 0 && (missing0 = "idempotency_key")) {
        validate22.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "spec" || key0 === "expected_revision" || key0 === "idempotency_key")) {
            validate22.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.spec !== void 0) {
            const _errs2 = errors;
            if (!validate23(data.spec, { instancePath: instancePath + "/spec", parentData: data, parentDataProperty: "spec", rootData, dynamicAnchors })) {
              vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.expected_revision !== void 0) {
              let data1 = data.expected_revision;
              const _errs3 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                validate22.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (errors === _errs3) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 < 0 || isNaN(data1)) {
                    validate22.errors = [{ instancePath: instancePath + "/expected_revision", schemaPath: "#/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                    return false;
                  }
                }
              }
              var valid0 = _errs3 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.idempotency_key !== void 0) {
                let data2 = data.idempotency_key;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (typeof data2 === "string") {
                    if (func1(data2) > 200) {
                      validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                      return false;
                    } else {
                      if (func1(data2) < 1) {
                        validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                        return false;
                      }
                    }
                  } else {
                    validate22.errors = [{ instancePath: instancePath + "/idempotency_key", schemaPath: "#/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs5 === errors;
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
      let missing0;
      if (data.op === void 0 && (missing0 = "op") || data.profile_id === void 0 && (missing0 = "profile_id") || data.request === void 0 && (missing0 = "request")) {
        validate21.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "profile_id" || key0 === "request")) {
            validate21.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("provider.write" !== data0) {
              validate21.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.write" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.profile_id !== void 0) {
              let data1 = data.profile_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern4.test(data1)) {
                    validate21.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                    return false;
                  }
                } else {
                  validate21.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.request !== void 0) {
                const _errs6 = errors;
                if (!validate22(data.request, { instancePath: instancePath + "/request", parentData: data, parentDataProperty: "request", rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
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
      if (data.op === void 0 && (missing0 = "op") || data.profile_id === void 0 && (missing0 = "profile_id") || data.request === void 0 && (missing0 = "request")) {
        validate27.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "profile_id" || key0 === "request")) {
            validate27.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("provider.resume" !== data0) {
              validate27.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.resume" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.profile_id !== void 0) {
              let data1 = data.profile_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern4.test(data1)) {
                    validate27.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                    return false;
                  }
                } else {
                  validate27.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.request !== void 0) {
                let data2 = data.request;
                const _errs6 = errors;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    let missing1;
                    if (data2.expected_revision === void 0 && (missing1 = "expected_revision") || data2.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                      validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ResumeWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                      return false;
                    } else {
                      const _errs9 = errors;
                      for (const key1 in data2) {
                        if (!(key1 === "expected_revision" || key1 === "idempotency_key")) {
                          validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ResumeWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                          return false;
                          break;
                        }
                      }
                      if (_errs9 === errors) {
                        if (data2.expected_revision !== void 0) {
                          let data3 = data2.expected_revision;
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                            validate27.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ResumeWrite/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs10) {
                            if (typeof data3 == "number" && isFinite(data3)) {
                              if (data3 < 1 || isNaN(data3)) {
                                validate27.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ResumeWrite/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                return false;
                              }
                            }
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                        if (valid2) {
                          if (data2.idempotency_key !== void 0) {
                            let data4 = data2.idempotency_key;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 200) {
                                  validate27.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ResumeWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate27.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ResumeWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate27.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ResumeWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  } else {
                    validate27.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ResumeWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
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
      if (data.op === void 0 && (missing0 = "op") || data.request === void 0 && (missing0 = "request")) {
        validate29.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "request")) {
            validate29.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate29.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("provider.settings.write" !== data0) {
              validate29.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.settings.write" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.request !== void 0) {
              let data1 = data.request;
              const _errs4 = errors;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                  let missing1;
                  if (data1.block_paid_apis === void 0 && (missing1 = "block_paid_apis") || data1.expected_revision === void 0 && (missing1 = "expected_revision") || data1.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                    validate29.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SettingsWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                    return false;
                  } else {
                    const _errs7 = errors;
                    for (const key1 in data1) {
                      if (!(key1 === "block_paid_apis" || key1 === "expected_revision" || key1 === "idempotency_key")) {
                        validate29.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SettingsWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                        return false;
                        break;
                      }
                    }
                    if (_errs7 === errors) {
                      if (data1.block_paid_apis !== void 0) {
                        const _errs8 = errors;
                        if (typeof data1.block_paid_apis !== "boolean") {
                          validate29.errors = [{ instancePath: instancePath + "/request/block_paid_apis", schemaPath: "#/$defs/SettingsWrite/properties/block_paid_apis/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                          return false;
                        }
                        var valid2 = _errs8 === errors;
                      } else {
                        var valid2 = true;
                      }
                      if (valid2) {
                        if (data1.expected_revision !== void 0) {
                          let data3 = data1.expected_revision;
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                            validate29.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/SettingsWrite/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs10) {
                            if (typeof data3 == "number" && isFinite(data3)) {
                              if (data3 < 0 || isNaN(data3)) {
                                validate29.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/SettingsWrite/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                return false;
                              }
                            }
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                        if (valid2) {
                          if (data1.idempotency_key !== void 0) {
                            let data4 = data1.idempotency_key;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 200) {
                                  validate29.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SettingsWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate29.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SettingsWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate29.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SettingsWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate29.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SettingsWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate29.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate29.errors = vErrors;
  return errors === 0;
}
validate29.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
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
      if (data.op === void 0 && (missing0 = "op") || data.profile_id === void 0 && (missing0 = "profile_id") || data.request === void 0 && (missing0 = "request")) {
        validate31.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "profile_id" || key0 === "request")) {
            validate31.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate31.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("provider.secret.write" !== data0) {
              validate31.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.secret.write" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.profile_id !== void 0) {
              let data1 = data.profile_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern4.test(data1)) {
                    validate31.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                    return false;
                  }
                } else {
                  validate31.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.request !== void 0) {
                let data2 = data.request;
                const _errs6 = errors;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    let missing1;
                    if (data2.expected_revision === void 0 && (missing1 = "expected_revision") || data2.idempotency_key === void 0 && (missing1 = "idempotency_key") || data2.value === void 0 && (missing1 = "value")) {
                      validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SecretWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                      return false;
                    } else {
                      const _errs9 = errors;
                      for (const key1 in data2) {
                        if (!(key1 === "expected_revision" || key1 === "idempotency_key" || key1 === "value" || key1 === "memory_only")) {
                          validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SecretWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                          return false;
                          break;
                        }
                      }
                      if (_errs9 === errors) {
                        if (data2.expected_revision !== void 0) {
                          let data3 = data2.expected_revision;
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                            validate31.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/SecretWrite/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs10) {
                            if (typeof data3 == "number" && isFinite(data3)) {
                              if (data3 < 0 || isNaN(data3)) {
                                validate31.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/SecretWrite/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                return false;
                              }
                            }
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                        if (valid2) {
                          if (data2.idempotency_key !== void 0) {
                            let data4 = data2.idempotency_key;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 200) {
                                  validate31.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SecretWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate31.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SecretWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate31.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SecretWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data2.value !== void 0) {
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (errors === _errs14) {
                                  if (!(typeof data2.value === "string")) {
                                    validate31.errors = [{ instancePath: instancePath + "/request/value", schemaPath: "#/$defs/SecretWrite/properties/value/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data2.memory_only !== void 0) {
                                const _errs16 = errors;
                                if (typeof data2.memory_only !== "boolean") {
                                  validate31.errors = [{ instancePath: instancePath + "/request/memory_only", schemaPath: "#/$defs/SecretWrite/properties/memory_only/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    validate31.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SecretWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
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
      if (data.op === void 0 && (missing0 = "op") || data.profile_id === void 0 && (missing0 = "profile_id") || data.request === void 0 && (missing0 = "request")) {
        validate33.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "profile_id" || key0 === "request")) {
            validate33.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate33.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("provider.secret.delete" !== data0) {
              validate33.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.secret.delete" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.profile_id !== void 0) {
              let data1 = data.profile_id;
              const _errs4 = errors;
              if (errors === _errs4) {
                if (typeof data1 === "string") {
                  if (!pattern4.test(data1)) {
                    validate33.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                    return false;
                  }
                } else {
                  validate33.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.request !== void 0) {
                let data2 = data.request;
                const _errs6 = errors;
                const _errs7 = errors;
                if (errors === _errs7) {
                  if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    let missing1;
                    if (data2.expected_revision === void 0 && (missing1 = "expected_revision") || data2.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                      validate33.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SecretDelete/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                      return false;
                    } else {
                      const _errs9 = errors;
                      for (const key1 in data2) {
                        if (!(key1 === "expected_revision" || key1 === "idempotency_key")) {
                          validate33.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SecretDelete/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                          return false;
                          break;
                        }
                      }
                      if (_errs9 === errors) {
                        if (data2.expected_revision !== void 0) {
                          let data3 = data2.expected_revision;
                          const _errs10 = errors;
                          if (!(typeof data3 == "number" && (!(data3 % 1) && !isNaN(data3)) && isFinite(data3))) {
                            validate33.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/SecretDelete/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                            return false;
                          }
                          if (errors === _errs10) {
                            if (typeof data3 == "number" && isFinite(data3)) {
                              if (data3 < 0 || isNaN(data3)) {
                                validate33.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/SecretDelete/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                return false;
                              }
                            }
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                        if (valid2) {
                          if (data2.idempotency_key !== void 0) {
                            let data4 = data2.idempotency_key;
                            const _errs12 = errors;
                            if (errors === _errs12) {
                              if (typeof data4 === "string") {
                                if (func1(data4) > 200) {
                                  validate33.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SecretDelete/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                  return false;
                                } else {
                                  if (func1(data4) < 1) {
                                    validate33.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SecretDelete/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                    return false;
                                  }
                                }
                              } else {
                                validate33.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/SecretDelete/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  } else {
                    validate33.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/SecretDelete/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
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
var schema50 = { "additionalProperties": false, "properties": { "categories": { "items": { "enum": ["excerpts", "metadata", "images", "history"], "type": "string" }, "title": "Categories", "type": "array", "uniqueItems": true }, "granted": { "title": "Granted", "type": "boolean" }, "profile_revision": { "minimum": 1, "title": "Profile Revision", "type": "integer" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" }, "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" } }, "required": ["categories", "granted", "profile_revision", "expected_revision", "idempotency_key"], "title": "ConsentWrite", "type": "object" };
var pattern11 = new RegExp("^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", "u");
var pattern12 = new RegExp("^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", "u");
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.profile_id === void 0 && (missing0 = "profile_id") || data.request === void 0 && (missing0 = "request")) {
        validate35.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "profile_id" || key0 === "request")) {
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
                if (!pattern11.test(data0)) {
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
                  if (!pattern12.test(data1)) {
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
                if ("provider.consent.write" !== data2) {
                  validate35.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.consent.write" }, message: "must be equal to constant" }];
                  return false;
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
                      if (!pattern4.test(data3)) {
                        validate35.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' }];
                        return false;
                      }
                    } else {
                      validate35.errors = [{ instancePath: instancePath + "/profile_id", schemaPath: "#/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                        if (data4.categories === void 0 && (missing1 = "categories") || data4.granted === void 0 && (missing1 = "granted") || data4.profile_revision === void 0 && (missing1 = "profile_revision") || data4.expected_revision === void 0 && (missing1 = "expected_revision") || data4.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                          validate35.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ConsentWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                          return false;
                        } else {
                          const _errs13 = errors;
                          for (const key1 in data4) {
                            if (!(key1 === "categories" || key1 === "granted" || key1 === "profile_revision" || key1 === "expected_revision" || key1 === "idempotency_key")) {
                              validate35.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ConsentWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                              return false;
                              break;
                            }
                          }
                          if (_errs13 === errors) {
                            if (data4.categories !== void 0) {
                              let data5 = data4.categories;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (Array.isArray(data5)) {
                                  var valid3 = true;
                                  const len0 = data5.length;
                                  for (let i0 = 0; i0 < len0; i0++) {
                                    let data6 = data5[i0];
                                    const _errs16 = errors;
                                    if (typeof data6 !== "string") {
                                      validate35.errors = [{ instancePath: instancePath + "/request/categories/" + i0, schemaPath: "#/$defs/ConsentWrite/properties/categories/items/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                    if (!(data6 === "excerpts" || data6 === "metadata" || data6 === "images" || data6 === "history")) {
                                      validate35.errors = [{ instancePath: instancePath + "/request/categories/" + i0, schemaPath: "#/$defs/ConsentWrite/properties/categories/items/enum", keyword: "enum", params: { allowedValues: schema50.properties.categories.items.enum }, message: "must be equal to one of the allowed values" }];
                                      return false;
                                    }
                                    var valid3 = _errs16 === errors;
                                    if (!valid3) {
                                      break;
                                    }
                                  }
                                  if (valid3) {
                                    let i1 = data5.length;
                                    let j0;
                                    if (i1 > 1) {
                                      const indices0 = {};
                                      for (; i1--; ) {
                                        let item0 = data5[i1];
                                        if (typeof item0 !== "string") {
                                          continue;
                                        }
                                        if (typeof indices0[item0] == "number") {
                                          j0 = indices0[item0];
                                          validate35.errors = [{ instancePath: instancePath + "/request/categories", schemaPath: "#/$defs/ConsentWrite/properties/categories/uniqueItems", keyword: "uniqueItems", params: { i: i1, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)" }];
                                          return false;
                                          break;
                                        }
                                        indices0[item0] = i1;
                                      }
                                    }
                                  }
                                } else {
                                  validate35.errors = [{ instancePath: instancePath + "/request/categories", schemaPath: "#/$defs/ConsentWrite/properties/categories/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data4.granted !== void 0) {
                                const _errs18 = errors;
                                if (typeof data4.granted !== "boolean") {
                                  validate35.errors = [{ instancePath: instancePath + "/request/granted", schemaPath: "#/$defs/ConsentWrite/properties/granted/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" }];
                                  return false;
                                }
                                var valid2 = _errs18 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data4.profile_revision !== void 0) {
                                  let data8 = data4.profile_revision;
                                  const _errs20 = errors;
                                  if (!(typeof data8 == "number" && (!(data8 % 1) && !isNaN(data8)) && isFinite(data8))) {
                                    validate35.errors = [{ instancePath: instancePath + "/request/profile_revision", schemaPath: "#/$defs/ConsentWrite/properties/profile_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs20) {
                                    if (typeof data8 == "number" && isFinite(data8)) {
                                      if (data8 < 1 || isNaN(data8)) {
                                        validate35.errors = [{ instancePath: instancePath + "/request/profile_revision", schemaPath: "#/$defs/ConsentWrite/properties/profile_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                        return false;
                                      }
                                    }
                                  }
                                  var valid2 = _errs20 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data4.expected_revision !== void 0) {
                                    let data9 = data4.expected_revision;
                                    const _errs22 = errors;
                                    if (!(typeof data9 == "number" && (!(data9 % 1) && !isNaN(data9)) && isFinite(data9))) {
                                      validate35.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ConsentWrite/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                      return false;
                                    }
                                    if (errors === _errs22) {
                                      if (typeof data9 == "number" && isFinite(data9)) {
                                        if (data9 < 0 || isNaN(data9)) {
                                          validate35.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/ConsentWrite/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                          return false;
                                        }
                                      }
                                    }
                                    var valid2 = _errs22 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                  if (valid2) {
                                    if (data4.idempotency_key !== void 0) {
                                      let data10 = data4.idempotency_key;
                                      const _errs24 = errors;
                                      if (errors === _errs24) {
                                        if (typeof data10 === "string") {
                                          if (func1(data10) > 200) {
                                            validate35.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ConsentWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                            return false;
                                          } else {
                                            if (func1(data10) < 1) {
                                              validate35.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ConsentWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                              return false;
                                            }
                                          }
                                        } else {
                                          validate35.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/ConsentWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                          return false;
                                        }
                                      }
                                      var valid2 = _errs24 === errors;
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
                        validate35.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/ConsentWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate35.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate35.errors = vErrors;
  return errors === 0;
}
validate35.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema52 = { "additionalProperties": false, "properties": { "kind": { "enum": ["call", "job", "session"], "title": "Kind", "type": "string" }, "identity": { "maxLength": 200, "minLength": 1, "title": "Identity", "type": "string" }, "currency": { "pattern": "^[A-Z]{3}$", "title": "Currency", "type": "string" }, "ceiling": { "anyOf": [{ "minimum": 0, "type": "number" }, { "pattern": "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$", "type": "string" }], "title": "Ceiling" }, "expected_revision": { "minimum": 0, "title": "Expected Revision", "type": "integer" }, "idempotency_key": { "maxLength": 200, "minLength": 1, "title": "Idempotency Key", "type": "string" } }, "required": ["kind", "identity", "currency", "ceiling", "expected_revision", "idempotency_key"], "title": "BudgetWrite", "type": "object" };
var pattern19 = new RegExp("^[A-Z]{3}$", "u");
var pattern20 = new RegExp("^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$", "u");
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
      if (data.notebook_id === void 0 && (missing0 = "notebook_id") || data.snapshot_id === void 0 && (missing0 = "snapshot_id") || data.op === void 0 && (missing0 = "op") || data.request === void 0 && (missing0 = "request")) {
        validate37.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "notebook_id" || key0 === "snapshot_id" || key0 === "op" || key0 === "request")) {
            validate37.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
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
                if (!pattern11.test(data0)) {
                  validate37.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' }];
                  return false;
                }
              } else {
                validate37.errors = [{ instancePath: instancePath + "/notebook_id", schemaPath: "#/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  if (!pattern12.test(data1)) {
                    validate37.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' }];
                    return false;
                  }
                } else {
                  validate37.errors = [{ instancePath: instancePath + "/snapshot_id", schemaPath: "#/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                  validate37.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                  return false;
                }
                if ("provider.budget" !== data2) {
                  validate37.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.budget" }, message: "must be equal to constant" }];
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
                      if (data3.kind === void 0 && (missing1 = "kind") || data3.identity === void 0 && (missing1 = "identity") || data3.currency === void 0 && (missing1 = "currency") || data3.ceiling === void 0 && (missing1 = "ceiling") || data3.expected_revision === void 0 && (missing1 = "expected_revision") || data3.idempotency_key === void 0 && (missing1 = "idempotency_key")) {
                        validate37.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/BudgetWrite/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs11 = errors;
                        for (const key1 in data3) {
                          if (!(key1 === "kind" || key1 === "identity" || key1 === "currency" || key1 === "ceiling" || key1 === "expected_revision" || key1 === "idempotency_key")) {
                            validate37.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/BudgetWrite/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs11 === errors) {
                          if (data3.kind !== void 0) {
                            let data4 = data3.kind;
                            const _errs12 = errors;
                            if (typeof data4 !== "string") {
                              validate37.errors = [{ instancePath: instancePath + "/request/kind", schemaPath: "#/$defs/BudgetWrite/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data4 === "call" || data4 === "job" || data4 === "session")) {
                              validate37.errors = [{ instancePath: instancePath + "/request/kind", schemaPath: "#/$defs/BudgetWrite/properties/kind/enum", keyword: "enum", params: { allowedValues: schema52.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data3.identity !== void 0) {
                              let data5 = data3.identity;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (func1(data5) > 200) {
                                    validate37.errors = [{ instancePath: instancePath + "/request/identity", schemaPath: "#/$defs/BudgetWrite/properties/identity/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                    return false;
                                  } else {
                                    if (func1(data5) < 1) {
                                      validate37.errors = [{ instancePath: instancePath + "/request/identity", schemaPath: "#/$defs/BudgetWrite/properties/identity/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                      return false;
                                    }
                                  }
                                } else {
                                  validate37.errors = [{ instancePath: instancePath + "/request/identity", schemaPath: "#/$defs/BudgetWrite/properties/identity/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data3.currency !== void 0) {
                                let data6 = data3.currency;
                                const _errs16 = errors;
                                if (errors === _errs16) {
                                  if (typeof data6 === "string") {
                                    if (!pattern19.test(data6)) {
                                      validate37.errors = [{ instancePath: instancePath + "/request/currency", schemaPath: "#/$defs/BudgetWrite/properties/currency/pattern", keyword: "pattern", params: { pattern: "^[A-Z]{3}$" }, message: 'must match pattern "^[A-Z]{3}$"' }];
                                      return false;
                                    }
                                  } else {
                                    validate37.errors = [{ instancePath: instancePath + "/request/currency", schemaPath: "#/$defs/BudgetWrite/properties/currency/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data3.ceiling !== void 0) {
                                  let data7 = data3.ceiling;
                                  const _errs18 = errors;
                                  const _errs19 = errors;
                                  let valid3 = false;
                                  const _errs20 = errors;
                                  if (errors === _errs20) {
                                    if (typeof data7 == "number" && isFinite(data7)) {
                                      if (data7 < 0 || isNaN(data7)) {
                                        const err0 = { instancePath: instancePath + "/request/ceiling", schemaPath: "#/$defs/BudgetWrite/properties/ceiling/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                        if (vErrors === null) {
                                          vErrors = [err0];
                                        } else {
                                          vErrors.push(err0);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err1 = { instancePath: instancePath + "/request/ceiling", schemaPath: "#/$defs/BudgetWrite/properties/ceiling/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                      if (vErrors === null) {
                                        vErrors = [err1];
                                      } else {
                                        vErrors.push(err1);
                                      }
                                      errors++;
                                    }
                                  }
                                  var _valid0 = _errs20 === errors;
                                  valid3 = valid3 || _valid0;
                                  const _errs22 = errors;
                                  if (errors === _errs22) {
                                    if (typeof data7 === "string") {
                                      if (!pattern20.test(data7)) {
                                        const err2 = { instancePath: instancePath + "/request/ceiling", schemaPath: "#/$defs/BudgetWrite/properties/ceiling/anyOf/1/pattern", keyword: "pattern", params: { pattern: "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$" }, message: 'must match pattern "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$"' };
                                        if (vErrors === null) {
                                          vErrors = [err2];
                                        } else {
                                          vErrors.push(err2);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err3 = { instancePath: instancePath + "/request/ceiling", schemaPath: "#/$defs/BudgetWrite/properties/ceiling/anyOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err3];
                                      } else {
                                        vErrors.push(err3);
                                      }
                                      errors++;
                                    }
                                  }
                                  var _valid0 = _errs22 === errors;
                                  valid3 = valid3 || _valid0;
                                  if (!valid3) {
                                    const err4 = { instancePath: instancePath + "/request/ceiling", schemaPath: "#/$defs/BudgetWrite/properties/ceiling/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                    if (vErrors === null) {
                                      vErrors = [err4];
                                    } else {
                                      vErrors.push(err4);
                                    }
                                    errors++;
                                    validate37.errors = vErrors;
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
                                  var valid2 = _errs18 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data3.expected_revision !== void 0) {
                                    let data8 = data3.expected_revision;
                                    const _errs24 = errors;
                                    if (!(typeof data8 == "number" && (!(data8 % 1) && !isNaN(data8)) && isFinite(data8))) {
                                      validate37.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/BudgetWrite/properties/expected_revision/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                      return false;
                                    }
                                    if (errors === _errs24) {
                                      if (typeof data8 == "number" && isFinite(data8)) {
                                        if (data8 < 0 || isNaN(data8)) {
                                          validate37.errors = [{ instancePath: instancePath + "/request/expected_revision", schemaPath: "#/$defs/BudgetWrite/properties/expected_revision/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                          return false;
                                        }
                                      }
                                    }
                                    var valid2 = _errs24 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                  if (valid2) {
                                    if (data3.idempotency_key !== void 0) {
                                      let data9 = data3.idempotency_key;
                                      const _errs26 = errors;
                                      if (errors === _errs26) {
                                        if (typeof data9 === "string") {
                                          if (func1(data9) > 200) {
                                            validate37.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/BudgetWrite/properties/idempotency_key/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                                            return false;
                                          } else {
                                            if (func1(data9) < 1) {
                                              validate37.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/BudgetWrite/properties/idempotency_key/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                              return false;
                                            }
                                          }
                                        } else {
                                          validate37.errors = [{ instancePath: instancePath + "/request/idempotency_key", schemaPath: "#/$defs/BudgetWrite/properties/idempotency_key/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                          return false;
                                        }
                                      }
                                      var valid2 = _errs26 === errors;
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
                    } else {
                      validate37.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/BudgetWrite/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate37.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate37.errors = vErrors;
  return errors === 0;
}
validate37.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema55 = { "additionalProperties": false, "properties": { "version": { "maxLength": 200, "minLength": 1, "title": "Version", "type": "string" }, "adapter": { "enum": ["ollama", "lm_studio", "openai", "anthropic", "gemini", "openai_compatible"], "title": "Adapter", "type": "string" }, "model": { "title": "Model", "type": "string" }, "currency": { "pattern": "^[A-Z]{3}$", "title": "Currency", "type": "string" }, "effective_date": { "format": "date", "title": "Effective Date", "type": "string" }, "source": { "maxLength": 2e3, "minLength": 1, "title": "Source", "type": "string" }, "input_per_million": { "anyOf": [{ "minimum": 0, "type": "number" }, { "pattern": "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$", "type": "string" }], "title": "Input Per Million" }, "output_per_million": { "anyOf": [{ "minimum": 0, "type": "number" }, { "pattern": "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$", "type": "string" }], "title": "Output Per Million" } }, "required": ["version", "adapter", "model", "currency", "effective_date", "source", "input_per_million", "output_per_million"], "title": "PriceConfig", "type": "object" };
var formats0 = /^\d{4}-\d{2}-\d{2}$/;
function validate39(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate39.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.op === void 0 && (missing0 = "op") || data.request === void 0 && (missing0 = "request")) {
        validate39.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "request")) {
            validate39.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs2 = errors;
            if (typeof data0 !== "string") {
              validate39.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
              return false;
            }
            if ("provider.price" !== data0) {
              validate39.errors = [{ instancePath: instancePath + "/op", schemaPath: "#/properties/op/const", keyword: "const", params: { allowedValue: "provider.price" }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.request !== void 0) {
              let data1 = data.request;
              const _errs4 = errors;
              const _errs5 = errors;
              if (errors === _errs5) {
                if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                  let missing1;
                  if (data1.version === void 0 && (missing1 = "version") || data1.adapter === void 0 && (missing1 = "adapter") || data1.model === void 0 && (missing1 = "model") || data1.currency === void 0 && (missing1 = "currency") || data1.effective_date === void 0 && (missing1 = "effective_date") || data1.source === void 0 && (missing1 = "source") || data1.input_per_million === void 0 && (missing1 = "input_per_million") || data1.output_per_million === void 0 && (missing1 = "output_per_million")) {
                    validate39.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/PriceConfig/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                    return false;
                  } else {
                    const _errs7 = errors;
                    for (const key1 in data1) {
                      if (!(key1 === "version" || key1 === "adapter" || key1 === "model" || key1 === "currency" || key1 === "effective_date" || key1 === "source" || key1 === "input_per_million" || key1 === "output_per_million")) {
                        validate39.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/PriceConfig/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                        return false;
                        break;
                      }
                    }
                    if (_errs7 === errors) {
                      if (data1.version !== void 0) {
                        let data2 = data1.version;
                        const _errs8 = errors;
                        if (errors === _errs8) {
                          if (typeof data2 === "string") {
                            if (func1(data2) > 200) {
                              validate39.errors = [{ instancePath: instancePath + "/request/version", schemaPath: "#/$defs/PriceConfig/properties/version/maxLength", keyword: "maxLength", params: { limit: 200 }, message: "must NOT have more than 200 characters" }];
                              return false;
                            } else {
                              if (func1(data2) < 1) {
                                validate39.errors = [{ instancePath: instancePath + "/request/version", schemaPath: "#/$defs/PriceConfig/properties/version/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                return false;
                              }
                            }
                          } else {
                            validate39.errors = [{ instancePath: instancePath + "/request/version", schemaPath: "#/$defs/PriceConfig/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                        }
                        var valid2 = _errs8 === errors;
                      } else {
                        var valid2 = true;
                      }
                      if (valid2) {
                        if (data1.adapter !== void 0) {
                          let data3 = data1.adapter;
                          const _errs10 = errors;
                          if (typeof data3 !== "string") {
                            validate39.errors = [{ instancePath: instancePath + "/request/adapter", schemaPath: "#/$defs/PriceConfig/properties/adapter/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                            return false;
                          }
                          if (!(data3 === "ollama" || data3 === "lm_studio" || data3 === "openai" || data3 === "anthropic" || data3 === "gemini" || data3 === "openai_compatible")) {
                            validate39.errors = [{ instancePath: instancePath + "/request/adapter", schemaPath: "#/$defs/PriceConfig/properties/adapter/enum", keyword: "enum", params: { allowedValues: schema55.properties.adapter.enum }, message: "must be equal to one of the allowed values" }];
                            return false;
                          }
                          var valid2 = _errs10 === errors;
                        } else {
                          var valid2 = true;
                        }
                        if (valid2) {
                          if (data1.model !== void 0) {
                            const _errs12 = errors;
                            if (typeof data1.model !== "string") {
                              validate39.errors = [{ instancePath: instancePath + "/request/model", schemaPath: "#/$defs/PriceConfig/properties/model/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            var valid2 = _errs12 === errors;
                          } else {
                            var valid2 = true;
                          }
                          if (valid2) {
                            if (data1.currency !== void 0) {
                              let data5 = data1.currency;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (typeof data5 === "string") {
                                  if (!pattern19.test(data5)) {
                                    validate39.errors = [{ instancePath: instancePath + "/request/currency", schemaPath: "#/$defs/PriceConfig/properties/currency/pattern", keyword: "pattern", params: { pattern: "^[A-Z]{3}$" }, message: 'must match pattern "^[A-Z]{3}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate39.errors = [{ instancePath: instancePath + "/request/currency", schemaPath: "#/$defs/PriceConfig/properties/currency/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid2 = _errs14 === errors;
                            } else {
                              var valid2 = true;
                            }
                            if (valid2) {
                              if (data1.effective_date !== void 0) {
                                let data6 = data1.effective_date;
                                const _errs16 = errors;
                                if (errors === _errs16) {
                                  if (errors === _errs16) {
                                    if (typeof data6 === "string") {
                                      if (!formats0.test(data6)) {
                                        validate39.errors = [{ instancePath: instancePath + "/request/effective_date", schemaPath: "#/$defs/PriceConfig/properties/effective_date/format", keyword: "format", params: { format: "date" }, message: 'must match format "date"' }];
                                        return false;
                                      }
                                    } else {
                                      validate39.errors = [{ instancePath: instancePath + "/request/effective_date", schemaPath: "#/$defs/PriceConfig/properties/effective_date/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                }
                                var valid2 = _errs16 === errors;
                              } else {
                                var valid2 = true;
                              }
                              if (valid2) {
                                if (data1.source !== void 0) {
                                  let data7 = data1.source;
                                  const _errs18 = errors;
                                  if (errors === _errs18) {
                                    if (typeof data7 === "string") {
                                      if (func1(data7) > 2e3) {
                                        validate39.errors = [{ instancePath: instancePath + "/request/source", schemaPath: "#/$defs/PriceConfig/properties/source/maxLength", keyword: "maxLength", params: { limit: 2e3 }, message: "must NOT have more than 2000 characters" }];
                                        return false;
                                      } else {
                                        if (func1(data7) < 1) {
                                          validate39.errors = [{ instancePath: instancePath + "/request/source", schemaPath: "#/$defs/PriceConfig/properties/source/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                          return false;
                                        }
                                      }
                                    } else {
                                      validate39.errors = [{ instancePath: instancePath + "/request/source", schemaPath: "#/$defs/PriceConfig/properties/source/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                  }
                                  var valid2 = _errs18 === errors;
                                } else {
                                  var valid2 = true;
                                }
                                if (valid2) {
                                  if (data1.input_per_million !== void 0) {
                                    let data8 = data1.input_per_million;
                                    const _errs20 = errors;
                                    const _errs21 = errors;
                                    let valid3 = false;
                                    const _errs22 = errors;
                                    if (errors === _errs22) {
                                      if (typeof data8 == "number" && isFinite(data8)) {
                                        if (data8 < 0 || isNaN(data8)) {
                                          const err0 = { instancePath: instancePath + "/request/input_per_million", schemaPath: "#/$defs/PriceConfig/properties/input_per_million/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                          if (vErrors === null) {
                                            vErrors = [err0];
                                          } else {
                                            vErrors.push(err0);
                                          }
                                          errors++;
                                        }
                                      } else {
                                        const err1 = { instancePath: instancePath + "/request/input_per_million", schemaPath: "#/$defs/PriceConfig/properties/input_per_million/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                        if (vErrors === null) {
                                          vErrors = [err1];
                                        } else {
                                          vErrors.push(err1);
                                        }
                                        errors++;
                                      }
                                    }
                                    var _valid0 = _errs22 === errors;
                                    valid3 = valid3 || _valid0;
                                    const _errs24 = errors;
                                    if (errors === _errs24) {
                                      if (typeof data8 === "string") {
                                        if (!pattern20.test(data8)) {
                                          const err2 = { instancePath: instancePath + "/request/input_per_million", schemaPath: "#/$defs/PriceConfig/properties/input_per_million/anyOf/1/pattern", keyword: "pattern", params: { pattern: "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$" }, message: 'must match pattern "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$"' };
                                          if (vErrors === null) {
                                            vErrors = [err2];
                                          } else {
                                            vErrors.push(err2);
                                          }
                                          errors++;
                                        }
                                      } else {
                                        const err3 = { instancePath: instancePath + "/request/input_per_million", schemaPath: "#/$defs/PriceConfig/properties/input_per_million/anyOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                        if (vErrors === null) {
                                          vErrors = [err3];
                                        } else {
                                          vErrors.push(err3);
                                        }
                                        errors++;
                                      }
                                    }
                                    var _valid0 = _errs24 === errors;
                                    valid3 = valid3 || _valid0;
                                    if (!valid3) {
                                      const err4 = { instancePath: instancePath + "/request/input_per_million", schemaPath: "#/$defs/PriceConfig/properties/input_per_million/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err4];
                                      } else {
                                        vErrors.push(err4);
                                      }
                                      errors++;
                                      validate39.errors = vErrors;
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
                                    var valid2 = _errs20 === errors;
                                  } else {
                                    var valid2 = true;
                                  }
                                  if (valid2) {
                                    if (data1.output_per_million !== void 0) {
                                      let data9 = data1.output_per_million;
                                      const _errs26 = errors;
                                      const _errs27 = errors;
                                      let valid4 = false;
                                      const _errs28 = errors;
                                      if (errors === _errs28) {
                                        if (typeof data9 == "number" && isFinite(data9)) {
                                          if (data9 < 0 || isNaN(data9)) {
                                            const err5 = { instancePath: instancePath + "/request/output_per_million", schemaPath: "#/$defs/PriceConfig/properties/output_per_million/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                            if (vErrors === null) {
                                              vErrors = [err5];
                                            } else {
                                              vErrors.push(err5);
                                            }
                                            errors++;
                                          }
                                        } else {
                                          const err6 = { instancePath: instancePath + "/request/output_per_million", schemaPath: "#/$defs/PriceConfig/properties/output_per_million/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                                          if (vErrors === null) {
                                            vErrors = [err6];
                                          } else {
                                            vErrors.push(err6);
                                          }
                                          errors++;
                                        }
                                      }
                                      var _valid1 = _errs28 === errors;
                                      valid4 = valid4 || _valid1;
                                      const _errs30 = errors;
                                      if (errors === _errs30) {
                                        if (typeof data9 === "string") {
                                          if (!pattern20.test(data9)) {
                                            const err7 = { instancePath: instancePath + "/request/output_per_million", schemaPath: "#/$defs/PriceConfig/properties/output_per_million/anyOf/1/pattern", keyword: "pattern", params: { pattern: "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$" }, message: 'must match pattern "^(?!^[-+.]*$)[+-]?0*\\d*\\.?\\d*$"' };
                                            if (vErrors === null) {
                                              vErrors = [err7];
                                            } else {
                                              vErrors.push(err7);
                                            }
                                            errors++;
                                          }
                                        } else {
                                          const err8 = { instancePath: instancePath + "/request/output_per_million", schemaPath: "#/$defs/PriceConfig/properties/output_per_million/anyOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err8];
                                          } else {
                                            vErrors.push(err8);
                                          }
                                          errors++;
                                        }
                                      }
                                      var _valid1 = _errs30 === errors;
                                      valid4 = valid4 || _valid1;
                                      if (!valid4) {
                                        const err9 = { instancePath: instancePath + "/request/output_per_million", schemaPath: "#/$defs/PriceConfig/properties/output_per_million/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                        if (vErrors === null) {
                                          vErrors = [err9];
                                        } else {
                                          vErrors.push(err9);
                                        }
                                        errors++;
                                        validate39.errors = vErrors;
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
                                      var valid2 = _errs26 === errors;
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
                } else {
                  validate39.errors = [{ instancePath: instancePath + "/request", schemaPath: "#/$defs/PriceConfig/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
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
      validate39.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate39.errors = vErrors;
  return errors === 0;
}
validate39.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var pattern23 = new RegExp("^[a-f0-9]{32}$", "u");
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
      if (data.op === void 0 && (missing0 = "op") || data.offset === void 0 && (missing0 = "offset")) {
        const err0 = { instancePath, schemaPath: "#/$defs/ProviderListCommand/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      } else {
        const _errs4 = errors;
        for (const key0 in data) {
          if (!(key0 === "op" || key0 === "offset")) {
            const err1 = { instancePath, schemaPath: "#/$defs/ProviderListCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
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
          if (data.op !== void 0) {
            let data0 = data.op;
            const _errs5 = errors;
            if (typeof data0 !== "string") {
              const err2 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderListCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if ("provider.list" !== data0) {
              const err3 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderListCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.list" }, message: "must be equal to constant" };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            var valid2 = _errs5 === errors;
          } else {
            var valid2 = true;
          }
          if (valid2) {
            if (data.offset !== void 0) {
              let data1 = data.offset;
              const _errs7 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                const err4 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderListCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              if (errors === _errs7) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 > 1e6 || isNaN(data1)) {
                    const err5 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderListCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  } else {
                    if (data1 < 0 || isNaN(data1)) {
                      const err6 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderListCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
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
              var valid2 = _errs7 === errors;
            } else {
              var valid2 = true;
            }
          }
        }
      }
    } else {
      const err7 = { instancePath, schemaPath: "#/$defs/ProviderListCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
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
  const _errs9 = errors;
  if (!validate21(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
    vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs9 === errors;
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
    const _errs10 = errors;
    const _errs11 = errors;
    if (errors === _errs11) {
      if (data && typeof data == "object" && !Array.isArray(data)) {
        let missing1;
        if (data.op === void 0 && (missing1 = "op") || data.profile_id === void 0 && (missing1 = "profile_id") || data.offset === void 0 && (missing1 = "offset")) {
          const err8 = { instancePath, schemaPath: "#/$defs/ProviderModelsCommand/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        } else {
          const _errs13 = errors;
          for (const key1 in data) {
            if (!(key1 === "op" || key1 === "profile_id" || key1 === "offset")) {
              const err9 = { instancePath, schemaPath: "#/$defs/ProviderModelsCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
              break;
            }
          }
          if (_errs13 === errors) {
            if (data.op !== void 0) {
              let data2 = data.op;
              const _errs14 = errors;
              if (typeof data2 !== "string") {
                const err10 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderModelsCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
              if ("provider.models" !== data2) {
                const err11 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderModelsCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.models" }, message: "must be equal to constant" };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
              var valid4 = _errs14 === errors;
            } else {
              var valid4 = true;
            }
            if (valid4) {
              if (data.profile_id !== void 0) {
                let data3 = data.profile_id;
                const _errs16 = errors;
                if (errors === _errs16) {
                  if (typeof data3 === "string") {
                    if (!pattern4.test(data3)) {
                      const err12 = { instancePath: instancePath + "/profile_id", schemaPath: "#/$defs/ProviderModelsCommand/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' };
                      if (vErrors === null) {
                        vErrors = [err12];
                      } else {
                        vErrors.push(err12);
                      }
                      errors++;
                    }
                  } else {
                    const err13 = { instancePath: instancePath + "/profile_id", schemaPath: "#/$defs/ProviderModelsCommand/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err13];
                    } else {
                      vErrors.push(err13);
                    }
                    errors++;
                  }
                }
                var valid4 = _errs16 === errors;
              } else {
                var valid4 = true;
              }
              if (valid4) {
                if (data.offset !== void 0) {
                  let data4 = data.offset;
                  const _errs18 = errors;
                  if (!(typeof data4 == "number" && (!(data4 % 1) && !isNaN(data4)) && isFinite(data4))) {
                    const err14 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderModelsCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                      vErrors = [err14];
                    } else {
                      vErrors.push(err14);
                    }
                    errors++;
                  }
                  if (errors === _errs18) {
                    if (typeof data4 == "number" && isFinite(data4)) {
                      if (data4 > 1e6 || isNaN(data4)) {
                        const err15 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderModelsCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                        if (vErrors === null) {
                          vErrors = [err15];
                        } else {
                          vErrors.push(err15);
                        }
                        errors++;
                      } else {
                        if (data4 < 0 || isNaN(data4)) {
                          const err16 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderModelsCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                          if (vErrors === null) {
                            vErrors = [err16];
                          } else {
                            vErrors.push(err16);
                          }
                          errors++;
                        }
                      }
                    }
                  }
                  var valid4 = _errs18 === errors;
                } else {
                  var valid4 = true;
                }
              }
            }
          }
        }
      } else {
        const err17 = { instancePath, schemaPath: "#/$defs/ProviderModelsCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    var _valid0 = _errs10 === errors;
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
      const _errs20 = errors;
      if (!validate27(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
        vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs20 === errors;
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
        const _errs21 = errors;
        const _errs22 = errors;
        if (errors === _errs22) {
          if (data && typeof data == "object" && !Array.isArray(data)) {
            let missing2;
            if (data.op === void 0 && (missing2 = "op")) {
              const err18 = { instancePath, schemaPath: "#/$defs/ProviderSettingsReadCommand/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            } else {
              const _errs24 = errors;
              for (const key2 in data) {
                if (!(key2 === "op")) {
                  const err19 = { instancePath, schemaPath: "#/$defs/ProviderSettingsReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                  if (vErrors === null) {
                    vErrors = [err19];
                  } else {
                    vErrors.push(err19);
                  }
                  errors++;
                  break;
                }
              }
              if (_errs24 === errors) {
                if (data.op !== void 0) {
                  let data5 = data.op;
                  if (typeof data5 !== "string") {
                    const err20 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderSettingsReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                      vErrors = [err20];
                    } else {
                      vErrors.push(err20);
                    }
                    errors++;
                  }
                  if ("provider.settings" !== data5) {
                    const err21 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderSettingsReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.settings" }, message: "must be equal to constant" };
                    if (vErrors === null) {
                      vErrors = [err21];
                    } else {
                      vErrors.push(err21);
                    }
                    errors++;
                  }
                }
              }
            }
          } else {
            const err22 = { instancePath, schemaPath: "#/$defs/ProviderSettingsReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
        var _valid0 = _errs21 === errors;
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
          const _errs27 = errors;
          if (!validate29(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs27 === errors;
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
            const _errs28 = errors;
            const _errs29 = errors;
            if (errors === _errs29) {
              if (data && typeof data == "object" && !Array.isArray(data)) {
                let missing3;
                if (data.op === void 0 && (missing3 = "op") || data.profile_id === void 0 && (missing3 = "profile_id")) {
                  const err23 = { instancePath, schemaPath: "#/$defs/ProviderSecretReadCommand/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" };
                  if (vErrors === null) {
                    vErrors = [err23];
                  } else {
                    vErrors.push(err23);
                  }
                  errors++;
                } else {
                  const _errs31 = errors;
                  for (const key3 in data) {
                    if (!(key3 === "op" || key3 === "profile_id")) {
                      const err24 = { instancePath, schemaPath: "#/$defs/ProviderSecretReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                      if (vErrors === null) {
                        vErrors = [err24];
                      } else {
                        vErrors.push(err24);
                      }
                      errors++;
                      break;
                    }
                  }
                  if (_errs31 === errors) {
                    if (data.op !== void 0) {
                      let data6 = data.op;
                      const _errs32 = errors;
                      if (typeof data6 !== "string") {
                        const err25 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderSecretReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err25];
                        } else {
                          vErrors.push(err25);
                        }
                        errors++;
                      }
                      if ("provider.secret" !== data6) {
                        const err26 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderSecretReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.secret" }, message: "must be equal to constant" };
                        if (vErrors === null) {
                          vErrors = [err26];
                        } else {
                          vErrors.push(err26);
                        }
                        errors++;
                      }
                      var valid8 = _errs32 === errors;
                    } else {
                      var valid8 = true;
                    }
                    if (valid8) {
                      if (data.profile_id !== void 0) {
                        let data7 = data.profile_id;
                        const _errs34 = errors;
                        if (errors === _errs34) {
                          if (typeof data7 === "string") {
                            if (!pattern4.test(data7)) {
                              const err27 = { instancePath: instancePath + "/profile_id", schemaPath: "#/$defs/ProviderSecretReadCommand/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' };
                              if (vErrors === null) {
                                vErrors = [err27];
                              } else {
                                vErrors.push(err27);
                              }
                              errors++;
                            }
                          } else {
                            const err28 = { instancePath: instancePath + "/profile_id", schemaPath: "#/$defs/ProviderSecretReadCommand/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                              vErrors = [err28];
                            } else {
                              vErrors.push(err28);
                            }
                            errors++;
                          }
                        }
                        var valid8 = _errs34 === errors;
                      } else {
                        var valid8 = true;
                      }
                    }
                  }
                }
              } else {
                const err29 = { instancePath, schemaPath: "#/$defs/ProviderSecretReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            var _valid0 = _errs28 === errors;
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
              const _errs36 = errors;
              if (!validate31(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs36 === errors;
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
                const _errs37 = errors;
                if (!validate33(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                  vErrors = vErrors === null ? validate33.errors : vErrors.concat(validate33.errors);
                  errors = vErrors.length;
                }
                var _valid0 = _errs37 === errors;
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
                  const _errs38 = errors;
                  const _errs39 = errors;
                  if (errors === _errs39) {
                    if (data && typeof data == "object" && !Array.isArray(data)) {
                      let missing4;
                      if (data.notebook_id === void 0 && (missing4 = "notebook_id") || data.snapshot_id === void 0 && (missing4 = "snapshot_id") || data.op === void 0 && (missing4 = "op") || data.profile_id === void 0 && (missing4 = "profile_id")) {
                        const err30 = { instancePath, schemaPath: "#/$defs/ProviderConsentReadCommand/required", keyword: "required", params: { missingProperty: missing4 }, message: "must have required property '" + missing4 + "'" };
                        if (vErrors === null) {
                          vErrors = [err30];
                        } else {
                          vErrors.push(err30);
                        }
                        errors++;
                      } else {
                        const _errs41 = errors;
                        for (const key4 in data) {
                          if (!(key4 === "notebook_id" || key4 === "snapshot_id" || key4 === "op" || key4 === "profile_id")) {
                            const err31 = { instancePath, schemaPath: "#/$defs/ProviderConsentReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                              vErrors = [err31];
                            } else {
                              vErrors.push(err31);
                            }
                            errors++;
                            break;
                          }
                        }
                        if (_errs41 === errors) {
                          if (data.notebook_id !== void 0) {
                            let data8 = data.notebook_id;
                            const _errs42 = errors;
                            if (errors === _errs42) {
                              if (typeof data8 === "string") {
                                if (!pattern11.test(data8)) {
                                  const err32 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                  if (vErrors === null) {
                                    vErrors = [err32];
                                  } else {
                                    vErrors.push(err32);
                                  }
                                  errors++;
                                }
                              } else {
                                const err33 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                if (vErrors === null) {
                                  vErrors = [err33];
                                } else {
                                  vErrors.push(err33);
                                }
                                errors++;
                              }
                            }
                            var valid10 = _errs42 === errors;
                          } else {
                            var valid10 = true;
                          }
                          if (valid10) {
                            if (data.snapshot_id !== void 0) {
                              let data9 = data.snapshot_id;
                              const _errs44 = errors;
                              if (errors === _errs44) {
                                if (typeof data9 === "string") {
                                  if (!pattern12.test(data9)) {
                                    const err34 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                    if (vErrors === null) {
                                      vErrors = [err34];
                                    } else {
                                      vErrors.push(err34);
                                    }
                                    errors++;
                                  }
                                } else {
                                  const err35 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err35];
                                  } else {
                                    vErrors.push(err35);
                                  }
                                  errors++;
                                }
                              }
                              var valid10 = _errs44 === errors;
                            } else {
                              var valid10 = true;
                            }
                            if (valid10) {
                              if (data.op !== void 0) {
                                let data10 = data.op;
                                const _errs46 = errors;
                                if (typeof data10 !== "string") {
                                  const err36 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                  if (vErrors === null) {
                                    vErrors = [err36];
                                  } else {
                                    vErrors.push(err36);
                                  }
                                  errors++;
                                }
                                if ("provider.consent" !== data10) {
                                  const err37 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.consent" }, message: "must be equal to constant" };
                                  if (vErrors === null) {
                                    vErrors = [err37];
                                  } else {
                                    vErrors.push(err37);
                                  }
                                  errors++;
                                }
                                var valid10 = _errs46 === errors;
                              } else {
                                var valid10 = true;
                              }
                              if (valid10) {
                                if (data.profile_id !== void 0) {
                                  let data11 = data.profile_id;
                                  const _errs48 = errors;
                                  if (errors === _errs48) {
                                    if (typeof data11 === "string") {
                                      if (!pattern4.test(data11)) {
                                        const err38 = { instancePath: instancePath + "/profile_id", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/profile_id/pattern", keyword: "pattern", params: { pattern: "^[a-zA-Z0-9_-]{1,100}$" }, message: 'must match pattern "^[a-zA-Z0-9_-]{1,100}$"' };
                                        if (vErrors === null) {
                                          vErrors = [err38];
                                        } else {
                                          vErrors.push(err38);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err39 = { instancePath: instancePath + "/profile_id", schemaPath: "#/$defs/ProviderConsentReadCommand/properties/profile_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err39];
                                      } else {
                                        vErrors.push(err39);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid10 = _errs48 === errors;
                                } else {
                                  var valid10 = true;
                                }
                              }
                            }
                          }
                        }
                      }
                    } else {
                      const err40 = { instancePath, schemaPath: "#/$defs/ProviderConsentReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                      if (vErrors === null) {
                        vErrors = [err40];
                      } else {
                        vErrors.push(err40);
                      }
                      errors++;
                    }
                  }
                  var _valid0 = _errs38 === errors;
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
                    const _errs50 = errors;
                    if (!validate35(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                      vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
                      errors = vErrors.length;
                    }
                    var _valid0 = _errs50 === errors;
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
                      const _errs51 = errors;
                      if (!validate37(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                        vErrors = vErrors === null ? validate37.errors : vErrors.concat(validate37.errors);
                        errors = vErrors.length;
                      }
                      var _valid0 = _errs51 === errors;
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
                        const _errs52 = errors;
                        const _errs53 = errors;
                        if (errors === _errs53) {
                          if (data && typeof data == "object" && !Array.isArray(data)) {
                            let missing5;
                            if (data.notebook_id === void 0 && (missing5 = "notebook_id") || data.snapshot_id === void 0 && (missing5 = "snapshot_id") || data.op === void 0 && (missing5 = "op") || data.kind === void 0 && (missing5 = "kind") || data.identity === void 0 && (missing5 = "identity")) {
                              const err41 = { instancePath, schemaPath: "#/$defs/ProviderBudgetReadCommand/required", keyword: "required", params: { missingProperty: missing5 }, message: "must have required property '" + missing5 + "'" };
                              if (vErrors === null) {
                                vErrors = [err41];
                              } else {
                                vErrors.push(err41);
                              }
                              errors++;
                            } else {
                              const _errs55 = errors;
                              for (const key5 in data) {
                                if (!(key5 === "notebook_id" || key5 === "snapshot_id" || key5 === "op" || key5 === "kind" || key5 === "identity")) {
                                  const err42 = { instancePath, schemaPath: "#/$defs/ProviderBudgetReadCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                                  if (vErrors === null) {
                                    vErrors = [err42];
                                  } else {
                                    vErrors.push(err42);
                                  }
                                  errors++;
                                  break;
                                }
                              }
                              if (_errs55 === errors) {
                                if (data.notebook_id !== void 0) {
                                  let data12 = data.notebook_id;
                                  const _errs56 = errors;
                                  if (errors === _errs56) {
                                    if (typeof data12 === "string") {
                                      if (!pattern11.test(data12)) {
                                        const err43 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                        if (vErrors === null) {
                                          vErrors = [err43];
                                        } else {
                                          vErrors.push(err43);
                                        }
                                        errors++;
                                      }
                                    } else {
                                      const err44 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                      if (vErrors === null) {
                                        vErrors = [err44];
                                      } else {
                                        vErrors.push(err44);
                                      }
                                      errors++;
                                    }
                                  }
                                  var valid12 = _errs56 === errors;
                                } else {
                                  var valid12 = true;
                                }
                                if (valid12) {
                                  if (data.snapshot_id !== void 0) {
                                    let data13 = data.snapshot_id;
                                    const _errs58 = errors;
                                    if (errors === _errs58) {
                                      if (typeof data13 === "string") {
                                        if (!pattern12.test(data13)) {
                                          const err45 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                          if (vErrors === null) {
                                            vErrors = [err45];
                                          } else {
                                            vErrors.push(err45);
                                          }
                                          errors++;
                                        }
                                      } else {
                                        const err46 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                        if (vErrors === null) {
                                          vErrors = [err46];
                                        } else {
                                          vErrors.push(err46);
                                        }
                                        errors++;
                                      }
                                    }
                                    var valid12 = _errs58 === errors;
                                  } else {
                                    var valid12 = true;
                                  }
                                  if (valid12) {
                                    if (data.op !== void 0) {
                                      let data14 = data.op;
                                      const _errs60 = errors;
                                      if (typeof data14 !== "string") {
                                        const err47 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                        if (vErrors === null) {
                                          vErrors = [err47];
                                        } else {
                                          vErrors.push(err47);
                                        }
                                        errors++;
                                      }
                                      if ("provider.budget.read" !== data14) {
                                        const err48 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.budget.read" }, message: "must be equal to constant" };
                                        if (vErrors === null) {
                                          vErrors = [err48];
                                        } else {
                                          vErrors.push(err48);
                                        }
                                        errors++;
                                      }
                                      var valid12 = _errs60 === errors;
                                    } else {
                                      var valid12 = true;
                                    }
                                    if (valid12) {
                                      if (data.kind !== void 0) {
                                        let data15 = data.kind;
                                        const _errs62 = errors;
                                        if (typeof data15 !== "string") {
                                          const err49 = { instancePath: instancePath + "/kind", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err49];
                                          } else {
                                            vErrors.push(err49);
                                          }
                                          errors++;
                                        }
                                        if (!(data15 === "call" || data15 === "job" || data15 === "session")) {
                                          const err50 = { instancePath: instancePath + "/kind", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/kind/enum", keyword: "enum", params: { allowedValues: schema53.properties.kind.enum }, message: "must be equal to one of the allowed values" };
                                          if (vErrors === null) {
                                            vErrors = [err50];
                                          } else {
                                            vErrors.push(err50);
                                          }
                                          errors++;
                                        }
                                        var valid12 = _errs62 === errors;
                                      } else {
                                        var valid12 = true;
                                      }
                                      if (valid12) {
                                        if (data.identity !== void 0) {
                                          let data16 = data.identity;
                                          const _errs64 = errors;
                                          if (errors === _errs64) {
                                            if (typeof data16 === "string") {
                                              if (!pattern23.test(data16)) {
                                                const err51 = { instancePath: instancePath + "/identity", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/identity/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{32}$" }, message: 'must match pattern "^[a-f0-9]{32}$"' };
                                                if (vErrors === null) {
                                                  vErrors = [err51];
                                                } else {
                                                  vErrors.push(err51);
                                                }
                                                errors++;
                                              }
                                            } else {
                                              const err52 = { instancePath: instancePath + "/identity", schemaPath: "#/$defs/ProviderBudgetReadCommand/properties/identity/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                              if (vErrors === null) {
                                                vErrors = [err52];
                                              } else {
                                                vErrors.push(err52);
                                              }
                                              errors++;
                                            }
                                          }
                                          var valid12 = _errs64 === errors;
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
                            const err53 = { instancePath, schemaPath: "#/$defs/ProviderBudgetReadCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                            if (vErrors === null) {
                              vErrors = [err53];
                            } else {
                              vErrors.push(err53);
                            }
                            errors++;
                          }
                        }
                        var _valid0 = _errs52 === errors;
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
                          const _errs66 = errors;
                          if (!validate39(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })) {
                            vErrors = vErrors === null ? validate39.errors : vErrors.concat(validate39.errors);
                            errors = vErrors.length;
                          }
                          var _valid0 = _errs66 === errors;
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
                            const _errs67 = errors;
                            const _errs68 = errors;
                            if (errors === _errs68) {
                              if (data && typeof data == "object" && !Array.isArray(data)) {
                                let missing6;
                                if (data.notebook_id === void 0 && (missing6 = "notebook_id") || data.snapshot_id === void 0 && (missing6 = "snapshot_id") || data.op === void 0 && (missing6 = "op") || data.offset === void 0 && (missing6 = "offset")) {
                                  const err54 = { instancePath, schemaPath: "#/$defs/ProviderCallsCommand/required", keyword: "required", params: { missingProperty: missing6 }, message: "must have required property '" + missing6 + "'" };
                                  if (vErrors === null) {
                                    vErrors = [err54];
                                  } else {
                                    vErrors.push(err54);
                                  }
                                  errors++;
                                } else {
                                  const _errs70 = errors;
                                  for (const key6 in data) {
                                    if (!(key6 === "notebook_id" || key6 === "snapshot_id" || key6 === "op" || key6 === "offset")) {
                                      const err55 = { instancePath, schemaPath: "#/$defs/ProviderCallsCommand/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
                                      if (vErrors === null) {
                                        vErrors = [err55];
                                      } else {
                                        vErrors.push(err55);
                                      }
                                      errors++;
                                      break;
                                    }
                                  }
                                  if (_errs70 === errors) {
                                    if (data.notebook_id !== void 0) {
                                      let data17 = data.notebook_id;
                                      const _errs71 = errors;
                                      if (errors === _errs71) {
                                        if (typeof data17 === "string") {
                                          if (!pattern11.test(data17)) {
                                            const err56 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProviderCallsCommand/properties/notebook_id/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$" }, message: 'must match pattern "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"' };
                                            if (vErrors === null) {
                                              vErrors = [err56];
                                            } else {
                                              vErrors.push(err56);
                                            }
                                            errors++;
                                          }
                                        } else {
                                          const err57 = { instancePath: instancePath + "/notebook_id", schemaPath: "#/$defs/ProviderCallsCommand/properties/notebook_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                          if (vErrors === null) {
                                            vErrors = [err57];
                                          } else {
                                            vErrors.push(err57);
                                          }
                                          errors++;
                                        }
                                      }
                                      var valid14 = _errs71 === errors;
                                    } else {
                                      var valid14 = true;
                                    }
                                    if (valid14) {
                                      if (data.snapshot_id !== void 0) {
                                        let data18 = data.snapshot_id;
                                        const _errs73 = errors;
                                        if (errors === _errs73) {
                                          if (typeof data18 === "string") {
                                            if (!pattern12.test(data18)) {
                                              const err58 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProviderCallsCommand/properties/snapshot_id/pattern", keyword: "pattern", params: { pattern: "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$" }, message: 'must match pattern "^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"' };
                                              if (vErrors === null) {
                                                vErrors = [err58];
                                              } else {
                                                vErrors.push(err58);
                                              }
                                              errors++;
                                            }
                                          } else {
                                            const err59 = { instancePath: instancePath + "/snapshot_id", schemaPath: "#/$defs/ProviderCallsCommand/properties/snapshot_id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                            if (vErrors === null) {
                                              vErrors = [err59];
                                            } else {
                                              vErrors.push(err59);
                                            }
                                            errors++;
                                          }
                                        }
                                        var valid14 = _errs73 === errors;
                                      } else {
                                        var valid14 = true;
                                      }
                                      if (valid14) {
                                        if (data.op !== void 0) {
                                          let data19 = data.op;
                                          const _errs75 = errors;
                                          if (typeof data19 !== "string") {
                                            const err60 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderCallsCommand/properties/op/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                            if (vErrors === null) {
                                              vErrors = [err60];
                                            } else {
                                              vErrors.push(err60);
                                            }
                                            errors++;
                                          }
                                          if ("provider.calls" !== data19) {
                                            const err61 = { instancePath: instancePath + "/op", schemaPath: "#/$defs/ProviderCallsCommand/properties/op/const", keyword: "const", params: { allowedValue: "provider.calls" }, message: "must be equal to constant" };
                                            if (vErrors === null) {
                                              vErrors = [err61];
                                            } else {
                                              vErrors.push(err61);
                                            }
                                            errors++;
                                          }
                                          var valid14 = _errs75 === errors;
                                        } else {
                                          var valid14 = true;
                                        }
                                        if (valid14) {
                                          if (data.offset !== void 0) {
                                            let data20 = data.offset;
                                            const _errs77 = errors;
                                            if (!(typeof data20 == "number" && (!(data20 % 1) && !isNaN(data20)) && isFinite(data20))) {
                                              const err62 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderCallsCommand/properties/offset/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                              if (vErrors === null) {
                                                vErrors = [err62];
                                              } else {
                                                vErrors.push(err62);
                                              }
                                              errors++;
                                            }
                                            if (errors === _errs77) {
                                              if (typeof data20 == "number" && isFinite(data20)) {
                                                if (data20 > 1e6 || isNaN(data20)) {
                                                  const err63 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderCallsCommand/properties/offset/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e6 }, message: "must be <= 1000000" };
                                                  if (vErrors === null) {
                                                    vErrors = [err63];
                                                  } else {
                                                    vErrors.push(err63);
                                                  }
                                                  errors++;
                                                } else {
                                                  if (data20 < 0 || isNaN(data20)) {
                                                    const err64 = { instancePath: instancePath + "/offset", schemaPath: "#/$defs/ProviderCallsCommand/properties/offset/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                                    if (vErrors === null) {
                                                      vErrors = [err64];
                                                    } else {
                                                      vErrors.push(err64);
                                                    }
                                                    errors++;
                                                  }
                                                }
                                              }
                                            }
                                            var valid14 = _errs77 === errors;
                                          } else {
                                            var valid14 = true;
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              } else {
                                const err65 = { instancePath, schemaPath: "#/$defs/ProviderCallsCommand/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                                if (vErrors === null) {
                                  vErrors = [err65];
                                } else {
                                  vErrors.push(err65);
                                }
                                errors++;
                              }
                            }
                            var _valid0 = _errs67 === errors;
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
    const err66 = { instancePath, schemaPath: "#/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
    if (vErrors === null) {
      vErrors = [err66];
    } else {
      vErrors.push(err66);
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
  validate_provider_command_generated_default as default,
  validate
};
