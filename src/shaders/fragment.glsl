precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uPlaneAspect;

vec2 bgSizeCover(vec2 texCoord, float textureAspect, float planeAspect) {
    float scaleX = planeAspect / textureAspect;
    float scaleY = 1.0;

    if(scaleX > 1.0) {
        scaleY /= scaleX;
        scaleX = 1.0;
    }

    if(scaleY > 1.0) {
        scaleX /= scaleY;
        scaleY = 1.0;
    }

    texCoord -= 0.5;
    texCoord.x *= scaleX;
    texCoord.y *= scaleY;
    texCoord += 0.5;

    return texCoord;
}

void main() {

    vec2 texCoord = bgSizeCover(vUv.xy, uTextureAspect, uPlaneAspect);
    vec3 tex = texture2D(uTexture, texCoord).rgb;

    gl_FragColor.rgb = tex;
    // gl_FragColor.rgb = vec3(vUv, 1.0);
    gl_FragColor.a = 1.0;
}
