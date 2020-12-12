precision highp float;

uniform sampler2D textureMap;
uniform sampler2D normalMap;

varying mat3 vTbn;
varying vec2 vUv;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;

uniform float shininess;

// struct PointLight {
//     vec3 position;
// };
// uniform PointLight pointLights[1];

void main() {
    vec3 normal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    normal = normalize(vTbn * normal);

    vec3 surfaceToLigth = normalize(vSurfaceToLight);
    vec3 surfaceToCamera = normalize(vSurfaceToCamera);
    vec3 halfVector = normalize(surfaceToLigth + surfaceToCamera);

    float brightness = clamp(dot(normal, surfaceToLigth), 0.1, 1.0);
    float specular = 0.0;
    if(brightness > 0.0) {
        specular = pow(clamp(dot(normal, halfVector), 0.0, 1.0), shininess);
    }

    gl_FragColor = texture2D(textureMap, vUv);
    gl_FragColor.rgb *= brightness * 3.0;
    gl_FragColor.rgb += specular * 0.25;
}