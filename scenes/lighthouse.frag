#include "common/common.frag"


void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  
  uv *= 5.0;

  vec3 color = vec3(0.0);

  uv.xy *= sign(uv.xy);
  
  float s = length(uv - vec2(2.0, 2.0)) - 0.5;
  color.x = step(s, 0.0);
  

  out_color = vec4(color, 1.0);

}