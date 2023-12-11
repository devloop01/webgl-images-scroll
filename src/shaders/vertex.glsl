precision mediump float;

#define PI 3.1415926535897932384626433832795

// uncomment if using ogl

uniform float uVelo;

varying vec2 vUv;

void main() {
    vUv = uv;

    vec3 pos = position;
    pos.y += ((sin(uv.x * PI) * uVelo) * 0.125);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}