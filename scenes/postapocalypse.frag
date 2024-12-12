#include "common/common.frag"
#include "common/distance.frag"
#include "common/noise.frag"

#define FAR        5000.0
#define STEP_COUNT 2000
#define STEP_SIZE  0.5

vec2 hash2(vec2 p)  {
  vec2 k = vec2(0.3183099, 0.3678794);
  float n = dot(vec2(111.0, 113.0), p);
  return fract(n * fract(k * n));
}

float get_height(vec2 p) {
  vec2 q = p;
  float n = 1000.0;
  vec2 id = round(q / n);
  vec2 offset = hash2(id) - 0.5;
  offset *= 0.35 * n; 
  q -= n * id;
  float crater = smoothstep(330.0, 0.0, length(q - offset));
  float h = -200.0 * crater;
  h += 2.0 * fbm(0.10 * p, 1.0, 2);
  h += 8.0 * fbm(0.05 * p, 1.0, 2);
  h += 20.0 * fbm(0.01 * p, 1.0, 2);
  return h;
} 

float city(vec3 p) {
  float building = sd_box(p, vec3(50.0, 250.0, 50.0));
  float f = fbm(0.1 * p, 1.0, 3);
  float ret = building + 10.0 * f;
  return ret;
}

#define MAP(p) map(p)

vec2 map(vec3 p) {
  float h = get_height(p.xz);
  float s = p.y - h;
  float c = city(p);
  float ret = min(c, s);
  return vec2(ret, 0.0);
}

#include "common/march.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 100.5, 200.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 LD = normalize(vec3(1.0));

  if (hit.id != -1.0) {
    float cos_theta = dot(hit.normal, LD);
    color = vec3(0.2, 0.2, 0.1);
    color += vec3(0.5, 0.5, 0.5) * cos_theta;
  }


  out_color = vec4(color, 1.0);
}