import { Color, WebGL } from "./js/Webgl.js";
import { loadImage, loadScript } from "./js/Utils.js";
import { CameraControl } from "./js/CameraControl.js";

import RustSphere from "./RustSphere.js";
import WallPlane from "./WallPlane.js";
import PointLight from "./PointLight.js";

const canvas = document.querySelector("canvas");
const webgl = new WebGL(canvas);
webgl.clearColor = new Color(0.0, 0.0, 0.0, 1.0);
webgl.depthTest = true;

const camera = new CameraControl(webgl, { near:0.01, zoomFactor:0.0001 });
camera.setOrigin(0, 0, -0.5);
const meshs = [];
let pointLight = null;
const shaderSources = [];
shaderSources.push(loadScript("./shader/normalMapping.vert"));
shaderSources.push(loadScript("./shader/normalMapping.frag"));
shaderSources.push(loadScript("./shader/lightPos.vert"));
shaderSources.push(loadScript("./shader/lightPos.frag"));

Promise.all(shaderSources).then(shaders => {
    const reflectionMat = webgl.initShader(shaders[0], shaders[1]);

    const rustSphere = new RustSphere(webgl, reflectionMat.varLocations, reflectionMat.program);
    loadImage("./img/plainrust.png").then(img => rustSphere.textureMap.set(img));
    loadImage("./img/plainrust_normal.png").then(img => rustSphere.normalMap.set(img));
    meshs.push(rustSphere);
    rustSphere.translate(0, 0, -0.5).rotateX(Math.PI / 2);

    const wallPlane = new WallPlane(webgl, reflectionMat.varLocations, reflectionMat.program);
    loadImage("./img/albedo.png").then(img => wallPlane.textureMap.set(img));
    loadImage("./img/albedo_normal.png").then(img => wallPlane.normalMap.set(img));
    meshs.push(wallPlane);
    wallPlane.rotateY(Math.PI).translate(0, 0, -1.0);

    const light = webgl.initShader(shaders[2], shaders[3]);
    pointLight = new PointLight(webgl, light.varLocations, light.program);
    pointLight.translate(0, 0, 0.5);
    meshs.push(pointLight);

    requestAnimationFrame(animate);
});

function animate(timestamp) {
    requestAnimationFrame(animate);

    if(webgl.resized) {
        camera.perspective();
    }

    webgl.clear();
    camera.update();

    for(const mesh of meshs) {
        mesh.update();
        mesh.render(camera, pointLight);
    }
}