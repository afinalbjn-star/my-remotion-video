import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Neon Cyber Grid Shader (Fragment Shader)
const fragShader = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// draw grid line
float gridLine(float coord, float thickness) {
  float line = abs(fract(coord) - 0.5);
  return smoothstep(0.5, 0.5 - thickness, line);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv *= 10.0;

  // animate
  float t = mod(u_time, 10.0);

  // moving grid
  uv.x += t * 0.5;
  uv.y += t * 0.25;

  float grid = gridLine(uv.x, 0.03) + gridLine(uv.y, 0.03);

  // neon color
  vec3 color = vec3(0.0, 0.8, 1.0) * grid;

  gl_FragColor = vec4(color, 1.0);
}
`;

export const TechGrid: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl");
        if (!gl) return;

        // Compile Shader
        const compile = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vsSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

        const vertexShader = compile(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = compile(gl.FRAGMENT_SHADER, fragShader);

        const program = gl.createProgram();
        if (!program || !vertexShader || !fragmentShader) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.useProgram(program);

        // Full screen quad
        const position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        );

        const positionLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Uniforms
        const timeLoc = gl.getUniformLocation(program, "u_time");
        const resLoc = gl.getUniformLocation(program, "u_resolution");

        const render = () => {
            gl.viewport(0, 0, width, height);
            gl.uniform2f(resLoc, width, height);

            const timeInSec = frame / fps;
            gl.uniform1f(timeLoc, timeInSec);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        render();
    }, [frame, fps, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ width: "100%", height: "100%" }}
        />
    );
};