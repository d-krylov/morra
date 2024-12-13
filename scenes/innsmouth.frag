#include "common/common.frag"
#include "common/distance.frag"
#include "common/texture.frag"

#iChannel0 "assets/brick.jpg"
#iChannel1 "assets/ground.jpg"

#define STEP_SIZE     0.5
#define STEP_COUNT    2000
#define FAR           5000.0
#define EPSILON       0.001

#define TERRAIN_ID    0.0
#define YARD_ID       1.0
#define ROOM_ID       2.0
#define WINDOW_ID     3.0

vec2 temple(vec3 p) {
  float t1 = sd_box(p - vec3(0.0, 5.0, 0.0), vec3(5.0, 5.0, 15.0));
  float t2 = sd_prism(p - vec3(0.0, 13.4, 0.0), 7.0, 15.0);

  float t = min(t1, t2);

  return vec2(t, 0.0);
}

vec2 lighthouse(vec3 p) {
  return vec2(0.0);
}

float get_height(vec2 p) {
  float h1 = smoothstep(200.0, 0.0, length(p - vec2(+200.0, -400.0)));
  float h2 = smoothstep(100.0, 0.0, length(p - vec2(-120.0, -200.0)));

  float h = 80.0 * h1 + 50.0 * h2;
  return h;
}

vec2 terrain(vec3 p) {
  float h = get_height(p.xz);
  return vec2(p.y - h, 0.0);
}

float roof(vec3 p, vec2 size) {
  return 0.0;
}

vec2 room(vec3 p, vec3 room_size, vec2 window_size) {
  vec2 wr = window_size.xy * room_size.xy;
  float r = sd_box(p, room_size);
  p.xz = abs(p.xz);
  float w1 = sd_box(p.xyz - vec3(0.0, 0.0, room_size.z), vec3(wr, room_size.z * 0.05));
  float w2 = sd_box(p.zyx - vec3(0.0, 0.0, room_size.x), vec3(wr, room_size.x * 0.05));
  float i = sd_box(p.xy, wr) * sd_box(p.yz, wr);
  float id = i < 0.0 ? WINDOW_ID : ROOM_ID; 
  return vec2(max(-w2, max(-w1, r)), id);
}

vec2 house(vec3 p, vec3 rooms, vec3 room_size, vec2 window) {
  vec3 rs = 2.0 * room_size;
  vec3 id = round(p / rs);
  p -= clamp(id * rs, -rooms * rs, rooms * rs);
  vec2 room = room(p, room_size, window);
  return room;
}

vec2 map(vec3 p) {
  vec2 terrain = terrain(p);

  //float h = get_height(vec2(-120.0, -200.0));

  //vec2 q = temple(p - vec3(-120.0, h, -200.0));

  float n = 50.0;
  vec2 id = round(p.xz / n);
  p.xz -= clamp(n * id, vec2(-300.0, -300.0), vec2(300.0, 300.0));
  float b = sd_round_box(p, vec3(20.0, 0.5, 20.0), 0.5);
  vec2 yard = vec2(b, YARD_ID);

  vec2 q = house(p - vec3(0.0, 11.5, 0.0), vec3(5.0, 5.0, 5.0), vec3(1.0, 1.0, 1.0), vec2(0.5, 0.5));

  vec2 ret = MIN(yard, q);

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
      hit.normal = get_normal(p);
      break;
    }
    t += STEP_SIZE * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}

vec3 get_material(Hit hit) {
  vec3 color;
  if (hit.id == YARD_ID) {
    color = texture(iChannel0, 0.5 * hit.position.xz).rgb;
  } else if (hit.id == ROOM_ID) {
    color = get_texture(iChannel1, 0.1 * hit.position, hit.normal, 1.0).rgb;
  } else if (hit.id == WINDOW_ID) {
    color = vec3(0.1);
  } else {
    color = vec3(0.3, 0.3, 0.3);
  }
  return color;
}

float soft_shadow(in Ray ray, float near, int steps) {
  float ret = 1.0;
  float t = near;
  for (int i = 0; i < steps && t < FAR; i++) {
	  vec3 p = ray.origin + ray.direction * t;
    float d = map(p).x;
    ret = min(ret, 10.0 * d / t);
    if (ret < EPSILON) break;
    t += d;
  }
  ret = clamp(ret, 0.0, 1.0);
  return ret * ret * (3.0 - 2.0 * ret);
}

vec3 get_light(Hit hit, Ray ray) {
  return vec3(0.0);
}

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 12.0, 20.0);
  ray.direction = normalize(vec3(uv, -1.0));

  Hit hit = trace(ray, 0.0);

  vec3 LD = normalize(vec3(1.0));

  if (hit.id != -1.0) {
    color = get_material(hit);
    float cos_theta = dot(hit.normal, LD);
    Ray shadow_ray = Ray(hit.position, LD); 
    color += vec3(0.2, 0.5, 0.1) * cos_theta * soft_shadow(shadow_ray, 0.1, 32);
  }

  out_color = vec4(color, 1.0);

}