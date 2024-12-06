#include "common.frag"
#include "tables.frag"

#define CELL_SIZE  2.0
#define STEP_COUNT 250
#define FAR        100.0
#define EPSILON    0.001
#define SPHERE_ID  0.0
#define SEGMENT_ID 1.0

int get_triangle(int i, int j) {
  return triangle_table[16 * i + j];
}

int get_cube_index(float[8] values, float level) {
  int cube_index = 0;
  for (int i = 0; i < 8; i++) { cube_index |= int(values[i] < level) << i; }
  return cube_index;
}

vec3 interpolate_vertex(float level, vec3 p1, vec3 p2, float v1, float v2) {
  float mu = (level - v1) / (v2 - v1);
  if (mu < 0.2) mu = 0.0;
  if (mu > 0.8) mu = 1.0;
  return mix(p1, p2, mu);
}

const int vertex_table[] = int[](
  0, 1, 1, 2, 2, 3, 3, 0,
  4, 5, 5, 6, 6, 7, 7, 4,
  0, 4, 1, 5, 2, 6, 3, 7
);

int polygonise(Grid grid, float level, inout Triangle[5] triangles) {
  vec3 vertices[12];
  
  int cube_index = get_cube_index(grid.v, level);

  if (edge_table[cube_index] == 0) return 0;

  for (int i = 0; i < 12; i++) {
    if ((edge_table[cube_index] & (1 << i)) != 0) {
      vertices[i] = interpolate_vertex(level, 
        grid.p[vertex_table[2 * i + 0]], 
        grid.p[vertex_table[2 * i + 1]], 
        grid.v[vertex_table[2 * i + 0]], 
        grid.v[vertex_table[2 * i + 1]]);
    }
  }

  int triangles_count = 0;
  for (int i = 0; get_triangle(cube_index, i) != -1; i += 3) {
    triangles[triangles_count].p0 = vertices[get_triangle(cube_index, i + 0)];
    triangles[triangles_count].p1 = vertices[get_triangle(cube_index, i + 1)];
    triangles[triangles_count].p2 = vertices[get_triangle(cube_index, i + 2)];
    triangles_count++;
  }

  return triangles_count;
}

const vec3 cube_vertices[8] = vec3[8] (
  vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0),
  vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 1.0), vec3(1.0, 1.0, 1.0), vec3(0.0, 1.0, 1.0)
);

vec2 scene(vec3 p) {
  float s = sd_sphere(p, vec3(0.0, 0.0, 0.0), 10.0);

  return vec2(s, SPHERE_ID);
}

Grid    grid;
Triangle[5] triangles;

vec2 map(vec3 p) {
  int triangles_count = 0;

  p.xz *= rotate(iTime);

  vec3 cell = floor(p / CELL_SIZE) * CELL_SIZE;

  vec2 s = scene(p);

  if (s.x > 2.0) return vec2(s.x - 2.0, SPHERE_ID);

  for (int i = 0; i < 8; i++) {
    grid.p[i] = cell + CELL_SIZE * cube_vertices[i];
    grid.v[i] = scene(grid.p[i]).x;
  }

  triangles_count = polygonise(grid, 0.0, triangles);

  vec2 ret = vec2(1e9, -1.0);

  for (int i = 0; i < triangles_count; i++) {
    float s1 = sd_sphere(p, triangles[i].p0, 0.2);
    float s2 = sd_sphere(p, triangles[i].p1, 0.2);
    float s3 = sd_sphere(p, triangles[i].p2, 0.2);
    vec2 segment = vec2(min(s1, min(s2, s3)), SEGMENT_ID);
    ret = MIN(ret, segment);
  }

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
      hit.position = p;
      hit.normal = get_normal(p);
      hit.id = d.y;
      break;
    }
    t += 0.5 * d.x;
    if (t > FAR) { break; }
  }
  return hit;
}


void mainImage(out vec4 out_color, in vec2 in_position) {
  vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;

  Ray ray;
  ray.origin = vec3(0.0, 0.0, 20.0);
  ray.direction = normalize(vec3(uv, -1.0));

  vec3 color = vec3(0.0);

  Hit hit = trace(ray, 0.0);

  vec3 LD = normalize(vec3(1.0, 1.0, 1.0));

  if (hit.id != -1.0) {
    if (hit.id == SEGMENT_ID) color = vec3(0.6, 0.1, 0.1);
    if (hit.id == SPHERE_ID) color = vec3(0.1, 0.1, 0.6);
    color += vec3(0.5, 0.5, 0.5) * dot(LD, hit.normal);
  }

  out_color = vec4(color, 1.0);
}