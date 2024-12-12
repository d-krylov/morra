#ifndef MARCH_FRAG
#define MARCH_FRAG

#include "common.frag"

#ifndef MAP
#define MAP(X) vec2(0.0)
#endif

#define EPSILON      0.001

vec3 get_normal(vec3 p) {
  const float h = 0.01; 
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * MAP(p + k.xyy * h).x + 
                   k.yyx * MAP(p + k.yyx * h).x + 
                   k.yxy * MAP(p + k.yxy * h).x + 
                   k.xxx * MAP(p + k.xxx * h).x);
}

Hit march(Ray ray, float near, float far, float step_size, int step_count) {
  Hit hit;
  hit.id = -1.0;
  float t = near;
  for (int i = 0; i < step_count && t < far; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec2 d = MAP(p);
    if (d.x < EPSILON) {
      hit.id = d.y;
      hit.position = p; 
      hit.normal = get_normal(hit.position);
      break;
    }
    t += step_size * d.x;
  }
  return hit;
}

float soft_shadow(Ray ray, float near, float far, int step_count) {
  float ret = 1.0;
  float t = near;
  for (int i = 0; i < step_count && t < far; i++) {
	  vec3 p = ray.origin + ray.direction * t;
    vec2 d = MAP(p);
    ret = min(ret, 10.0 * d.x / t);
    if (ret < EPSILON) break;
    t += d.x;
  }
  ret = clamp(ret, 0.0, 1.0);
  return ret * ret * (3.0 - 2.0 * ret);
}

#endif // MARCH_FRAG