import { Color, WebGL } from "./Webgl.js";
import { create, fromTranslation } from "./lib/mat4.js";
import { Camera } from "./Camera.js";
import buildFace from "./Face.js";
import { loadImage, loadScript, computeTangent } from "./Utils.js";

const canvas = document.querySelector("canvas");
const webgl = new WebGL(canvas);
webgl.clearColor = new Color(0.0, 0.0, 0.0, 1.0);
webgl.depthTest = true;

const camera = new Camera(webgl, { near: 0.01 });
camera.rotateY(Math.PI * 2);
camera.translate(0, 0, 1.5);

window.addEventListener("mousemove", e => {
    const dpr = window.devicePixelRatio || 1;
    const mx = -(e.clientX * dpr) / webgl.width + 0.5;
    const my = -(e.clientY * dpr) / webgl.height + 0.5;
    const factor = Math.PI * 2;
    camera.identity().rotateY(mx * factor).rotateX(my * factor).translate(0, 0, 1.5);
});

const shaderSources = [];
shaderSources.push(loadScript("./shader/shader.vert"));
shaderSources.push(loadScript("./shader/shader.frag"))

let shape1, shape2;
let modelShape1, modelShape2;
let shapeGeometry1, shapeGeometry2;
let tangents, bitangents;

Promise.all(shaderSources).then(shaders => {
    // Creation de la texture et chargement
    const textureMap = webgl.texture(0);
    const normalMap = webgl.texture(1);
    loadImage("./img/albedo.png").then(img => textureMap.set(img));
    loadImage("./img/albedo_normal.png").then(img => normalMap.set(img));
    // Generation des infos d'attributs et d'uniforms
    const { varLocations, program } = webgl.initShader(shaders[0], shaders[1]);
    // Generation des variables et uniforms de la figure 1
    shape1 = webgl.attribUniformInterface(varLocations, program);
    // Generation des variables et uniforms de la figure 2
    shape2 = webgl.attribUniformInterface(varLocations, program);

    // Creation de la figure 1
    modelShape1 = fromTranslation(create(), [0, 0, -1]);
    shapeGeometry1 = buildFace(2, 1, 2, 1, true);
    [ tangents, bitangents ] = computeTangent(shapeGeometry1);

    shape1.attributes.normal.set(shapeGeometry1.normals);
    shape1.attributes.position.set(shapeGeometry1.vertices);
    shape1.attributes.uv.set(shapeGeometry1.uvs);
    shape1.indices.set(shapeGeometry1.indices);
    shape1.attributes.tangent.set(tangents);
    shape1.attributes.bitangent.set(bitangents);

    // Creation de la figure 2
    modelShape2 = fromTranslation(create(), [0, 0, 0]);
    shapeGeometry2 = buildFace(3, 1, 3, 1, true);
    [ tangents, bitangents ] = computeTangent(shapeGeometry1);

    shape2.attributes.normal.set(shapeGeometry2.normals);
    shape2.attributes.position.set(shapeGeometry2.vertices);
    shape2.attributes.uv.set(shapeGeometry2.uvs);
    shape2.indices.set(shapeGeometry2.indices);
    shape2.attributes.tangent.set(tangents);
    shape2.attributes.bitangent.set(bitangents);

    requestAnimationFrame(animate);
});

function animate(timestamp) {
    requestAnimationFrame(animate);

    if(webgl.resized) {
        camera.perspective();
    }

    webgl.clear();
    // Affichage shape 1
    shape1.enable();
    shape1.uniforms.model.set(modelShape1);
    camera.loadProjectionMatrix(shape1.uniforms.projection);
    camera.loadViewMatrix(shape1.uniforms.view);
    shape1.uniforms.textureMap.set(0);
    shape1.uniforms.normalMap.set(1);
    shape1.drawTriangle(shapeGeometry1.count);
    shape1.disable();
    // Affichage shape 2
    shape2.enable();
    shape2.uniforms.model.set(modelShape2);
    camera.loadProjectionMatrix(shape2.uniforms.projection);
    camera.loadViewMatrix(shape2.uniforms.view);
    shape2.uniforms.textureMap.set(0);
    shape1.uniforms.normalMap.set(1);
    shape2.drawTriangle(shapeGeometry2.count);
    shape2.disable();
}
