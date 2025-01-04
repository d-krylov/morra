#ifndef COMMON_FRAG
#define COMMON_FRAG

// STRUCTURES

#define PI 3.141592653589793

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Hit {
  float t, id;
  bool inside;
  vec3 normal;
  vec3 position;
};

// TOOLS

vec2 min_object(vec2 p, vec2 q) {
  return (p.x < q.x) ? p : q;
}

// https://iquilezles.org/articles/smin/

float smin_root(float a, float b, float k) {
  float x = b - a;
  return 0.5 * (a + b - sqrt(x * x + 4.0 * k * k));
}

float smin_quadratic(float a, float b, float k) {
  float m = 4.0 * k;
  float h = max(m - abs(a - b), 0.0) / m;
  return min(a, b) - h * h * k;
}

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

mat2 rotate_tangent(float atg) {
  float sn = atg / sqrt(1.0 + atg * atg);
  float cs = 1.0 / sqrt(1.0 + atg * atg);
  return mat2(cs, sn, -sn, cs);
}

float get_angle_id(vec2 p, float n) {
  float sp = 2.0 * PI / n;
  float an = atan(p.y, p.x);
  return floor(an / sp);
}

float repeat_angle(vec2 p, float n) {
  float sp = 2.0 * PI / n;
  float an = atan(p.y, p.x);
  float id = floor(an / sp);
  return sp * id;
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// MATRICES

mat4 rotate_x(float phi) {
  float Sin = sin(phi), Cos = cos(phi);
  return mat4(
    1.0,  0.0, 0.0, 0.0,
    0.0,  Cos, Sin, 0.0,
    0.0, -Sin, Cos, 0.0,
    0.0,  0.0, 0.0, 1.0);
}

mat4 rotate_y(float phi) {
  float Sin = sin(phi), Cos = cos(phi);
  return mat4(
    Cos, 0.0, Sin, 0.0, 
    0.0, 1.0, 0.0, 0.0, 
   -Sin, 0.0, Cos, 0.0, 
    0.0, 0.0, 0.0, 1.0);
}

mat4 translate(float p_x, float p_y, float p_z) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0, 
    0.0, 0.0, 1.0, 0.0, 
    p_x, p_y, p_z, 1.0);
}

mat4 scale(float s_x, float s_y, float s_z) {
  return mat4(
    s_x, 0.0, 0.0, 0.0,
    0.0, s_y, 0.0, 0.0, 
    0.0, 0.0, s_z, 0.0, 
    0.0, 0.0, 0.0, 1.0);
}

Ray transform_ray(Ray ray, mat4 m) {
  vec4 origin = inverse(m) * vec4(ray.origin, 1.0);
  vec4 direction = inverse(m) * vec4(ray.direction, 0.0);
  return Ray(origin.xyz, direction.xyz);
}

vec3 transform_normal(vec3 normal, mat4 m) {
  vec4 n = transpose(inverse(m)) * vec4(normal, 0.0); 
  return normalize(n.xyz);
}

vec3 transform_point(vec3 point, mat4 m) {
  vec4 p = m * vec4(point, 1.0);
  return p.xyz;
}

vec3 fibonacci_lattice(float i, float count) {
  float f = 0.5 * sqrt(5.0) - 0.5;
  float z = 1.0 - 2.0 * (i + 0.5) / count;
  float r = sqrt(1.0 - z * z);
  float phi = PI * f * i;
  float x = r * cos(phi);
  float y = r * sin(phi);
  return vec3(x, y, z);
}

#endif // COMMON_FRAG