#include "common/distance.frag"
#include "common/common.frag"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          250.0
#define EPSILON      0.001

const float A = 0.5;
const float B = 0.25 * sqrt(5.0) - 0.25;

float icosahedron_vertices(vec3 p, float r) {
  p = abs(p);
  float s1 = sd_sphere(p.xyz - vec3(B, A, 0.0), r);
  float s2 = sd_sphere(p.yzx - vec3(B, A, 0.0), r);
  float s3 = sd_sphere(p.zxy - vec3(B, A, 0.0), r);
  return min(s1, min(s2, s3));
}

float icosahedron_box(vec3 p) {
  float b1 = sd_box(p.xyz, vec3(B, A, 0.05));
  float b2 = sd_box(p.yzx, vec3(B, A, 0.05));
  float b3 = sd_box(p.zxy, vec3(B, A, 0.05));
  return min(b1, min(b2, b3));
}

float icosahedron_normal(vec3 p) {
  float d = sqrt(A * A + B * B);
  p.xy = abs(p.xy);
  p.xy *= rotate_tangent(A / B);
  return sd_capsule(p.yxz - vec3(0.0, d, 0.0), 0.05, 1.0);
}

float icosahedron_normals(vec3 p) {
  float a = icosahedron_normal(p);
  float b = icosahedron_normal(p.zxy);
  float c = icosahedron_normal(p.yzx);
  return min(a, min(b, c));
}

vec2 map(vec3 p) {
  p.xz *= rotate(iTime);
  p.xy *= rotate(iTime);
  
  float spheres = icosahedron_vertices(p, 0.1);
  spheres = min(spheres, icosahedron_box(p));
  spheres = min(spheres, icosahedron_normals(p));

  return vec2(spheres, 0.0);
}

vec3 get_normal(vec3 p) {
  const float h = 0.01; 
  const vec2 k = vec2(1.0, -1.0);
  return normalize(k.xyy * map(p + k.xyy * h).x + 
                   k.yyx * map(p + k.yyx * h).x + 
                   k.yxy * map(p + k.yxy * h).x + 
                   k.xxx * map(p + k.xxx * h).x);
}

Hit trace(Ray ray, float near) {
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
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 3.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  if (hit.id != -1.0) {
    color = vec3(0.5, 0.5, 0.8);
    color += vec3(0.5, 0.7, 0.3) * dot(hit.normal, normalize(vec3(1.0)));
  }

  out_color = vec4(color, 1.0);
}