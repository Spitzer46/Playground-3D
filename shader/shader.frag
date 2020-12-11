    precision highp float;
    precision highp int;

    uniform sampler2D textureMap;
    uniform sampler2D normalMap;

    varying vec2 vUv;
    varying vec3 vSurfaceToLight;
    varying vec3 vWorldNormal;
    varying vec3 vTangent;
    varying vec3 bBitangent;

    void main() {
        vec3 surfaceToLigth = normalize(vSurfaceToLight);
        vec3 worldNormal = normalize(vWorldNormal);
        vec3 normal = texture2D(normalMap, vUv).rgb;
        normal = normalize(normal * 2.0 - 1.0);

        float brightness = clamp(dot(normal, surfaceToLigth), 0.0, 1.0);

        gl_FragColor = texture2D(textureMap, vUv);
        gl_FragColor.rgb *= (brightness * 3.5);
    }