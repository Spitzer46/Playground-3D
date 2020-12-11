import * as mat4 from "./lib/mat4.js";
import * as vec3 from "./lib/vec3.js";

export class Camera {
    constructor(webgl, config = {}) {
        this.webgl = webgl;
        this.fov = config.fov || 45;
        this.near = config.near || 1;
        this.far = config.far ||1000;

        this.projectionMatrix = mat4.create();
        this.cameraMatrix = mat4.create();

        this.vec3 = vec3.create();
        this.mat4 = mat4.create();
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

    loadViewMatrix(uniform) {
        mat4.invert(this.mat4, this.cameraMatrix);
        uniform.set(this.mat4);
        return this;
    }

    translate(x = 0, y = 0, z = 0) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        mat4.translate(this.cameraMatrix, this.cameraMatrix, this.vec3);

        return this;
    }

    rotateX(alpha = 0) {
        mat4.rotateX(this.cameraMatrix, this.cameraMatrix, alpha);
        return this;
    }

    rotateY(alpha = 0) {
        mat4.rotateY(this.cameraMatrix, this.cameraMatrix, alpha);
        return this;
    }

    rotateZ(alpha = 0) {
        mat4.rotateZ(this.cameraMatrix, this.cameraMatrix, alpha);
        return this;
    }

    identity() {
        mat4.identity(this.cameraMatrix);
        return this;
    }
}