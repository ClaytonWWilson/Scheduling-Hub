import React, { ReactNode, useState } from "react";

type DropAreaProps = {
  children: ReactNode;
  onAccepted: (files: FileList) => void;
};

const preventDefaults = (event: React.DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const DropArea = (props: DropAreaProps) => {
  const [highlighted, setHighlighted] = useState(false);

  return (
    <div
      className={`border-2 w-fit h-fit ${
        highlighted ? "border-secondary" : "border-transparent"
      }`}
      onDragEnter={(e) => {
        preventDefaults(e);
        setHighlighted(true);
      }}
      onDragOver={(e) => {
        preventDefaults(e);
        setHighlighted(true);
      }}
      onDragLeave={(e) => {
        preventDefaults(e);
        setHighlighted(false);
      }}
      onDrop={(e) => {
        preventDefaults(e);
        setHighlighted(false);
        const files = e.dataTransfer.files;
        props.onAccepted(files);
      }}
    >
      {props.children}
    </div>
  );
};

export default DropArea;

// BUG: Border shifts the surrounding div. Need to convert to either box-shadow or border-box div
// https://stackoverflow.com/questions/9601357/placing-border-inside-of-div-and-not-on-its-edge
