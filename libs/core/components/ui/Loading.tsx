"use client";
import { ClipLoader } from "react-spinners";
interface Props {
  height?: number;
  size: number;
  color: string;
  thickness: number;
}
function Loading({ height = 0, color, size, thickness }: Props) {
  return (
    <div
      className="flex justify-center items-center"
      style={{ height: `${height}vh` }}
    >
      <ClipLoader
        color={color}
        size={size}
        cssOverride={{
          borderWidth: `${thickness}px`,
        }}
      />
    </div>
  );
}

export default Loading;
