export default function buildSphere(radius = 1, stackCount = 4, sectorCount = 4, tile = 1) {
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    const radiusInv = 1 / radius;
    const sectorStep = 2 * Math.PI / sectorCount;
    const stackStep = Math.PI / stackCount;

    for(let i = 0; i <= stackCount; ++i) {
        // [ 2PI : -2PI ]
        const stackAngle = Math.PI / 2 - i * stackStep; 
        const xy = radius * Math.cos(stackAngle);
        const z = radius * Math.sin(stackAngle);
        for(let j = 0; j <= sectorCount; ++j) {
            // [ 0 - PI ]
            const sectorAngle = j * sectorStep;
            // Vertex position
            const x = xy * Math.cos(sectorAngle);
            const y = xy * Math.sin(sectorAngle);
            vertices.push(x, y, z);
            // Vertex normal
            const nx = x * radiusInv;
            const ny = y * radiusInv;
            const nz = z * radiusInv;
            normals.push(nx, ny, nz);
            // Vertex uv
            const s = j / (sectorCount / tile);
            const t = i / (stackCount / tile);
            uvs.push(s, t);
        }
    } 

    for(let i = 0; i <= stackCount; ++i) {
        let k1 = i * (sectorCount + 1);
        let k2 = k1 + sectorCount + 1;
        for(let j = 0; j <= sectorCount; ++j, ++k1, ++k2) {
            if(i != 0) {
                indices.push(k1, k2, k1 + 1);
            }
            if(i != (stackCount - 1)) {
                indices.push(k1 + 1, k2, k2 + 1);
            }
        }
    }

    return {
        indices: new Uint16Array(indices),
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        count: indices.length
    }
}