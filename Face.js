export default function buildFace(width = 1, height = 1, segmentWidth = 1, segmentHeight = 1, tiled = false, flip = false) {
    const width_half = width / 2;
    const height_half = height / 2;
    const gridX = Math.floor(segmentWidth);
    const gridY = Math.floor(segmentHeight);
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segment_width = width / gridX;
    const segment_height = height / gridY;

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    for(let iy = 0; iy < gridY1; ++iy) {
        const y = iy * segment_height - height_half;
        for(let ix = 0; ix < gridX1; ++ix) {
            const x = ix * segment_width - width_half;

            vertices.push(x, -y, 0);
            normals.push(0, 0, 1);

            if(tiled) {
                uvs.push(ix, 1 - iy);
            }
            else {
                uvs.push(ix / gridX);
                uvs.push(1 - (iy / gridY));
            }
        }
    }

    for(let iy = 0; iy < gridY; ++iy) {
        for(let ix = 0; ix < gridX; ++ix) {
            const a = ix + gridX1 * iy;
            const b = ix + gridX1 * (iy + 1);
            const c = (ix + 1) + gridX1 * (iy + 1);
            const d = (ix + 1) + gridX1 * iy;

            if(flip) {
                if(ix & 1 ^ iy & 1) {
                  indices.push(a, b, d);
                  indices.push(b, c, d);
                }
                else {
                  indices.push(a, b, c);
                  indices.push(a, c, d);
                }
            }
            else {
                indices.push(a, b, d);
                indices.push(b, c, d);
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