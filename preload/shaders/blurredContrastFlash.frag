#pragma header

uniform float contrast;
uniform float blurAmount;

/*- - - https://www.shadertoy.com/view/XdcXzn
- - - - Contrast code source*/

mat4 contrastMatrix(float contrast)
{
	float t = ( 1.0 - contrast ) / 2.0;

    return mat4( contrast, 0, 0, 0,
                 0, contrast, 0, 0,
                 0, 0, contrast, 0,
                 t, t, t, 1 );

}

/*- - - Gaussian Blur is taken from funkin.assets/preload/shaders/gaussianBlur.frag
- - - - check it for more info*/

const float bluramount  = 1.0;
const float center      = 1.0;
const float stepSize    = 0.004;
const float steps       = 3.0;

const float minOffs     = (float(steps-1.0)) / -2.0;
const float maxOffs     = (float(steps-1.0)) / +2.0;


vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {

  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

void main() {
  vec4 blurred;
  vec4 blurredShit = blur13(bitmap, openfl_TextureCoordv, openfl_TextureSize.xy, vec2(0.0, blurAmount * 2.0));
  blurredShit = mix(blur13(bitmap, openfl_TextureCoordv, openfl_TextureSize.xy, vec2(blurAmount * 2.0, 0.0)), blurredShit, 0.5);

  // Work out how much to blur based on the mid point
  // blurAmount = pow((openfl_TextureCoordv.y * center) * 2.0 - 1.0, 2.0) * bluramount;

  // This is the accumulation of color from the surrounding pixels in the texture
  blurred = vec4(0.0, 0.0, 0.0, 1.0);

  // From minimum offset to maximum offset
  for (float offsX = minOffs; offsX <= maxOffs; ++offsX) {
    for (float offsY = minOffs; offsY <= maxOffs; ++offsY) {

      // copy the coord so we can mess with it
      vec2 temp_tcoord = openfl_TextureCoordv.xy;

      //work out which uv we want to sample now
      temp_tcoord.x += offsX * blurAmount * stepSize;
      temp_tcoord.y += offsY * blurAmount * stepSize;

      // accumulate the sample
      blurred += texture2D(bitmap, temp_tcoord);
    }
  }

  // because we are doing an average, we divide by the amount (x AND y, hence steps * steps)
  blurred /= float(steps * steps);

  // apply blur and contrast
  gl_FragColor = contrastMatrix(contrast) * blurredShit;
}
