import * as vec3 from "./lib/vec3.js";
import * as vec2 from "./lib/vec2.js";

export function loadImage(src) {
    return new Promise((loaded, failed) => {
        const img = new Image();
        img.addEventListener("load", () => loaded(img));
        img.addEventListener("error", err => failed(err));
        img.src = src;
    });
}

export function loadScript(src) {
    return new Promise((loaded, failed) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", data => loaded(data.target.response));
        xhr.addEventListener("error", err => failed(err));
        xhr.open("GET", src);
        xhr.send();
    });
}

export function computeTangent(geometry = {}) {
    const tangents = [];
    const bitangents = [];
    const indices = geometry.indices;
    if(indices === undefined) return [ null, null ];
    const vertices = geometry.vertices;
    if(vertices === undefined) return [ null, null ];
    const uvs = geometry.uvs;
    if(uvs === undefined) return [ null, null ];

    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();
    const uv0 = vec2.create();
    const uv1 = vec2.create();
    const uv2 = vec2.create();
    const deltaPos1 = vec3.create();
    const deltaPos2 = vec3.create();
    const deltaUv1 = vec2.create();
    const deltaUv2 = vec2.create();
    const right = vec3.create();
    const left = vec3.create();
    const tangent = vec3.create();
    const bitangent = vec3.create();

    for(let i = 0; i < indices.length; i+=3) {
        const index0 = indices[i];
        const index1 = indices[i+1];
        const index2 = indices[i+2];

        vec3.set(v0, vertices[index0*3], vertices[index0*3+1], vertices[index0*3+2]);
        vec3.set(v1, vertices[index1*3], vertices[index1*3+1], vertices[index1*3+2]);
        vec3.set(v2, vertices[index2*3], vertices[index2*3+1], vertices[index2*3+2]);
        vec2.set(uv0, uvs[index0*2], uvs[index0*2+1]);
        vec2.set(uv1, uvs[index1*2], uvs[index1*2+1]);
        vec2.set(uv2, uvs[index2*2], uvs[index2*2+1]);

        vec3.sub(deltaPos1, v1, v0);
        vec3.sub(deltaPos2, v2, v0);
        vec2.sub(deltaUv1, uv1, uv0);
        vec2.sub(deltaUv2, uv2, uv0);

        const r = 1.0 / (deltaUv1[0] * deltaUv2[1] - deltaUv1[1] * deltaUv2[0]);
        // Compute tangent
        vec3.multiplyByScalar(left, deltaPos1, deltaUv2[1]);
        vec3.multiplyByScalar(right, deltaPos2, deltaUv1[1]);
        vec3.subtract(tangent, left, right);
        vec3.multiplyByScalar(tangent, tangent, r);

        // Compute bitantent
        vec3.multiplyByScalar(left, deltaPos2, deltaUv1[0]);
        vec3.multiplyByScalar(right, deltaPos1, deltaUv2[0]);
        vec3.subtract(bitangent, left, right);
        vec3.multiplyByScalar(bitangent, bitangent, r);

        tangents.push(tangent, tangent, tangent)
        bitangents.push(bitangent, bitangent, bitangent);
    }

    return [ tangents, bitangents ];
}