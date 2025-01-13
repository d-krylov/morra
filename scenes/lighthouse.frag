#include "common/common.frag"
#include "common/random.frag"

void mainImage(out vec4 out_color, in vec2 in_position) {
	vec2 uv = (2.0 * in_position - iResolution.xy) / iResolution.xy;
  uv.y *= iResolution.y / iResolution.x;
  
  uv *= 10.0;

  vec3 color = vec3(0.0);

  float n = 1.0;

  uv.y -= -1.0 * round(uv.x);
  uv.x -= round(uv.x);


  float res = length(uv) - 0.5;



  color.x = step(res, 0.0);
  

  out_color = vec4(color, 1.0);

}