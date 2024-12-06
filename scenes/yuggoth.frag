#include "common/common.frag"

#define STEP_SIZE  0.5
#define STEP_COUNT 5000
#define FAR        500.0
#define EPSILON    0.001

float get_height(vec2 p) {
  float h = p.y;
  return h;
}

vec2 terrain(vec3 p) {
  return vec2(0.0);
}

vec2 map(in vec3 p) {
  return vec2(p.y, 0.0);
}

vec3 get_normal(in vec3 p) {
  const float h = 0.01; 
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * h).x + 
                   k.yyx * map(p + k.yyx * h).x + 
                   k.yxy * map(p + k.yxy * h).x + 
                   k.xxx * map(p + k.xxx * h).x);
}

Hit trace(in Ray ray, in float near) {
  Hit hit;
  hit.id = -1.0;
  float t = near;
  for (int i = 0; i < STEP_COUNT; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec2 d = map(p);
    if (d.x < EPSILON) {
      hit.id = d.y;
      hit.position = p;
      hit.normal = get_normal(hit.position);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 5.0, 15.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  float n = 5.0;
  

  if (hit.id != -1.0) {

  }

  out_color = vec4(color, 1.0);
}