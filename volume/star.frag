#include "common/intersection.frag"
#include "common/noise.frag"

float map(vec3 p) {
  p.xz *= rotate(iTime);
  float d = smoothstep(7.0, 0.0, length(p));
  float f = fbm(5.0 * p, 0.5, 4);
  return f * d;
}

vec3 get_normal(vec3 p) {
  const float h = 0.01; 
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * h) + 
                   k.yyx * map(p + k.yyx * h) + 
                   k.yxy * map(p + k.yxy * h) + 
                   k.xxx * map(p + k.xxx * h));
}

vec3 get_color(float d, vec3 p, vec3 n) {
  vec3 color;
  if (d > 0.6) color.x = 1.0;
  if (d > 0.5) color.y = 1.0;
  if (d > 0.4) color.z = 1.0;
  color *= dot(normalize(p), n);
  return color;
}

vec3 environment(Ray ray, float step_count, float near, float far) {
  float t = near;
  float s = (far - near) / step_count;
  float d = 0.0;
  vec3 normal, color;
  for (float i = 0.0; i < step_count; i++) {
    vec3 p = ray.origin + ray.direction * t;
    d = map(p);
    normal = get_normal(p);
    color += get_color(d, p, normal);
    t += s;
  }
  return color;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 5.0);
  ray.direction = normalize(vec3(uv, -1.0));

  vec2 t = sphere_intersect(ray, vec4(0.0, 0.0, 0.0, 7.0));

  if (t != vec2(-1.0)) {
    color = environment(ray, 30.0, t.x, t.y);
  }

  out_color = vec4(color, 1.0);
}