import Mesh from "./js/Mesh.js";
import buildSphere from "./js/Sphere.js";
import { computeTangent } from "./js/Utils.js";

export default class RustSphere extends Mesh {
    constructor(webgl, varLocations, program) {
        super(webgl, varLocations, program);
        this.textureMap = this.webgl.texture(0);
        this.normalMap = this.webgl.texture(1);
        this.shininess = 100;
    }

    setup() {
        const { attributes, indices } = this.interfaces;

        const sphereGeometry = buildSphere(0.25, 64, 64, 4);
        attributes.position.set(sphereGeometry.vertices);
        attributes.normal.set(sphereGeometry.normals);
        attributes.uv.set(sphereGeometry.uvs);
        indices.set(sphereGeometry.indices);

        const [ tangents, bitangents ] = computeTangent(sphereGeometry);
        attributes.tangent.set(tangents);
        attributes.bitangent.set(bitangents);
        this.count = sphereGeometry.count;
    }

    render(camera, light) {
        const { uniforms, enable, disable, drawTriangle } = this.interfaces;

        enable();
        super.render(camera);
        uniforms.textureMap.set(0);
        uniforms.normalMap.set(1);
        uniforms.shininess.set(this.shininess);
        light.loadPosition(uniforms.lightPosition);
        camera.loadPosition(uniforms.cameraPosition);
        this.textureMap.enable();
        this.normalMap.enable();
        drawTriangle(this.count);
        disable();
    }
}