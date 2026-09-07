// validate-original-structure.generated.js
var validate = validate20;
var validate_original_structure_generated_default = validate20;
var schema32 = { "additionalProperties": false, "properties": { "kind": { "enum": ["start", "end", "text", "image"], "title": "Kind", "type": "string" }, "tag": { "default": "", "title": "Tag", "type": "string" }, "attributes": { "additionalProperties": { "type": "string" }, "title": "Attributes", "type": "object" }, "text": { "default": "", "title": "Text", "type": "string" }, "image_index": { "anyOf": [{ "minimum": 0, "type": "integer" }, { "type": "null" }], "default": null, "title": "Image Index" } }, "required": ["kind"], "title": "OriginalToken", "type": "object" };
var schema34 = { "additionalProperties": false, "properties": { "code": { "enum": ["ACTIVE_CONTENT", "SOURCE_STYLE", "EXTERNAL_RESOURCE", "UNSUPPORTED_ELEMENT", "REMOVED_ATTRIBUTE", "UNDECLARED_IMAGE", "IMAGE_FORMAT", "IMAGE_LIMIT", "IMAGE_DECODE", "IMAGE_ANIMATION"], "title": "Code", "type": "string" }, "element": { "title": "Element", "type": "string" }, "reference": { "title": "Reference", "type": "string" }, "count": { "default": 1, "minimum": 1, "title": "Count", "type": "integer" } }, "required": ["code", "element", "reference"], "title": "OriginalLimitation", "type": "object" };
var pattern4 = new RegExp("^[a-f0-9]{64}$", "u");
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
      if (data.tokens === void 0 && (missing0 = "tokens") || data.images === void 0 && (missing0 = "images") || data.limitations === void 0 && (missing0 = "limitations")) {
        validate20.errors = [{ instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: missing0 }, message: "must have required property '" + missing0 + "'" }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) {
          if (!(key0 === "tokens" || key0 === "images" || key0 === "limitations")) {
            validate20.errors = [{ instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" }];
            return false;
            break;
          }
        }
        if (_errs1 === errors) {
          if (data.tokens !== void 0) {
            let data0 = data.tokens;
            const _errs2 = errors;
            if (errors === _errs2) {
              if (Array.isArray(data0)) {
                var valid1 = true;
                const len0 = data0.length;
                for (let i0 = 0; i0 < len0; i0++) {
                  let data1 = data0[i0];
                  const _errs4 = errors;
                  const _errs5 = errors;
                  if (errors === _errs5) {
                    if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
                      let missing1;
                      if (data1.kind === void 0 && (missing1 = "kind")) {
                        validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0, schemaPath: "#/$defs/OriginalToken/required", keyword: "required", params: { missingProperty: missing1 }, message: "must have required property '" + missing1 + "'" }];
                        return false;
                      } else {
                        const _errs7 = errors;
                        for (const key1 in data1) {
                          if (!(key1 === "kind" || key1 === "tag" || key1 === "attributes" || key1 === "text" || key1 === "image_index")) {
                            validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0, schemaPath: "#/$defs/OriginalToken/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" }];
                            return false;
                            break;
                          }
                        }
                        if (_errs7 === errors) {
                          if (data1.kind !== void 0) {
                            let data2 = data1.kind;
                            const _errs8 = errors;
                            if (typeof data2 !== "string") {
                              validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0 + "/kind", schemaPath: "#/$defs/OriginalToken/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                              return false;
                            }
                            if (!(data2 === "start" || data2 === "end" || data2 === "text" || data2 === "image")) {
                              validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0 + "/kind", schemaPath: "#/$defs/OriginalToken/properties/kind/enum", keyword: "enum", params: { allowedValues: schema32.properties.kind.enum }, message: "must be equal to one of the allowed values" }];
                              return false;
                            }
                            var valid3 = _errs8 === errors;
                          } else {
                            var valid3 = true;
                          }
                          if (valid3) {
                            if (data1.tag !== void 0) {
                              const _errs10 = errors;
                              if (typeof data1.tag !== "string") {
                                validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0 + "/tag", schemaPath: "#/$defs/OriginalToken/properties/tag/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                return false;
                              }
                              var valid3 = _errs10 === errors;
                            } else {
                              var valid3 = true;
                            }
                            if (valid3) {
                              if (data1.attributes !== void 0) {
                                let data4 = data1.attributes;
                                const _errs12 = errors;
                                if (errors === _errs12) {
                                  if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
                                    for (const key2 in data4) {
                                      const _errs15 = errors;
                                      if (typeof data4[key2] !== "string") {
                                        validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0 + "/attributes/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/$defs/OriginalToken/properties/attributes/additionalProperties/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                        return false;
                                      }
                                      var valid4 = _errs15 === errors;
                                      if (!valid4) {
                                        break;
                                      }
                                    }
                                  } else {
                                    validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0 + "/attributes", schemaPath: "#/$defs/OriginalToken/properties/attributes/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                                    return false;
                                  }
                                }
                                var valid3 = _errs12 === errors;
                              } else {
                                var valid3 = true;
                              }
                              if (valid3) {
                                if (data1.text !== void 0) {
                                  const _errs17 = errors;
                                  if (typeof data1.text !== "string") {
                                    validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0 + "/text", schemaPath: "#/$defs/OriginalToken/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                  var valid3 = _errs17 === errors;
                                } else {
                                  var valid3 = true;
                                }
                                if (valid3) {
                                  if (data1.image_index !== void 0) {
                                    let data7 = data1.image_index;
                                    const _errs19 = errors;
                                    const _errs20 = errors;
                                    let valid5 = false;
                                    const _errs21 = errors;
                                    if (!(typeof data7 == "number" && (!(data7 % 1) && !isNaN(data7)) && isFinite(data7))) {
                                      const err0 = { instancePath: instancePath + "/tokens/" + i0 + "/image_index", schemaPath: "#/$defs/OriginalToken/properties/image_index/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                                      if (vErrors === null) {
                                        vErrors = [err0];
                                      } else {
                                        vErrors.push(err0);
                                      }
                                      errors++;
                                    }
                                    if (errors === _errs21) {
                                      if (typeof data7 == "number" && isFinite(data7)) {
                                        if (data7 < 0 || isNaN(data7)) {
                                          const err1 = { instancePath: instancePath + "/tokens/" + i0 + "/image_index", schemaPath: "#/$defs/OriginalToken/properties/image_index/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 0 }, message: "must be >= 0" };
                                          if (vErrors === null) {
                                            vErrors = [err1];
                                          } else {
                                            vErrors.push(err1);
                                          }
                                          errors++;
                                        }
                                      }
                                    }
                                    var _valid0 = _errs21 === errors;
                                    valid5 = valid5 || _valid0;
                                    const _errs23 = errors;
                                    if (data7 !== null) {
                                      const err2 = { instancePath: instancePath + "/tokens/" + i0 + "/image_index", schemaPath: "#/$defs/OriginalToken/properties/image_index/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
                                      if (vErrors === null) {
                                        vErrors = [err2];
                                      } else {
                                        vErrors.push(err2);
                                      }
                                      errors++;
                                    }
                                    var _valid0 = _errs23 === errors;
                                    valid5 = valid5 || _valid0;
                                    if (!valid5) {
                                      const err3 = { instancePath: instancePath + "/tokens/" + i0 + "/image_index", schemaPath: "#/$defs/OriginalToken/properties/image_index/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
                                      if (vErrors === null) {
                                        vErrors = [err3];
                                      } else {
                                        vErrors.push(err3);
                                      }
                                      errors++;
                                      validate20.errors = vErrors;
                                      return false;
                                    } else {
                                      errors = _errs20;
                                      if (vErrors !== null) {
                                        if (_errs20) {
                                          vErrors.length = _errs20;
                                        } else {
                                          vErrors = null;
                                        }
                                      }
                                    }
                                    var valid3 = _errs19 === errors;
                                  } else {
                                    var valid3 = true;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    } else {
                      validate20.errors = [{ instancePath: instancePath + "/tokens/" + i0, schemaPath: "#/$defs/OriginalToken/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                      return false;
                    }
                  }
                  var valid1 = _errs4 === errors;
                  if (!valid1) {
                    break;
                  }
                }
              } else {
                validate20.errors = [{ instancePath: instancePath + "/tokens", schemaPath: "#/properties/tokens/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                return false;
              }
            }
            var valid0 = _errs2 === errors;
          } else {
            var valid0 = true;
          }
          if (valid0) {
            if (data.images !== void 0) {
              let data8 = data.images;
              const _errs25 = errors;
              if (errors === _errs25) {
                if (Array.isArray(data8)) {
                  var valid6 = true;
                  const len1 = data8.length;
                  for (let i1 = 0; i1 < len1; i1++) {
                    let data9 = data8[i1];
                    const _errs27 = errors;
                    const _errs28 = errors;
                    if (errors === _errs28) {
                      if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                        let missing2;
                        if (data9.sha256 === void 0 && (missing2 = "sha256") || data9.width === void 0 && (missing2 = "width") || data9.height === void 0 && (missing2 = "height") || data9.data_base64 === void 0 && (missing2 = "data_base64")) {
                          validate20.errors = [{ instancePath: instancePath + "/images/" + i1, schemaPath: "#/$defs/OriginalImage/required", keyword: "required", params: { missingProperty: missing2 }, message: "must have required property '" + missing2 + "'" }];
                          return false;
                        } else {
                          const _errs30 = errors;
                          for (const key3 in data9) {
                            if (!(key3 === "sha256" || key3 === "width" || key3 === "height" || key3 === "data_base64")) {
                              validate20.errors = [{ instancePath: instancePath + "/images/" + i1, schemaPath: "#/$defs/OriginalImage/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" }];
                              return false;
                              break;
                            }
                          }
                          if (_errs30 === errors) {
                            if (data9.sha256 !== void 0) {
                              let data10 = data9.sha256;
                              const _errs31 = errors;
                              if (errors === _errs31) {
                                if (typeof data10 === "string") {
                                  if (!pattern4.test(data10)) {
                                    validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/sha256", schemaPath: "#/$defs/OriginalImage/properties/sha256/pattern", keyword: "pattern", params: { pattern: "^[a-f0-9]{64}$" }, message: 'must match pattern "^[a-f0-9]{64}$"' }];
                                    return false;
                                  }
                                } else {
                                  validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/sha256", schemaPath: "#/$defs/OriginalImage/properties/sha256/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                              }
                              var valid8 = _errs31 === errors;
                            } else {
                              var valid8 = true;
                            }
                            if (valid8) {
                              if (data9.width !== void 0) {
                                let data11 = data9.width;
                                const _errs33 = errors;
                                if (!(typeof data11 == "number" && (!(data11 % 1) && !isNaN(data11)) && isFinite(data11))) {
                                  validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/width", schemaPath: "#/$defs/OriginalImage/properties/width/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                  return false;
                                }
                                if (errors === _errs33) {
                                  if (typeof data11 == "number" && isFinite(data11)) {
                                    if (data11 <= 0 || isNaN(data11)) {
                                      validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/width", schemaPath: "#/$defs/OriginalImage/properties/width/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" }];
                                      return false;
                                    }
                                  }
                                }
                                var valid8 = _errs33 === errors;
                              } else {
                                var valid8 = true;
                              }
                              if (valid8) {
                                if (data9.height !== void 0) {
                                  let data12 = data9.height;
                                  const _errs35 = errors;
                                  if (!(typeof data12 == "number" && (!(data12 % 1) && !isNaN(data12)) && isFinite(data12))) {
                                    validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/height", schemaPath: "#/$defs/OriginalImage/properties/height/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                    return false;
                                  }
                                  if (errors === _errs35) {
                                    if (typeof data12 == "number" && isFinite(data12)) {
                                      if (data12 <= 0 || isNaN(data12)) {
                                        validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/height", schemaPath: "#/$defs/OriginalImage/properties/height/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" }];
                                        return false;
                                      }
                                    }
                                  }
                                  var valid8 = _errs35 === errors;
                                } else {
                                  var valid8 = true;
                                }
                                if (valid8) {
                                  if (data9.data_base64 !== void 0) {
                                    const _errs37 = errors;
                                    if (typeof data9.data_base64 !== "string") {
                                      validate20.errors = [{ instancePath: instancePath + "/images/" + i1 + "/data_base64", schemaPath: "#/$defs/OriginalImage/properties/data_base64/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                    var valid8 = _errs37 === errors;
                                  } else {
                                    var valid8 = true;
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        validate20.errors = [{ instancePath: instancePath + "/images/" + i1, schemaPath: "#/$defs/OriginalImage/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                        return false;
                      }
                    }
                    var valid6 = _errs27 === errors;
                    if (!valid6) {
                      break;
                    }
                  }
                } else {
                  validate20.errors = [{ instancePath: instancePath + "/images", schemaPath: "#/properties/images/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                  return false;
                }
              }
              var valid0 = _errs25 === errors;
            } else {
              var valid0 = true;
            }
            if (valid0) {
              if (data.limitations !== void 0) {
                let data14 = data.limitations;
                const _errs39 = errors;
                if (errors === _errs39) {
                  if (Array.isArray(data14)) {
                    var valid9 = true;
                    const len2 = data14.length;
                    for (let i2 = 0; i2 < len2; i2++) {
                      let data15 = data14[i2];
                      const _errs41 = errors;
                      const _errs42 = errors;
                      if (errors === _errs42) {
                        if (data15 && typeof data15 == "object" && !Array.isArray(data15)) {
                          let missing3;
                          if (data15.code === void 0 && (missing3 = "code") || data15.element === void 0 && (missing3 = "element") || data15.reference === void 0 && (missing3 = "reference")) {
                            validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2, schemaPath: "#/$defs/OriginalLimitation/required", keyword: "required", params: { missingProperty: missing3 }, message: "must have required property '" + missing3 + "'" }];
                            return false;
                          } else {
                            const _errs44 = errors;
                            for (const key4 in data15) {
                              if (!(key4 === "code" || key4 === "element" || key4 === "reference" || key4 === "count")) {
                                validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2, schemaPath: "#/$defs/OriginalLimitation/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" }];
                                return false;
                                break;
                              }
                            }
                            if (_errs44 === errors) {
                              if (data15.code !== void 0) {
                                let data16 = data15.code;
                                const _errs45 = errors;
                                if (typeof data16 !== "string") {
                                  validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2 + "/code", schemaPath: "#/$defs/OriginalLimitation/properties/code/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                  return false;
                                }
                                if (!(data16 === "ACTIVE_CONTENT" || data16 === "SOURCE_STYLE" || data16 === "EXTERNAL_RESOURCE" || data16 === "UNSUPPORTED_ELEMENT" || data16 === "REMOVED_ATTRIBUTE" || data16 === "UNDECLARED_IMAGE" || data16 === "IMAGE_FORMAT" || data16 === "IMAGE_LIMIT" || data16 === "IMAGE_DECODE" || data16 === "IMAGE_ANIMATION")) {
                                  validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2 + "/code", schemaPath: "#/$defs/OriginalLimitation/properties/code/enum", keyword: "enum", params: { allowedValues: schema34.properties.code.enum }, message: "must be equal to one of the allowed values" }];
                                  return false;
                                }
                                var valid11 = _errs45 === errors;
                              } else {
                                var valid11 = true;
                              }
                              if (valid11) {
                                if (data15.element !== void 0) {
                                  const _errs47 = errors;
                                  if (typeof data15.element !== "string") {
                                    validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2 + "/element", schemaPath: "#/$defs/OriginalLimitation/properties/element/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                    return false;
                                  }
                                  var valid11 = _errs47 === errors;
                                } else {
                                  var valid11 = true;
                                }
                                if (valid11) {
                                  if (data15.reference !== void 0) {
                                    const _errs49 = errors;
                                    if (typeof data15.reference !== "string") {
                                      validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2 + "/reference", schemaPath: "#/$defs/OriginalLimitation/properties/reference/type", keyword: "type", params: { type: "string" }, message: "must be string" }];
                                      return false;
                                    }
                                    var valid11 = _errs49 === errors;
                                  } else {
                                    var valid11 = true;
                                  }
                                  if (valid11) {
                                    if (data15.count !== void 0) {
                                      let data19 = data15.count;
                                      const _errs51 = errors;
                                      if (!(typeof data19 == "number" && (!(data19 % 1) && !isNaN(data19)) && isFinite(data19))) {
                                        validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2 + "/count", schemaPath: "#/$defs/OriginalLimitation/properties/count/type", keyword: "type", params: { type: "integer" }, message: "must be integer" }];
                                        return false;
                                      }
                                      if (errors === _errs51) {
                                        if (typeof data19 == "number" && isFinite(data19)) {
                                          if (data19 < 1 || isNaN(data19)) {
                                            validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2 + "/count", schemaPath: "#/$defs/OriginalLimitation/properties/count/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" }];
                                            return false;
                                          }
                                        }
                                      }
                                      var valid11 = _errs51 === errors;
                                    } else {
                                      var valid11 = true;
                                    }
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          validate20.errors = [{ instancePath: instancePath + "/limitations/" + i2, schemaPath: "#/$defs/OriginalLimitation/type", keyword: "type", params: { type: "object" }, message: "must be object" }];
                          return false;
                        }
                      }
                      var valid9 = _errs41 === errors;
                      if (!valid9) {
                        break;
                      }
                    }
                  } else {
                    validate20.errors = [{ instancePath: instancePath + "/limitations", schemaPath: "#/properties/limitations/type", keyword: "type", params: { type: "array" }, message: "must be array" }];
                    return false;
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
  validate_original_structure_generated_default as default,
  validate
};
