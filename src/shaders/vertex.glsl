precision mediump float;

#define PI 3.1415926535897932384626433832795

uniform float uVelo;
uniform float uStrength;
uniform vec2 uViewportSize;

varying vec2 vUv;

void main() {
    vUv = uv;

    // vec3 newPosition = position;
    // newPosition.y += ((sin(uv.x * PI) * uVelo) * 0.125);
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0 );

    vec4 globalPosition = modelMatrix * vec4(position, 1.0);
    vec3 newPosition = globalPosition.xyz;

    float strength = uStrength * 6.;
    newPosition.z += abs(sin(globalPosition.y * 0.25 + PI * 0.5)) * -strength + strength * 0.25;

    gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
}