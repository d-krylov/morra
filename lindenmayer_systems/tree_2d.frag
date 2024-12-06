#define PI 3.1415926535897932

mat2 rotate(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

float sd_capsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

vec2 hash2(vec2 p)  {
  vec2 k = vec2(0.3183099, 0.3678794);
  float n = dot(vec2(111.0, 113.0), p);
  return fract(n * fract(k * n));
}


const float BRANCHES = 10.0;


void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.x;  
  vec3 color = vec3(0.0);
  uv += vec2(0.0, 0.5);
  uv *= 20.0;

  float h = 10.0;
  float r = 0.1;

  vec2 begin = vec2(0.0, 0.0);
  vec2 current = begin;
  float branch = sd_capsule(uv, current, vec2(0.0, 4.0), r);

  vec2 offset[] = vec2[](
    vec2(1.0,  2.0),
    vec2(2.0, -1.0),
    vec2(1.0,  1.0),
    vec2(2.0, -2.0)
  );


  for (int i = 0; i < 10; i++) {
    vec2 new = current + offset[i % 4];
    branch = min(branch, sd_capsule(uv, current, new, r));
    current = new;
  }
  

  color.g = step(branch, 0.0);

  out_color = vec4(color, 1.0);
}