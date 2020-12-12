import buildSphere from "./js/Sphere.js";
import Mesh from "./js/Mesh.js";

export default class PointLight extends Mesh {
    constructor(webgl, varLocations, program) {
        super(webgl, varLocations, program);
        this.step = 0.0025;
        setTimeout(this.change.bind(this), 3500);
    }

    setup() {
        const { attributes, indices } = this.interfaces;

        const sphereGeometry = buildSphere(0.025, 16, 16);
        attributes.position.set(sphereGeometry.vertices);
        indices.set(sphereGeometry.indices);

        this.count = sphereGeometry.count;
    }

    render(camera, light) {
        const { uniforms, enable, disable, drawTriangle } = this.interfaces;

        enable();
        super.render(camera);
        drawTriangle(this.count);
        disable();
    }

    update() {
        this.translate(this.step, 0, 0);
    }

    change() {
        setTimeout(this.change.bind(this), 7000);
        this.step *= -1;
    }
}