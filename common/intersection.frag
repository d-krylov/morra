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

void box_intersect(Ray ray, vec3 position, vec3 size, out vec3 t1, out vec3 t2) {
  vec3 m = clamp(1.0 / ray.direction, -1e30, 1e30);
  vec3 n = m * (position - ray.origin);
  vec3 k = abs(m) * size;
  t1 = n - k;
  t2 = n + k;
}

bool box_intersect(Ray ray, vec3 position, vec3 size) {
  vec3 t1, t2; box_intersect(ray, position, size, t1, t2);
  float tn = max(max(t1.x, t1.y), t1.z);
  float tf = min(min(t2.x, t2.y), t2.z);
  if (tn > tf || tf < 0.0) return false;
  return true;
}

Hit box_intersect(Ray ray, vec3 size, float id) {
  Hit hit = Hit(-1.0, -1.0, vec3(0.0), vec3(0.0));
  vec3 t1, t2; box_intersect(ray, vec3(0.0), size, t1, t2);
  float tn = max(max(t1.x, t1.y), t1.z);
  float tf = min(min(t2.x, t2.y), t2.z);
	if (tn > tf || tf < 0.0) return hit;
  hit.t = tn; hit.id = id; hit.position = ray.origin + ray.direction * hit.t; 
  hit.normal = -sign(ray.direction) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
  return hit;
}

Hit box_intersect(Ray ray, in mat4 transform, float id) {
  ray = transform_ray(ray, transform);
  Hit hit = box_intersect(ray, vec3(0.5), id);
  hit.normal = transform_normal(hit.normal, transform);
  hit.position = transform_point(hit.position, transform);
  return hit;
}

Hit sphere_intersect(Ray ray, vec4 sphere, float id) {
  vec2 t = sphere_intersect(ray, sphere);
  Hit hit = Hit(-1.0, -1.0, vec3(0.0), vec3(0.0));
  if (t == vec2(-1.0)) return hit;
  hit.t = t.x;
  hit.position = ray.origin + ray.direction * hit.t;
  hit.normal = normalize(hit.position - sphere.xyz);
  hit.id = id;
  return hit;
}


#endif // INTERSECTION_FRAG