#ifndef COMMON_FRAG
#define COMMON_FRAG

struct Triangle {
  vec3 p0;
  vec3 p1;
  vec3 p2;
};

struct Grid {
  vec3 p[8];
  float v[8];
};

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Hit {
  float id;
  vec3 normal;
  vec3 position;
};

vec2 MIN(vec2 a, vec2 b) {
  if (a.x < b.x) return a; return b;
}

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

float sd_sphere(vec3 p, vec3 origin, float r) {
  return length(p - origin) - r;
}

float sd_capsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float dot2(vec3 x) { return dot(x, x); }

float sd_triangle(vec3 p, vec3 a, vec3 b, vec3 c) {
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 ac = a - c; vec3 pc = p - c;
  vec3 normal = cross(ba, ac);
  return sqrt(
    (sign(dot(cross(ba, normal), pa)) +
     sign(dot(cross(cb, normal), pb)) +
     sign(dot(cross(ac, normal), pc)) < 2.0)
     ?
     min( min(
      dot2(ba * clamp(dot(ba, pa) / dot2(ba), 0.0, 1.0) - pa),
      dot2(cb * clamp(dot(cb, pb) / dot2(cb), 0.0, 1.0) - pb)),
      dot2(ac * clamp(dot(ac, pc) / dot2(ac), 0.0, 1.0) - pc)):
      dot(normal, pa) * dot(normal, pa) / dot2(normal));
}

float sphere_intersect(Ray ray, vec4 sphere) {
  float result = -1.0;
  vec3 origin_to_center = ray.origin - sphere.xyz;
  float b = dot(origin_to_center, ray.direction);
  float c = dot(origin_to_center, origin_to_center) - sphere.w * sphere.w;
  float D = b * b - c;
  result = (D < 0.0) ? result : -b - sqrt(D);
  return result;
}

#endif // COMMON_FRAG