import Mesh from "./js/Mesh.js";
import buildFace from "./js/Face.js";
import { computeTangent } from "./js/Utils.js";

export default class WallPlane extends Mesh {
    constructor(webgl, varLocations, program) {
        super(webgl, varLocations, program);
        this.textureMap = this.webgl.texture(0);
        this.normalMap = this.webgl.texture(1);
        this.shininess = 10;
    }

    setup() {
        const { attributes, indices } = this.interfaces;

        const planeGeometry = buildFace(4, 2, 4, 2, true);
        attributes.position.set(planeGeometry.vertices);
        attributes.normal.set(planeGeometry.normals);
        attributes.uv.set(planeGeometry.uvs);
        indices.set(planeGeometry.indices);

        const [ tangents, bitangents ] = computeTangent(planeGeometry);
        attributes.tangent.set(tangents);
        attributes.bitangent.set(bitangents);
        this.count = planeGeometry.count;
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