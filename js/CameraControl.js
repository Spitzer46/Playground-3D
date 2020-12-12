import Camera from "./Camera.js";
import * as vec3 from "../lib/vec3.js";

export class CameraControl extends Camera {
    constructor(webgl, config) {
        super(webgl, config);
        this.webgl = webgl;

        this.rotStart = config.rotStart || Math.PI;
        this.rotFactor = config.rotFactor || Math.PI * 2;
        this.zoomFactor = config.zoomFactor || 0.001;

        this.rotx = this.rotStart;
        this.roty = 0;
        this.zoom = 0;

        this.origin = vec3.create();

        window.addEventListener("mousemove", this.#onMouseMove.bind(this));
        window.addEventListener("mousewheel", this.#onMouseWheel.bind(this));
    }

    #onMouseMove(e) {
        const dpr = window.devicePixelRatio || 1.0;
        const mx = -(e.clientX * dpr) / this.webgl.width + 0.5;
        const my = -(e.clientY * dpr) / this.webgl.height + 0.5;
        this.rotx = mx * this.rotFactor;
        this.roty = this.rotStart - my * this.rotFactor;
    }

    #onMouseWheel(e) {
        this.zoom += e.wheelDelta * this.zoomFactor;
    }

    update() {
        this.identity();
        this.translateByVector(this.origin);
        this.rotateY(this.rotx);
        this.rotateX(this.roty);
        
        this.translate(0, 0, this.zoom);
    }

    setOrigin(x = 0, y = 0, z = 0) {
        vec3.set(this.origin, x, y, z);
    }
}