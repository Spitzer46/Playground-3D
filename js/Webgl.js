export class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

class AttribInfo {
    constructor(loc, size, type) {
        this.loc = loc;
        this.size =  size;
        this.type = type;
    }
}

class UniformInfo {
    constructor(loc, size, type) {
        this.loc = loc;
        this.size = size;
        this.type = type;
    }
}

class VariableLocations {
    constructor(attribIndex, uniformLoc) {
        this.attribIndex = attribIndex;
        this.uniformLoc = uniformLoc;
    }
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

export class WebGL {

    #canvas = null;
    #gl = null;
    #resized = false;
    #width = 0;
    #height = 0;
    #clearColor = null;
    #enableDepthTest = false;
    #program = null;

    constructor(canvas, opt = {}) {
        this.#canvas = canvas;
        this.#gl = canvas.getContext("webgl", opt);
        if(this.#gl === null) {
            throw new Error("webgl does not support");
        }
        this.#resized = false;

        window.addEventListener("resize", this.#resize.bind(this));
        this.#resize();
    }

    #resize() {
        const dpr = window.devicePixelRatio || 1;
        this.#width = this.#canvas.offsetWidth * dpr;
        this.#height = this.#canvas.offsetHeight * dpr;
        this.#canvas.width = this.#width;
        this.#canvas.height = this.#height;
        this.#gl.viewport(0, 0, this.#gl.drawingBufferWidth, this.#gl.drawingBufferHeight);
        this.#resized = true;
    }

    clear() {
        if(this.#clearColor) {
            this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
        }
    }

    loadShader(source, type) {
        const gl = this.#gl;
        const shader = gl.createShader(type);
        if(shader === null) {
            console.warn("unable to create shader");
            return null;
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(!compiled) {
            const error = gl.getShaderInfoLog(shader);
            console.warn('failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShaderSrc, fragShaderSrc) {
        const gl = this.#gl;
        const vertexShader = this.loadShader(vertexShaderSrc, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fragShaderSrc, gl.FRAGMENT_SHADER);
        if(vertexShader === null || fragmentShader === null) {
            return null;
        }
        const program = gl.createProgram();
        if (!program) {
            return null;
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            const error = gl.getProgramInfoLog(program);
            console.warn('failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }

    initShader(vertexShader, fragmentShader) {
        const gl = this.#gl;
        const program = this.createProgram(vertexShader, fragmentShader);
        if(program === null) {
            console.warn('failed to create program');
            return null;
        }
        return { varLocations: this.loadVariableLocations(program), program };
    }

    loadAttributeLocations(program) {
        if(program === undefined) {
            console.warn("expected shader")
            return null;
        }
        const gl = this.#gl;
        const attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        const attribIndex = {};
        for (let i = 0; i < attribCount; ++i) {
            const attrib = gl.getActiveAttrib(program, i);
            attribIndex[attrib.name] = new AttribInfo(i, attrib.size, attrib.type);
        }
        return attribIndex;
    }

    loadUniformLocations(program) {
        if(program === undefined) {
            console.warn("expected shader")
            return null;
        }
        const gl = this.#gl;
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        const uniformLoc = {};
        for (let i = 0; i < uniformCount; ++i) {
            const uniform = gl.getActiveUniform(program, i);
            const loc = gl.getUniformLocation(program, uniform.name);
            uniformLoc[uniform.name] = new UniformInfo(loc, uniform.size, uniform.type);
        }
        return uniformLoc;
    }

    loadVariableLocations(program) {
        if(program === undefined) {
            console.warn("expected shader")
            return null;
        }
        return new VariableLocations(
            this.loadAttributeLocations(program),
            this.loadUniformLocations(program)
        );
    }

    #getTypeAndSizeFromType(type) {
        const gl = this.#gl;
        switch(type) {
            case gl.FLOAT_VEC2: return { type: gl.FLOAT, size: 2 };
            case gl.FLOAT_VEC3: return { type: gl.FLOAT, size: 3 };
            case gl.FLOAT_VEC4: return { type: gl.FLOAT, size: 4 };
            case gl.INT_VEC2: return { type: gl.INT, size: 2 };
            case gl.INT_VEC2: return { type: gl.INT, size: 3 };
            case gl.INT_VEC2: return { type: gl.INT, size: 4 };
            case gl.BOOL_VEC2: return { type: gl.BOOL, size: 2 };
            case gl.BOOL_VEC3: return { type: gl.BOOL, size: 3 };
            case gl.BOOL_VEC4: return { type: gl.BOOL, size: 4 };
            default: return { type, size: 1 };
        }
    }

    #uniformCallFromType(type, loc, data, normalize = false) {
        const gl = this.#gl;
        switch(type) {
            case gl.FLOAT: gl.uniform1f(loc, data); break;
            case gl.FLOAT_VEC2: gl.uniform2fv(loc, data); break;
            case gl.FLOAT_VEC3: gl.uniform3fv(loc, data); break;
            case gl.FLOAT_VEC4: gl.uniform4fv(loc, data); break;
            case gl.FLOAT_MAT2: gl.uniformMatrix2fv(loc, normalize, data); break;
            case gl.FLOAT_MAT3: gl.uniformMatrix3fv(loc, normalize, data); break;
            case gl.FLOAT_MAT4: gl.uniformMatrix4fv(loc, normalize, data); break;
            case gl.INT: gl.uniform1i(loc, data); break;
            case gl.INT_VEC2: gl.uniform2iv(loc, data); break;
            case gl.INT_VEC3: gl.uniform3iv(loc, data); break;
            case gl.INT_VEC4: gl.uniform4iv(loc, data); break;
            case gl.SAMPLER_2D: gl.uniform1i(loc, data); break;
            default:
        }
    }

    attribute(attrib, normalize = false, step = 0, offset = 0) {
        let interfaces = null;
        if(attrib instanceof AttribInfo) {
            const gl = this.#gl;
            const buffer = gl.createBuffer();
            const typeSize = this.#getTypeAndSizeFromType(attrib.type);
            interfaces = {
                set(data) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                },
                enable: () => {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.vertexAttribPointer(attrib.loc, typeSize.size, typeSize.type, normalize, step, offset);
                    gl.enableVertexAttribArray(attrib.loc);
                },
                disable: () => {
                    gl.disableVertexAttribArray(attrib.loc);
                }
            }
        }
        return interfaces;
    }

    uniform(uniform) {
        let interfaces = null;
        if(uniform instanceof UniformInfo) {
            interfaces = {
                set: (data) => this.#uniformCallFromType(uniform.type, uniform.loc, data)
            }
        }
        return interfaces;
    }

    element() {
        const gl = this.#gl;
        const buffer = gl.createBuffer();
        return {
            set(indices) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            },
            enable() {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            }
        }
    }

    texture(index = 0, config = {}) {
        let interfaces = null;
        const gl = this.#gl;
        const texture = gl.createTexture();
        const target = config.target || gl.TEXTURE_2D;
        const level = config.level || 0;
        const internalFormat = config.internalFormat || gl.RGBA;
        const externalFormat = config.externalFormat || gl.RGBA;
        const type = config.type || gl.UNSIGNED_BYTE;
        interfaces = {
            set(image, filter = {}) {
                gl.activeTexture(gl.TEXTURE0 + index);
                gl.bindTexture(target, texture);
                gl.texImage2D(target, level, internalFormat, externalFormat, type, image);
                const wraps = filter.wraps || gl.REPEAT;
                const wrapt = filter.wrapt || gl.REPEAT;
                gl.texParameteri(target, gl.TEXTURE_WRAP_S, wraps);
                gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapt);
                if(isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    gl.generateMipmap(target);
                }
                else {
                    const minFilter = filter.minFilter || gl.LINEAR;
                    const maxFilter = filter.maxFilter || gl.LINEAR;
                    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, maxFilter);
                }
            },
            enable() {
                gl.activeTexture(gl.TEXTURE0 + index);
                gl.bindTexture(target, texture);
            }
        }
        const defaultTexel = new Uint8Array([0, 0, 255, 255]);
        gl.bindTexture(target, texture);
        gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            defaultTexel);
        return interfaces;
    }

    attribUniformInterface(variableLocations, program) {
        let interfaces = null;
        if(variableLocations instanceof VariableLocations) {
            const gl = this.#gl;
            ///////// Attributes /////////
            const attributes = {};
            for (const [attribKey, attribInfo] of Object.entries(variableLocations.attribIndex)) {
                attributes[attribKey] = this.attribute(attribInfo);
            }
            ////////// Uniforms //////////
            const uniforms = {};
            for (const [uniformKey, uniformInfo] of Object.entries(variableLocations.uniformLoc)) {
                uniforms[uniformKey] = this.uniform(uniformInfo);
            }
            ////////// Indices ///////////
            const indices = this.element();
            /// enable attrib uniform ////
            const enable = () => {
                this.shader = program;
                for(const attribKey in attributes) {
                    attributes[attribKey].enable();
                }
                indices.enable();
            };
            /// disable attrib uniform ///
            const disable = () => {
                for(const attribKey in attributes) {
                    attributes[attribKey].disable();
                }
            }
            //////// draw triangle ///////
            const drawTriangle = (count, offset = 0) => {
                gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
            }
            //////// Draw triangle ///////
            interfaces = { 
                attributes, 
                uniforms,
                indices,
                enable,
                disable,
                drawTriangle
            };
        }
        return interfaces;
    }

    setupShader(vertexShader, fragmentShader) {
        const { varLocations, program } = this.initShader(vertexShader, fragmentShader);
        if(varLocations === null || program === null) {
            return null;
        }
        return this.attribUniformInterface(varLocations, program);
    }

    get resized() {
        if(this.#resized) {
            this.#resized = false;
            return true;
        }
        return false;
    }

    get gl() {
        return this.#gl;
    }

    set clearColor(color) {
        if(color instanceof Color) {
            this.#gl.clearColor(color.r, color.g, color.b, color.a);
            this.#clearColor = color;
        }
    }

    set depthTest(test) {
        const gl = this.#gl;
        this.#enableDepthTest = test;
        if(test) {
            gl.enable(gl.DEPTH_TEST);
        }
        else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    set shader(program) {
        if(this.#program !== program) {
            this.#program = program;
            this.#gl.useProgram(program);
        }
    }

    get width() { return this.#width }
    get height() { return this.#height }
}