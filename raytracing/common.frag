#ifndef COMMON_FRAG
#define COMMON_FRAG

#define PI         (3.141592653589793)
#define LAMBERTIAN (0)
#define METALLIC   (1)
#define EMISSIVE   (2)

#define EPSILON     (0.001)
#define FAR         (10000.0)

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Hit {
  vec3 position;
  vec3 normal;
  float t;
  int id;
};

struct Material {
  vec3 albedo;
  vec3 emissive;
  float metallic;
  int type;
};

mat4 rotateY(float phi) {
  float Sin = sin(phi);
  float Cos = cos(phi);
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
  vec4 o = inverse(m) * vec4(ray.origin, 1.0);
  vec4 d = inverse(m) * vec4(ray.direction, 0.0);
  return Ray(o.xyz, d.xyz);
}

vec3 transform_normal(vec3 normal, mat4 m) {
  vec4 n = transpose(inverse(m)) * vec4(normal, 0.0); 
  return n.xyz;
}

float seed;
float random() { return fract(sin(seed++) * 43758.5453123); }

vec3 random_unit_vector() {
  float cos_theta = random() * 2.0 - 1.0;
  float phi = random() * 2.0 * PI;
  float sin_theta = sqrt(1.0f - cos_theta * cos_theta);
  return vec3(
    cos(phi) * sin_theta,
    sin(phi) * sin_theta,
    cos_theta
  );
}

#endif // COMMON_FRAG