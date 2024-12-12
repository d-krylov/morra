#ifndef DISTANCE_FRAG
#define DISTANCE_FRAG

// https://iquilezles.org/articles/distfunctions/

// CAPSULE

float sd_capsule(vec3 p, float r, float h) {
  p.y -= clamp(p.y, 0.0, h);
  return length(p) - r;
}

float sd_capsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sd_capsule(vec3 p, float r1, float r2, float h) {
  float b = (r1 - r2) / h;
  float a = sqrt(1.0 - b * b);
  vec2 q = vec2(length(p.xz), p.y);
  float k = dot(q, vec2(-b, a));
  if (k < 0.0) return length(q) - r1;
  if (k > a * h) return length(q - vec2(0.0, h)) - r2;
  return dot(q, vec2(a, b)) - r1;
}

float sd_cylinder(vec3 p, float r, float h) {
  vec2 d = vec2(length(p.xz) - r, abs(p.y) - h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sd_torus(vec3 p, float R, float r) {
  vec2 q = vec2(length(p.xz) - R, p.y);
  return length(q)- r;
}

float sd_sphere(vec3 p, float r) {
  return length(p) - r;
}

float sd_box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sd_box(vec3 p, float x, float y, float z) {
  vec3 q = abs(p) - vec3(x, y, z);
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sd_box(vec3 p, vec3 b) {
  return sd_box(p, b.x, b.y, b.z);
}

float sd_cone(vec3 p, vec2 c, float h) {
  float q = length(p.xz);
  return max(dot(c.xy, vec2(q, p.y)), -h - p.y);
}

float sd_prism(vec3 p, float r, float h) {
  vec3 q = abs(p);
  float t = sqrt(3.0) / 2.0;
  return max(q.z - h, max(q.x * t + p.y * 0.5, -p.y) - r * 0.5);
}

float sd_hex_prism(vec3 p, float side, float h) {
  const vec3 k = vec3(-sqrt(3.0) / 2.0, 0.5, sqrt(3.0) / 3.0);
  p = abs(p);
  p.xy -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
  vec2 d = vec2(length(p.xy - vec2(clamp(p.x, -k.z * side, k.z * side), side)) * sign(p.y - side), p.z - h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sd_pyramid(vec3 p, float h) {
  float m2 = h * h + 0.25;
  p.xz = abs(p.xz);
  p.xz = (p.z > p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);
  float s = max(-q.x, 0.0);
  float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);  
  float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
  float b = m2 * (q.x + 0.5*t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
    
  float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
    
  return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}

float sd_round_box(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

#endif // DISTANCE_FRAG