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

void box_intersect_internal(Ray ray, vec3 position, vec3 size, out vec3 t1, out vec3 t2) {
  vec3 m = clamp(1.0 / ray.direction, -1e30, 1e30);
  vec3 n = m * (position - ray.origin);
  vec3 k = abs(m) * size;
  t1 = n - k;
  t2 = n + k;
}

Hit box_intersect_internal(Ray ray, vec3 size, float id) {
  Hit hit; hit.id = -1.0; hit.t = -1.0;
  vec3 t1, t2; box_intersect_internal(ray, vec3(0.0), size, t1, t2);
  float tn = max(max(t1.x, t1.y), t1.z);
  float tf = min(min(t2.x, t2.y), t2.z);
	if (tn > tf || tf < 0.0) return hit;
  hit.inside = tn < 0.0; hit.t = hit.inside ? tf : tn; 
  hit.id = id; hit.position = ray.origin + ray.direction * hit.t; 
  hit.normal = -sign(ray.direction) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
  return hit;
}

bool box_intersect(Ray ray, vec3 position, vec3 size) {
  vec3 t1, t2; box_intersect_internal(ray, position, size, t1, t2);
  float tn = max(max(t1.x, t1.y), t1.z);
  float tf = min(min(t2.x, t2.y), t2.z);
  if (tn > tf || tf < 0.0) return false;
  return true;
}

Hit box_intersect(Ray ray, in mat4 transform, float id) {
  ray = transform_ray(ray, transform);
  Hit hit = box_intersect_internal(ray, vec3(0.5), id);
  hit.normal = transform_normal(hit.normal, transform);
  hit.position = transform_point(hit.position, transform);
  return hit;
}

Hit sphere_intersect(Ray ray, vec4 sphere, float id) {
  vec2 t = sphere_intersect(ray, sphere);
  Hit hit; hit.id = -1.0; hit.t = -1.0;
  if (t == vec2(-1.0)) return hit;
  hit.inside = t.x < 0.0;
  hit.t = hit.inside ? t.y : t.x;
  hit.position = ray.origin + ray.direction * hit.t;
  hit.normal = normalize(hit.position - sphere.xyz) * (hit.inside ? -1.0 : 1.0);
  hit.id = id;
  return hit;
}

vec3 triangle_intersect(Ray ray, vec3 v0, vec3 v1, vec3 v2) {
  vec3 v1_v0 = v1 - v0;
  vec3 v2_v0 = v2 - v0;
  vec3 origin_v0 = ray.origin - v0;
  vec3 n = cross(v1_v0, v2_v0);
  vec3 q = cross(origin_v0, ray.direction);
  float d = clamp(1.0 / dot(ray.direction, n), -1e30, 1e30);
  float u = d * dot(-q, v2_v0);
  float v = d * dot(q, v1_v0);
  float t = d * dot(-n, origin_v0);
  if (u < 0.0 || v < 0.0 || (u + v) > 1.0) t = -1.0;
  return vec3(t, u, v);
}


#endif // INTERSECTION_FRAG