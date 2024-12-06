#include "common/common.frag"
#include "common/noise.frag"
#include "common/intersection.frag"

vec3 get_color(vec3 p) {
  vec3 color;
  float h = smoothstep(5.0, 0.0, p.y);
  float d = smoothstep(5.0, 0.0, length(p.xz));
  float t = iTime;
  p.y -= 5.0 * t;
  float f = fbm(p, 1.0, 4);
  color = vec3(f, f, 1.0) * h * d;

  return color;
}


vec3 environment(Ray ray, float step_count, float near, float far) {
  float t = near;
  float s = (far - near) / step_count;
  vec3 color = vec3(0.0);
  for (float i = 0.0; i < step_count; i++) {
    vec3 p = ray.origin + ray.direction * t;
    vec3 new = get_color(p);
    color += 0.05 * new;
    t += s;
  }
  return color;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 3.0, 10.0);
  ray.direction = normalize(vec3(uv, -1.0));

  vec2 t = sphere_intersect(ray, vec4(0.0, 0.0, 0.0, 4.5));

  if (t != vec2(-1.0)) {
    color = environment(ray, 20.0, t.x, t.y);
  }


  out_color = vec4(color, 1.0);
}