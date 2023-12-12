precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;

uniform vec2 uPlaneSize;
uniform vec2 uTextureSize;

uniform float uVelo;
uniform float uScale;

vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
    float screenRatio = screenSize.x / screenSize.y;
    float imageRatio = imageSize.x / imageSize.y;
    vec2 newSize = screenRatio < imageRatio ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y) : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
    vec2 newOffset = (screenRatio < imageRatio ? vec2((newSize.x - screenSize.x) / 2.0, 0.0) : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
    return uv * screenSize / newSize + newOffset;
}

void main() {

    vec2 uv = vUv;

    vec2 texCenter = vec2(0.5);
    vec2 texUv = backgroundCoverUv(uPlaneSize, uTextureSize, uv);
    vec2 texScale = (texUv - texCenter) * uScale + texCenter;
    vec3 tex = texture2D(uTexture, texScale).rgb;

    texScale.y += 0.05 * uVelo;
    if(uv.y < 1.)
        tex.g = texture2D(uTexture, texScale).g;

    texScale.y += 0.04 * uVelo;
    if(uv.y < 1.)
        tex.b = texture2D(uTexture, texScale).b;

    gl_FragColor.rgb = tex;
    // gl_FragColor.rgb = vec3(vUv, 0.);
    gl_FragColor.a = 1.0;
}
