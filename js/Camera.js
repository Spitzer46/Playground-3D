import * as mat4 from "../lib/mat4.js";
import Object3D from "./Object3D.js"

export default class Camera extends Object3D {
    constructor(webgl, config = {}) {
        super();
        this.webgl = webgl;
        this.fov = config.fov || 45;
        this.near = config.near || 1;
        this.far = config.far ||1000;

        this.projectionMatrix = mat4.create();
    }

    perspective() {
        const aspect = this.webgl.width / this.webgl.height;
        mat4.perspective(this.projectionMatrix, this.fov, aspect, this.near, this.far);
        return this;
    }

    loadProjectionMatrix(uniform) {
        uniform.set(this.projectionMatrix);
        return this;
    }
}