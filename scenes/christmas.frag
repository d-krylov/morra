#include "common/common.frag"
#include "common/distance.frag"

#define STEP_SIZE         0.1
#define STEP_COUNT        1000
#define FAR               1000.0
#define EPSILON           0.001


vec2 map(vec3 p) {
  vec2 ret = vec2(sd_capsule(p, 0.2, 10.0), 0.0);
  vec3 q = vec3(atan(p.x, p.z), p.y, length(p.xz));

  q.y -= q.z / 2.0;

  vec2 scale = vec2(6.283185, 1.0);
  q.xy /= scale;

  float sn = 1.0 / 10.0;

  q.xy += q.yx * vec2(-1.0, 1.0) * sn;

  vec2 pair = fract((q.xy + 1.0) * 0.5) * 2.0 - 1.0;
  q.xy = abs(pair)- 0.5;
  vec2 flip = step(0.0, pair) * 2.0 - 1.0;
  q.xy *= scale;

  q.y += 2.0 * flip.y * q.z;

  q.xz = q.z * vec2(sin(q.x), cos(q.x));

  q.yz = (q.yz + flip.yy * q.zy * vec2(-1.0, 1.0)) / sqrt(5.0);

  float b = sd_capsule(q - vec3(0.0, 0.0, 0.0), 0.1, 2.0);

  //float b = length(q - vec3(1.0, 0.0, 7.0)) - 0.5;

  vec2 branch = vec2(b, 0.0);

  ret = MIN(ret, branch);

  return ret;
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
  ray.origin = vec3(0.0, 5.0, 10.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    color = vec3(0.5, 0.4, 0.4);
    float cos_theta = dot(hit.normal, LD);
    color += vec3(0.2, 0.4, 0.5) * cos_theta;
  }


  out_color = vec4(color, 1.0);

}