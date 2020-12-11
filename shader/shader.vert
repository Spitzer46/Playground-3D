    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    attribute vec3 tangent;
    attribute vec3 bitangent;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    varying vec2 vUv;
    varying vec3 vSurfaceToLight;
    varying vec3 vWorldNormal;
    varying vec3 vTangent;
    varying vec3 bBitangent;

    const vec3 lightPosition = vec3(0, 0, 0.3);

    void main() {
        gl_Position = projection * view * model * vec4(position, 1.0);

        vUv = uv;
        vTangent = tangent;
        bBitangent = bitangent;

        vWorldNormal = vec3(model * vec4(normal, 0.0));
        vec3 worldPosition = (model * vec4(position, 1.0)).xyz;
        vSurfaceToLight = lightPosition - worldPosition;
    }