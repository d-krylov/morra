#ifndef HASH_FRAG
#define HASH_FRAG

float hash(float p) {
  return fract(sin(p * 134.787) * 13751.5453123);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 37.119))) * 43758.5453123);
}

vec2 hash22(vec2 p) {
  return fract(sin(p * vec2(37.1331, 59.7257)) * 113829.5453123);
}

// https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/

uint wang_hash(inout uint seed) {
  seed = uint(seed ^ uint(61)) ^ uint(seed >> uint(16));
  seed *= uint(9);
  seed = seed ^ (seed >> 4);
  seed *= uint(0x27d4eb2d);
  seed = seed ^ (seed >> 15);
  return seed;
}

float random(inout uint state) {
  return float(wang_hash(state)) / 4294967296.0;
}

vec3 random_unit_vector(inout uint seed) {
  float pi = 3.141592653589793;
  float z = random(seed) * 2.0 - 1.0;
  float a = random(seed) * 2.0 * pi;
  float r = sqrt(1.0 - z * z);
  float x = r * cos(a);
  float y = r * sin(a);
  return vec3(x, y, z);
}

#endif // HASH_FRAG