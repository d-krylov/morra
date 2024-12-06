#include "common/common.frag"
#include "common/distance.frag"
#iChannel0 "assets/tree.jpg"
#iChannel1 "assets/table.jpg"

#define STEP_SIZE    0.5
#define STEP_COUNT   500
#define FAR          50.0
#define EPSILON      0.001


#define LOG_R            0.5            
#define ROOM_SIZE        5.0
#define WALL_ID          0.0
#define FLOOR_ID         1.0

vec2 home(vec3 p) {
  vec3 q0 = p; q0.xz = abs(q0.xz); vec3 q1 = q0 - vec3(0.0, LOG_R, 0.0);
  q0.y -= clamp(2.0 * LOG_R * round(0.5 * q0.y / LOG_R),  0.0, ROOM_SIZE);
  q1.y -= clamp(2.0 * LOG_R * round(0.5 * q1.y / LOG_R), -1.0, ROOM_SIZE);
  float x_wall = sd_cylinder(q0.xzy - vec3(ROOM_SIZE, 0.0, 0.0), LOG_R, ROOM_SIZE);
  float z_wall = sd_cylinder(q1.yxz - vec3(0.0, 0.0, ROOM_SIZE), LOG_R, ROOM_SIZE);
  q0 = p; q0.z -= clamp(0.5 * round(2.0 * q0.z), -ROOM_SIZE, ROOM_SIZE);
  q0.y = abs(q0.y - 0.5 * ROOM_SIZE);
  float floor = sd_box(q0 - vec3(0.0, ROOM_SIZE / 2.0, 0.0), ROOM_SIZE, 0.1, 0.235);
  float window = sd_box(p - vec3(0.0, ROOM_SIZE / 2.0, -ROOM_SIZE), 1.0, 1.0, LOG_R + 1.0);
  float ret = max(-window, min(floor, min(x_wall, z_wall)));
  float id = FLOOR_ID * float(ret == floor) + WALL_ID * float(ret != floor);
  return vec2(ret, id);
}


vec2 map(vec3 p) {
  vec2 ret = home(p);

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

Material get_material(Hit hit) {
  Material material;
  if (hit.id == WALL_ID) {
    vec2 uv = vec2(hit.position.x + hit.position.z + hit.position.y, atan(hit.normal.x + hit.normal.z, hit.normal.y));
    material.albedo = texture(iChannel0, 0.2 * uv).rgb * vec3(0.9, 0.4, 0.1); 
  } else if (hit.id == FLOOR_ID) {
    material.albedo = get_texture(iChannel1, hit.position, hit.normal);
  }
  return material;
}

void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;
  vec3 color = vec3(0.0);

  Ray ray;
  ray.origin = vec3(0.0, 1.0, 0.0);
  ray.direction = normalize(vec3(uv, -1.0));

  ray.direction.xz *= rotate(iTime);

  Hit hit  = trace(ray, 0.0);

  if (hit.id != -1.0) {
    Material material = get_material(hit);
    color = material.albedo;
  }


  out_color = vec4(color, 1.0);
}