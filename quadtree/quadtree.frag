#define STEPS 5.0

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = in_position / iResolution.xy;
  
  float t = 0.5 * iTime;
  vec2 offset = vec2(0.5, 0.5);
  vec2 radius = 0.5 * vec2(sin(t), cos(t));
  vec2 circle = offset + radius;
  vec3 color;

  color.z = step(length(uv - circle), 0.1);

  for (int i = 0; i < 5; i++) {
    vec2 d = min(uv, 1.0 - uv); 
  
    if (min(d.x, d.y) < 0.01) { 
      color.x = 1.0;
    }

    uv = 2.0 * uv - step(offset, uv); 
  }

  out_color = vec4(color, 1.0);
}