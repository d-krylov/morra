#include "common/common.frag"
#include "common/distance.frag"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define MAP(p) map(p)

float cube_fractal(vec3 p, float size, float radius, float size_divisor, float radius_divisor, int iterations) {
  float result = sd_sphere(p, radius);
  for (int i = 0; i < iterations; i++) {
    p = abs(p);
    p -= vec3(size);
    radius /= radius_divisor;
    result = min(sd_sphere(p, radius), result);
    size /= size_divisor;
  }
  return result;
}

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  float cube = cube_fractal(p, 16.0, 4.0, 3.0, 2.0, 8);
  return vec2(cube, 0.0);
}

#include "common/march.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 64.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = march(ray, 0.0, FAR, STEP_SIZE, STEP_COUNT);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));
  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.5);
    float cos_theta = dot(hit.normal, LD);
    color += cos_theta * vec3(1.0, 1.0, 0.2);
  }

 
  out_color = vec4(color, 1.0);
}