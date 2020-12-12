import * as mat4 from "../lib/mat4.js";
import * as vec3 from "../lib/vec3.js";

export default class Object3D {
    constructor() {
        this.model = mat4.create();
        this.mat4 = mat4.create();
        this.vec3 = vec3.create();
    }
    
    loadViewMatrix(uniform) {
        mat4.invert(this.mat4, this.model);
        uniform.set(this.mat4);
        return this;
    }

    loadPosition(uniform) {
        mat4.getTranslation(this.vec3, this.model);
        uniform.set(this.vec3);
        return this;
    }

    translate(x = 0, y = 0, z = 0) {
        this.vec3[0] = x;
        this.vec3[1] = y;
        this.vec3[2] = z;
        mat4.translate(this.model, this.model, this.vec3);
        return this;
    }

    translateByVector(vec) {
        mat4.translate(this.model, this.model, vec);
        return this;
    }

    rotateX(alpha = 0) {
        mat4.rotateX(this.model, this.model, alpha);
        return this;
    }

    rotateY(alpha = 0) {
        mat4.rotateY(this.model, this.model, alpha);
        return this;
    }

    rotateZ(alpha = 0) {
        mat4.rotateZ(this.model, this.model, alpha);
        return this;
    }

    identity() {
        mat4.identity(this.model);
        return this;
    }

    update() {}
}