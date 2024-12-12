#include "common/distance.frag"
#include "common/common.frag"
#include "common/texture.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          250.0
#define EPSILON      0.001

#define MAP(p) map(p)

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float sphere = length(p) - 5.0;
  return vec2(sphere, 0.0);
}

#include "common/march.frag"

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float ring(vec2 uv, vec2 origin, float r, float t) {
  return step(length(uv - origin), r + t) - step(length(uv - origin), r - t);
}

vec3 get_color(Hit hit) {
  hit.normal.xz *= rotate(iTime);
  hit.normal.yz *= rotate(iTime);
  vec2 uv = get_sphere_uv(hit.normal);
  vec3 color;
  float n = 0.03125; vec2 id = n * round(uv / n);
  float swap = hash(id) > 0.5 ? 1.0 : -1.0;
  uv -= clamp(id, vec2(0.0, 0.1), vec2(1.0, 0.9));
  n *= 0.5;
  uv.x *= swap;
  color.x += ring(uv, +vec2(n), n, 0.1 * n);
  color.x += ring(uv, -vec2(n), n, 0.1 * n);
  return color;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 15.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  if (hit.id != -1.0) {
    color = get_color(hit);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, normalize(vec3(1.0)));
  }

  out_color = vec4(color, 1.0);
}