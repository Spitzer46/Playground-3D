import * as mat4 from "../lib/mat4.js";
import Object3D from "./Object3D.js"

export default class Mesh extends Object3D {
    constructor(webgl, varLocations, program) {
        super();
        this.webgl = webgl;
        this.model = mat4.create();
        this.interfaces = webgl.attribUniformInterface(varLocations, program);
        this.setup();
    }

    setup() {}

    render(camera, light) {
        camera.loadProjectionMatrix(this.interfaces.uniforms.projection);
        camera.loadViewMatrix(this.interfaces.uniforms.view);
        this.interfaces.uniforms.model.set(this.model);
    }
}