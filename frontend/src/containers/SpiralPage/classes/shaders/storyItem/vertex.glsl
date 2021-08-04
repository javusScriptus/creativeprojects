#define PI 3.1415926535897932384626433832795

precision highp float;
precision highp int;

uniform float uStrength;
uniform vec2 uViewportSizes;
uniform vec2 uPlaneSizes;
uniform float uTime;
uniform vec3 uMouse3D;

varying vec2 vUv;

void main() {
  
  vec3 stablePosition = position;
  vec3 newPos = position;

  //Parallax mouse animation
  stablePosition.x -= uMouse3D.x * 0.004;
  stablePosition.y -= uMouse3D.y * 0.004;

  // Cursor animation
  float dist = distance(position.xy, uMouse3D.xy);
  float area = 1.- smoothstep(0., 30., dist);
  stablePosition.z += dist * 0.1;

  vec4 newPosition = modelViewMatrix * vec4(stablePosition, 1.0);

  newPosition.x += sin(newPosition.y / uPlaneSizes.y * 0.9 * PI + PI / 2.0) * uStrength * 5.;
  newPosition.y += sin(newPosition.x / uPlaneSizes.x * 0.9 * PI + PI / 2.0) * uStrength * 15.;
  newPosition.x += sin(newPos.y * PI + PI / 2.0) * abs(uStrength)  * newPosition.x;
  newPosition.y += sin(newPos.x * PI + PI / 2.0) * abs(uStrength)  * newPosition.y;

  gl_Position = projectionMatrix * newPosition;

  vUv = uv;
}


// void main() {
//   vec3 stablePosition = position;
//   vec3 newPos = position;

//   //Parallax mouse animation
//   stablePosition.x -= uMouse3D.x * 0.004;
//   stablePosition.y -= uMouse3D.y * 0.004;

//   vec4 newPosition = modelViewMatrix * vec4(stablePosition, 1.0);

//   // Cursor animation
//   float dist = distance(newPosition.xy, uMouse3D.xy);
//   float area = 1.- smoothstep(0., 20., dist);
//   newPosition.x += area * 5. * sin(uTime * 0.004);
//   newPosition.y += area * 5. * sin(uTime * 0.004);
//   newPosition.z += area * 5. * sin(uTime * 0.004);

//   newPosition.x += sin(newPosition.y / uPlaneSizes.y * 0.9 * PI + PI / 2.0) * uStrength * 5.;
//   newPosition.y += sin(newPosition.x / uPlaneSizes.x * 0.9 * PI + PI / 2.0) * uStrength * 15.;
//   newPosition.x += sin(newPos.y * PI + PI / 2.0) * abs(uStrength)  * newPosition.x;
//   newPosition.y += sin(newPos.x * PI + PI / 2.0) * abs(uStrength)  * newPosition.y;

//   gl_Position = projectionMatrix * newPosition;

//   vUv = uv;
// }