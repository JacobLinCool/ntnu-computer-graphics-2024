attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_normalMatrix;
varying vec3 v_Normal;
varying vec3 v_PositionInWorld;
varying vec4 v_Color;
void main() {
    //TODO-1: transform "a_Position" to clip space and store in "gl_Position"
    gl_Position = u_MvpMatrix * a_Position;

    //TODO-2: transform "a_Position" to world space and store its first three elements to "v_PositionInWorld"
    v_PositionInWorld = (u_modelMatrix * a_Position).xyz;

    //TODO-3: transform normal vector "a_Normal" to world space using "u_normalMatrix" and store the result in "v_Normal", 
    //        remember to renormalize the result before storing it to v_Normal
    v_Normal = normalize((u_normalMatrix * a_Normal).xyz);

    //TODO-4: set "a_Color" to "v_Color"
    v_Color = a_Color;
}
