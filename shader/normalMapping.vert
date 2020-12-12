precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec3 bitangent;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 cameraPosition;

varying mat3 vTbn;
varying vec2 vUv;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;
// const vec3 lightPosition = vec3(0, 0, 0);
uniform vec3 lightPosition;

void main() {
    gl_Position = projection * view * model * vec4(position, 1.0);

    vec3 worldNormal = normalize(vec3(model * vec4(normal, 0.0)));
    vec3 worldTangent = normalize(vec3(model * vec4(tangent, 0.0)));
    vec3 worldBitangent = normalize(vec3(model * vec4(bitangent, 0.0)));

    vTbn = mat3(worldTangent, worldBitangent, worldNormal);
    vUv = uv;

    vec3 worldPosition = (model * vec4(position, 1.0)).xyz;
    vSurfaceToLight = lightPosition - worldPosition;
    vSurfaceToCamera = cameraPosition - worldPosition;
}