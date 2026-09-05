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

// validate-manifest.generated.js
var validate = validate20;
var validate_manifest_generated_default = validate20;
var pattern4 = new RegExp("^[0-9]+\\.[0-9]+\\.[0-9]+$", "u");
var pattern5 = new RegExp("^[A-Za-z0-9_./ -]+$", "u");
var pattern6 = new RegExp("^[a-f0-9]{64}$", "u");
var func1 = require_ucs2length().default;
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
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.manifest_version === void 0 && (missing0 = "manifest_version") || data.protocol_version === void 0 && (missing0 = "protocol_version") || data.engine_version === void 0 && (missing0 = "engine_version") || data.platform === void 0 && (missing0 = "platform") || data.architecture === void 0 && (missing0 = "architecture") || data.entrypoint === void 0 && (missing0 = "entrypoint") || data.files === void 0 && (missing0 = "files")) {
        validate20.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "manifest_version" || key0 === "protocol_version" || key0 === "engine_version" || key0 === "platform" || key0 === "architecture" || key0 === "entrypoint" || key0 === "files")) {
            validate20.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.manifest_version !== void 0) {
            let data0 = data.manifest_version;
            const _errs2 = errors;
            if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
              validate20.errors = [{ instancePath: instancePath + "/manifest_version", schemaPath: "#/properties/manifest_version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
              return false;
            }
            if (1 !== data0) {
              validate20.errors = [{ instancePath: instancePath + "/manifest_version", schemaPath: "#/properties/manifest_version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.protocol_version !== void 0) {
              let data1 = data.protocol_version;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && (!(data1 % 1) && !isNaN(data1)) && isFinite(data1))) {
                validate20.errors = [{ instancePath: instancePath + "/protocol_version", schemaPath: "#/properties/protocol_version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                return false;
              }
              if (1 !== data1) {
                validate20.errors = [{ instancePath: instancePath + "/protocol_version", schemaPath: "#/properties/protocol_version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" }];
                return false;
              }
              var valid0 = _errs4 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.engine_version !== void 0) {
                let data2 = data.engine_version;
                const _errs6 = errors;
                if (errors === _errs6) {
                  if (typeof data2 === "string") {
                    if (!pattern4.test(data2)) {
                      validate20.errors = [{ instancePath: instancePath + "/engine_version", schemaPath: "#/properties/engine_version/pattern", keyword: "pattern", params: { pattern: "^[0-9]+\\.[0-9]+\\.[0-9]+$" }, message: 'must match pattern "^[0-9]+\\.[0-9]+\\.[0-9]+$"' }];
                      return false;
                    }
                  } else {
                    validate20.errors = [{ instancePath: instancePath + "/engine_version", schemaPath: "#/properties/engine_version/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                }
                var valid0 = _errs6 === errors;
              } else {
                var valid0 = true;
              }
              if (valid0) {
                if (data.platform !== void 0) {
                  let data3 = data.platform;
                  const _errs8 = errors;
                  if (typeof data3 !== "string") {
                    validate20.errors = [{ instancePath: instancePath + "/platform", schemaPath: "#/properties/platform/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                    return false;
                  }
                  if ("win32" !== data3) {
                    validate20.errors = [{ instancePath: instancePath + "/platform", schemaPath: "#/properties/platform/const", keyword: "const", params: { allowedValue: "win32" }, message: "must be equal to constant" }];
                    return false;
                  }
                  var valid0 = _errs8 === errors;
                } else {
                  var valid0 = true;
                }
                if (valid0) {
                  if (data.architecture !== void 0) {
                    let data4 = data.architecture;
                    const _errs10 = errors;
                    if (typeof data4 !== "string") {
                      validate20.errors = [{ instancePath: instancePath + "/architecture", schemaPath: "#/properties/architecture/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                      return false;
                    }
                    if ("x86_64" !== data4) {
                      validate20.errors = [{ instancePath: instancePath + "/architecture", schemaPath: "#/properties/architecture/const", keyword: "const", params: { allowedValue: "x86_64" }, message: "must be equal to constant" }];
                      return false;
                    }
                    var valid0 = _errs10 === errors;
                  } else {
                    var valid0 = true;
                  }
                  if (valid0) {
                    if (data.entrypoint !== void 0) {
                      let data5 = data.entrypoint;
                      const _errs12 = errors;
                      if (typeof data5 !== "string") {
                        validate20.errors = [{ instancePath: instancePath + "/entrypoint", schemaPath: "#/properties/entrypoint/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                        return false;
                      }
                      if ("evidra-engine.exe" !== data5) {
                        validate20.errors = [{ instancePath: instancePath + "/entrypoint", schemaPath: "#/properties/entrypoint/const", keyword: "const", params: { allowedValue: "evidra-engine.exe" }, message: "must be equal to constant" }];
                        return false;
                      }
                      var valid0 = _errs12 === errors;
                    } else {
                      var valid0 = true;
                    }
                    if (valid0) {
                      if (data.files !== void 0) {
                        let data6 = data.files;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (Array.isArray(data6)) {
                            if (data6.length > 1e4) {
                              validate20.errors = [{ instancePath: instancePath + "/files", schemaPath: "#/properties/files/maxItems", keyword: "maxItems", params: { limit: 1e4 }, message: "must NOT have more than 10000 items" }];
                              return false;
                            } else {
                              if (data6.length < 1) {
                                validate20.errors = [{ instancePath: instancePath + "/files", schemaPath: "#/properties/files/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" }];
                                return false;
                              } else {
                                var valid1 = true;
                                const len0 = data6.length;
                                for (let i0 = 0; i0 < len0; i0++) {
                                  let data7 = data6[i0];
                                  const _errs16 = errors;
                                  const _errs17 = errors;
                                  if (errors === _errs17) {
                                    if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
                                      let missing1;
                                      if (data7.path === void 0 && (missing1 = "path") || data7.size === void 0 && (missing1 = "size") || data7.sha256 === void 0 && (missing1 = "sha256")) {
                                        validate20.errors = [{ instancePath: instancePath + "/files/" + i0, schemaPath: "#/$defs/PayloadFile/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                                        return false;
                                      } else {
                                        const _errs19 = errors;
                                        for (const key1 in data7) {
                                          if (!(key1 === "path" || key1 === "size" || key1 === "sha256")) {
                                            validate20.errors = [{ instancePath: instancePath + "/files/" + i0, schemaPath: "#/$defs/PayloadFile/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                                            return false;
                                            break;
                                          }
                                        }
                                        if (_errs19 === errors) {
                                          if (data7.path !== void 0) {
                                            let data8 = data7.path;
                                            const _errs20 = errors;
                                            if (errors === _errs20) {
                                              if (typeof data8 === "string") {
                                                if (func1(data8) > 240) {
                                                  validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/path", schemaPath: "#/$defs/PayloadFile/properties/path/maxLength", keyword: "maxLength", params: { limit: 240 }, message: "must NOT have more than 240 characters" }];
                                                  return false;
                                                } else {
                                                  if (func1(data8) < 1) {
                                                    validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/path", schemaPath: "#/$defs/PayloadFile/properties/path/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" }];
                                                    return false;
                                                  } else {
                                                    if (!pattern5.test(data8)) {
                                                      validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/path", schemaPath: "#/$defs/PayloadFile/properties/path/pattern", keyword: "pattern", params: { pattern: "^[A-Za-z0-9_./ -]+$" }, message: 'must match pattern "^[A-Za-z0-9_./ -]+$"' }];
                                                      return false;
                                                    }
                                                  }
                                                }
                                              } else {
                                                validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/path", schemaPath: "#/$defs/PayloadFile/properties/path/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                                return false;
                                              }
                                            }
                                            var valid3 = _errs20 === errors;
                                          } else {
                                            var valid3 = true;
                                          }
                                          if (valid3) {
                                            if (data7.size !== void 0) {
                                              let data9 = data7.size;
                                              const _errs22 = errors;
                                              if (!(typeof data9 == "number" && (!(data9 % 1) && !isNaN(data9)) && isFinite(data9))) {
                                                validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/size", schemaPath: "#/$defs/PayloadFile/properties/size/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                                return false;
                                              }
                                              if (errors === _errs22) {
                                                if (typeof data9 == "number" && isFinite(data9)) {
                                                  if (data9 < 0 || isNaN(data9)) {
                                                    validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/size", schemaPath: "#/$defs/PayloadFile/properties/size/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" }];
                                                    return false;
                                                  }
                                                }
                                              }
                                              var valid3 = _errs22 === errors;
                                            } else {
                                              var valid3 = true;
                                            }
                                            if (valid3) {
                                              if (data7.sha256 !== void 0) {
                                                let data10 = data7.sha256;
                                                const _errs24 = errors;
                                                if (errors === _errs24) {
                                                  if (typeof data10 === "string") {
                                                    if (!pattern6.test(data10)) {
                                                      validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/sha256", schemaPath: "#/$defs/PayloadFile/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                                      return false;
                                                    }
                                                  } else {
                                                    validate20.errors = [{ instancePath: instancePath + "/files/" + i0 + "/sha256", schemaPath: "#/$defs/PayloadFile/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
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
                                    } else {
                                      validate20.errors = [{ instancePath: instancePath + "/files/" + i0, schemaPath: "#/$defs/PayloadFile/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                      return false;
                                    }
                                  }
                                  var valid1 = _errs16 === errors;
                                  if (!valid1) {
                                    break;
                                  }
                                }
                              }
                            }
                          } else {
                            validate20.errors = [{ instancePath: instancePath + "/files", schemaPath: "#/properties/files/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                            return false;
                          }
                        }
                        var valid0 = _errs14 === errors;
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
      validate20.errors = [{ instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
      return false;
    }
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
export {
  validate_manifest_generated_default as default,
  validate
};
