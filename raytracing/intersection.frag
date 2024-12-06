#ifndef INTERSECTION_FRAG
#define INTERSECTION_FRAG

#include "common.frag"

Hit sphere_intersect(Ray ray, vec4 sphere, int id) {
  vec3 origin_to_center = ray.origin - sphere.xyz;
  float b = dot(origin_to_center, ray.direction);
  float c = dot(origin_to_center, origin_to_center) - sphere.w * sphere.w;
  float D = b * b - c;
  if (D < 0.0) return Hit(vec3(0.0), vec3(0.0), -1.0, -1);
  Hit hit;
  hit.t = -b - sqrt(D);
  hit.position = ray.origin + ray.direction * hit.t;
  hit.normal = normalize(hit.position - sphere.xyz);
  hit.id = id;
  return hit;
}

Hit box_intersect(Ray ray, vec3 size, int id) {
  vec3 m = clamp(1.0 / ray.direction, -1e30, 1e30);
  vec3 n = m * ray.origin;
  vec3 k = abs(m) * size;
  vec3 t1 = -n - k;
  vec3 t2 = -n + k;
  float t_near = max(max(t1.x, t1.y), t1.z);
  float t_far  = min(min(t2.x, t2.y), t2.z);
	if (t_near > t_far || t_far < 0.0) return Hit(vec3(0.0), vec3(0.0), -1.0, -1);
  Hit hit;
  hit.t = t_near;
  hit.position = ray.origin + ray.direction * hit.t;
  hit.normal = -sign(ray.direction) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
  hit.id = id;
  return hit;
}

Hit box_intersect(Ray ray, in mat4 m, int id) {
  ray = transform_ray(ray, m);
  Hit hit = box_intersect(ray, vec3(0.5), id);
  hit.normal = transform_normal(hit.normal, m);
  hit.position = (m * vec4(hit.position, 1.0)).xyz;
  return hit;
}

#endif // INTERSECTION_FRAG
