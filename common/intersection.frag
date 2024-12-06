#ifndef INTERSECTION_FRAG
#define INTERSECTION_FRAG

#include "common.frag"

vec2 sphere_intersect(Ray ray, vec4 sphere) {
  vec2 result = vec2(-1.0);
  vec3 origin_to_center = ray.origin - sphere.xyz;
  float b = dot(origin_to_center, ray.direction);
  float c = dot(origin_to_center, origin_to_center) - sphere.w * sphere.w;
  float D = b * b - c;
  result = (D < 0.0) ? result : vec2(-b - sqrt(D), -b + sqrt(D));
  return result;
}

bool box_intersection(Ray ray, vec3 position, vec3 size) {
  vec3 m = 1.0 / ray.direction;
  vec3 n = m * (position - ray.origin);
  vec3 k = abs(m) * size;
  vec3 t1 = n - k;
  vec3 t2 = n + k;
  float tN = max(max(t1.x, t1.y), t1.z);
  float tF = min(min(t2.x, t2.y), t2.z);
  return tN < tF && tF > 0.0;
}

#endif // INTERSECTION_FRAG