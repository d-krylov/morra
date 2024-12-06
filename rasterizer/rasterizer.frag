#include "common.frag"

vec3 box_vertices[8] = vec3[8](
  vec3(-0.5, -0.5, +0.5), // 0
  vec3(+0.5, -0.5, +0.5), // 1
  vec3(+0.5, +0.5, +0.5), // 2
  vec3(-0.5, +0.5, +0.5), // 3
  vec3(-0.5, -0.5, -0.5), // 4
  vec3(+0.5, -0.5, -0.5), // 5
  vec3(+0.5, +0.5, -0.5), // 6
  vec3(-0.5, +0.5, -0.5)  // 7
);

Triangle triangles[12];

vec3 barycentric(vec2 a, vec2 b, vec2 c, vec2 p) {
  vec3 x = vec3(c.x - a.x, b.x - a.x, a.x - p.x);
  vec3 y = vec3(c.y - a.y, b.y - a.y, a.y - p.y);
  vec3 q = cross(x, y);
  return vec3(q.z - q.x - q.y, q.y, q.x) / q.z;
}

void make_box() {
  triangles[0].a = box_vertices[0];  triangles[0].b = box_vertices[1];  triangles[0].c = box_vertices[2];
  triangles[1].a = box_vertices[2];  triangles[1].b = box_vertices[3];  triangles[1].c = box_vertices[0];

  triangles[2].a = box_vertices[1];  triangles[2].b = box_vertices[5];  triangles[2].c = box_vertices[6];
  triangles[3].a = box_vertices[6];  triangles[3].b = box_vertices[2];  triangles[3].c = box_vertices[1];

  triangles[4].a = box_vertices[5];  triangles[4].b = box_vertices[4];  triangles[4].c = box_vertices[7];
  triangles[5].a = box_vertices[7];  triangles[5].b = box_vertices[6];  triangles[5].c = box_vertices[5];

  triangles[6].a = box_vertices[4];  triangles[6].b = box_vertices[0];  triangles[6].c = box_vertices[3];
  triangles[7].a = box_vertices[3];  triangles[7].b = box_vertices[7];  triangles[7].c = box_vertices[4];

  triangles[8].a = box_vertices[3];  triangles[8].b = box_vertices[2];  triangles[8].c = box_vertices[6];
  triangles[9].a = box_vertices[6];  triangles[9].b = box_vertices[7];  triangles[9].c = box_vertices[3];

  triangles[10].a = box_vertices[4]; triangles[10].b = box_vertices[5]; triangles[10].c = box_vertices[1];
  triangles[11].a = box_vertices[1]; triangles[11].b = box_vertices[0]; triangles[11].c = box_vertices[4];
}

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;

  vec3 color = vec3(0.0);

  make_box();

  for (int i = 0; i < 12; i++) {
    Triangle t = triangles[i];
    vec3 r = barycentric(t.a.xy, t.b.xy, t.c.xy, uv);
    if (r.x > 0.0 && r.y > 0.0 && r.z > 0.0) {
      color.x = 1.0;
    }
  }

  out_color = vec4(color, 1.0);

}